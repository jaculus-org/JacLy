import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from '@/app/app-provider';
import { makeRouter } from '@/app/router';
import { makeRouterContext } from '@/app/router-context';
import '@/app/index.css';

// register VSCode default language extensions
import '@codingame/monaco-vscode-javascript-default-extension';
import '@codingame/monaco-vscode-json-default-extension';
import '@codingame/monaco-vscode-theme-defaults-default-extension';
import '@codingame/monaco-vscode-typescript-basics-default-extension';
import 'vscode/localExtensionHost';

import { initialize } from '@codingame/monaco-vscode-api/services';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import { registerFileSystemOverlay } from '@codingame/monaco-vscode-files-service-override';
import getLanguagesServiceOverride from '@codingame/monaco-vscode-languages-service-override';
import getModelServiceOverride from '@codingame/monaco-vscode-model-service-override';
import getTextMateServiceOverride from '@codingame/monaco-vscode-textmate-service-override';
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override';
import Hotjar from '@hotjar/browser';
import * as Sentry from '@sentry/react';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import { ZenFSProvider } from '@/editor/services/zen-fs-provider';
import { ensureBaseFs } from '@/project/services/project-fs-service';

const siteId = 6691272;
const hotjarVersion = 6;

Hotjar.init(siteId, hotjarVersion);

Sentry.init({
  dsn: 'https://996565cac67dc734f86eb32e02a099fc@o4511220055670784.ingest.de.sentry.io/4511220058816592',
  sendDefaultPii: true,
  enabled: process.env.NODE_ENV === 'production',
});

async function bootstrap() {
  const appRoot = document.getElementById('root');
  if (!appRoot) {
    throw new Error('Missing #root element');
  }

  // mount /tsLibs for TypeScript language service
  await ensureBaseFs();

  // setup worker
  window.MonacoEnvironment = {
    getWorker(_workerId: string, label: string) {
      if (label === 'TextMateWorker') {
        return new Worker(
          new URL('@codingame/monaco-vscode-textmate-service-override/worker', import.meta.url),
          { type: 'module' },
        );
      }
      return new EditorWorker();
    },
  };

  // register FS provider
  registerFileSystemOverlay(1, new ZenFSProvider());

  // initialize VSCode services
  await initialize(
    {
      ...getLanguagesServiceOverride(),
      ...getModelServiceOverride(),
      ...getTextMateServiceOverride(),
      ...getThemeServiceOverride(),
    },
    appRoot,
    {
      workspaceProvider: {
        workspace: {
          folderUri: URI.file('/'),
          label: 'JacLy',
        },
        trusted: true,
        async open() {
          return false;
        },
      },
    },
  );

  const context = makeRouterContext();
  const router = makeRouter(context);

  ReactDOM.createRoot(appRoot).render(
    <StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  );
}

bootstrap();
