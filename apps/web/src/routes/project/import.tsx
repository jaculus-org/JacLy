import { m } from '@/paraglide/messages';
import { Button } from '@/features/shared/components/ui/button';
import { Input } from '@/features/shared/components/ui/input';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { UploadIcon } from 'lucide-react';
import type { FSInterface } from '@jaculus/project/fs';
import { useRef, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import {
  parseZipFile,
  createProjectFromPackage,
} from '@/features/project/lib/import';

export const Route = createFileRoute('/project/import')({
  component: ImportProject,
});

function ImportProject() {
  const navigate = useNavigate();
  const { projectManService: runtimeService, projectFsService } =
    Route.useRouteContext();
  const [projectName, setProjectName] = useState('imported-project');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      setSelectedFile(file);
      // Use filename without extension as default project name
      const nameWithoutExt = file.name.replace(/\.zip$/i, '');
      setProjectName(nameWithoutExt);
    } else if (file) {
      enqueueSnackbar(
        m.project_import_invalid_file?.() ?? 'Please select a .zip file',
        {
          variant: 'error',
        }
      );
    }
  }

  async function handleImport() {
    if (!selectedFile) return;

    setIsImporting(true);

    try {
      // Read and parse the zip file
      const arrayBuffer = await selectedFile.arrayBuffer();
      const zipData = new Uint8Array(arrayBuffer);
      const importResult = parseZipFile(zipData);

      // Create the project in the database
      const newProject = await runtimeService.createProject(
        projectName,
        importResult.projectType
      );

      const { fs, projectPath } = await projectFsService.mount(newProject.id);

      await createProjectFromPackage(
        fs as unknown as FSInterface,
        projectPath,
        importResult.package
      );

      enqueueSnackbar(
        m.project_import_success?.() ??
          `Successfully imported ${importResult.fileCount} files`,
        { variant: 'success' }
      );

      navigate({
        to: '/project/$projectId',
        params: { projectId: newProject.id },
      });
    } catch (error) {
      console.error('Failed to import project:', error);
      enqueueSnackbar(
        m.project_import_error?.() ?? 'Failed to import project',
        { variant: 'error' }
      );
      setIsImporting(false);
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">
        {m.project_import_title?.() ?? 'Import Project'}
      </h1>

      <div className="space-y-6">
        <div>
          <label
            htmlFor="projectName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {m.project_new_name_label()}
          </label>
          <Input
            id="projectName"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            placeholder={m.project_new_name_placeholder()}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">
            {m.project_import_file_title?.() ?? 'Select ZIP File'}
          </h2>
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".zip"
              onChange={handleFileSelect}
              className="hidden"
            />
            <UploadIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            {selectedFile ? (
              <p className="text-lg font-medium">{selectedFile.name}</p>
            ) : (
              <p className="text-muted-foreground">
                {m.project_import_drop_hint?.() ??
                  'Click to select a .zip file'}
              </p>
            )}
          </div>
        </div>

        <Button
          onClick={handleImport}
          className="w-full"
          disabled={!selectedFile || isImporting}
        >
          {isImporting
            ? (m.project_import_btn_importing?.() ?? 'Importing...')
            : (m.project_import_btn_import?.() ?? 'Import Project')}
        </Button>
      </div>
    </div>
  );
}
