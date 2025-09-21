import { ListProjects } from '@/components/project/list/list-projects';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/editor/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <ListProjects />;
}
