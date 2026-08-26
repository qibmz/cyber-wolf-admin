/**
 * @name 代理的配置
 * @see 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 *
 * @doc https://umijs.org/docs/guides/proxy
 */

/** 测试环境后端 */
export const BACKEND_DEV = 'https://cyber-wolf-backend-dev.qibmz.com';
/** 正式环境后端 */
export const BACKEND_PROD = 'https://cyber-wolf-backend.qibmz.com';

export default {
  /**
   * 本地联调：本机 cyber-wolf-backend（默认 APP_PORT=3001）
   * @doc https://github.com/chimurai/http-proxy-middleware
   */
  dev: {
    '/api/': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
  /**
   * 远程测试后端（npm run start:test）
   */
  test: {
    '/api/': {
      target: BACKEND_DEV,
      changeOrigin: true,
    },
  },
  /**
   * 预发联调默认也走测试后端（npm run start:pre）
   */
  pre: {
    '/api/': {
      target: BACKEND_DEV,
      changeOrigin: true,
    },
  },
};
