import type {
  BadgeAward,
  Book,
  BookSource,
  DailyAssignment,
  Distillation,
  DistilledChapter,
  GamificationEvent,
  ReadingProgress,
  User
} from '@distill/contracts';

const nowIso = () => new Date().toISOString();

const seedUserId = 'user-demo';

const seededBooks: Book[] = [
  {
    id: 'book-sapiens',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    totalEstimatedMinutes: 60
  },
  {
    id: 'book-homo-deus',
    title: 'Homo Deus: A Brief History of Tomorrow',
    author: 'Yuval Noah Harari',
    totalEstimatedMinutes: 60
  },
  {
    id: 'book-21-lessons',
    title: '21 Lessons for the 21st Century',
    author: 'Yuval Noah Harari',
    totalEstimatedMinutes: 58
  }
];

const contextMap: Record<string, string[]> = {
  'book-sapiens': [
    'Shared myths enable large-scale cooperation.',
    'Agricultural productivity did not always improve well-being.',
    'Science, empire, and capitalism evolved together.'
  ],
  'book-homo-deus': [
    'Humanism shifts under data-centric decision systems.',
    'Biotech and AI reshape the meaning of agency.',
    'Future inequality may hinge on data ownership.'
  ],
  'book-21-lessons': [
    'The information war changes democratic resilience.',
    'Identity and nationalism remain powerful social forces.',
    'Education must emphasize adaptability and clarity.'
  ]
};

const makeDistillation = (book: Book): Distillation => ({
  id: `distill-${book.id}-v1`,
  bookId: book.id,
  version: 1,
  bookSummary: `A one-hour distillation of ${book.title}.`,
  contextThreads: contextMap[book.id],
  totalEstimatedMinutes: book.totalEstimatedMinutes,
  status: 'published'
});

const makeChapters = (distillationId: string): DistilledChapter[] =>
  Array.from({ length: 10 }).map((_, i) => ({
    id: `${distillationId}-chapter-${i + 1}`,
    distillationId,
    chapterNumber: i + 1,
    title: `Chapter ${i + 1}`,
    summary: `Key ideas distilled for chapter ${i + 1}.`,
    contextWhyItMatters: 'Connects this section to the whole-book argument and preserves long-range context.',
    estimatedMinutes: 6,
    sourceSpanRefs: [`p.${(i + 1) * 12}-${(i + 1) * 12 + 5}`]
  }));

const distillations = seededBooks.map((book) => makeDistillation(book));
const chapters = distillations.flatMap((distillation) => makeChapters(distillation.id));

export const store: {
  users: User[];
  bookSources: BookSource[];
  books: Book[];
  distillations: Distillation[];
  chapters: DistilledChapter[];
  assignments: DailyAssignment[];
  progress: ReadingProgress[];
  gamificationEvents: GamificationEvent[];
  badges: BadgeAward[];
} = {
  users: [
    {
      id: seedUserId,
      email: 'demo@distill.app',
      timezone: 'America/Los_Angeles',
      booksPerYearGoal: 120,
      paceMinutesPerDay: 60,
      xp: 0,
      streakCount: 0
    }
  ],
  bookSources: [],
  books: seededBooks,
  distillations,
  chapters,
  assignments: [
    {
      id: 'assignment-1',
      userId: seedUserId,
      bookId: 'book-sapiens',
      assignedAt: nowIso(),
      locked: false
    }
  ],
  progress: [
    {
      id: 'progress-1',
      userId: seedUserId,
      bookId: 'book-sapiens',
      currentChapter: 1,
      completedChapterIds: [],
      readingSeconds: 0,
      completed: false,
      updatedAt: nowIso()
    }
  ],
  gamificationEvents: [],
  badges: []
};

export const ids = {
  ingest: () => `ingest-${Date.now()}`,
  source: () => `source-${Date.now()}`,
  badge: () => `badge-${Date.now()}`,
  event: () => `event-${Date.now()}`,
  assignment: () => `assignment-${Date.now()}`,
  progress: () => `progress-${Date.now()}`,
  book: () => `book-${Date.now()}`,
  distillation: () => `distillation-${Date.now()}`,
  chapter: () => `chapter-${Date.now()}`
};
