import assert from 'node:assert/strict';
import { test } from 'node:test';
import { collectWorkspacePackages } from '../src/server/library-loader.js';

test('collectWorkspacePackages finds nested package metadata without duplicates', () => {
  const workspace = {
    blocks: {
      blocks: [
        {
          extraState: { package: 'basic' },
          next: {
            block: {
              extraState: { package: 'game-loop' },
              inputs: {
                CODE: { block: { extraState: { package: 'basic' } } },
              },
            },
          },
        },
      ],
    },
  };

  assert.deepEqual(collectWorkspacePackages(workspace), ['basic', 'game-loop']);
});
