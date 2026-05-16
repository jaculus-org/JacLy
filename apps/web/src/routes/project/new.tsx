import type { JaculusProjectType } from '@jaculus/project/package';
import { createFileRoute } from '@tanstack/react-router';
import { ProjectNewPage } from '@/project';

interface NewProjectSearchParams {
  type?: JaculusProjectType;
  template?: string;
}

export const Route = createFileRoute('/project/new')({
  component: ProjectNewPage,
  validateSearch: (search: Record<string, unknown>): NewProjectSearchParams => {
    const type =
      search.type === 'jacly' || search.type === 'code'
        ? (search.type as JaculusProjectType)
        : undefined;

    return {
      type,
      template: typeof search.template === 'string' ? search.template : undefined,
    };
  },
});
