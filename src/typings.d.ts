declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';
declare module '*.md' {
  const content: string;
  export default content;
}
declare module 'mockjs';

declare const __APP_VERSION__: string;
declare const __UMI_VERSION__: string;
declare const __UTOO_VERSION__: string;
declare const BACKEND_DEV: string;
declare const BACKEND_PROD: string;

declare namespace NodeJS {
  interface ProcessEnv {
    /** 构建注入的 API 根地址；空字符串表示走相对路径 /api */
    API_SERVER?: string;
    UMI_APP_API_SERVER?: string;
  }
}
