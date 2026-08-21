// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** 此处后端没有提供注释 GET /api/v1/users */
export async function usersControllerFindAllV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.UsersControllerFindAllV1Params,
  options?: { [key: string]: any }
) {
  return request<API.InfinityPaginationUserResponseDto>("/api/v1/users", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1/users */
export async function usersControllerCreateV1(
  body: API.CreateUserDto,
  options?: { [key: string]: any }
) {
  return request<API.User>("/api/v1/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/v1/users/${param0} */
export async function usersControllerFindOneV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.UsersControllerFindOneV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.User>(`/api/v1/users/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /api/v1/users/${param0} */
export async function usersControllerRemoveV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.UsersControllerRemoveV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/v1/users/${param0}`, {
    method: "DELETE",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PATCH /api/v1/users/${param0} */
export async function usersControllerUpdateV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.UsersControllerUpdateV1Params,
  body: API.UpdateUserDto,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.User>(`/api/v1/users/${param0}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 修改用户姓名（admin） PATCH /api/v1/users/${param0}/name */
export async function usersControllerUpdateNameV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.UsersControllerUpdateNameV1Params,
  body: API.UpdateUserNameDto,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.User>(`/api/v1/users/${param0}/name`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
