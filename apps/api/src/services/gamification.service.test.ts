import test from 'node:test';
import assert from 'node:assert/strict';
import { applyChapterCompletion } from './gamification.service.js';
import { store } from '../db/store.js';

test('chapter completion grants XP and updates progress', () => {
  const beforeXp = store.users[0].xp;
  const result = applyChapterCompletion('user-demo', 'book-sapiens', 'chapter-1', 900);
  assert.equal(result.xp, beforeXp + 20);
  assert.equal(result.streak_count > 0, true);
  assert.equal(result.completion_percent >= 10, true);
});
