import { getRequest } from '@jaculus/jacly/project';
import { createFromBundle } from '@jaculus/project/creation';
import {
  loadPackageFromBytes,
  loadPackageFromUri,
  type PackageLoadResult,
} from '@jaculus/project/import';
import { getRouteApi } from '@tanstack/react-router';
import { toUint8Array } from 'js-base64';
import { enqueueSnackbar } from 'notistack';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { logger } from '@/core';
import { m } from '@/core/paraglide/messages';
import { generateNanoId } from '@/ui/lib/nanoid';
import { loadPackageFromFile } from '../../services/load-package';
import { ProjectImportContext } from './project-import-context';
import { isAcceptedFile } from './project-import-utils';

const routeApi = getRouteApi('/project/import');

export function ProjectImportProvider({ children }: { children: ReactNode }) {
  const navigate = routeApi.useNavigate();
  const search = routeApi.useSearch();
  const initialUrl = search.url ?? '';
  const inlineData = search.data;
  const auto = search.auto ?? false;
  const { projectManService: runtimeService, projectFsService } = routeApi.useRouteContext();

  const [projectName, setProjectName] = useState(`imported-project-${generateNanoId(5)}`);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [packageUrl, setPackageUrl] = useState(initialUrl);
  const [activeTab, setActiveTab] = useState<'file' | 'url'>(initialUrl ? 'url' : 'file');
  const [isImporting, setIsImporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
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

  const handleImport = useCallback(async () => {
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
  }, [
    activeTab,
    inlineData,
    navigate,
    packageUrl,
    projectFsService,
    projectName,
    runtimeService,
    selectedFile,
  ]);

  useEffect(() => {
    if (auto && (packageUrl || inlineData) && !autoImportTriggered.current) {
      autoImportTriggered.current = true;
      void handleImport();
    }
  }, [handleImport, inlineData, packageUrl, auto]);

  const value = {
    state: { projectName, selectedFile, packageUrl, activeTab, isImporting, dragOver },
    actions: {
      setProjectName,
      setSelectedFile: (file: File | null) => {
        if (file) applyFile(file);
        else setSelectedFile(null);
      },
      setPackageUrl,
      setActiveTab,
      setDragOver,
      handleImport,
    },
  };

  return <ProjectImportContext.Provider value={value}>{children}</ProjectImportContext.Provider>;
}
