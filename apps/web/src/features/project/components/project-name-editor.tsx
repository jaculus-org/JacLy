import { m } from '@/paraglide/messages';
import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useActiveProject } from '../active-project';
import { Button } from '@/features/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog';
import { Input } from '@/features/shared/components/ui/input';

const projectNamePattern = /^[a-zA-Z0-9-_ ]+$/;

export function ProjectNameEditor() {
  const {
    state: { dbProject },
    actions: { renameProject },
  } = useActiveProject();

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function openDialog() {
    setValue(dbProject.name);
    setError(null);
    setOpen(true);
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setError(null);
    }
    setOpen(next);
  }

  async function confirm() {
    const nextName = value.trim();

    if (!nextName) {
      setError(m.project_rename_required());
      return;
    }

    if (!projectNamePattern.test(nextName)) {
      setError(m.project_rename_invalid());
      return;
    }

    if (nextName === dbProject.name) {
      setOpen(false);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await renameProject(nextName);
      setOpen(false);
    } catch {
      setError(m.project_rename_failed());
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={openDialog}
        className="group flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300 pl-4 border-l border-blue-200 dark:border-slate-600 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
        title={m.project_rename()}
      >
        <span>{dbProject.name}</span>
        <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity duration-200 flex-shrink-0" />
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{m.project_rename_title()}</DialogTitle>
            <DialogDescription>
              {m.project_rename_description()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={m.project_rename_placeholder()}
              onKeyDown={e => e.key === 'Enter' && confirm()}
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              {m.project_rename_cancel()}
            </Button>
            <Button onClick={confirm} disabled={loading}>
              {m.project_rename_confirm()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
