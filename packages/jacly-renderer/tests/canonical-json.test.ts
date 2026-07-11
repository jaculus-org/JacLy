import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canonicalJson, renderHash } from '../src/server/canonical-json.js';

test('canonicalJson sorts object keys recursively but preserves array order', () => {
  const first = { z: 1, nested: { b: true, a: 'value' }, list: [2, 1] };
  const second = { list: [2, 1], nested: { a: 'value', b: true }, z: 1 };

  assert.equal(canonicalJson(first), canonicalJson(second));
  assert.equal(renderHash(first), renderHash(second));
  assert.notEqual(renderHash(first), renderHash({ ...second, list: [1, 2] }));
});
