import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock all heavy dependencies before importing app
const mockHistory = {
  location: {
    pathname: '/welcome',
    search: '',
    hash: '',
  },
  replace: vi.fn(),
};

const mockAuthMe = vi.fn();
const mockClearAuth = vi.fn();
const mockRedirectToLogin = vi.fn();

vi.mock('@umijs/max', () => ({
  history: mockHistory,
  Link: ({ children }: any) => children,
}));

vi.mock('@/services/cyber-wolf/auth', () => ({
  authControllerMeV1: mockAuthMe,
}));

vi.mock('@/utils/auth', async () => {
  const actual =
    await vi.importActual<typeof import('@/utils/auth')>('@/utils/auth');
  return {
    ...actual,
    clearAuth: mockClearAuth,
    redirectToLogin: mockRedirectToLogin,
  };
});

vi.mock('@/components', () => ({
  AvatarDropdown: () => null,
  DocLink: () => null,
  ErrorBoundary: ({ children }: any) => children,
  Footer: () => null,
  LangDropdown: () => null,
  OfflineBanner: () => null,
  VersionDropdown: () => null,
}));

vi.mock('@ant-design/pro-components', () => ({
  SettingDrawer: () => null,
}));

vi.mock('@ant-design/icons', () => ({
  LinkOutlined: () => null,
}));

vi.mock('./requestErrorConfig', () => ({
  errorConfig: {},
}));

vi.mock('../config/defaultSettings', () => ({
  default: { navTheme: 'light' },
}));

describe('app getInitialState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHistory.location = {
      pathname: '/welcome',
      search: '',
      hash: '',
    };
  });

  it('should fetch currentUser when not on login page', async () => {
    const { getInitialState } = await import('./app');
    mockAuthMe.mockResolvedValue({
      id: 1,
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: { id: 1, name: 'admin' },
    });

    const state = await getInitialState();

    expect(mockAuthMe).toHaveBeenCalled();
    expect(state.currentUser).toEqual({
      name: 'Admin User',
      email: 'admin@example.com',
      userid: '1',
      avatar: undefined,
      access: 'admin',
    });
    expect(state.settingDrawerOpen).toBe(false);
    expect(state.fetchUserInfo).toBeDefined();
  });

  it('should stay on welcome as guest when currentUser fetch fails (401)', async () => {
    const { getInitialState } = await import('./app');
    mockAuthMe.mockRejectedValue(new Error('401 Unauthorized'));

    const state = await getInitialState();

    expect(mockClearAuth).toHaveBeenCalled();
    expect(mockRedirectToLogin).not.toHaveBeenCalled();
    expect(state.currentUser).toBeUndefined();
  });

  it('should not fetch currentUser on login page', async () => {
    const { getInitialState } = await import('./app');
    mockHistory.location = {
      pathname: '/user/login',
      search: '',
      hash: '',
    };

    const state = await getInitialState();

    expect(mockAuthMe).not.toHaveBeenCalled();
    expect(state.currentUser).toBeUndefined();
    expect(state.fetchUserInfo).toBeDefined();
  });

  it('should encode redirect path correctly on 401', async () => {
    const { getInitialState } = await import('./app');
    mockHistory.location = {
      pathname: '/admin/users',
      search: '?page=2',
      hash: '#section',
    };
    mockAuthMe.mockRejectedValue(new Error('401'));

    await getInitialState();

    expect(mockRedirectToLogin).toHaveBeenCalledWith(
      '/admin/users?page=2#section',
    );
  });

  it('should include default settings in initial state', async () => {
    const { getInitialState } = await import('./app');
    mockAuthMe.mockResolvedValue({
      id: 2,
      email: 'user@example.com',
      firstName: 'User',
      lastName: '',
      role: { id: 2, name: 'user' },
    });

    const state = await getInitialState();

    expect(state.settings).toEqual({ navTheme: 'light' });
  });
});
