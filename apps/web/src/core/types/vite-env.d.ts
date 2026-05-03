/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ROUTE_PREFIX?: string;
}

declare module '*.md' {
  export const html: string;
  export const raw: string;
}
