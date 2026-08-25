const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const TOKEN_EXPIRES_KEY = 'tokenExpires';

/** backend RoleEnum.admin */
export const ROLE_ADMIN_ID = 1;

export type AuthTokens = {
  token: string;
  refreshToken: string;
  tokenExpires?: number;
};

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage;
}

export function saveAuthTokens(data: AuthTokens) {
  if (!canUseStorage()) return;
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  if (data.tokenExpires != null) {
    localStorage.setItem(TOKEN_EXPIRES_KEY, String(data.tokenExpires));
  } else {
    localStorage.removeItem(TOKEN_EXPIRES_KEY);
  }
}

export function getToken(): string | null {
  if (!canUseStorage()) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!canUseStorage()) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getTokenExpires(): number | null {
  if (!canUseStorage()) return null;
  const raw = localStorage.getItem(TOKEN_EXPIRES_KEY);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function clearAuth() {
  if (!canUseStorage()) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRES_KEY);
}

/** access token 是否将在 thresholdMs 内过期（默认 60s） */
export function isAccessTokenExpiringSoon(thresholdMs = 60_000): boolean {
  const expires = getTokenExpires();
  if (expires == null) return false;
  return expires - Date.now() <= thresholdMs;
}

const loginPath = '/user/login';

/**
 * Validate redirect URL to prevent open redirect attacks.
 * Only allow same-origin relative paths starting with '/'.
 */
export function getSafeRedirectUrl(redirect: string | null): string {
  if (!redirect?.startsWith('/')) return '/';
  if (redirect.startsWith('//')) return '/';

  if (typeof window === 'undefined') {
    return redirect;
  }

  try {
    const parsed = new URL(redirect, window.location.origin);
    if (parsed.origin !== window.location.origin) return '/';
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return '/';
  }
}

/** 401 / 登出后跳转登录，避免在登录页死循环 */
export function redirectToLogin(redirectPath?: string) {
  if (typeof window === 'undefined') return;
  const { pathname, search, hash } = window.location;
  if (pathname === loginPath || pathname.startsWith(`${loginPath}/`)) {
    return;
  }
  const fallback = `${pathname}${search}${hash}` || '/';
  const redirect = getSafeRedirectUrl(redirectPath ?? fallback);
  const searchParams = new URLSearchParams({
    redirect,
  });
  window.location.replace(`${loginPath}?${searchParams.toString()}`);
}

/** Map backend User → ProLayout CurrentUser fields */
export function mapUserToCurrentUser(user: API.User): API.CurrentUser {
  const name = user.nickname?.trim() || user.email;
  const roleId = user.role?.id;
  const access =
    roleId === ROLE_ADMIN_ID || user.role?.name?.toLowerCase() === 'admin'
      ? 'admin'
      : user.role?.name?.toLowerCase() || 'user';

  return {
    name,
    email: user.email,
    userid: user.id != null ? String(user.id) : undefined,
    avatar: user.photo?.path,
    access,
  };
}
