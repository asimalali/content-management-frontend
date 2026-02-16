import { beforeEach, describe, expect, it } from 'vitest';
import { tokenStorage } from '@/lib/api';

describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    tokenStorage.clearTokens();
  });

  it('stores tokens in localStorage for persistence', () => {
    tokenStorage.setTokens('access-token', 'refresh-token');

    expect(tokenStorage.getAccessToken()).toBe('access-token');
    expect(tokenStorage.getRefreshToken()).toBe('refresh-token');
    expect(localStorage.getItem('accessToken')).toBe('access-token');
    expect(localStorage.getItem('refreshToken')).toBe('refresh-token');
  });

  it('retrieves tokens from localStorage', () => {
    localStorage.setItem('accessToken', 'stored-access');
    localStorage.setItem('refreshToken', 'stored-refresh');

    expect(tokenStorage.getAccessToken()).toBe('stored-access');
    expect(tokenStorage.getRefreshToken()).toBe('stored-refresh');
  });

  it('clears tokens from localStorage', () => {
    localStorage.setItem('accessToken', 'access-token');
    localStorage.setItem('refreshToken', 'refresh-token');

    tokenStorage.clearTokens();

    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });
});
