import path from 'node:path';
import { packProjectAsTarGz } from '@jaculus/project/export';
import type { FSInterface } from '@jaculus/project/fs';
import { loadPackageJson, savePackageJson } from '@jaculus/project/package';
import { createFileRoute } from '@tanstack/react-router';
import { Archive, Download, Link2, MoreVertical, Pencil, Share2, Trash } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { Suspense, use, useMemo, useState } from 'react';
import { m } from '@/core/paraglide/messages';
import type { IDbProject } from '@/core/types/project';
import {
  buildPackageImportUrl,
  downloadProjectAsTarGz,
  downloadProjectAsZip,
  ProjectIndexPage,
  ProjectIndexSkeleton,
} from '@/project';
import { Button } from '@/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/components/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/components/dropdown-menu';
import { Input } from '@/ui/components/input';

export const Route = createFileRoute('/project/')({
  component: ProjectIndexRoute,
});

function ProjectIndexRoute() {
  const routeContext = Route.useRouteContext();
  const dataPromise = useMemo(
    () => routeContext.projectManService.listProjects(),
    [routeContext.projectManService],
  );

  return (
    <Suspense fallback={<ProjectIndexSkeleton />}>
      <ProjectIndexContent
        dataPromise={dataPromise}
        runtimeService={routeContext.projectManService}
        projectFsService={routeContext.projectFsService}
      />
    </Suspense>
  );
}

interface ProjectIndexContentProps {
  dataPromise: Promise<IDbProject[]>;
  runtimeService: {
    listProjects: () => Promise<IDbProject[]>;
    deleteProject: (projectId: string) => Promise<void>;
    renameProject: (projectId: string, nextName: string) => Promise<void>;
  };
  projectFsService: {
    withMount: <T>(
      projectId: string,
      callback: (ctx: { fs: unknown; projectPath: string }) => Promise<T>,
    ) => Promise<T>;
  };
}

function ProjectIndexContent({
  dataPromise,
  runtimeService,
  projectFsService,
}: ProjectIndexContentProps) {
  const initialProjects = use(dataPromise);
  const [projects, setProjects] = useState(initialProjects);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [projectToRename, setProjectToRename] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState<string | null>(null);

  const projectNamePattern = /^[a-zA-Z0-9-_ ]+$/;
  const projectNamePatternJson = /^[a-z0-9-_]+$/;

  async function refreshProjects() {
    setProjects(await runtimeService.listProjects());
  }

  function startRename(projectId: string, projectName: string) {
    setProjectToRename({ id: projectId, name: projectName });
    setRenameValue(projectName);
    setRenameError(null);
    setRenameDialogOpen(true);
  }

  async function confirmDelete() {
    if (!projectToDelete) return;

    await runtimeService.deleteProject(projectToDelete);
    await refreshProjects();
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
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
        await projectFsService.withMount(projectId, async ({ fs, projectPath }) => {
          const packageJsonPath = path.join(projectPath, 'package.json');
          const pkgJson = await loadPackageJson(fs as FSInterface, packageJsonPath);
          await savePackageJson(fs as FSInterface, packageJsonPath, {
            ...pkgJson,
            name: nextName,
          });
        });
      }

      await runtimeService.renameProject(projectId, nextName);
      await refreshProjects();

      setRenameDialogOpen(false);
      setProjectToRename(null);
    } catch (error) {
      console.error('Failed to rename project:', error);
      setRenameError(m.project_rename_failed());
    }
  }

  return (
    <>
      <ProjectIndexPage
        projects={projects}
        renderAction={(project) => (
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Share2 className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={async () => {
                    await projectFsService.withMount(project.id, async ({ fs, projectPath }) => {
                      await downloadProjectAsZip(fs as FSInterface, projectPath, project.name);
                    });
                  }}
                >
                  <Download className="mr-2 size-4" />
                  {m.project_download_zip()}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    await projectFsService.withMount(project.id, async ({ fs, projectPath }) => {
                      await downloadProjectAsTarGz(fs as FSInterface, projectPath, project.name);
                    });
                  }}
                >
                  <Archive className="mr-2 size-4" />
                  Download .tar.gz
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    try {
                      await projectFsService.withMount(project.id, async ({ fs, projectPath }) => {
                        const gzBytes = await packProjectAsTarGz(fs as FSInterface, projectPath, [
                          'build',
                          'node_modules',
                        ]);
                        const url = buildPackageImportUrl(new Uint8Array(gzBytes));
                        await navigator.clipboard.writeText(url);
                        enqueueSnackbar('Import URL copied to clipboard', {
                          variant: 'success',
                        });
                      });
                    } catch (error) {
                      console.error('Failed to copy project URL:', error);
                      enqueueSnackbar('Failed to copy project URL', {
                        variant: 'error',
                      });
                    }
                  }}
                >
                  <Link2 className="mr-2 size-4" />
                  Copy import URL
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => startRename(project.id, project.name)}>
                  <Pencil className="mr-2 size-4" />
                  {m.project_rename()}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setProjectToDelete(project.id);
                    setDeleteDialogOpen(true);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash className="mr-2 size-4" />
                  {m.project_delete()}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{m.project_delete_title()}</DialogTitle>
            <DialogDescription>{m.project_delete_description()}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
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
        onOpenChange={(open) => {
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
            <DialogDescription>{m.project_rename_description()}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder={m.project_rename_placeholder()}
            />
            {renameError ? <p className="text-sm text-destructive">{renameError}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              {m.project_rename_cancel()}
            </Button>
            <Button onClick={confirmRename}>{m.project_rename_confirm()}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
