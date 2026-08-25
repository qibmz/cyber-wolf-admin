import type { ActionType, ProFormInstance } from '@ant-design/pro-components';
import { history, useLocation } from '@umijs/max';
import { type RefObject, useEffect, useMemo, useRef } from 'react';

export type TableUrlFieldType = 'string' | 'number' | 'boolean';

export type TableUrlFieldConfig = {
  type?: TableUrlFieldType;
};

export type TableUrlFieldsConfig<TFilters extends Record<string, unknown>> = {
  [K in keyof TFilters]?: TableUrlFieldConfig;
};

export type TableUrlQueryOptions<TFilters extends Record<string, unknown>> = {
  defaultPageSize?: number;
  /** 分页以外的筛选字段（会读写到 URL query） */
  fields?: TableUrlFieldsConfig<TFilters>;
  /**
   * ProTable 的 actionRef。浏览器前进/后退时用于同步页码并重新请求。
   * 与页面里传给 ProTable 的 actionRef 使用同一个 ref。
   */
  actionRef?: RefObject<ActionType | null | undefined>;
};

export type TableUrlQueryBase = {
  current: number;
  pageSize: number;
};

export type TableUrlQuery<TFilters extends Record<string, unknown>> =
  TableUrlQueryBase & Partial<TFilters>;

function stripSearchPrefix(search: string) {
  return search.startsWith('?') ? search.slice(1) : search;
}

function parseFieldValue(
  raw: string | null,
  type: TableUrlFieldType,
): string | number | boolean | undefined {
  if (raw == null || raw === '') return undefined;
  if (type === 'boolean') {
    return raw === 'true' ? true : undefined;
  }
  if (type === 'number') {
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  }
  return raw;
}

function shouldWriteField(
  value: unknown,
  type: TableUrlFieldType,
): value is string | number | boolean {
  if (value == null || value === '') return false;
  if (type === 'boolean') return value === true || value === 'true';
  if (type === 'number') {
    return typeof value === 'number'
      ? Number.isFinite(value)
      : Number.isFinite(Number(value));
  }
  return typeof value === 'string' ? value.length > 0 : true;
}

function serializeField(value: unknown, type: TableUrlFieldType): string {
  if (type === 'boolean') return 'true';
  return String(value);
}

function pickFilters<TFilters extends Record<string, unknown>>(
  query: TableUrlQuery<TFilters>,
): Partial<TFilters> {
  const { current: _c, pageSize: _p, ...filters } = query;
  return filters as unknown as Partial<TFilters>;
}

function emptyFilters<TFilters extends Record<string, unknown>>(
  fields: TableUrlFieldsConfig<TFilters>,
): Partial<TFilters> {
  const next = {} as Partial<TFilters>;
  for (const key of Object.keys(fields) as (keyof TFilters & string)[]) {
    (next as Record<string, unknown>)[key] = undefined;
  }
  return next;
}

/** 从 location.search 解析分页与筛选 */
export function parseTableUrlQuery<
  TFilters extends Record<string, unknown> = Record<string, never>,
>(
  search: string,
  options: TableUrlQueryOptions<TFilters> = {},
): TableUrlQuery<TFilters> {
  const defaultPageSize = options.defaultPageSize ?? 10;
  const fields = options.fields ?? ({} as TableUrlFieldsConfig<TFilters>);
  const q = new URLSearchParams(stripSearchPrefix(search));
  const currentRaw = Number(q.get('current'));
  const pageSizeRaw = Number(q.get('pageSize'));

  const filters = {} as Partial<TFilters>;
  for (const key of Object.keys(fields) as (keyof TFilters & string)[]) {
    const type = fields[key]?.type ?? 'string';
    const parsed = parseFieldValue(q.get(key), type);
    if (parsed !== undefined) {
      (filters as Record<string, unknown>)[key] = parsed;
    }
  }

  return {
    current: Number.isFinite(currentRaw) && currentRaw > 0 ? currentRaw : 1,
    pageSize:
      Number.isFinite(pageSizeRaw) && pageSizeRaw > 0
        ? pageSizeRaw
        : defaultPageSize,
    ...filters,
  };
}

/** 将分页 / 筛选序列化为 search 字符串（含前导 ?，全默认时返回空串） */
export function buildTableUrlSearch<
  TFilters extends Record<string, unknown> = Record<string, never>,
>(
  params: Partial<TableUrlQueryBase> &
    Partial<TFilters> &
    Record<string, unknown>,
  options: TableUrlQueryOptions<TFilters> = {},
): string {
  const defaultPageSize = options.defaultPageSize ?? 10;
  const fields = options.fields ?? ({} as TableUrlFieldsConfig<TFilters>);
  const next = new URLSearchParams();
  const current = Number(params.current) || 1;
  const pageSize = Number(params.pageSize) || defaultPageSize;

  if (current !== 1) next.set('current', String(current));
  if (pageSize !== defaultPageSize) next.set('pageSize', String(pageSize));

  for (const key of Object.keys(fields) as (keyof TFilters & string)[]) {
    const type = fields[key]?.type ?? 'string';
    const value = params[key];
    if (shouldWriteField(value, type)) {
      next.set(key, serializeField(value, type));
    }
  }

  const search = next.toString();
  return search ? `?${search}` : '';
}

/** history.replace 写入当前 pathname 的 query（无变化则跳过）；有写入时返回 true */
export function syncTableUrlQuery<
  TFilters extends Record<string, unknown> = Record<string, never>,
>(
  pathname: string,
  params: Partial<TableUrlQueryBase> &
    Partial<TFilters> &
    Record<string, unknown>,
  options: TableUrlQueryOptions<TFilters> = {},
): boolean {
  const nextSearch = buildTableUrlSearch(params, options);
  const currentSearch = window.location.search || '';
  if (pathname !== window.location.pathname || nextSearch !== currentSearch) {
    history.replace({
      pathname,
      search: nextSearch,
    });
    return true;
  }
  return false;
}

/**
 * ProTable 分页 / 筛选与 URL query 双向绑定。
 *
 * 用法要点：
 * 1. 把返回的 `manualRequest` 传给 ProTable（避免 onInit 空表单先请求再冲掉 URL）
 * 2. 把页面的 `actionRef` 传入 options，以便前进/后退时同步页码
 * 3. 不要把 `query` 绑到 column.initialValue + syncToInitialValues
 */
export function useTableUrlQuery<
  TFilters extends Record<string, unknown> = Record<string, never>,
>(options: TableUrlQueryOptions<TFilters> = {}) {
  const defaultPageSize = options.defaultPageSize ?? 10;
  const fields = options.fields ?? ({} as TableUrlFieldsConfig<TFilters>);
  const optionsRef = useRef({
    defaultPageSize,
    fields,
    actionRef: options.actionRef,
  });
  optionsRef.current = {
    defaultPageSize,
    fields,
    actionRef: options.actionRef,
  };

  const location = useLocation();
  const fieldKeySig = Object.keys(fields).sort().join(',');
  const formRef = useRef<ProFormInstance>(undefined);
  /** 本次 URL 变化是否由 syncUrl / onReset 主动写入 */
  const writingRef = useRef(false);
  const skipNextSearchEffectRef = useRef(true);

  const query = useMemo(
    () =>
      parseTableUrlQuery<TFilters>(location.search, {
        defaultPageSize,
        fields: optionsRef.current.fields,
      }),
    [defaultPageSize, fieldKeySig, location.search],
  );

  const hydrateForm = (nextQuery: TableUrlQuery<TFilters>) => {
    const fieldsConfig = optionsRef.current.fields;
    formRef.current?.setFieldsValue({
      ...emptyFilters(fieldsConfig),
      ...pickFilters(nextQuery),
    });
  };

  const applyQueryToTable = (nextQuery: TableUrlQuery<TFilters>) => {
    hydrateForm(nextQuery);
    // submit 会把筛选写入 ProTable 内部 formSearch；非首次会把页码打回 1，随后再纠正
    formRef.current?.submit?.();
    queueMicrotask(() => {
      optionsRef.current.actionRef?.current?.setPageInfo?.({
        current: nextQuery.current,
        pageSize: nextQuery.pageSize,
      });
    });
  };

  const syncUrl = (
    params: Partial<TableUrlQueryBase> &
      Partial<TFilters> &
      Record<string, unknown>,
  ) => {
    const wrote = syncTableUrlQuery(location.pathname, params, {
      defaultPageSize: optionsRef.current.defaultPageSize,
      fields: optionsRef.current.fields,
    });
    if (wrote) {
      writingRef.current = true;
    }
  };

  // 首屏：等 ProTable 搜索表单挂载后，按 URL 回填并提交（配合 manualRequest）
  useEffect(() => {
    queueMicrotask(() => {
      applyQueryToTable(
        parseTableUrlQuery<TFilters>(window.location.search, {
          defaultPageSize: optionsRef.current.defaultPageSize,
          fields: optionsRef.current.fields,
        }),
      );
    });
  }, []);

  // 浏览器前进 / 后退 / 外部改 search：回填表单并重新请求
  useEffect(() => {
    if (skipNextSearchEffectRef.current) {
      skipNextSearchEffectRef.current = false;
      return;
    }
    if (writingRef.current) {
      writingRef.current = false;
      return;
    }
    applyQueryToTable(query);
  }, [location.search, query]);

  const onReset = () => {
    const wrote = syncTableUrlQuery(
      location.pathname,
      {
        current: 1,
        pageSize: defaultPageSize,
      } as Partial<TableUrlQueryBase> &
        Partial<TFilters> &
        Record<string, unknown>,
      {
        defaultPageSize,
        fields,
      },
    );
    if (wrote) {
      writingRef.current = true;
    }
    queueMicrotask(() => {
      formRef.current?.setFieldsValue(emptyFilters(fields));
      formRef.current?.submit?.();
      optionsRef.current.actionRef?.current?.setPageInfo?.({
        current: 1,
        pageSize: defaultPageSize,
      });
    });
  };

  return {
    query,
    syncUrl,
    onReset,
    formRef,
    defaultPageSize,
    /** 必须传给 ProTable，避免 onInit 空筛选请求冲掉 URL */
    manualRequest: true as const,
    pagination: {
      defaultCurrent: query.current,
      defaultPageSize: query.pageSize,
    },
  };
}
