import { resources, defaultNS } from './i18n/config';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: (typeof resources)['en'];
    // Enable the selector API for better TypeScript support
    enableSelector: true;
  }
}
