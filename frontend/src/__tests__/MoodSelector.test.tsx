import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import MoodSelector from '../components/MoodSelector';

describe('MoodSelector', () => {
  const mockOnSelect = vi.fn();

  it('renders 5 mood options', () => {
    render(<MoodSelector value={null} onChange={mockOnSelect} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(5);
  });

  it('calls onChange with selected mood score', async () => {
    const user = userEvent.setup();
    render(<MoodSelector value={null} onChange={mockOnSelect} />);

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[3]);

    expect(mockOnSelect).toHaveBeenCalledWith(4);
  });

  it('highlights the selected mood', () => {
    render(<MoodSelector value={3} onChange={mockOnSelect} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[2]).toHaveClass('selected');
  });

  it('has accessible labels for each mood level', () => {
    render(<MoodSelector value={null} onChange={mockOnSelect} />);
    expect(screen.getByLabelText(/1/)).toBeInTheDocument();
    expect(screen.getByLabelText(/5/)).toBeInTheDocument();
  });
});
