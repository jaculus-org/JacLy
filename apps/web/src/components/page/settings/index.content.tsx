import { t, type Dictionary } from 'intlayer';

const appContent = {
  key: 'settings',
  content: {
    settings: t({
      en: 'Settings',
      cs: 'Nastavení',
    }),
  },
} satisfies Dictionary;

export default appContent;
