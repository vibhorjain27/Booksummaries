const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/v1';

let token = '';
let loginPromise: Promise<void> | null = null;

const bootstrapAuth = async (): Promise<void> => {
  if (token) return;
  if (!loginPromise) {
    loginPromise = fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@distill.app' })
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(await response.text());
        }
        return response.json() as Promise<{ token: string }>;
      })
      .then((payload) => {
        token = payload.token;
      })
      .finally(() => {
        loginPromise = null;
      });
  }
  await loginPromise;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  await bootstrapAuth();

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export const api = {
  getDailyActive: () => request('/daily/active'),
  getLibrary: () => request('/library'),
  getProgressSummary: () => request('/gamification/summary'),
  getDistillation: (bookId: string) => request(`/books/${bookId}/distillation`),
  completeChapter: (payload: { book_id: string; chapter_id: string; reading_seconds: number }) =>
    request('/daily/complete-chapter', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  ingestBook: (payload: { source_url: string; title_hint?: string; author_hint?: string }) =>
    request('/books/ingest', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};
