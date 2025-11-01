import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/editor/$projectId')({
  component: PostComponent,
});

function PostComponent() {
  return <div>Hello "/editor/$projectId"!</div>;
}
