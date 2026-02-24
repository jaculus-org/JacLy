import { m } from '@/paraglide/messages';
import { downloadProjectAsZip } from '@/features/project/lib/download';
import { Button } from '@/features/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/features/shared/components/ui/dropdown-menu';
import { Input } from '@/features/shared/components/ui/input';
import type { FSInterface } from '@jaculus/project/fs';
import path from 'path';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Blocks,
  Code,
  Download,
  MoreVertical,
  Pencil,
  Trash,
} from 'lucide-react';
import { useState } from 'react';
import { loadPackageJson, savePackageJson } from '@jaculus/project/package';

export const Route = createFileRoute('/project/')({
  component: EditorList,
});

function EditorList() {
  const { projectManService: runtimeService, projectFsService } =
    Route.useRouteContext();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [projectToRename, setProjectToRename] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState<string | null>(null);

  const projects = useLiveQuery(
    () => runtimeService.listProjects(),
    [runtimeService]
  );
  const navigate = useNavigate();

  async function confirmDelete() {
    if (projectToDelete) {
      await runtimeService.deleteProject(projectToDelete);
    }
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  }

  const projectNamePattern = /^[a-zA-Z0-9-_ ]+$/;
  const projectNamePatternJson = /^[a-z0-9-_]+$/;

  function startRename(projectId: string, projectName: string) {
    setProjectToRename({ id: projectId, name: projectName });
    setRenameValue(projectName);
    setRenameError(null);
    setRenameDialogOpen(true);
  }

  async function confirmRename() {
    if (!projectToRename) return;
    const nextName = renameValue.trim();

    if (!nextName) {
      setRenameError(m.project_rename_required());
      return;
    }

    if (!projectNamePattern.test(nextName)) {
      setRenameError(m.project_rename_invalid());
      return;
    }

    setRenameError(null);

    try {
      const projectId = projectToRename.id;

      if (nextName === projectToRename.name) {
        setRenameDialogOpen(false);
        setProjectToRename(null);
        return;
      }
      const nextNamePackage = nextName.replace(/[^a-zA-Z0-9-_]/g, '-');

      if (projectNamePatternJson.test(nextNamePackage)) {
        await projectFsService.withMount(
          projectId,
          async ({ fs, projectPath }) => {
            const packageJsonPath = path.join(projectPath, 'package.json');
            const pkgJson = await loadPackageJson(fs, packageJsonPath);
            await savePackageJson(fs, packageJsonPath, {
              ...pkgJson,
              name: nextName,
            });
          }
        );
      }

      await runtimeService.renameProject(projectId, nextName);

      setRenameDialogOpen(false);
      setProjectToRename(null);
    } catch (error) {
      console.error('Failed to rename project:', error);
      setRenameError(m.project_rename_failed());
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-center">
        {m.project_title()}
      </h1>

      <div className="flex justify-center mb-4 space-x-4">
        <Button
          onClick={() => {
            navigate({ to: '/project/new' });
          }}
          variant="outline"
          size={'lg'}
        >
          {m.project_btn_create()}
        </Button>

        <Button
          onClick={() => {
            navigate({ to: '/project/import' });
          }}
          variant="outline"
          size={'lg'}
        >
          {m.project_btn_import()}
        </Button>
      </div>

      {projects && projects.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => {
              const Icon = project.type === 'jacly' ? Blocks : Code;
              return (
                <Link
                  key={project.id}
                  to="/project/$projectId"
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
                                runtimeService.deleteProject(project.id);
                              }}
                              className="text-red-600"
                            >
                              <Trash className="w-4 h-4 mr-2" />
                              {m.project_delete()}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                startRename(project.id, project.name);
                              }}
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              {m.project_rename()}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async e => {
                                e.stopPropagation();
                                await projectFsService.withMount(
                                  project.id,
                                  async ({ fs, projectPath }) => {
                                    await downloadProjectAsZip(
                                      fs as unknown as FSInterface,
                                      projectPath,
                                      project.name
                                    );
                                  }
                                );
                              }}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              {m.project_download_zip()}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {m.project_created_at()}{' '}
                          {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {m.project_updated_at()}{' '}
                          {new Date(project.modifiedAt).toLocaleDateString()}
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
                <DialogTitle>{m.project_delete_title()}</DialogTitle>
                <DialogDescription>
                  {m.project_delete_description()}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  {m.project_delete_cancel()}
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  {m.project_delete_confirm()}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={renameDialogOpen}
            onOpenChange={open => {
              setRenameDialogOpen(open);
              if (!open) {
                setRenameError(null);
                setProjectToRename(null);
              }
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{m.project_rename_title()}</DialogTitle>
                <DialogDescription>
                  {m.project_rename_description()}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Input
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  placeholder={m.project_rename_placeholder()}
                />
                {renameError && (
                  <p className="text-sm text-destructive">{renameError}</p>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setRenameDialogOpen(false)}
                >
                  {m.project_rename_cancel()}
                </Button>
                <Button onClick={confirmRename}>
                  {m.project_rename_confirm()}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <p className="text-center text-muted-foreground">{m.project_empty()}</p>
      )}
    </div>
  );
}
