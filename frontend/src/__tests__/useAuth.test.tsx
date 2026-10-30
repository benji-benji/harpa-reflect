import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../services/api', () => ({
  loginUser: vi.fn(),
  getCurrentUser: vi.fn(),
}));

import { loginUser, getCurrentUser } from '../services/api';

describe('useAuth hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it('starts unauthenticated', async () => {
    const { useAuth } = await import('../hooks/useAuth');
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('login stores token and fetches user', async () => {
    (loginUser as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ access_token: 'test-token', token_type: 'bearer' });
    (getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 'user-1',
      username: 'staff1',
      display_name: 'Staff One',
      role: 'staff',
      is_active: true,
    });

    const { useAuth } = await import('../hooks/useAuth');
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('staff1', 'pass');
    });

    expect(loginUser).toHaveBeenCalledWith('staff1', 'pass');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.username).toBe('staff1');
  });

  it('logout clears token and user', async () => {
    (loginUser as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ access_token: 'test-token', token_type: 'bearer' });
    (getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 'user-1',
      username: 'staff1',
      display_name: 'Staff One',
      role: 'staff',
      is_active: true,
    });

    const { useAuth } = await import('../hooks/useAuth');
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('staff1', 'pass');
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
