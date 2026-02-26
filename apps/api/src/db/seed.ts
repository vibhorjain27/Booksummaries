import { prisma } from './prisma.js';

async function seed() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@distill.app' },
    update: {},
    create: {
      email: 'demo@distill.app',
      timezone: 'America/Los_Angeles',
      booksPerYearGoal: 120,
      paceMinutesPerDay: 60
    }
  });

  const books = [
    { id: 'book-sapiens', title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', totalEstimatedMinutes: 60 },
    { id: 'book-homo-deus', title: 'Homo Deus: A Brief History of Tomorrow', author: 'Yuval Noah Harari', totalEstimatedMinutes: 60 },
    { id: 'book-21-lessons', title: '21 Lessons for the 21st Century', author: 'Yuval Noah Harari', totalEstimatedMinutes: 58 }
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

  for (const book of books) {
    const created = await prisma.book.upsert({
      where: { id: book.id },
      update: {
        title: book.title,
        author: book.author,
        totalEstimatedMinutes: book.totalEstimatedMinutes
      },
      create: book
    });

    const distillation = await prisma.distillation.upsert({
      where: { bookId_version: { bookId: created.id, version: 1 } },
      update: {
        bookSummary: `A one-hour distillation of ${book.title}.`,
        contextThreads: contextMap[book.id],
        totalEstimatedMinutes: book.totalEstimatedMinutes,
        status: 'published'
      },
      create: {
        bookId: created.id,
        version: 1,
        bookSummary: `A one-hour distillation of ${book.title}.`,
        contextThreads: contextMap[book.id],
        totalEstimatedMinutes: book.totalEstimatedMinutes,
        status: 'published'
      }
    });

    for (let i = 1; i <= 10; i += 1) {
      await prisma.distilledChapter.upsert({
        where: {
          distillationId_chapterNumber: {
            distillationId: distillation.id,
            chapterNumber: i
          }
        },
        update: {
          title: `Chapter ${i}`,
          summary: `Key ideas distilled for chapter ${i}.`,
          contextWhyItMatters: 'Connects this section to the whole-book argument and preserves long-range context.',
          estimatedMinutes: 6,
          sourceSpanRefs: [`p.${i * 12}-${i * 12 + 5}`]
        },
        create: {
          distillationId: distillation.id,
          chapterNumber: i,
          title: `Chapter ${i}`,
          summary: `Key ideas distilled for chapter ${i}.`,
          contextWhyItMatters: 'Connects this section to the whole-book argument and preserves long-range context.',
          estimatedMinutes: 6,
          sourceSpanRefs: [`p.${i * 12}-${i * 12 + 5}`]
        }
      });
    }
  }

  const firstBook = await prisma.book.findUnique({ where: { id: 'book-sapiens' } });
  if (firstBook) {
    await prisma.dailyAssignment.upsert({
      where: { id: 'assignment-initial' },
      update: {
        userId: user.id,
        bookId: firstBook.id,
        assignedAt: new Date(),
        locked: false
      },
      create: {
        id: 'assignment-initial',
        userId: user.id,
        bookId: firstBook.id,
        assignedAt: new Date(),
        locked: false
      }
    });

    await prisma.readingProgress.upsert({
      where: { userId_bookId: { userId: user.id, bookId: firstBook.id } },
      update: {},
      create: {
        userId: user.id,
        bookId: firstBook.id,
        currentChapter: 1,
        completedChapterIds: [],
        readingSeconds: 0,
        completed: false
      }
    });
  }
}

seed()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed complete');
  })
  .catch(async (error) => {
    await prisma.$disconnect();
    console.error(error);
    process.exit(1);
  });
