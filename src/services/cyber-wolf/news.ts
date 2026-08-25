// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** 此处后端没有提供注释 GET /api/v1/news */
export async function newsArticlesControllerFindAllV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.NewsArticlesControllerFindAllV1Params,
  options?: { [key: string]: any }
) {
  return request<API.InfinityPaginationNewsArticleResponseDto>("/api/v1/news", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/v1/news/${param0} */
export async function newsArticlesControllerFindByIdV1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.NewsArticlesControllerFindByIdV1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.NewsArticle>(`/api/v1/news/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/v1/news/categories */
export async function newsArticlesControllerFindCategoriesV1(options?: {
  [key: string]: any;
}) {
  return request<API.NewsCategory[]>("/api/v1/news/categories", {
    method: "GET",
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1/news/fetch */
export async function newsArticlesControllerFetchV1(options?: {
  [key: string]: any;
}) {
  return request<any>("/api/v1/news/fetch", {
    method: "POST",
    ...(options || {}),
  });
}
