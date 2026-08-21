// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** 此处后端没有提供注释 GET / */
export async function homeControllerAppInfo(options?: { [key: string]: any }) {
  return request<any>("/", {
    method: "GET",
    ...(options || {}),
  });
}
