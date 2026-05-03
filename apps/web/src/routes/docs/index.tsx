import { createFileRoute } from '@tanstack/react-router';
import { DocsLayout, DocsPage } from '@/docs';

export const Route = createFileRoute('/docs/')({
  component: DocsIndexPage,
});

function DocsIndexPage() {
  return (
    <DocsLayout>
      <DocsPage page="index" />
    </DocsLayout>
  );
}
