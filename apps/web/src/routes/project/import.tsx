import { getRequest } from '@jaculus/jacly/project';
import { createFromBundle } from '@jaculus/project/creation';
import {
  loadPackageFromBytes,
  loadPackageFromUri,
  type PackageLoadResult,
} from '@jaculus/project/import';
import { createFileRoute } from '@tanstack/react-router';
import { toUint8Array } from 'js-base64';
import { LinkIcon, UploadIcon } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import { Logger } from '@/core/components/logger';
import { m } from '@/core/paraglide/messages';
import { logger } from '@/core/services/logger-service';
import { loadPackageFromFile } from '@/project/services/load-package';
import { Button } from '@/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/components/card';
import { Input } from '@/ui/components/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/components/tabs';
import { generateNanoId } from '@/ui/lib/nanoid';

interface ImportSearchParams {
  url?: string;
  data?: string;
  auto?: true;
}

export const Route = createFileRoute('/project/import')({
  component: ImportProject,
  validateSearch: (search: Record<string, unknown>): ImportSearchParams => {
    return {
      url: typeof search.url === 'string' ? search.url : undefined,
      data: typeof search.data === 'string' ? search.data : undefined,
      auto:
        search.auto === 'true' || search.auto === '1' || search.auto === true ? true : undefined,
    };
  },
});

function ImportProject() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const initialUrl = search.url ?? '';
  const inlineData = search.data;
  const auto = search.auto ?? false;
  const { projectManService: runtimeService, projectFsService } = Route.useRouteContext();

  const [projectName, setProjectName] = useState(`imported-project-${generateNanoId(5)}`);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [packageUrl, setPackageUrl] = useState(initialUrl);
  const [activeTab, setActiveTab] = useState<'file' | 'url'>(initialUrl ? 'url' : 'file');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoImportTriggered = useRef(false);

  useEffect(() => {
    logger.clear();
  }, []);

  useEffect(() => {
    const current = search.url ?? '';
    if (packageUrl === current) return;
    const timer = setTimeout(() => {
      navigate({
        search: (prev) => ({ ...prev, url: packageUrl || undefined }),
        replace: true,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [packageUrl, navigate, search.url]);

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
      let importResult: PackageLoadResult;

      if (inlineData) {
        const bytes = toUint8Array(inlineData);
        importResult = await loadPackageFromBytes(bytes);
      } else if (activeTab === 'file') {
        if (!selectedFile) {
          enqueueSnackbar(m.project_import_invalid_file(), {
            variant: 'error',
          });
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
        importResult = await loadPackageFromUri(getRequest, packageUrl);
      }

      const newProject = await runtimeService.createProject(projectName, importResult.projectType);

      const { fs, projectPath } = await projectFsService.mount(newProject.id);

      await createFromBundle(fs, projectPath, importResult.package, logger, false, false);

      enqueueSnackbar(m.project_import_success({ fileCount: importResult.fileCount }), {
        variant: 'success',
      });

      await navigate({
        to: '/project/$projectId',
        params: { projectId: newProject.id },
      });
    } catch (error) {
      console.error('Failed to import project:', error);
      enqueueSnackbar(m.project_import_error(), { variant: 'error' });
      setIsImporting(false);
    }
  }

  // Auto-import when `auto=true` is present in the URL alongside a `url` param
  useEffect(() => {
    if (auto && (packageUrl || inlineData) && !autoImportTriggered.current) {
      autoImportTriggered.current = true;
      void handleImport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleImport, inlineData, packageUrl, auto]);

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">{m.project_import_title()}</h1>

      <div className="space-y-6">
        <div>
          <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
            {m.project_new_name_label()}
          </label>
          <Input
            id="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder={m.project_new_name_placeholder()}
            autoFocus
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'file' | 'url')}
          className="flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2" variant={'default'}>
            <TabsTrigger value="file">
              <UploadIcon className="w-4 h-4 mr-2" />
              {m.project_import_tab_file()}
            </TabsTrigger>
            <TabsTrigger value="url">
              <LinkIcon className="w-4 h-4 mr-2" />
              {m.project_import_tab_url()}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{m.project_import_file_title()}</CardTitle>
                <CardDescription>{m.project_import_file_description()}</CardDescription>
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
                      <p className="text-muted-foreground mb-1">{m.project_import_click_hint()}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.project_import_supported_formats()}
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
                <CardTitle>{m.project_import_url_title()}</CardTitle>
                <CardDescription>{m.project_import_url_description()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  type="url"
                  value={packageUrl}
                  onChange={(e) => setPackageUrl(e.target.value)}
                  placeholder={m.project_import_url_placeholder()}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">{m.project_import_url_hint()}</p>
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
          {isImporting ? m.project_import_btn_importing() : m.project_import_btn_import()}
        </Button>

        <Logger.Logs defaultLevel="silly" logLevelSelector={false} hideIfEmpty />
      </div>
    </div>
  );
}
