type FlushCallback = () => Promise<void>;
type PendingCallback = () => boolean;

class JaclySaveCoordinator {
  private callbacks = new Map<FlushCallback, PendingCallback>();

  registerFlushCallback(callback: FlushCallback, isPending: PendingCallback): () => void {
    this.callbacks.set(callback, isPending);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  async flushPendingWrites(): Promise<void> {
    const callbacks = [...this.callbacks.keys()];
    await Promise.all(callbacks.map((callback) => callback()));
  }

  hasPendingWrites(): boolean {
    return [...this.callbacks.values()].some((isPending) => isPending());
  }
}

export const jaclySaveCoordinator = new JaclySaveCoordinator();
