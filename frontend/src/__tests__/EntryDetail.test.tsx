import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import EntryDetail from '../pages/EntryDetail';

const mockEntry = {
  id: 'entry-1',
  user_id: 'user-1',
  session_date: '2026-04-15',
  status: 'complete',
  created_at: '2026-04-15T18:00:00Z',
  completed_at: '2026-04-15T18:30:00Z',
  responses: [
    { id: 'r1', prompt_key: 'highlights', response_text: 'Two kids built a den together', audio_url: null, sort_order: 1 },
    { id: 'r2', prompt_key: 'challenges', response_text: 'One kid was disruptive', audio_url: null, sort_order: 2 },
    { id: 'r3', prompt_key: 'observations', response_text: 'Deep play at fire pit', audio_url: null, sort_order: 3 },
  ],
  ai_response: {
    id: 'ai-1',
    response_text: 'Great observation about the den building. This connects to associative play...',
    model_used: 'gpt-4o-mini',
    created_at: '2026-04-15T18:31:00Z',
  },
};

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: 'user-1', username: 'staff1', display_name: 'Staff One', role: 'staff' },
  }),
}));

vi.mock('../services/api', () => ({
  getEntry: vi.fn(() => Promise.resolve(mockEntry)),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'entry-1' }),
  };
});

function renderEntryDetail() {
  return render(
    <BrowserRouter>
      <EntryDetail />
    </BrowserRouter>
  );
}

describe('EntryDetail', () => {
  it('displays the session date', async () => {
    renderEntryDetail();
    expect(await screen.findByText(/15 apr 2026/i)).toBeInTheDocument();
  });

  it('displays all prompt responses', async () => {
    renderEntryDetail();
    expect(await screen.findByText(/two kids built a den together/i)).toBeInTheDocument();
    expect(screen.getByText(/one kid was disruptive/i)).toBeInTheDocument();
    expect(screen.getByText(/deep play at fire pit/i)).toBeInTheDocument();
  });

  it('displays the AI coaching response', async () => {
    renderEntryDetail();
    expect(await screen.findByText(/great observation about the den building/i)).toBeInTheDocument();
  });

  it('shows prompt labels', async () => {
    renderEntryDetail();
    expect(await screen.findByText(/highlights/i)).toBeInTheDocument();
    expect(screen.getByText(/challenges/i)).toBeInTheDocument();
    expect(screen.getByText(/observations/i)).toBeInTheDocument();
  });

  it('displays completed status', async () => {
    renderEntryDetail();
    expect(await screen.findByText(/complete/i)).toBeInTheDocument();
  });
});
