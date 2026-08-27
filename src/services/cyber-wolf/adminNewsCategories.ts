// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** 此处后端没有提供注释 GET /api/v1/admin/news-categories */
export async function newsCategoriesAdminControllerFindAllV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.NewsCategoriesAdminControllerFindAllV1Params,
  options?: { [key: string]: any }
) {
  return request<API.InfinityPaginationNewsCategoryResponseDto>(
    "/api/v1/admin/news-categories",
    {
      method: "GET",
      params: {
        // deletedStatus has a default value: notDeleted
        deletedStatus: "notDeleted",
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 POST /api/v1/admin/news-categories */
export async function newsCategoriesAdminControllerCreateV1(
  body: API.CreateNewsCategoryDto,
  options?: { [key: string]: any }
) {
  return request<API.NewsCategory>("/api/v1/admin/news-categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/v1/admin/news-categories/${param0} */
export async function newsCategoriesAdminControllerFindByIdV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.NewsCategoriesAdminControllerFindByIdV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.NewsCategory>(`/api/v1/admin/news-categories/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /api/v1/admin/news-categories/${param0} */
export async function newsCategoriesAdminControllerRemoveV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.NewsCategoriesAdminControllerRemoveV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/v1/admin/news-categories/${param0}`, {
    method: "DELETE",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PATCH /api/v1/admin/news-categories/${param0} */
export async function newsCategoriesAdminControllerUpdateV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.NewsCategoriesAdminControllerUpdateV1Params,
  body: API.UpdateNewsCategoryDto,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.NewsCategory>(`/api/v1/admin/news-categories/${param0}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PATCH /api/v1/admin/news-categories/${param0}/restore */
export async function newsCategoriesAdminControllerRestoreV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.NewsCategoriesAdminControllerRestoreV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.NewsCategory>(
    `/api/v1/admin/news-categories/${param0}/restore`,
    {
      method: "PATCH",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}
