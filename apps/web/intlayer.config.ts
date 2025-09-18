import { Locales, type IntlayerConfig } from 'intlayer';

const config: IntlayerConfig = {
  internationalization: {
    locales: [
      Locales.ENGLISH,
      Locales.CZECH,
      // Your other locales
    ],
    defaultLocale: Locales.ENGLISH,
  },
  middleware: {
    prefixDefault: false, // Default locale won't be prefixed in URLs
  },
};

export default config;
