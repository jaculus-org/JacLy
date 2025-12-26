type Handler = () => unknown | Promise<unknown>;

class Basic {
  private onStartFn: Handler | null = null;
  private foreverFns: Handler[] = [];
  private started = false;

  onStart(fn: Handler): void {
    this.onStartFn = fn;
  }

  forever(fn: Handler): void {
    this.foreverFns.push(fn);
    if (!this.started) {
      setTimeout(() => {
        if (!this.started) this.run();
      }, 0);
    }
  }

  private async runHandler(fn: Handler): Promise<void> {
    try {
      await fn();
    } catch (err) {
      console.error("Error in handler:\n" + err);
      console.error(err);
    }
  }

  private spawnForever(fn: Handler): void {
    (async () => {
      while (true) {
        await this.runHandler(fn);
        // Yield to event loop to prevent starving other tasks
        await new Promise<void>(resolve => setTimeout(resolve, 0));
      }
    })();
  }

  private run(): void {
    this.started = true;

    if (this.onStartFn) {
      this.runHandler(this.onStartFn);
    }

    for (const fn of this.foreverFns) {
      this.spawnForever(fn);
    }
  }
}

export const basic = new Basic();
