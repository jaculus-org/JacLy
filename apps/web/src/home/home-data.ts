import type { JaculusProjectType } from '@jaculus/project/package';
import type { RegistryListTemplate } from '@jaculus/project/registry';
import { getLocale } from '@/core/paraglide/runtime';
import type { IDbProject } from '@/core/types/project';
import { createProjectRegistry } from '@/project/services/registry';
import type { HomeReleaseSummary } from './home-context';

const featuredTemplateCount = 3;

interface HomeDataDeps {
  projectManService: {
    listProjects(): Promise<IDbProject[]>;
  };
}

interface ReleaseSummaryFile {
  en?: HomeReleaseSummary;
  cs?: HomeReleaseSummary;
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
    const response = await fetch(
      `${import.meta.env.BASE_URL}release-summary.json?ts=${Date.now()}`,
      {
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as ReleaseSummaryFile;
    const summary = data[getLocale()];

    if (!summary || !Array.isArray(summary.items) || summary.items.length === 0) {
      return null;
    }

    return {
      items: summary.items.filter((item): item is string => typeof item === 'string').slice(0, 4),
    };
  } catch (error) {
    console.error('Failed to load release summary:', error);
    return null;
  }
}
