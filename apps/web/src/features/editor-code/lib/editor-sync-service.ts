/**
 * EditorSyncService - Coordinates editor saves and file system changes
 *
 * This service tracks files being saved by the editor to prevent the file watcher
 * from reloading content that was just written, avoiding race conditions.
 *
 * The pending-save flag is held for the full duration of the writeFile call,
 * not a fixed timeout, so partial reads during slow IndexedDB writes are blocked.
 */

type FileChangeListener = (filePath: string, content: string) => void;

class EditorSyncServiceImpl {
  // Files currently being written by the editor — watcher events are ignored
  private pendingSaves = new Set<string>();

  // Listeners for external file changes
  private externalChangeListeners: FileChangeListener[] = [];

  /**
   * Mark a file as being written by the editor.
   * Pair with markEditorSaveEnd() when the write completes.
   */
  markEditorSaveStart(filePath: string): void {
    this.pendingSaves.add(filePath);
  }

  /**
   * Clear the pending-save flag after the write completes (or fails).
   */
  markEditorSaveEnd(filePath: string): void {
    this.pendingSaves.delete(filePath);
  }

  /**
   * Check if a file watcher event should be ignored.
   * Returns true while the editor is writing this file.
   */
  shouldIgnoreWatcherEvent(filePath: string): boolean {
    return this.pendingSaves.has(filePath);
  }

  /**
   * Subscribe to external file changes.
   * These are changes from sources other than the editor (e.g., compiler).
   */
  onExternalChange(listener: FileChangeListener): () => void {
    this.externalChangeListeners.push(listener);
    return () => {
      const index = this.externalChangeListeners.indexOf(listener);
      if (index > -1) {
        this.externalChangeListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify listeners of an external file change.
   * Called by the file watcher when a non-editor change is detected.
   */
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

// Singleton instance
export const editorSyncService = new EditorSyncServiceImpl();
