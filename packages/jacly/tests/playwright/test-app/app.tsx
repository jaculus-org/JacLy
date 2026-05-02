import * as Blockly from 'blockly/core';
import { useEffect, useMemo, useRef, useState } from 'react';
import { JaclyEditor } from '../../../src/editor';
import { JaclyEngine } from '../../../src/engine';
import { getFixture } from './fixtures/registry';
import { installJaclyTestHooks } from './test-hooks';

const searchParams = new URLSearchParams(window.location.search);
const isTestMode = searchParams.get('test') === '1';
const fixture = getFixture(searchParams.get('fixture') ?? 'basic');

export function App() {
  const engine = useMemo(() => new JaclyEngine(), []);
  const [jaclyBlocksData, setJaclyBlocksData] = useState(fixture.jaclyBlocksData);
  const latestJsonRef = useRef<object | null>(null);
  const latestGeneratedCodeRef = useRef('');

  useEffect(() => {
    if (!isTestMode) return undefined;
    return installJaclyTestHooks({
      getLatestJson: () => latestJsonRef.current,
      getLatestGeneratedCode: () => latestGeneratedCodeRef.current,
      getCurrentGeneratedCode: () => {
        const workspace = Blockly.getMainWorkspace();
        if (!workspace) return '';
        return engine.generateCode(workspace);
      },
    });
  }, [engine]);

  return (
    <main data-testid="jacly-test-app">
      <header className="test-header">
        <h1>Jacly Playwright Test App</h1>
        {isTestMode && fixture.installableJaclyBlocksData ? (
          <button
            type="button"
            data-testid="install-library"
            onClick={() => {
              setJaclyBlocksData(fixture.installableJaclyBlocksData!);
            }}
          >
            Install library
          </button>
        ) : null}
      </header>
      <section data-testid="jacly-editor" className="editor-shell">
        <JaclyEditor
          engine={engine}
          jaclyBlocksData={jaclyBlocksData}
          theme="light"
          locale="en"
          initialJson={fixture.initialJson}
          onJsonChange={(json) => {
            latestJsonRef.current = json;
          }}
          onGeneratedCode={(code) => {
            latestGeneratedCodeRef.current = code;
          }}
          onMissingPackage={async () => {}}
        />
      </section>
    </main>
  );
}
