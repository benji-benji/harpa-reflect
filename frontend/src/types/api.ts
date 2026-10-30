export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  username: string;
  display_name: string;
  role: 'staff' | 'supervisor';
  is_active: boolean;
}

export interface EntryResponseIn {
  prompt_key: string;
  response_text: string;
  audio_url?: string | null;
}

export interface JournalEntryCreate {
  session_date: string;
  responses: EntryResponseIn[];
}

export interface EntryResponse {
  id: string;
  prompt_key: string;
  response_text: string;
  audio_url: string | null;
  sort_order: number;
}

export interface AIResponse {
  id: string;
  response_text: string;
  model_used: string;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  session_date: string;
  status: 'draft' | 'complete';
  created_at: string;
  completed_at: string | null;
  responses: EntryResponse[];
  ai_response: AIResponse | null;
}

export interface JournalEntryListItem {
  id: string;
  session_date: string;
  status: 'draft' | 'complete';
  created_at: string;
  completed_at: string | null;
}

export interface MoodRecord {
  id: string;
  session_date: string;
  mood_score: number;
  mood_note: string | null;
  entry_id: string | null;
  created_at: string;
}

export interface Goal {
  id: string;
  goal_text: string;
  is_active: boolean;
  created_at: string;
  completed_at: string | null;
}

export interface EngagementMetric {
  user_id: string;
  display_name: string;
  total_entries: number;
  entries_this_week: number;
  last_entry_date: string | null;
  avg_mood: number | null;
}

export interface PromptDefinition {
  prompt_key: string;
  text: string;
  requires_goal?: boolean;
}
