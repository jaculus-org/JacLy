import { createFileRoute } from '@tanstack/react-router';
import { ProjectImportPage } from '@/project/components/project-import/project-import-page';

interface ImportSearchParams {
  url?: string;
  data?: string;
  auto?: true;
}

export const Route = createFileRoute('/project/import')({
  component: ProjectImportPage,
  validateSearch: (search: Record<string, unknown>): ImportSearchParams => {
    return {
      url: typeof search.url === 'string' ? search.url : undefined,
      data: typeof search.data === 'string' ? search.data : undefined,
      auto:
        search.auto === 'true' || search.auto === '1' || search.auto === true ? true : undefined,
    };
  },
});
