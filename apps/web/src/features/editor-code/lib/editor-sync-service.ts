/**
 * EditorSyncService - Coordinates editor saves and file system changes
 *
 * This service tracks files being saved by the editor to prevent the file watcher
 * from reloading content that was just written, avoiding race conditions.
 */

type FileChangeListener = (filePath: string, content: string) => void;

class EditorSyncServiceImpl {
  // Files currently being saved by the editor (should ignore watcher events)
  private pendingSaves = new Map<string, number>();

  // Timeout duration to consider a save as "pending" (ms)
  private readonly SAVE_TIMEOUT = 200;

  // Listeners for external file changes
  private externalChangeListeners: FileChangeListener[] = [];

  /**
   * Mark a file as being saved by the editor.
   * The file watcher should ignore the next change event for this file.
   */
  markEditorSave(filePath: string): void {
    // Clear any existing timeout
    const existingTimeout = this.pendingSaves.get(filePath);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    const timeoutId = window.setTimeout(() => {
      this.pendingSaves.delete(filePath);
    }, this.SAVE_TIMEOUT);

    this.pendingSaves.set(filePath, timeoutId);
  }

  /**
   * Check if a file watcher event should be ignored.
   * Returns true if this file was recently saved by the editor.
   */
  shouldIgnoreWatcherEvent(filePath: string): boolean {
    return this.pendingSaves.has(filePath);
  }

  /**
   * Clear pending save status for a file (e.g., when save is confirmed).
   */
  clearPendingSave(filePath: string): void {
    const timeoutId = this.pendingSaves.get(filePath);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.pendingSaves.delete(filePath);
    }
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
