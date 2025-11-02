import { NewProject } from '@/components/projects/project-new';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/editor/new')({
  component: NewProjectRoute,
});

function NewProjectRoute() {
  return <NewProject />;
}
