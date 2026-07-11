export class DeferredUnmountCoordinator {
  private pendingUnmounts = new Map<string, symbol>();

  cancel(key: string): void {
    this.pendingUnmounts.delete(key);
  }

  schedule(key: string, pendingWork: Promise<unknown>, unmount: () => void): void {
    const token = Symbol(key);
    this.pendingUnmounts.set(key, token);
    void pendingWork
      .catch(() => undefined)
      .finally(() => {
        if (this.pendingUnmounts.get(key) !== token) return;
        this.pendingUnmounts.delete(key);
        unmount();
      });
  }
}
