export type ContentPolicyMode = 'unrestricted' | 'rights_gated';

export type LibraryStatus = 'in_progress' | 'completed' | 'saved';

export interface User {
  id: string;
  email: string;
  timezone: string;
  booksPerYearGoal: number;
  paceMinutesPerDay: number;
  xp: number;
  streakCount: number;
  lastStreakAt?: string;
}

export interface BookSource {
  id: string;
  sourceUrl: string;
  titleHint?: string;
  authorHint?: string;
  checksum?: string;
  fetchStatus: 'queued' | 'fetched' | 'failed';
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  totalEstimatedMinutes: number;
}

export interface Distillation {
  id: string;
  bookId: string;
  version: number;
  bookSummary: string;
  contextThreads: string[];
  totalEstimatedMinutes: number;
  status: 'draft' | 'published' | 'failed';
}

export interface DistilledChapter {
  id: string;
  distillationId: string;
  chapterNumber: number;
  title: string;
  summary: string;
  contextWhyItMatters: string;
  estimatedMinutes: number;
  sourceSpanRefs: string[];
}

export interface DailyAssignment {
  id: string;
  userId: string;
  bookId: string;
  assignedAt: string;
  locked: boolean;
}

export interface ReadingProgress {
  id: string;
  userId: string;
  bookId: string;
  currentChapter: number;
  completedChapterIds: string[];
  readingSeconds: number;
  completed: boolean;
  updatedAt: string;
}

export interface GamificationEvent {
  id: string;
  userId: string;
  type: 'chapter_completed' | 'book_completed' | 'streak_updated' | 'badge_claimed';
  deltaXp: number;
  createdAt: string;
}

export interface BadgeAward {
  id: string;
  userId: string;
  badgeCode: 'first_book' | 'seven_day_streak' | 'thirty_chapters';
  claimed: boolean;
  earnedAt: string;
}

export interface IngestBookRequest {
  source_url: string;
  title_hint?: string;
  author_hint?: string;
}

export interface IngestBookResponse {
  ingest_job_id: string;
  status: 'queued' | 'processing' | 'failed';
}

export interface DailyActiveResponse {
  active_assignment: DailyAssignment | null;
  book: Book | null;
  progress: ReadingProgress | null;
}

export interface CompleteChapterRequest {
  book_id: string;
  chapter_id: string;
  reading_seconds: number;
}

export interface CompleteChapterResponse {
  xp: number;
  streak_count: number;
  completion_percent: number;
  unlocked_badges: BadgeAward[];
}

export interface DistillationResponse {
  book_summary: string;
  chapter_summaries: DistilledChapter[];
  context_threads: string[];
  total_estimated_minutes: number;
}

export interface ClaimBadgeRequest {
  badge_code: BadgeAward['badgeCode'];
}

export interface ClaimBadgeResponse {
  success: boolean;
  badge: BadgeAward | null;
}
