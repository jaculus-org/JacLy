import { test as base, type Page } from '@playwright/test';

export type Act = (action: Promise<unknown>) => Promise<void>;

async function waitForBlocklyToSettle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const Blockly = (
      window as typeof window & {
        Blockly?: {
          getMainWorkspace: () => unknown;
        };
      }
    ).Blockly;
    const workspace = Blockly?.getMainWorkspace() as
      | {
          addChangeListener: (
            listener: (event: { type: string; toJson?: () => object }) => void,
          ) => unknown;
          removeChangeListener: (
            listener: (event: { type: string; toJson?: () => object }) => void,
          ) => void;
        }
      | null
      | undefined;
    if (!workspace) return;

    let eventFired = false;
    const events: object[] = [];
    const listener = workspace.addChangeListener((event) => {
      eventFired = true;
      events.push(typeof event.toJson === 'function' ? event.toJson() : { type: event.type });
    });

    try {
      let frames = 0;
      do {
        if (++frames > 15) {
          throw new Error(
            `Blockly events still firing after 15 frames:\n${JSON.stringify(events, null, 2)}`,
          );
        }
        eventFired = false;
        await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
      } while (eventFired);
    } finally {
      workspace.removeChangeListener(listener);
    }
  });
}

export const test = base.extend<{ act: Act }>({
  act: async ({ page }, use) => {
    await use(async (action) => {
      await action;
      await waitForBlocklyToSettle(page);
    });
  },
});
