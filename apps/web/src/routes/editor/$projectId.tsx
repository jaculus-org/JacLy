import { FlexLayoutEditor } from '@/components/layout/flexlayout';
import { getProjectById } from '@/lib/project/jacProject.ts';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/editor/$projectId')({
  loader: ({ params }) => getProjectById(params.projectId),
  component: PostComponent,
});

function PostComponent() {
  const project = Route.useLoaderData();

  return <FlexLayoutEditor project={project} />;
}
