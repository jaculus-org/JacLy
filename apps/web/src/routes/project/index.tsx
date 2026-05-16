import { createFileRoute } from '@tanstack/react-router';
import { ProjectIndexContainer } from '@/project';

export const Route = createFileRoute('/project/')({
  component: ProjectIndexRoute,
});

function ProjectIndexRoute() {
  const { projectManService, projectFsService } = Route.useRouteContext();
  return (
    <ProjectIndexContainer runtimeService={projectManService} projectFsService={projectFsService} />
  );
}
