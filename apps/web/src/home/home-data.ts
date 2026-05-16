import type { JaculusProjectType } from '@jaculus/project/package';
import type { RegistryListTemplate } from '@jaculus/project/registry';
import { buildInfo } from 'virtual-build-info';
import { fetchReleaseSummary } from '@/core/services/release-summary';
import type { IDbProject } from '@/core/types/project';
import { createProjectRegistry } from '@/project';
import type { HomeReleaseSummary } from './home-context';

const featuredTemplateCount = 3;

interface HomeDataDeps {
  projectManService: {
    listProjects(): Promise<IDbProject[]>;
  };
}

export interface HomeDataResult {
  jaclyTemplates: RegistryListTemplate[];
  codeTemplates: RegistryListTemplate[];
  recentProjects: IDbProject[];
  releaseSummary: HomeReleaseSummary | null;
  templatesAvailable: boolean;
  templatesLoaded: boolean;
}

export async function loadHomeData({ projectManService }: HomeDataDeps): Promise<HomeDataResult> {
  const [templates, recentProjects, releaseSummary] = await Promise.all([
    loadTemplates(),
    projectManService.listProjects(),
    loadReleaseSummary(),
  ]);

  return {
    jaclyTemplates: templates.jaclyTemplates,
    codeTemplates: templates.codeTemplates,
    recentProjects: [...recentProjects]
      .sort((left, right) => right.modifiedAt - left.modifiedAt)
      .slice(0, 4),
    releaseSummary,
    templatesAvailable: templates.templatesAvailable,
    templatesLoaded: templates.templatesLoaded,
  };
}

async function loadTemplates() {
  try {
    const registry = createProjectRegistry();
    const templates = await registry.listTemplates();

    return {
      jaclyTemplates: takeTemplates(templates, 'jacly'),
      codeTemplates: takeTemplates(templates, 'code'),
      templatesAvailable: true,
      templatesLoaded: true,
    };
  } catch (error) {
    console.error('Failed to load homepage templates:', error);
    return {
      jaclyTemplates: [],
      codeTemplates: [],
      templatesAvailable: false,
      templatesLoaded: true,
    };
  }
}

function takeTemplates(templates: RegistryListTemplate[], type: JaculusProjectType) {
  return templates
    .filter((template) => template.projectType === type)
    .slice(0, featuredTemplateCount);
}

async function loadReleaseSummary(): Promise<HomeReleaseSummary | null> {
  try {
    const entries = await fetchReleaseSummary();
    if (entries.length === 0) return null;

    const entry = entries.find((e) => e.version === buildInfo.version) ?? entries[0];
    if (!entry || !Array.isArray(entry.items) || entry.items.length === 0) return null;

    return {
      items: entry.items.filter((item): item is string => typeof item === 'string').slice(0, 4),
    };
  } catch (error) {
    console.error('Failed to load release summary:', error);
    return null;
  }
}
