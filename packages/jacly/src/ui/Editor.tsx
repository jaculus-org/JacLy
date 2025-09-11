import { useRef } from 'react';
import 'blockly/blocks';
import { javascriptGenerator } from 'blockly/javascript';
import { useBlocklyWorkspace } from '@kuband/react-blockly';
import * as Blockly from 'blockly/core';

export function JaclyEditor() {
  const blocklyRef = useRef<HTMLDivElement>(null);

  const toolbox: Blockly.utils.toolbox.ToolboxDefinition = {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'Logic',
        colour: '#5C81A6',
        contents: [
          { kind: 'block', type: 'controls_if' },
          { kind: 'block', type: 'logic_compare' },
          { kind: 'block', type: 'logic_operation' },
        ],
      },
      {
        kind: 'category',
        name: 'Math',
        colour: '#5CA65C',
        contents: [
          { kind: 'block', type: 'math_number' },
          { kind: 'block', type: 'math_arithmetic' },
          { kind: 'block', type: 'math_round' },
        ],
      },
      {
        kind: 'category',
        name: 'Text',
        colour: '#5CA6A6',
        contents: [
          { kind: 'block', type: 'text' },
          // { kind: 'block', type: 'text_print' },
        ],
      },
      {
        kind: 'sep',
        gap: 16,
      },
    ],
  };

  useBlocklyWorkspace({
    ref: blocklyRef,
    toolboxConfiguration: toolbox,
    initialJson: {},
    workspaceConfiguration: {
      grid: { spacing: 25, length: 3, colour: '#ccc', snap: true },
      comments: true,
      sounds: false,
      trashcan: true,
      renderer: 'zelos',
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2,
      },
    },
    onWorkspaceChange: ws => {
      try {
        // generate js to console
        const code = javascriptGenerator.workspaceToCode(ws);
        console.log('Generated JavaScript code:');
        console.log(code);
      } catch (error) {
        console.error('Error generating JavaScript code:', error);
      }
    },
    onInject: ws => console.log('Injected workspace', ws),
    onDispose: ws => console.log('Disposed workspace', ws),
  });

  return (
    <div
      style={{
        height: '600px',
        width: '100%',
        border: '1px solid #333',
        background: '#1e1e1e',
      }}
    >
      <div ref={blocklyRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
