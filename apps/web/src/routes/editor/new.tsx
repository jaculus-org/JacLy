import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/editor/new')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/editor/new"!</div>;
}
