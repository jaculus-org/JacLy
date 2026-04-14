import React, { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { JaclyEditor } from '@jaculus/jacly/editor';
import { JaclyEngine } from '@jaculus/jacly/engine';
import type { JaclyBlocksData } from '@jaculus/project';
import type {
  ExtensionToWebviewMessage,
  WebviewToExtensionMessage,
} from '../messages';

import './dev-index.css';

type MissingPackages = Record<string, Iterable<string>>;

declare const acquireVsCodeApi: () => {
  postMessage: (message: WebviewToExtensionMessage) => void;
  setState: (state: unknown) => void;
  getState: () => unknown;
};

const App = () => {
  const vscode = React.useMemo(() => acquireVsCodeApi(), []);

  type LoadPhase = 'connecting' | 'loading-blocks' | 'ready';

  const [initialJson, setInitialJson] = useState<object | null>(null);
  const [jaclyBlocksData, setJaclyBlocksData] =
    useState<JaclyBlocksData | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [engine] = useState(() => new JaclyEngine());
  const [error, setError] = useState<string | null>(null);
  const [loadPhase, setLoadPhase] = useState<LoadPhase>('connecting');

  React.useEffect(() => {
    const handler = (event: MessageEvent<ExtensionToWebviewMessage>) => {
      const message = event.data;
      if (message?.type === 'load') {
        setLoadPhase('ready');
        setInitialJson(message.initialJson ?? {});
        setJaclyBlocksData(
          message.jaclyBlocksData ?? { blockFiles: {}, translations: {} }
        );
        setError(null);
      } else if (message?.type === 'reloadBlocks') {
        setJaclyBlocksData(
          message.jaclyBlocksData ?? { blockFiles: {}, translations: {} }
        );
        setError(null);
      } else if (message?.type === 'error') {
        setError(message.message);
      }
    };
    window.addEventListener('message', handler);
    vscode.postMessage({ type: 'ready' });
    setLoadPhase('loading-blocks');
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

  const handleMissingPackage = useCallback(
    async (missingPackages: MissingPackages) => {
      for (const [packageName, blockTypes] of Object.entries(missingPackages)) {
        console.error(
          `Missing package: ${packageName}, required by blocks: ${[...blockTypes].join(', ')}`
        );
      }
    },
    []
  );

  if (error) {
    return (
      <div className="jacly-error">
        <p className="jacly-error__title">Jacly failed to load</p>
        <pre className="jacly-error__message">{error}</pre>
      </div>
    );
  }

  if (!initialJson || !jaclyBlocksData) {
    const steps: { label: string; phase: LoadPhase }[] = [
      { label: 'Connecting to workspace', phase: 'connecting' },
      { label: 'Loading block definitions', phase: 'loading-blocks' },
      { label: 'Initializing editor', phase: 'ready' },
    ];
    const currentIndex = steps.findIndex(s => s.phase === loadPhase);

    return (
      <div className="jacly-loading">
        <div className="jacly-loading__spinner" aria-hidden="true" />
        <p className="jacly-loading__title">Loading JacLy</p>
        <ul className="jacly-loading__steps">
          {steps.map((step, i) => {
            const isDone = i < currentIndex;
            const isActive = i === currentIndex;
            return (
              <li
                key={step.phase}
                className={[
                  'jacly-loading__step',
                  isDone ? 'jacly-loading__step--done' : '',
                  isActive ? 'jacly-loading__step--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className="jacly-loading__step-icon">
                  {isDone ? '✓' : isActive ? '›' : '○'}
                </span>
                {step.label}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className="app-container">
      <JaclyEditor
        engine={engine}
        theme={theme}
        jaclyBlocksData={jaclyBlocksData}
        locale="en"
        initialJson={initialJson}
        onJsonChange={handleJsonChange}
        onGeneratedCode={handleGeneratedCode}
        onMissingPackage={handleMissingPackage}
      />
    </div>
  );
};

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}
