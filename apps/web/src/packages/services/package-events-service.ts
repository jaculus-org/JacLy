type Listener = () => void;

class PackageEventsService {
  private listeners: Listener[] = [];

  notifyPackagesChanged(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error('PackageEventsService listener error:', err);
      }
    }
  }

  onPackagesChanged(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx > -1) this.listeners.splice(idx, 1);
    };
  }
}

export const packageEventsService = new PackageEventsService();
