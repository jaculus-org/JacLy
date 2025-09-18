import { SelectNewProject } from '@/components/project/new/CreateNewProject';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/editor/new')({
  component: RouteComponent,
});

function RouteComponent() {
  return <SelectNewProject />;
}
