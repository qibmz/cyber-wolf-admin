// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** 此处后端没有提供注释 GET /api/v1/admin/news */
export async function newsArticlesAdminControllerFindAllV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.NewsArticlesAdminControllerFindAllV1Params,
  options?: { [key: string]: any }
) {
  return request<API.InfinityPaginationNewsArticleResponseDto>(
    "/api/v1/admin/news",
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

/** 此处后端没有提供注释 POST /api/v1/admin/news */
export async function newsArticlesAdminControllerCreateV1(
  body: API.CreateNewsArticleDto,
  options?: { [key: string]: any }
) {
  return request<API.NewsArticle>("/api/v1/admin/news", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/v1/admin/news/${param0} */
export async function newsArticlesAdminControllerFindByIdV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.NewsArticlesAdminControllerFindByIdV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.NewsArticle>(`/api/v1/admin/news/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /api/v1/admin/news/${param0} */
export async function newsArticlesAdminControllerRemoveV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.NewsArticlesAdminControllerRemoveV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/v1/admin/news/${param0}`, {
    method: "DELETE",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PATCH /api/v1/admin/news/${param0} */
export async function newsArticlesAdminControllerUpdateV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.NewsArticlesAdminControllerUpdateV1Params,
  body: API.UpdateNewsArticleDto,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.NewsArticle>(`/api/v1/admin/news/${param0}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PATCH /api/v1/admin/news/${param0}/restore */
export async function newsArticlesAdminControllerRestoreV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.NewsArticlesAdminControllerRestoreV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.NewsArticle>(`/api/v1/admin/news/${param0}/restore`, {
    method: "PATCH",
    params: { ...queryParams },
    ...(options || {}),
  });
}
