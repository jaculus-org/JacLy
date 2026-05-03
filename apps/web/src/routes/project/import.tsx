import { getRequest } from '@jaculus/jacly/project';
import { createFromBundle } from '@jaculus/project/creation';
import {
  loadPackageFromBytes,
  loadPackageFromUri,
  type PackageLoadResult,
} from '@jaculus/project/import';
import { createFileRoute } from '@tanstack/react-router';
import { toUint8Array } from 'js-base64';
import { FileArchiveIcon, LinkIcon, Trash2Icon, UploadIcon } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Logger } from '@/core/components/logger';
import { m } from '@/core/paraglide/messages';
import { logger } from '@/core/services/logger-service';
import { loadPackageFromFile } from '@/project/services/load-package';
import { ProjectFormSection } from '@/ui';
import { Button } from '@/ui/components/button';
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

const ACCEPTED_EXTENSIONS = ['.zip', '.tar', '.tar.gz', '.tgz'];
const inputTextClass =
  'text-slate-950 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500';

function isAcceptedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

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
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoImportTriggered = useRef(false);
  const dragCounter = useRef(0);

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

  const applyFile = useCallback((file: File) => {
    if (!isAcceptedFile(file)) {
      enqueueSnackbar(m.project_import_invalid_file(), { variant: 'error' });
      return;
    }
    setSelectedFile(file);
    const nameWithoutExt = file.name
      .replace(/\.zip$/i, '')
      .replace(/\.tar\.gz$/i, '')
      .replace(/\.tgz$/i, '');
    setProjectName(nameWithoutExt);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) applyFile(file);
    },
    [applyFile],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (dragCounter.current === 1) setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) applyFile(file);
    },
    [applyFile],
  );

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

  useEffect(() => {
    if (auto && (packageUrl || inlineData) && !autoImportTriggered.current) {
      autoImportTriggered.current = true;
      void handleImport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleImport, inlineData, packageUrl, auto]);

  return (
    <div className="space-y-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
        {m.project_import_title()}
      </h1>

      <div className="mx-auto max-w-3xl space-y-6">
        <ProjectFormSection title={m.project_new_name_label()}>
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder={m.project_new_name_placeholder()}
            autoFocus
            className={`h-11 text-base ${inputTextClass}`}
          />
        </ProjectFormSection>

        <ProjectFormSection title={m.project_import_title()}>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'file' | 'url')}
            className="flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-2" variant="default">
              <TabsTrigger value="file">
                <UploadIcon className="mr-2 size-4" />
                {m.project_import_tab_file()}
              </TabsTrigger>
              <TabsTrigger value="url">
                <LinkIcon className="mr-2 size-4" />
                {m.project_import_tab_url()}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="mt-4">
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`group cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
                  dragOver
                    ? 'border-sky-500 bg-sky-50/60 dark:border-sky-400 dark:bg-sky-950/30'
                    : 'border-sky-200/70 bg-sky-50/30 hover:border-sky-300/90 hover:bg-sky-50/50 dark:border-sky-900/40 dark:bg-sky-950/15 dark:hover:border-sky-800/60 dark:hover:bg-sky-950/25'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".zip,.tar,.tar.gz,.tgz"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {dragOver ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="rounded-xl bg-sky-100 p-3 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                      <UploadIcon className="size-6" />
                    </div>
                    <p className="font-medium text-sky-700 dark:text-sky-300">Drop file here</p>
                  </div>
                ) : selectedFile ? (
                  <div className="flex items-center justify-between gap-4 rounded-lg border border-sky-200/60 bg-white/70 p-4 text-left dark:border-sky-900/40 dark:bg-slate-950/50">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="shrink-0 rounded-xl bg-sky-100 p-2.5 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                        <FileArchiveIcon className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-950 dark:text-slate-50">
                          {selectedFile.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                    >
                      <Trash2Icon className="size-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="rounded-xl bg-sky-100 p-3 text-sky-700 transition-colors group-hover:bg-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:group-hover:bg-sky-900">
                      <UploadIcon className="size-6" />
                    </div>
                    <p className="font-medium text-slate-700 dark:text-slate-200">
                      {m.project_import_click_hint()}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {m.project_import_supported_formats()}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="url" className="mt-4">
              <div className="space-y-3">
                <Input
                  type="url"
                  value={packageUrl}
                  onChange={(e) => setPackageUrl(e.target.value)}
                  placeholder={m.project_import_url_placeholder()}
                  className={`h-11 text-base ${inputTextClass}`}
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {m.project_import_url_hint()}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </ProjectFormSection>

        <div className="pt-2">
          <Button
            onClick={handleImport}
            size="lg"
            className="w-full bg-slate-950 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_14px_32px_-18px_rgba(15,23,42,0.45)] dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-slate-200 dark:hover:shadow-[0_14px_30px_-18px_rgba(226,232,240,0.18)]"
            disabled={
              (activeTab === 'file' && !selectedFile) ||
              (activeTab === 'url' && !packageUrl) ||
              isImporting
            }
          >
            {isImporting ? m.project_import_btn_importing() : m.project_import_btn_import()}
          </Button>
        </div>

        <Logger.Logs defaultLevel="silly" logLevelSelector={false} hideIfEmpty />
      </div>
    </div>
  );
}
