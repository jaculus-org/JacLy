type FileChangeListener = (filePath: string, content: string) => void;

// Prevents ZenFS watcher events from racing concurrent editor writes.
// Writers call markEditorSaveStart/End around writeFile to suppress watcher events;
// non-Monaco writers call notifyExternalChange so Monaco receives the update directly.
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
