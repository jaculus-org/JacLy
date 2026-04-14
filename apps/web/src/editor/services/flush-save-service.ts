type FlushHandler = () => Promise<void>;

class FlushSaveService {
  private handler: FlushHandler | null = null;

  register(handler: FlushHandler): () => void {
    this.handler = handler;
    return () => {
      if (this.handler === handler) this.handler = null;
    };
  }

  async flush(): Promise<void> {
    if (this.handler) await this.handler();
  }
}

export const flushSaveService = new FlushSaveService();
