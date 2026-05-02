import type { JaclyBlocksData } from '@jaculus/project';

export const jsonBlocksData: JaclyBlocksData = {
  blockFiles: {
    'json.jacly.json': {
      category: 'json',
      name: 'JSON',
      colour: '#d81b60',
      contents: [
        {
          kind: 'block',
          type: 'json_object_create',
        },
        {
          kind: 'block',
          type: 'json_object_to_text',
          message0: 'JSON to text $[VALUE]',
          args0: [
            {
              type: 'input_value',
              name: 'VALUE',
            },
          ],
          output: 'String',
          tooltip: 'Convert a value to JSON text.',
          code: 'JSON.stringify($[VALUE])',
        },
        {
          kind: 'block',
          type: 'json_text_to_object',
          message0: 'text to JSON $[TEXT]',
          args0: [
            {
              type: 'input_value',
              name: 'TEXT',
              check: 'String',
            },
          ],
          output: 'JsonObject',
          tooltip: 'Parse text into a JSON object.',
          code: 'JSON.parse($[TEXT])',
          inputs: {
            TEXT: {
              shadow: {
                type: 'text',
                fields: {
                  TEXT: '{"key":"value"}',
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'json_object_clear',
          message0: 'clear object $[OBJECT]',
          args0: [
            {
              type: 'input_value',
              name: 'OBJECT',
              check: 'JsonObject',
            },
          ],
          previousStatement: null,
          nextStatement: null,
          inputsInline: true,
          tooltip: 'Delete all keys from an object.',
          code: '(() => { const __jaclyObject = $[OBJECT]; Object.keys(__jaclyObject).forEach((__jaclyKey) => delete __jaclyObject[__jaclyKey]); })();',
        },
        {
          kind: 'block',
          type: 'json_object_contains_key',
          message0: 'object $[OBJECT] contains key $[KEY]',
          args0: [
            {
              type: 'input_value',
              name: 'OBJECT',
              check: 'JsonObject',
            },
            {
              type: 'input_value',
              name: 'KEY',
            },
          ],
          output: 'Boolean',
          inputsInline: true,
          tooltip: 'Check whether an object has a key.',
          code: 'Object.prototype.hasOwnProperty.call($[OBJECT], $[KEY])',
          inputs: {
            KEY: {
              shadow: {
                type: 'text',
                fields: {
                  TEXT: 'key',
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'json_object_get_key',
          message0: 'get key $[KEY] in object $[OBJECT]',
          args0: [
            {
              type: 'input_value',
              name: 'KEY',
            },
            {
              type: 'input_value',
              name: 'OBJECT',
              check: 'JsonObject',
            },
          ],
          output: null,
          inputsInline: true,
          tooltip: 'Get the value stored under a key.',
          code: '($[OBJECT][$[KEY]])',
          inputs: {
            KEY: {
              shadow: {
                type: 'text',
                fields: {
                  TEXT: 'key',
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'json_object_set_key',
          message0: 'in object $[OBJECT] set key $[KEY] value $[VALUE]',
          args0: [
            {
              type: 'input_value',
              name: 'OBJECT',
              check: 'JsonObject',
            },
            {
              type: 'input_value',
              name: 'KEY',
            },
            {
              type: 'input_value',
              name: 'VALUE',
            },
          ],
          previousStatement: null,
          nextStatement: null,
          inputsInline: true,
          tooltip: 'Set a key to a value.',
          code: '$[OBJECT][$[KEY]] = $[VALUE];',
          inputs: {
            KEY: {
              shadow: {
                type: 'text',
                fields: {
                  TEXT: 'key',
                },
              },
            },
            VALUE: {
              shadow: {
                type: 'text',
                fields: {
                  TEXT: 'value',
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'json_object_delete_key',
          message0: 'in object $[OBJECT] delete key $[KEY]',
          args0: [
            {
              type: 'input_value',
              name: 'OBJECT',
              check: 'JsonObject',
            },
            {
              type: 'input_value',
              name: 'KEY',
            },
          ],
          previousStatement: null,
          nextStatement: null,
          inputsInline: true,
          tooltip: 'Delete a key from an object.',
          code: 'delete $[OBJECT][$[KEY]];',
          inputs: {
            KEY: {
              shadow: {
                type: 'text',
                fields: {
                  TEXT: 'key',
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'json_object_entry',
          message0: 'key $[KEY] value $[VALUE]',
          args0: [
            {
              type: 'input_value',
              name: 'KEY',
            },
            {
              type: 'input_value',
              name: 'VALUE',
            },
          ],
          previousStatement: 'JsonObjectEntry',
          nextStatement: 'JsonObjectEntry',
          inputsInline: true,
          hideInToolbox: true,
          tooltip: 'One key/value pair inside a JSON object.',
          code: '[$[KEY]]: $[VALUE],',
          inputs: {
            KEY: {
              shadow: {
                type: 'text',
                fields: {
                  TEXT: 'key',
                },
              },
            },
            VALUE: {
              shadow: {
                type: 'text',
                fields: {
                  TEXT: 'value',
                },
              },
            },
          },
        },
      ],
    },
  },
} as JaclyBlocksData;

export const jsonProgramInitialJson = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'json_program',
        id: 'json-program-root',
        x: 80,
        y: 60,
      },
    ],
  },
};

export const jsonCodegenBlocksData: JaclyBlocksData = {
  blockFiles: {
    ...jsonBlocksData.blockFiles,
    'json-program.jacly.json': {
      category: 'json_program',
      name: 'JSON Program',
      colour: '#444444',
      contents: [
        {
          kind: 'block',
          type: 'json_program',
          message0: 'program object $[OBJ]',
          args0: [
            {
              type: 'input_value',
              name: 'OBJ',
              check: 'JsonObject',
            },
          ],
          code: 'emit($[OBJ]);',
          isProgramStart: true,
          hideInToolbox: true,
        },
      ],
    },
  },
} as JaclyBlocksData;
