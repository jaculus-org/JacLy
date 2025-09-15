import { useRef, useEffect } from 'react';
import 'blockly/blocks';
import { javascriptGenerator } from 'blockly/javascript';
import { useBlocklyWorkspace } from '@kuband/react-blockly';
import * as Blockly from 'blockly/core';

const darkTheme = Blockly.Theme.defineTheme('dark', {
  name: 'dark',
  base: Blockly.Themes.Zelos,
  componentStyles: {
    workspaceBackgroundColour: '#1e1e1e',
    toolboxBackgroundColour: '#252526',
    toolboxForegroundColour: '#cccccc',
    flyoutBackgroundColour: '#252526',
    flyoutForegroundColour: '#cccccc',
    scrollbarColour: '#797979',
    insertionMarkerColour: '#ffffff',
    markerColour: '#4285f4',
    cursorColour: '#ffffff',
  },
});

interface EditorProps {
  theme: Theme;
  onCodeChange?: (code: string) => void;
}

export function JaclyEditor({ theme, onCodeChange }: EditorProps) {
  const blocklyRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

  const isDark = theme === 'dark';

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
      theme: isDark ? darkTheme : Blockly.Themes.Zelos,
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
        onCodeChange?.(code);
      } catch (_error) {
        console.error('Error generating JavaScript code:', _error);
      }
    },
    onInject: ws => {
      workspaceRef.current = ws;
      console.log('Injected workspace', ws);
    },
    onDispose: ws => console.log('Disposed workspace', ws),
  });

  useEffect(() => {
    if (workspaceRef.current) {
      workspaceRef.current.setTheme(isDark ? darkTheme : Blockly.Themes.Zelos);
    }
  }, [isDark]);

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
      }}
    >
      <div ref={blocklyRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
