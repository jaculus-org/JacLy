import { t, type Dictionary } from 'intlayer';

const headerContent = {
  key: 'ModeToggle',
  content: {
    home: t({
      en: 'Home',
      cs: 'Domů',
    }),
    toggleTheme: t({
      en: 'Toggle theme',
      cs: 'Přepnout motiv',
    }),
    light: t({
      en: 'Light',
      cs: 'Světlý',
    }),
    dark: t({
      en: 'Dark',
      cs: 'Tmavý',
    }),
    system: t({
      en: 'System',
      cs: 'Podle systému',
    }),
  },
} satisfies Dictionary;

export default headerContent;
