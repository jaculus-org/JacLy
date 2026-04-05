type FileChangeListener = (filePath: string, content: string) => void;

/**
 * Coordinates editor saves and filesystem changes.
 *
 * Tracks files being written by any editor so the ZenFS watcher never reads
 * partially-written content. Every writer must bracket its writeFile call with
 * markEditorSaveStart / markEditorSaveEnd and call notifyExternalChange after
 * writes that originate outside the Monaco text editor.
 */
export class EditorSyncService {
  private pendingSaves = new Set<string>();
  private externalChangeListeners: FileChangeListener[] = [];

  markEditorSaveStart(filePath: string): void {
    this.pendingSaves.add(filePath);
  }

  markEditorSaveEnd(filePath: string): void {
    this.pendingSaves.delete(filePath);
  }

  shouldIgnoreWatcherEvent(filePath: string): boolean {
    return this.pendingSaves.has(filePath);
  }

  onExternalChange(listener: FileChangeListener): () => void {
    this.externalChangeListeners.push(listener);
    return () => {
      const index = this.externalChangeListeners.indexOf(listener);
      if (index > -1) this.externalChangeListeners.splice(index, 1);
    };
  }

  notifyExternalChange(filePath: string, content: string): void {
    for (const listener of this.externalChangeListeners) {
      try {
        listener(filePath, content);
      } catch (error) {
        console.error('Error in external change listener:', error);
      }
    }
  }
}

export const editorSyncService = new EditorSyncService();
