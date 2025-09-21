import { t, type Dictionary } from 'intlayer';

const headerContent = {
  key: 'header',
  content: {
    home: t({
      en: 'Home',
      cs: 'Domů',
    }),
    blocks: t({
      en: 'Blocks',
      cs: 'Bloky',
    }),
  },
} satisfies Dictionary;

export default headerContent;
