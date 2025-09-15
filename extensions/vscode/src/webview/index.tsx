import { createRoot } from 'react-dom/client';
import { JaclyEditor } from '@jaculus/jacly/ui';

function App() {
  return (
    <div style={{ padding: 8 }}>
      <h2>JacLy Blockly</h2>
      <JaclyEditor
        theme="dark"
        onCodeChange={(code: string) => console.log(code)}
      />
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
