import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Blocks, Code, MoreVertical, Trash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useJac } from '@/jaculus/provider/jac-context';
import { NewProjectButton } from '../../new/new-project-button';
import { useIntlayer } from 'react-intlayer';
import { enqueueSnackbar } from 'notistack';

export function ListProjects() {
  const content = useIntlayer('list-projects');
  const { projects, activeProject, deleteProject } = useJac();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setProjectToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      const projectName =
        projects[projectToDelete]?.name || content.project.value;
      deleteProject(projectToDelete);
      enqueueSnackbar(
        `${content.project.value} "${projectName}" ${content.deletedMessage.value}`,
        { variant: 'success' }
      );
    }
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-center">
        {content.projects}
      </h1>

      <div className="flex justify-center mb-4">
        <NewProjectButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(projects).map(([id, project]) => {
          const Icon = project.type === 'jacly' ? Blocks : Code;
          return (
            <Card
              key={id}
              className={`transition-all duration-300 hover:shadow-lg ${activeProject?.id === id ? 'ring-2 ring-blue-500' : ''}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-5 h-5" />
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleDelete(id)}
                        className="text-red-600"
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        {content.deleteProject}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <Link
                  to="/editor/$projectId"
                  params={{ projectId: id }}
                  className="block"
                >
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {content.createdAt}:{' '}
                      {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {content.updatedAt}:{' '}
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {content.version}: {project.jaculusVersion}
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{content.deleteProject}</DialogTitle>
            <DialogDescription>
              {content.deleteProjectDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              {content.cancel}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {content.confirmDelete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
