import test from 'node:test';
import assert from 'node:assert/strict';
import { getActiveDaily } from './daily.service.js';

test('active daily returns active assignment with book and progress', () => {
  const payload = getActiveDaily('user-demo');
  assert.equal(Boolean(payload.active_assignment), true);
  assert.equal(Boolean(payload.book), true);
  assert.equal(Boolean(payload.progress), true);
});
