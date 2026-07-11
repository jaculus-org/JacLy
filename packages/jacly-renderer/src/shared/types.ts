export type RenderFormat = 'svg' | 'png';
export type RenderTheme = 'light' | 'dark';
export type RenderLocale = 'en' | 'cs';

export interface RenderOptions {
  theme: RenderTheme;
  locale: RenderLocale;
  padding: number;
  scale: number;
}

export interface RenderSpec {
  workspace: Record<string, unknown>;
  blockData: Record<string, unknown>;
  format: RenderFormat;
  options: RenderOptions;
}

export interface BrowserRenderPayload {
  workspace: Record<string, unknown>;
  blockData: Record<string, unknown>;
  options: RenderOptions;
}

export interface SvgRenderResult {
  svg: string;
  width: number;
  height: number;
}

export interface RenderArtifact {
  content: Uint8Array;
  contentType: 'image/svg+xml' | 'image/png';
  width: number;
  height: number;
}

export interface RenderResponse {
  hash: string;
  format: RenderFormat;
  url: string;
  markdown: string;
  width: number;
  height: number;
  cached: boolean;
}
