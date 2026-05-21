import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth';

vi.mock('../services/auth', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    me: vi.fn(),
  },
}));

const mockedAuth = vi.mocked(authService);

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset zustand store state between tests.
    useAuthStore.setState({ token: null, user: null, status: 'idle' });
    vi.clearAllMocks();
  });

  it('login stores token + user and persists to localStorage', async () => {
    mockedAuth.login.mockResolvedValueOnce({
      token: 'tok-abc',
      user: { id: '1', email: 'a@b.c', name: 'Alice' },
    });

    await useAuthStore.getState().login('a@b.c', 'secret');

    const state = useAuthStore.getState();
    expect(state.token).toBe('tok-abc');
    expect(state.user?.email).toBe('a@b.c');
    expect(state.status).toBe('ready');
    expect(localStorage.getItem('finance.token')).toBe('tok-abc');
    expect(JSON.parse(localStorage.getItem('finance.user') as string).id).toBe('1');
  });

  it('logout clears both store state and localStorage', () => {
    localStorage.setItem('finance.token', 'tok');
    localStorage.setItem('finance.user', JSON.stringify({ id: '1' }));
    useAuthStore.setState({
      token: 'tok',
      user: { id: '1', email: 'x', name: 'x' },
      status: 'ready',
    });

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(localStorage.getItem('finance.token')).toBeNull();
    expect(localStorage.getItem('finance.user')).toBeNull();
  });

  it('hydrate verifies the cached token via /me and updates the user', async () => {
    localStorage.setItem('finance.token', 'tok-cached');
    mockedAuth.me.mockResolvedValueOnce({
      id: '1',
      email: 'real@me.com',
      name: 'Real',
    });

    await useAuthStore.getState().hydrate();

    expect(mockedAuth.me).toHaveBeenCalledOnce();
    expect(useAuthStore.getState().user?.email).toBe('real@me.com');
    expect(useAuthStore.getState().status).toBe('ready');
  });

  it('hydrate clears the session when /me fails (invalid/expired token)', async () => {
    localStorage.setItem('finance.token', 'bad-token');
    mockedAuth.me.mockRejectedValueOnce(new Error('401'));

    await useAuthStore.getState().hydrate();

    expect(useAuthStore.getState().token).toBeNull();
    expect(localStorage.getItem('finance.token')).toBeNull();
    expect(useAuthStore.getState().status).toBe('ready');
  });

  it('hydrate is a no-op when no token is cached', async () => {
    await useAuthStore.getState().hydrate();
    expect(mockedAuth.me).not.toHaveBeenCalled();
    expect(useAuthStore.getState().status).toBe('ready');
  });
});
