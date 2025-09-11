import React from 'react';
import { createRoot } from 'react-dom/client';
import { JaclyEditor } from '@jaculus/jacly/ui';

function App() {
  return (
    <div style={{ padding: 8 }}>
      <h2>JacLy Blockly</h2>
      <JaclyEditor />
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
