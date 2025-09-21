import { FlexLayoutEditor } from '@/components/layout/flexlayout';
import { getProjectById } from '@/lib/project/projects';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/editor/$projectId')({
  // In a loader
  loader: ({ params }) => getProjectById(params.projectId),
  // Or in a component
  component: PostComponent,
});

function PostComponent() {
  // const { projectId } = Route.useParams();
  // const data = Route.useLoaderData();

  return <FlexLayoutEditor />;
}
