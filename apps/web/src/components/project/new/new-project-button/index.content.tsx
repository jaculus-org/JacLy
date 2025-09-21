import { t, type Dictionary } from 'intlayer';

const componentContent = {
  key: 'new-project-button',
  content: {
    createNewProject: t({
      en: 'Create New Project',
      cs: 'Vytvořit nový projekt',
    }),
  },
} satisfies Dictionary;

export default componentContent;
