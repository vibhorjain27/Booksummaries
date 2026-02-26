export const buildDailyNotification = (bookTitle: string): string =>
  `Today's 1-hour distillation is ready: ${bookTitle}`;

export const buildResumeNotification = (): string =>
  'Resume your current book to keep your momentum.';
