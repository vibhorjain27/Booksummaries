import { store, ids } from '../db/store.js';
import { nowIso } from '../utils/time.js';

const ensureQueuedNextBook = (userId: string, currentBookId: string): void => {
  const queuedExists = store.assignments.some((a) => a.userId === userId && a.locked);
  if (queuedExists) return;

  const nextBook = store.books.find(
    (book) =>
      book.id !== currentBookId &&
      !store.progress.some((p) => p.userId === userId && p.bookId === book.id)
  );

  if (!nextBook) return;

  store.assignments.push({
    id: ids.assignment(),
    userId,
    bookId: nextBook.id,
    assignedAt: nowIso(),
    locked: true
  });
};

export const ensureActiveAssignment = (userId: string): void => {
  const existing = store.assignments.find((a) => a.userId === userId && !a.locked);
  if (existing) {
    ensureQueuedNextBook(userId, existing.bookId);
    return;
  }

  const progress = store.progress.find((p) => p.userId === userId && !p.completed);
  if (progress) {
    store.assignments.push({
      id: ids.assignment(),
      userId,
      bookId: progress.bookId,
      assignedAt: nowIso(),
      locked: false
    });
    ensureQueuedNextBook(userId, progress.bookId);
    return;
  }

  const lockedNext = store.assignments.find((a) => a.userId === userId && a.locked);
  if (lockedNext) {
    lockedNext.locked = false;

    if (!store.progress.some((p) => p.userId === userId && p.bookId === lockedNext.bookId)) {
      store.progress.push({
        id: ids.progress(),
        userId,
        bookId: lockedNext.bookId,
        currentChapter: 1,
        completedChapterIds: [],
        readingSeconds: 0,
        completed: false,
        updatedAt: nowIso()
      });
    }

    ensureQueuedNextBook(userId, lockedNext.bookId);
    return;
  }

  const nextBook = store.books.find((book) => !store.progress.some((p) => p.userId === userId && p.bookId === book.id));
  if (!nextBook) return;

  store.assignments.push({
    id: ids.assignment(),
    userId,
    bookId: nextBook.id,
    assignedAt: nowIso(),
    locked: false
  });

  store.progress.push({
    id: ids.progress(),
    userId,
    bookId: nextBook.id,
    currentChapter: 1,
    completedChapterIds: [],
    readingSeconds: 0,
    completed: false,
    updatedAt: nowIso()
  });

  ensureQueuedNextBook(userId, nextBook.id);
};

export const getActiveDaily = (userId: string) => {
  ensureActiveAssignment(userId);
  const active = store.assignments.find((a) => a.userId === userId && !a.locked) ?? null;
  if (!active) {
    return { active_assignment: null, book: null, progress: null };
  }

  return {
    active_assignment: active,
    book: store.books.find((b) => b.id === active.bookId) ?? null,
    progress: store.progress.find((p) => p.userId === userId && p.bookId === active.bookId) ?? null
  };
};
