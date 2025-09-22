import { t, type Dictionary } from 'intlayer';

const appContent = {
  key: 'reset-layout',
  content: {
    resetLayout: t({
      en: 'Reset Layout',
      cs: 'Obnovit rozvržení',
    }),
    resetLayoutDescription: t({
      en: 'Reset the layout to its default state.',
      cs: 'Obnovit rozvržení do výchozího stavu.',
    }),
  },
} satisfies Dictionary;

export default appContent;
