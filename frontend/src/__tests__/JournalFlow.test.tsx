import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import JournalFlow from '../pages/JournalFlow';

const mockCreateEntry = vi.fn();
const mockCompleteEntry = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: 'user-1', username: 'staff1', display_name: 'Staff One', role: 'staff' },
  }),
}));

vi.mock('../services/api', () => ({
  createEntry: (...args: unknown[]) => mockCreateEntry(...args),
  completeEntry: (...args: unknown[]) => mockCompleteEntry(...args),
  recordMood: vi.fn(() => Promise.resolve({})),
  getActiveGoal: vi.fn(() =>
    Promise.resolve({ id: 'goal-1', goal_text: 'Step back more', is_active: true })
  ),
}));

function renderJournalFlow() {
  return render(
    <BrowserRouter>
      <JournalFlow />
    </BrowserRouter>
  );
}

describe('JournalFlow', () => {
  beforeEach(() => {
    mockCreateEntry.mockReset();
    mockCompleteEntry.mockReset();
  });

  it('shows the first prompt (session context)', () => {
    renderJournalFlow();
    expect(screen.getByText(/what session are you reflecting on/i)).toBeInTheDocument();
  });

  it('has a text input area for responses', () => {
    renderJournalFlow();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('advances to next prompt on continue', async () => {
    const user = userEvent.setup();
    renderJournalFlow();

    await user.type(screen.getByRole('textbox'), 'Wednesday session, 25 kids');
    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByText(/what went well today/i)).toBeInTheDocument();
    });
  });

  it('shows goal check-in prompt with active goal text', async () => {
    const user = userEvent.setup();
    renderJournalFlow();

    for (let i = 0; i < 5; i++) {
      await user.type(screen.getByRole('textbox'), `Response ${i}`);
      await user.click(screen.getByRole('button', { name: /next/i }));
    }

    await waitFor(() => {
      expect(screen.getByText(/step back more/i)).toBeInTheDocument();
    });
  });

  it('shows mood selector prompt', async () => {
    const user = userEvent.setup();
    renderJournalFlow();

    for (let i = 0; i < 6; i++) {
      const textbox = screen.queryByRole('textbox');
      if (textbox) {
        await user.type(textbox, `Response ${i}`);
      }
      const nextBtn = screen.queryByRole('button', { name: /next/i });
      if (nextBtn) {
        await user.click(nextBtn);
      }
    }

    await waitFor(() => {
      expect(screen.getByText(/how are you feeling/i)).toBeInTheDocument();
    });
  });

  it('has a voice recording button', () => {
    renderJournalFlow();
    expect(screen.getByRole('button', { name: /record/i })).toBeInTheDocument();
  });
});
