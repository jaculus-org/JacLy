import { t, type Dictionary } from 'intlayer';

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
    unknownComponent: t({
      en: 'Unknown component: {component}',
      cs: 'Neznámá komponenta: {component}',
    }),
  },
} satisfies Dictionary;

export default componentContent;
