import { createFileRoute } from '@tanstack/react-router';
import { DocsLayout, DocsPage } from '@/docs';

export const Route = createFileRoute('/docs/$page')({
  component: DocsPageRoute,
});

function DocsPageRoute() {
  const { page } = Route.useParams();
  return (
    <DocsLayout>
      <DocsPage page={page} />
    </DocsLayout>
  );
}
