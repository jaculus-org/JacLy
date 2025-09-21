import { t, type Dictionary } from 'intlayer';

const componentContent = {
  key: 'list-projects',
  content: {
    project: t({
      en: 'Project',
      cs: 'Projekt',
    }),
    projects: t({
      en: 'Projects',
      cs: 'Projekty',
    }),
    deletedMessage: t({
      en: 'has been deleted.',
      cs: 'byl smazán.',
    }),
    createdAt: t({
      en: 'Created',
      cs: 'Vytvořeno',
    }),
    updatedAt: t({
      en: 'Updated',
      cs: 'Aktualizováno',
    }),
    version: t({
      en: 'Version',
      cs: 'Verze',
    }),
    deleteProject: t({
      en: 'Delete Project',
      cs: 'Smazat projekt',
    }),
    deleteProjectDescription: t({
      en: 'Are you sure you want to delete this project? This action cannot be undone.',
      cs: 'Opravdu chcete tento projekt smazat? Tuto akci nelze vrátit zpět.',
    }),
    cancel: t({
      en: 'Cancel',
      cs: 'Zrušit',
    }),
    confirmDelete: t({
      en: 'Delete',
      cs: 'Smazat',
    }),
    // Add more translations as needed
  },
} satisfies Dictionary;

export default componentContent;
