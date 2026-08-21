import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { getIntl, getLocale } from '@umijs/max';
import { message, notification } from 'antd';
import { authControllerRefreshV1 } from '@/services/cyber-wolf/auth';
import {
  clearAuth,
  getRefreshToken,
  getToken,
  isAccessTokenExpiringSoon,
  redirectToLogin,
  saveAuthTokens,
} from '@/utils/auth';

// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// 与后端约定的响应数据格式（Pro 模板 / 业务错误适配）
interface ResponseStructure {
  success?: boolean;
  data?: unknown;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

/** cyber-wolf-backend ResponseInterceptor 包装 */
interface BackendEnvelope {
  code: number;
  msg: string;
  data?: unknown;
}

function isBackendEnvelope(body: unknown): body is BackendEnvelope {
  return (
    !!body &&
    typeof body === 'object' &&
    !(body instanceof Blob) &&
    'code' in body &&
    'msg' in body
  );
}

function isAuthRefreshRequest(url?: string) {
  return !!url && url.includes('/api/v1/auth/refresh');
}

function isAuthLoginRequest(url?: string) {
  return !!url && url.includes('/api/v1/auth/email/login');
}

/** locale → backend x-custom-lang（简化为语言前缀） */
function resolveCustomLang() {
  try {
    const locale = getLocale?.() || 'zh-CN';
    return locale.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  } catch {
    return 'zh';
  }
}

let refreshPromise: Promise<boolean> | null = null;

/**
 * 用 refreshToken 换新 access token。
 * backend 一般走 jwt-refresh：Authorization: Bearer <refreshToken>
 */
async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const data = await authControllerRefreshV1({
          skipErrorHandler: true,
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });
        saveAuthTokens({
          token: data.token,
          refreshToken: data.refreshToken,
          tokenExpires: data.tokenExpires,
        });
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

function forceLogoutToLogin() {
  clearAuth();
  redirectToLogin();
}

/**
 * @name 错误处理
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  errorConfig: {
    errorThrower: (res) => {
      // 已解包的成功 data（无 success 字段）直接放行
      if (
        res &&
        typeof res === 'object' &&
        !('success' in (res as object)) &&
        !('errorCode' in (res as object))
      ) {
        return;
      }
      const { success, data, errorCode, errorMessage, showType } =
        res as unknown as ResponseStructure;
      if (success === false) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        throw error;
      }
    },
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                title: errorCode,
                description: errorMessage,
              });
              break;
            case ErrorShowType.REDIRECT:
              forceLogoutToLogin();
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response) {
        const status = error.response.status;
        const url = error.config?.url as string | undefined;
        if (
          status === 401 &&
          !isAuthRefreshRequest(url) &&
          !isAuthLoginRequest(url)
        ) {
          // 同步路径无法 await refresh；清会话并跳登录。
          // 主动续期见 requestInterceptors（即将过期时 refresh）。
          forceLogoutToLogin();
          return;
        }
        message.error(`Response status:${status}`);
      } else if (typeof navigator !== 'undefined' && !navigator.onLine) {
        message.error(
          getIntl().formatMessage({
            id: 'app.request.offline',
            defaultMessage:
              'Network unavailable. Please check your connection and try again.',
          }),
        );
      } else if (error.request) {
        message.error('None response! Please retry.');
      } else {
        message.error('Request error, please retry.');
      }
    },
  },

  requestInterceptors: [
    async (config: RequestOptions) => {
      const headers = {
        ...config.headers,
        'x-custom-lang': resolveCustomLang(),
      } as Record<string, string>;

      const url = config.url;

      // refresh 接口必须带 refreshToken，不能被 access token 覆盖
      if (isAuthRefreshRequest(url)) {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          headers.Authorization = `Bearer ${refreshToken}`;
        }
        return { ...config, headers };
      }

      // access token 即将过期时先续期（登录请求跳过）
      if (
        !isAuthLoginRequest(url) &&
        getRefreshToken() &&
        isAccessTokenExpiringSoon()
      ) {
        const ok = await tryRefreshToken();
        if (!ok) {
          forceLogoutToLogin();
          throw new Error('Session expired');
        }
      }

      const token = getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      return { ...config, headers };
    },
  ],

  responseInterceptors: [
    (response) => {
      const body = response.data;
      if (!isBackendEnvelope(body)) {
        return response;
      }
      if (body.code === 200) {
        // 解包后与 Swagger schema / 生成 client 类型一致
        (response as { data: unknown }).data = body.data;
        return response;
      }
      // 适配 Pro errorThrower
      (response as { data: unknown }).data = {
        success: false,
        errorCode: body.code,
        errorMessage: body.msg,
        data: body.data,
      };
      return response;
    },
  ],
};
