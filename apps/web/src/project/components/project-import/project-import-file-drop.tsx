import { FileArchiveIcon, Trash2Icon, UploadIcon } from 'lucide-react';
import { useRef } from 'react';
import { m } from '@/core/paraglide/messages';
import { useProjectImport } from './project-import-context';
import { formatFileSize } from './project-import-utils';

export function ProjectImportFileDrop() {
  const { state, actions } = useProjectImport();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) actions.setSelectedFile(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (dragCounter.current === 1) actions.setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) actions.setDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    actions.setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) actions.setSelectedFile(file);
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`group cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
        state.dragOver
          ? 'border-primary bg-primary/8'
          : 'border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/40'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        accept=".zip,.tar,.tar.gz,.tgz"
        onChange={handleFileSelect}
        className="hidden"
      />

      {state.dragOver ? (
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <UploadIcon className="size-6" />
          </div>
          <p className="font-medium text-primary">Drop file here</p>
        </div>
      ) : state.selectedFile ? (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 text-left">
          <div className="flex items-center gap-4 min-w-0">
            <div className="shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary">
              <FileArchiveIcon className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{state.selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(state.selectedFile.size)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              actions.setSelectedFile(null);
            }}
            className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2Icon className="size-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary/20">
            <UploadIcon className="size-6" />
          </div>
          <p className="font-medium text-foreground">{m.project_import_click_hint()}</p>
          <p className="text-sm text-muted-foreground">{m.project_import_supported_formats()}</p>
        </div>
      )}
    </div>
  );
}
