import { t, type Dictionary } from 'intlayer';

const appContent = {
  key: 'app',
  content: {
    title: t({
      en: 'Welcome to JacLy',
      cs: 'Vítejte v JacLy',
    }),
    subtitle: t({
      en: 'Your visual programming environment for creating amazing projects with blocks',
      cs: 'Vaše vizuální programovací prostředí pro vytváření úžasných projektů pomocí bloků',
    }),
    getStarted: t({
      en: 'Get Started',
      cs: 'Začít',
    }),
    visualProgrammingTitle: t({
      en: 'Visual Programming',
      cs: 'Vizuální programování',
    }),
    visualProgrammingDescription: t({
      en: 'Build programs using intuitive drag-and-drop blocks',
      cs: 'Vytvářejte programy pomocí intuitivních bloků přetahování',
    }),
    codeGenerationTitle: t({
      en: 'Code Generation',
      cs: 'Generování kódu',
    }),
    codeGenerationDescription: t({
      en: 'Automatically generate clean, syntactically correct code from your block designs',
      cs: 'Automaticky generujte čistý, syntakticky správný kód z vašich blokových návrhů',
    }),
    integratedTerminalTitle: t({
      en: 'Integrated Terminal',
      cs: 'Integrovaný terminál',
    }),
    integratedTerminalDescription: t({
      en: 'Test and debug your code directly within the app',
      cs: 'Testujte a ladte svůj kód přímo v aplikaci',
    }),
  },
} satisfies Dictionary;

export default appContent;
