import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearAuth,
  getRefreshToken,
  getSafeRedirectUrl,
  getToken,
  getTokenExpires,
  isAccessTokenExpiringSoon,
  mapUserToCurrentUser,
  ROLE_ADMIN_ID,
  redirectToLogin,
  saveAuthTokens,
} from './auth';

describe('auth utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('saveAuthTokens / get* / clearAuth round-trip', () => {
    saveAuthTokens({
      token: 'access',
      refreshToken: 'refresh',
      tokenExpires: 1_700_000_000_000,
    });

    expect(getToken()).toBe('access');
    expect(getRefreshToken()).toBe('refresh');
    expect(getTokenExpires()).toBe(1_700_000_000_000);

    clearAuth();
    expect(getToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(getTokenExpires()).toBeNull();
  });

  it('isAccessTokenExpiringSoon respects threshold', () => {
    saveAuthTokens({
      token: 'a',
      refreshToken: 'r',
      tokenExpires: Date.now() + 10_000,
    });
    expect(isAccessTokenExpiringSoon(60_000)).toBe(true);
    expect(isAccessTokenExpiringSoon(5_000)).toBe(false);
  });

  it('mapUserToCurrentUser maps admin by role id', () => {
    const user = mapUserToCurrentUser({
      id: 1,
      email: 'admin@example.com',
      provider: 'email',
      socialId: '',
      nickname: 'Admin User',
      photo: { id: '1', path: '/a.png' },
      role: { id: ROLE_ADMIN_ID, name: 'Admin' },
      status: { id: 1, name: 'Active' },
      createdAt: '',
      updatedAt: '',
      deletedAt: '',
    });

    expect(user).toEqual({
      name: 'Admin User',
      email: 'admin@example.com',
      userid: '1',
      avatar: '/a.png',
      access: 'admin',
    });
  });

  it('mapUserToCurrentUser falls back to email as name', () => {
    const user = mapUserToCurrentUser({
      id: 2,
      email: 'user@example.com',
      provider: 'email',
      socialId: '',
      nickname: '',
      photo: { id: '', path: '' },
      role: { id: 2, name: 'User' },
      status: { id: 1, name: 'Active' },
      createdAt: '',
      updatedAt: '',
      deletedAt: '',
    });

    expect(user.name).toBe('user@example.com');
    expect(user.access).toBe('user');
  });

  it('getSafeRedirectUrl blocks open redirects', () => {
    expect(getSafeRedirectUrl(null)).toBe('/');
    expect(getSafeRedirectUrl('https://evil.com')).toBe('/');
    expect(getSafeRedirectUrl('//evil.com')).toBe('/');
    expect(getSafeRedirectUrl('/welcome')).toBe('/welcome');
    expect(getSafeRedirectUrl('/admin/users?tab=1#x')).toBe(
      '/admin/users?tab=1#x',
    );
  });

  it('redirectToLogin skips when already on login page', () => {
    const replace = vi.fn();
    vi.stubGlobal('location', {
      pathname: '/user/login',
      search: '',
      hash: '',
      origin: 'http://localhost:8000',
      replace,
    });

    redirectToLogin('/welcome');
    expect(replace).not.toHaveBeenCalled();
  });

  it('redirectToLogin navigates with safe redirect query', () => {
    const replace = vi.fn();
    vi.stubGlobal('location', {
      pathname: '/admin/users',
      search: '?x=1',
      hash: '',
      origin: 'http://localhost:8000',
      replace,
    });

    redirectToLogin();
    expect(replace).toHaveBeenCalledWith(
      '/user/login?redirect=%2Fadmin%2Fusers%3Fx%3D1',
    );
  });
});
