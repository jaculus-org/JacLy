import { useRef } from 'react'
import * as Blockly from 'blockly'
import { useBlocklyWorkspace } from '@kuband/react-blockly'

export default function BlocklyEditor() {
  const blocklyRef = useRef<HTMLDivElement>(null)

  const toolbox = {
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
        ],
      },
      {
        kind: 'category',
        name: 'Text',
        colour: '#5CA6A6',
        contents: [
          { kind: 'block', type: 'text' },
          { kind: 'block', type: 'text_print' },
        ],
      },
    ],
  } as Blockly.utils.toolbox.ToolboxDefinition

  useBlocklyWorkspace({
    ref: blocklyRef,
    toolboxConfiguration: toolbox,
    initialXml: '<xml></xml>',
    workspaceConfiguration: {
      grid: { spacing: 25, length: 3, colour: '#ccc', snap: true },
      trashcan: true,
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2,
      },
    },
    onWorkspaceChange: () => {
      // try {
      //   const code = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(ws))
      //   console.log('Workspace changed XML:', code)
      // } catch {}
    },
    onInject: ws => console.log('Injected workspace', ws),
    onDispose: ws => console.log('Disposed workspace', ws),
  })

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
  )
}
