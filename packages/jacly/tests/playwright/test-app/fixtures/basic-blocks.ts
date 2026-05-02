export const basicBlocksData = {
  blockFiles: {
    'basic.jacly.json': {
      category: 'basic',
      name: 'Basic',
      colour: '#4c97ff',
      contents: [
        {
          kind: 'block',
          type: 'basic_do_thing',
          message0: 'do thing',
          code: 'doThing();',
          previousStatement: null,
          nextStatement: null,
        },
      ],
    },
  },
};

export const emptyWorkspace = {
  blocks: {
    languageVersion: 0,
    blocks: [],
  },
};
