import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe('API service', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    localStorage.clear();
    vi.resetModules();
  });

  it('loginUser sends POST to /api/v1/auth/login', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ access_token: 'token', token_type: 'bearer' }),
    });

    const { loginUser } = await import('../services/api');
    const result = await loginUser('staff1', 'pass123');

    expect(mockFetch).toHaveBeenCalledWith('/api/v1/auth/login', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ username: 'staff1', password: 'pass123' }),
    }));
    expect(result.access_token).toBe('token');
  });

  it('getCurrentUser sends GET to /api/v1/auth/me with auth header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'u1', username: 'staff1' }),
    });

    localStorage.setItem('token', 'test-token');
    const { getCurrentUser } = await import('../services/api');
    await getCurrentUser();

    expect(mockFetch).toHaveBeenCalledWith('/api/v1/auth/me', expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: 'Bearer test-token',
      }),
    }));
  });

  it('createEntry sends POST to /api/v1/entries', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'e1', status: 'draft' }),
    });

    localStorage.setItem('token', 'test-token');
    const { createEntry } = await import('../services/api');
    await createEntry({
      session_date: '2026-04-15',
      responses: [{ prompt_key: 'highlights', response_text: 'Great session' }],
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/v1/entries', expect.objectContaining({
      method: 'POST',
    }));
  });

  it('getEntries sends GET to /api/v1/entries', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    localStorage.setItem('token', 'test-token');
    const { getEntries } = await import('../services/api');
    await getEntries();

    expect(mockFetch).toHaveBeenCalledWith('/api/v1/entries', expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: 'Bearer test-token',
      }),
    }));
  });

  it('completeEntry sends POST to /api/v1/entries/:id/complete', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'e1', status: 'complete' }),
    });

    localStorage.setItem('token', 'test-token');
    const { completeEntry } = await import('../services/api');
    await completeEntry('e1');

    expect(mockFetch).toHaveBeenCalledWith('/api/v1/entries/e1/complete', expect.objectContaining({
      method: 'POST',
    }));
  });

  it('transcribeAudio sends multipart POST to /api/v1/voice/transcribe', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ text: 'Hello world' }),
    });

    localStorage.setItem('token', 'test-token');
    const { transcribeAudio } = await import('../services/api');
    const blob = new Blob(['audio'], { type: 'audio/wav' });
    await transcribeAudio(blob);

    expect(mockFetch).toHaveBeenCalledWith('/api/v1/voice/transcribe', expect.objectContaining({
      method: 'POST',
    }));
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ detail: 'Unauthorized' }),
    });

    const { loginUser } = await import('../services/api');
    await expect(loginUser('bad', 'creds')).rejects.toThrow();
  });
});
