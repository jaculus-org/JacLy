import { t, type Dictionary } from 'intlayer';

const componentContent = {
  key: 'create-new-project',
  content: {
    createNewProject: t({
      en: 'Create New Project',
      cs: 'Vytvořit nový projekt',
    }),
    projectName: t({
      en: 'Project Name',
      cs: 'Název projektu',
    }),
    myAwesomeProject: t({
      en: 'My Awesome Project',
      cs: 'Můj úžasný projekt',
    }),
    projectType: t({
      en: 'Project Type',
      cs: 'Typ projektu',
    }),
    jaclyProject: t({
      en: 'Jacly Project (blocks)',
      cs: 'Jacly projekt (bloky)',
    }),
    jaclyProjectDescription: t({
      en: 'Visual programming with blocks.',
      cs: 'Vizuální programování s bloky.',
    }),
    jaculusProject: t({
      en: 'Jaculus Project (code)',
      cs: 'Jaculus projekt (kód)',
    }),
    jaculusProjectDescription: t({
      en: 'Text-based programming with Jaculus in TS.',
      cs: 'Textové programování systémem Jaculus v TS.',
    }),
    createProject: t({
      en: 'Create Project',
      cs: 'Vytvořit projekt',
    }),
  },
} satisfies Dictionary;

export default componentContent;
