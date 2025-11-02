import { ListProjects } from '@/components/projects/projects-list';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/editor/')({
  component: EditorRoot,
});

function EditorRoot() {
  return <ListProjects />;
}
