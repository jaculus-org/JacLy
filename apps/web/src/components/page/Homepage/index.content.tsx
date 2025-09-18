import { t, type Dictionary } from 'intlayer';

const appContent = {
  key: 'app',
  content: {
    title: t({
      en: 'Welcome to JacLy',
      cs: 'Vítejte v JacLy',
    }),
  },
} satisfies Dictionary;

export default appContent;
