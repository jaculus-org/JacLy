import { createFromBundle } from '@jaculus/project/creation';
import type { JaculusProjectType } from '@jaculus/project/package';
import type { RegistryListTemplate } from '@jaculus/project/registry';
import { getRouteApi } from '@tanstack/react-router';
import { enqueueSnackbar } from 'notistack';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { m } from '@/core/paraglide/messages';
import { logger } from '@/core';
import { loadPackageFromFile } from '../../services/load-package';
import { createProjectRegistry, defaultRegisters } from '../../services/registry';
import { ProjectNewContext } from './project-new-context';

const routeApi = getRouteApi('/project/new');

export function ProjectNewProvider({ children }: { children: ReactNode }) {
  const navigate = routeApi.useNavigate();
  const search = routeApi.useSearch();
  const { projectManService: runtimeService, projectFsService } = routeApi.useRouteContext();
  const projectType: JaculusProjectType = search.type ?? 'jacly';

  const [projectName, setProjectName] = useState('');
  const [templates, setTemplates] = useState<RegistryListTemplate[]>([]);
  const [registers, setRegisters] = useState<string[]>(defaultRegisters);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === search.template) ?? null,
    [search.template, templates],
  );
  const showInitialTemplateLoading = templatesLoading && templates.length === 0;
  const showTemplateRefresh = templatesLoading && templates.length > 0;

  useEffect(() => {
    logger.clear();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setTemplatesLoading(true);
    setTemplatesError(false);

    (async () => {
      try {
        const registry = createProjectRegistry(registers);
        const loadedTemplates = await registry.listTemplates(projectType);
        if (cancelled) return;
        setTemplates(loadedTemplates);
        setTemplatesLoading(false);
      } catch (error) {
        if (cancelled) return;
        console.error('Failed to load templates from registry:', error);
        setTemplates([]);
        setTemplatesLoading(false);
        setTemplatesError(true);
        enqueueSnackbar(m.project_new_template_load_error(), { variant: 'error' });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [projectType, registers]);

  useEffect(() => {
    if (templatesLoading || templatesError) {
      return;
    }

    const templateExists = templates.some((template) => template.id === search.template);
    const nextTemplate = templateExists ? search.template : templates[0]?.id;

    if (search.template === nextTemplate) {
      return;
    }

    navigate({
      search: (prev) => ({
        ...prev,
        type: projectType,
        template: nextTemplate,
      }),
      replace: true,
      resetScroll: false,
    });
  }, [navigate, projectType, search.template, templates, templatesError, templatesLoading]);

  function selectType(type: JaculusProjectType) {
    if (type === projectType) return;
    navigate({
      search: (prev) => ({ ...prev, type, template: undefined }),
      resetScroll: false,
    });
  }

  function selectTemplate(templateId: string) {
    navigate({
      search: (prev) => ({ ...prev, type: projectType, template: templateId }),
      resetScroll: false,
    });
  }

  async function createProject() {
    if (!selectedTemplate) return;

    if (projectName.trim() === '') {
      enqueueSnackbar(m.project_new_name_required(), { variant: 'warning' });
      return;
    }

    setIsCreating(true);
    try {
      const registry = createProjectRegistry(registers);
      const versions = await registry.listVersions(selectedTemplate.id);
      const tgz = await registry.getPackageTgz(selectedTemplate.id, versions[0]);

      const file = new File([new Uint8Array(tgz)], 'package.tar.gz', {
        type: 'application/gzip',
      });

      const importResult = await loadPackageFromFile(file);
      const pkg = importResult.package;

      const newProject = await runtimeService.createProject(projectName, projectType);
      const { fs, projectPath } = await projectFsService.mount(newProject.id);

      await createFromBundle(fs, projectPath, pkg, logger, false, false);

      navigate({
        to: '/project/$projectId',
        params: { projectId: newProject.id },
      });
    } catch (error) {
      console.error('Failed to create project:', error);
      enqueueSnackbar(m.project_new_creation_error(), { variant: 'error' });
      setIsCreating(false);
    }
  }

  const canSubmit = Boolean(selectedTemplate) && !isCreating;

  return (
    <ProjectNewContext.Provider
      value={{
        state: {
          projectName,
          projectType,
          templates,
          selectedTemplate,
          registers,
          templatesLoading,
          templatesError,
          isCreating,
        },
        actions: {
          setProjectName,
          setRegisters,
          selectType,
          selectTemplate,
          createProject,
        },
        meta: {
          showInitialTemplateLoading,
          showTemplateRefresh,
          canSubmit,
        },
      }}
    >
      {children}
    </ProjectNewContext.Provider>
  );
}
