import type {
  LoginResponse,
  User,
  JournalEntry,
  JournalEntryCreate,
  JournalEntryListItem,
  MoodRecord,
  Goal,
} from '../types/api';

interface QuoteOut {
  id: string;
  quote_text: string;
  approved_at: string;
  used_in_report: boolean;
}

function getToken(): string | null {
  return localStorage.getItem('token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export async function loginUser(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse<LoginResponse>(response);
}

export async function getCurrentUser(): Promise<User> {
  const response = await fetch('/api/v1/auth/me', {
    headers: authHeaders(),
  });
  return handleResponse<User>(response);
}

export async function createEntry(data: JournalEntryCreate): Promise<JournalEntry> {
  const response = await fetch('/api/v1/entries', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<JournalEntry>(response);
}

export async function getEntries(): Promise<JournalEntryListItem[]> {
  const response = await fetch('/api/v1/entries', {
    headers: authHeaders(),
  });
  return handleResponse<JournalEntryListItem[]>(response);
}

export async function getEntry(id: string): Promise<JournalEntry> {
  const response = await fetch(`/api/v1/entries/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse<JournalEntry>(response);
}

export async function completeEntry(id: string): Promise<JournalEntry> {
  const response = await fetch(`/api/v1/entries/${id}/complete`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return handleResponse<JournalEntry>(response);
}

export async function recordMood(data: {
  session_date: string;
  mood_score: number;
  mood_note?: string;
  entry_id?: string;
}): Promise<MoodRecord> {
  const response = await fetch('/api/v1/mood', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<MoodRecord>(response);
}

export async function getMoodHistory(): Promise<MoodRecord[]> {
  const response = await fetch('/api/v1/mood', {
    headers: authHeaders(),
  });
  return handleResponse<MoodRecord[]>(response);
}

export async function createGoal(goalText: string): Promise<Goal> {
  const response = await fetch('/api/v1/goals', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ goal_text: goalText }),
  });
  return handleResponse<Goal>(response);
}

export async function getGoals(): Promise<Goal[]> {
  const response = await fetch('/api/v1/goals', {
    headers: authHeaders(),
  });
  return handleResponse<Goal[]>(response);
}

export async function getActiveGoal(): Promise<Goal | null> {
  const response = await fetch('/api/v1/goals/active', {
    headers: authHeaders(),
  });
  if (response.status === 404) return null;
  return handleResponse<Goal>(response);
}

export async function transcribeAudio(blob: Blob): Promise<{ text: string }> {
  const formData = new FormData();
  formData.append('file', blob, 'recording.wav');
  const token = getToken();
  const response = await fetch('/api/v1/voice/transcribe', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  return handleResponse<{ text: string }>(response);
}

export async function approveQuote(entryResponseId: string, quoteText: string): Promise<QuoteOut> {
  const response = await fetch('/api/v1/quotes', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ entry_response_id: entryResponseId, quote_text: quoteText }),
  });
  return handleResponse<QuoteOut>(response);
}
