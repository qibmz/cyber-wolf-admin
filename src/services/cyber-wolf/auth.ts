// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** 此处后端没有提供注释 POST /api/v1/auth/email/confirm */
export async function authControllerConfirmEmailV1(
  body: API.AuthConfirmEmailDto,
  options?: { [key: string]: any }
) {
  return request<any>("/api/v1/auth/email/confirm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1/auth/email/confirm/new */
export async function authControllerConfirmNewEmailV1(
  body: API.AuthConfirmEmailDto,
  options?: { [key: string]: any }
) {
  return request<any>("/api/v1/auth/email/confirm/new", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1/auth/email/login */
export async function authControllerLoginV1(
  body: API.AuthEmailLoginDto,
  options?: { [key: string]: any }
) {
  return request<API.LoginResponseDto>("/api/v1/auth/email/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1/auth/email/register */
export async function authControllerRegisterV1(
  body: API.AuthRegisterLoginDto,
  options?: { [key: string]: any }
) {
  return request<any>("/api/v1/auth/email/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1/auth/forgot/password */
export async function authControllerForgotPasswordV1(
  body: API.AuthForgotPasswordDto,
  options?: { [key: string]: any }
) {
  return request<any>("/api/v1/auth/forgot/password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1/auth/google/login */
export async function authGoogleControllerLoginV1(
  body: API.AuthGoogleLoginDto,
  options?: { [key: string]: any }
) {
  return request<API.LoginResponseDto>("/api/v1/auth/google/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1/auth/logout */
export async function authControllerLogoutV1(options?: { [key: string]: any }) {
  return request<any>("/api/v1/auth/logout", {
    method: "POST",
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/v1/auth/me */
export async function authControllerMeV1(options?: { [key: string]: any }) {
  return request<API.User>("/api/v1/auth/me", {
    method: "GET",
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /api/v1/auth/me */
export async function authControllerDeleteV1(options?: { [key: string]: any }) {
  return request<any>("/api/v1/auth/me", {
    method: "DELETE",
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PATCH /api/v1/auth/me */
export async function authControllerUpdateV1(
  body: API.AuthUpdateDto,
  options?: { [key: string]: any }
) {
  return request<API.User>("/api/v1/auth/me", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1/auth/refresh */
export async function authControllerRefreshV1(options?: {
  [key: string]: any;
}) {
  return request<API.RefreshResponseDto>("/api/v1/auth/refresh", {
    method: "POST",
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1/auth/reset/password */
export async function authControllerResetPasswordV1(
  body: API.AuthResetPasswordDto,
  options?: { [key: string]: any }
) {
  return request<any>("/api/v1/auth/reset/password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
