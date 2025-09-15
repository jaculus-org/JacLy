import { createFileRoute } from '@tanstack/react-router';
// import { TarDemo } from '@/components/test/tar-demo'

export const Route = createFileRoute('/tar')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/tar"!</div>;
}
