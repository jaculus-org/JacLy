import { EditorProvider } from '@/providers/editor-provider';
import { JacProjectProvider } from '@/providers/jac-project-provider';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/editor/$projectId')({
  loader: ({ params }) => params.projectId,
  component: EditorProject,
});

function EditorProject() {
  const projectId = Route.useLoaderData();

  return (
    <JacProjectProvider projectId={projectId}>
      <EditorProvider />
    </JacProjectProvider>
  );
}
