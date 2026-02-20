import { m } from '@/paraglide/messages';
import { Button } from '@/features/shared/components/ui/button';
import { Input } from '@/features/shared/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/features/shared/components/ui/tabs';
import { createFileRoute } from '@tanstack/react-router';
import { UploadIcon, LinkIcon } from 'lucide-react';
import type { FSInterface } from '@jaculus/project/fs';
import { useEffect, useRef, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { createProjectFromPackage } from '@/features/project/lib/import';
import {
  loadPackageFromFile,
  loadPackageFromUri,
} from '@/features/project/lib/loadPackage';

interface ImportSearchParams {
  url?: string;
}

export const Route = createFileRoute('/project/import')({
  component: ImportProject,
  validateSearch: (search: Record<string, unknown>): ImportSearchParams => {
    return {
      url: typeof search.url === 'string' ? search.url : undefined,
    };
  },
});

function ImportProject() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const initialUrl = search.url ?? '';
  const { projectManService: runtimeService, projectFsService } =
    Route.useRouteContext();

  const [projectName, setProjectName] = useState('imported-project');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [packageUrl, setPackageUrl] = useState(initialUrl);
  const [activeTab, setActiveTab] = useState<'file' | 'url'>(
    initialUrl ? 'url' : 'file'
  );
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab !== 'url') return;
    const current = search.url ?? '';
    if (packageUrl === current) return;
    const timer = setTimeout(() => {
      navigate({
        search: prev => ({ ...prev, url: packageUrl || undefined }),
        replace: true,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [packageUrl, activeTab, navigate, search.url]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const nameWithoutExt = file.name
        .replace(/\.zip$/i, '')
        .replace(/\.tar\.gz$/i, '')
        .replace(/\.tgz$/i, '');
      setProjectName(nameWithoutExt);
    }
  }

  async function handleImport() {
    setIsImporting(true);

    try {
      let importResult;

      if (activeTab === 'file') {
        if (!selectedFile) {
          enqueueSnackbar(
            m.project_import_invalid_file?.() ?? 'Please select a file',
            { variant: 'error' }
          );
          setIsImporting(false);
          return;
        }
        importResult = await loadPackageFromFile(selectedFile);
      } else {
        if (!packageUrl) {
          enqueueSnackbar('Please enter a URL', { variant: 'error' });
          setIsImporting(false);
          return;
        }
        importResult = await loadPackageFromUri(packageUrl);
      }

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

        <Tabs
          value={activeTab}
          onValueChange={value => setActiveTab(value as 'file' | 'url')}
          className="flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2" variant={'default'}>
            <TabsTrigger value="file">
              <UploadIcon className="w-4 h-4 mr-2" />
              {m.project_import_tab_file?.() ?? 'File'}
            </TabsTrigger>
            <TabsTrigger value="url">
              <LinkIcon className="w-4 h-4 mr-2" />
              {m.project_import_tab_url?.() ?? 'URL'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {m.project_import_file_title?.() ?? 'Select Archive File'}
                </CardTitle>
                <CardDescription>
                  {m.project_import_file_description?.() ??
                    'Upload a ZIP or TAR.GZ archive file containing your project. The project type will be automatically detected.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".zip,.tar,.tar.gz,.tgz"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <UploadIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  {selectedFile ? (
                    <p className="text-lg font-medium">{selectedFile.name}</p>
                  ) : (
                    <div>
                      <p className="text-muted-foreground mb-1">
                        {m.project_import_click_hint?.() ??
                          'Click to select an archive file'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {m.project_import_supported_formats?.() ??
                          'Supported formats: ZIP, TAR, TAR.GZ'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="url" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {m.project_import_url_title?.() ?? 'Package URL'}
                </CardTitle>
                <CardDescription>
                  {m.project_import_url_description?.() ??
                    'Import a project from a remote URL. Provide a direct link to a ZIP or TAR.GZ archive file.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  type="url"
                  value={packageUrl}
                  onChange={e => setPackageUrl(e.target.value)}
                  placeholder={
                    m.project_import_url_placeholder?.() ??
                    'https://example.com/package.zip'
                  }
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  {m.project_import_url_hint?.() ??
                    'Enter a URL to a ZIP or TAR.GZ file'}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Button
          onClick={handleImport}
          className="w-full"
          disabled={
            (activeTab === 'file' && !selectedFile) ||
            (activeTab === 'url' && !packageUrl) ||
            isImporting
          }
        >
          {isImporting
            ? (m.project_import_btn_importing?.() ?? 'Importing...')
            : (m.project_import_btn_import?.() ?? 'Import Project')}
        </Button>
      </div>
    </div>
  );
}
