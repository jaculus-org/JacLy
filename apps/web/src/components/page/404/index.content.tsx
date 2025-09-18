import { t, type Dictionary } from 'intlayer';

const appContent = {
  key: 'page_404',
  content: {
    page_not_found: t({
      en: 'Page not found',
      cs: 'Stránka nenalezena',
    }),
    not_found_description: t({
      en: "Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.",
      cs: 'Omlouváme se, ale stránku, kterou hledáte, jsme nenašli. Možná byla přesunuta, smazána nebo jste zadali nesprávnou URL.',
    }),
    go_home: t({
      en: 'Go Home',
      cs: 'Jít na domovskou stránku',
    }),
    start_building: t({
      en: 'Start Building',
      cs: 'Začít stavět',
    }),
    need_help: t({
      en: 'Need help? Check out our',
      cs: 'Potřebujete pomoc? Podívejte se na naši',
    }),
    documentation: t({
      en: 'documentation',
      cs: 'dokumentaci',
    }),
  },
} satisfies Dictionary;

export default appContent;
