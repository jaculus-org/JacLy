import { t, type Dictionary, insert } from 'intlayer';

const componentContent = {
  key: 'flexlayout',
  content: {
    blocks: t({
      en: 'Blocks',
      cs: 'Bloky',
    }),
    jaculusTab: t({
      en: 'Jaculus',
      cs: 'Jaculus',
    }),
    generatedCodeTab: t({
      en: 'Generated Code',
      cs: 'Generovaný kód',
    }),
    terminalTab: t({
      en: 'Terminal',
      cs: 'Terminál',
    }),
    blocklyEditorTab: t({
      en: 'Blockly Editor',
      cs: 'Blockly Editor',
    }),
    fileExplorerTab: t({
      en: 'File Explorer',
      cs: 'Průzkumník souborů',
    }),
    unknownComponent: t({
      en: 'Unknown component: {component}',
      cs: 'Neznámá komponenta: {component}',
    }),
    projectNotFound: t({
      en: 'Project does not exist',
      cs: 'Projekt neexistuje',
    }),

    projectNameNotFound: t({
      en: insert`Project with name "{projectName}" does not exist`,
      cs: insert`Projekt s názvem "{projectName}" neexistuje`,
    }),
    // Add more translations as needed
  },
} satisfies Dictionary;

export default componentContent;
