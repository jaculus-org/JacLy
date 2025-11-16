import { createRoot } from 'react-dom/client';
// import { JaclyEditor } from '@jaculus/jacly/editor';

function App() {
  return (
    <div style={{ padding: 8 }}>
      <h2>JacLy Blockly</h2>
      {/* <JaclyEditor
        theme="dark"
      /> */}
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
