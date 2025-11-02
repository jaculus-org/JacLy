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
import { enqueueSnackbar } from 'notistack';
import { NewProjectButton } from './new-project-button';
import { deleteProject, getProjects } from '@/lib/projects/project-manager';

export type JaclyProjectType = 'jacly' | 'code';

export type JacProject = {
  name: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isStarred: boolean;
  archived: Date | null;
  jaculusVersion: string;
  type: JaclyProjectType;
  folderStructure?: Record<string, boolean>;
};

export function ListProjects() {
  const projects = getProjects();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  function handleDelete(id: string) {
    setProjectToDelete(id);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (projectToDelete) {
      try {
        const result = await deleteProject(projectToDelete);
        if (result) {
          enqueueSnackbar(`Project has been deleted.`, {
            variant: 'success',
          });
        } else {
          enqueueSnackbar(`Failed to delete project.`, {
            variant: 'error',
          });
        }
      } catch (error) {
        if (error instanceof Error && error.message === 'blocked') {
          enqueueSnackbar(
            'Database deletion blocked. Please reload the window.',
            {
              variant: 'warning',
            }
          );
        } else {
          enqueueSnackbar(`Failed to delete project.`, {
            variant: 'error',
          });
        }
      }
    }
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-center">Projects</h1>

      <div className="flex justify-center mb-4">
        <NewProjectButton />
      </div>

      {projects.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => {
              const Icon = project.type === 'jacly' ? Blocks : Code;
              return (
                <Link
                  key={project.id}
                  to="/editor/$projectId"
                  params={{ projectId: project.id }}
                  className="block"
                >
                  <Card
                    className={`transition-all duration-300 hover:shadow-lg`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-5 h-5" />
                          <CardTitle className="text-lg">
                            {project.name}
                          </CardTitle>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                handleDelete(project.id);
                              }}
                              className="text-red-600"
                            >
                              <Trash className="w-4 h-4 mr-2" />
                              Delete Project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Created At:{' '}
                          {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Updated At:{' '}
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Version: {project.jaculusVersion}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Project</DialogTitle>
                <DialogDescription>
                  Do you really want to delete this project? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  Perform Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <p className="text-center text-muted-foreground">
          No projects found. Create a new project to get started.
        </p>
      )}
    </div>
  );
}
