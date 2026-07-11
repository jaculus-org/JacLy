import type { Browser, Page } from 'playwright';
import { chromium } from 'playwright';
import type {
  BrowserRenderPayload,
  RenderArtifact,
  RenderFormat,
  SvgRenderResult,
} from '../shared/types.js';
import { errorMessage } from './errors.js';

export interface ArtifactRenderer {
  render(payload: BrowserRenderPayload, format: RenderFormat): Promise<RenderArtifact>;
  close(): Promise<void>;
}

export class WorkspaceRenderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkspaceRenderError';
  }
}

export interface PlaywrightRendererOptions {
  rendererUrl: () => string;
  launchOptions?: Parameters<typeof chromium.launch>[0];
}

export class PlaywrightArtifactRenderer implements ArtifactRenderer {
  private browserPromise: Promise<Browser> | null = null;

  constructor(private readonly options: PlaywrightRendererOptions) {}

  private browser(): Promise<Browser> {
    this.browserPromise ??= chromium.launch({ headless: true, ...this.options.launchOptions });
    return this.browserPromise;
  }

  private async renderSvg(page: Page, payload: BrowserRenderPayload): Promise<SvgRenderResult> {
    await page.goto(this.options.rendererUrl(), { waitUntil: 'networkidle' });
    await page.waitForFunction(() => Boolean(window.jaclyRenderer));
    try {
      return await page.evaluate((request) => window.jaclyRenderer.render(request), payload);
    } catch (error) {
      throw new WorkspaceRenderError(`Blockly render failed: ${errorMessage(error)}`);
    }
  }

  async render(payload: BrowserRenderPayload, format: RenderFormat): Promise<RenderArtifact> {
    const browser = await this.browser();
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    try {
      const rendered = await this.renderSvg(page, payload);
      if (format === 'svg') {
        return {
          content: Buffer.from(rendered.svg),
          contentType: 'image/svg+xml',
          width: rendered.width,
          height: rendered.height,
        };
      }

      await page.setContent(
        `<!doctype html><style>html,body{margin:0;padding:0;background:transparent}</style>${rendered.svg}`,
      );
      const image = await page.locator('svg').screenshot({
        type: 'png',
        omitBackground: true,
      });
      return {
        content: image,
        contentType: 'image/png',
        width: rendered.width,
        height: rendered.height,
      };
    } finally {
      await page.close();
    }
  }

  async close(): Promise<void> {
    if (!this.browserPromise) return;
    const browser = await this.browserPromise;
    this.browserPromise = null;
    await browser.close();
  }
}
