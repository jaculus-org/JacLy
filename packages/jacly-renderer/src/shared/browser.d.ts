import type { BrowserRenderPayload, SvgRenderResult } from './types.js';

declare global {
  interface Window {
    jaclyRenderer: {
      render: (payload: BrowserRenderPayload) => Promise<SvgRenderResult>;
    };
  }
}
