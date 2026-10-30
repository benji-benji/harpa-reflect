import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VoiceRecorder from '../components/VoiceRecorder';

const mockTranscribe = vi.fn();

vi.mock('../services/api', () => ({
  transcribeAudio: (...args: unknown[]) => mockTranscribe(...args),
}));

describe('VoiceRecorder', () => {
  const mockOnTranscript = vi.fn();

  beforeEach(() => {
    mockTranscribe.mockReset();
    mockOnTranscript.mockReset();
  });

  it('renders a record button', () => {
    render(<VoiceRecorder onTranscript={mockOnTranscript} />);
    expect(screen.getByRole('button', { name: /record/i })).toBeInTheDocument();
  });

  it('record button is enabled by default', () => {
    render(<VoiceRecorder onTranscript={mockOnTranscript} />);
    expect(screen.getByRole('button', { name: /record/i })).toBeEnabled();
  });
});
