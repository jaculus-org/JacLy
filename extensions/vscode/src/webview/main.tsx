import React, { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { JaclyEditor } from '@jaculus/jacly/editor';

import './dev-index.css';

declare const acquireVsCodeApi: () => {
  postMessage: (message: unknown) => void;
  setState: (state: unknown) => void;
  getState: () => unknown;
};

interface JaclyBlocksData {
  blockFiles: Record<string, object>;
  translations: Record<string, string>;
}

type IncomingMessage =
  | {
      type: 'load';
      initialJson: object;
      jaclyBlocksData: JaclyBlocksData;
    }
  | {
      type: 'reloadBlocks';
      jaclyBlocksData: JaclyBlocksData;
    };

const App = () => {
  const vscode = React.useMemo(() => acquireVsCodeApi(), []);

  const [initialJson, setInitialJson] = useState<object | null>(null);
  const [jaclyBlocksData, setJaclyBlocksData] =
    useState<JaclyBlocksData | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  React.useEffect(() => {
    const handler = (event: MessageEvent<IncomingMessage>) => {
      const message = event.data;
      if (message?.type === 'load') {
        setInitialJson(message.initialJson ?? {});
        setJaclyBlocksData(
          message.jaclyBlocksData ?? { blockFiles: {}, translations: {} }
        );
      } else if (message?.type === 'reloadBlocks') {
        setJaclyBlocksData(
          message.jaclyBlocksData ?? { blockFiles: {}, translations: {} }
        );
      }
    };
    window.addEventListener('message', handler);
    vscode.postMessage({ type: 'ready' });
    return () => window.removeEventListener('message', handler);
  }, [vscode]);

  React.useEffect(() => {
    const detectTheme = () => {
      const isDark = document.body.classList.contains('vscode-dark');
      setTheme(isDark ? 'dark' : 'light');
    };

    detectTheme();

    const observer = new MutationObserver(detectTheme);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const handleJsonChange = useCallback(
    (workspaceJson: object) => {
      vscode.postMessage({ type: 'saveJson', json: workspaceJson });
    },
    [vscode]
  );

  const handleGeneratedCode = useCallback(
    (code: string) => {
      vscode.postMessage({ type: 'generatedCode', code });
    },
    [vscode]
  );

  if (!initialJson || !jaclyBlocksData) {
    return (
      <div className="loading">
        <p>Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <JaclyEditor
        theme={theme}
        jaclyBlocksData={jaclyBlocksData}
        locale="en"
        initialJson={initialJson}
        onJsonChange={handleJsonChange}
        onGeneratedCode={handleGeneratedCode}
      />
    </div>
  );
};

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}
