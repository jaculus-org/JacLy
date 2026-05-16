type FlushCallback = () => Promise<void>;

class JaclySaveCoordinator {
  private callbacks = new Set<FlushCallback>();

  registerFlushCallback(callback: FlushCallback): () => void {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  async flushPendingWrites(): Promise<void> {
    const callbacks = [...this.callbacks];
    await Promise.all(callbacks.map((callback) => callback()));
  }
}

export const jaclySaveCoordinator = new JaclySaveCoordinator();