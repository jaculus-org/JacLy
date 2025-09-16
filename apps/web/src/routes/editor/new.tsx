import { SelectNewProject } from '@/components/project/new/select-new-project';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/editor/new')({
  component: RouteComponent,
});

function RouteComponent() {
  return <SelectNewProject />;
}
