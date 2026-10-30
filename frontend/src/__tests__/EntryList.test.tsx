import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import EntryList from '../pages/EntryList';

const mockEntries = [
  {
    id: 'entry-1',
    session_date: '2026-04-15',
    status: 'complete',
    created_at: '2026-04-15T18:00:00Z',
    completed_at: '2026-04-15T18:30:00Z',
  },
  {
    id: 'entry-2',
    session_date: '2026-04-14',
    status: 'draft',
    created_at: '2026-04-14T17:00:00Z',
    completed_at: null,
  },
];

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: 'user-1', username: 'staff1', display_name: 'Staff One', role: 'staff' },
  }),
}));

vi.mock('../services/api', () => ({
  getEntries: vi.fn(() => Promise.resolve(mockEntries)),
}));

function renderEntryList() {
  return render(
    <BrowserRouter>
      <EntryList />
    </BrowserRouter>
  );
}

describe('EntryList', () => {
  it('renders a list of journal entries', async () => {
    renderEntryList();
    expect(await screen.findByText(/15 apr/i)).toBeInTheDocument();
    expect(screen.getByText(/14 apr/i)).toBeInTheDocument();
  });

  it('shows status badges', async () => {
    renderEntryList();
    expect(await screen.findByText(/complete/i)).toBeInTheDocument();
    expect(screen.getByText(/draft/i)).toBeInTheDocument();
  });

  it('has a link to create new entry', () => {
    renderEntryList();
    expect(screen.getByRole('link', { name: /new entry/i })).toBeInTheDocument();
  });

  it('entries are clickable', async () => {
    renderEntryList();
    await screen.findByText(/15 apr/i);
    const links = screen.getAllByRole('link');
    const entryLinks = links.filter((l) => l.getAttribute('href')?.includes('/entries/'));
    expect(entryLinks.length).toBeGreaterThanOrEqual(2);
  });
});
