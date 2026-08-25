import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProForm,
  ProFormDateTimePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, Col, Image, Popconfirm, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import ImageUpload from '@/components/ImageUpload';
import { useTableUrlQuery } from '@/hooks/useTableUrlQuery';
import {
  newsArticlesAdminControllerCreateV1,
  newsArticlesAdminControllerFindAllV1,
  newsArticlesAdminControllerRemoveV1,
  newsArticlesAdminControllerRestoreV1,
  newsArticlesAdminControllerUpdateV1,
} from '@/services/cyber-wolf/adminNews';
import { newsCategoriesAdminControllerFindAllV1 } from '@/services/cyber-wolf/adminNewsCategories';

type NewsFormValues = {
  title: string;
  summary: string;
  url: string;
  category: string;
  coverImage?: string;
  sourceName: string;
  sourceId: string;
  publishedAt: dayjs.Dayjs | string;
};

type ModalState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'edit'; article: API.NewsArticle };

type DeletedStatus = NonNullable<
  API.NewsArticlesAdminControllerFindAllV1Params['deletedStatus']
>;

type NewsListFilters = {
  category?: string;
  deletedStatus?: DeletedStatus;
};

const DEFAULT_PAGE_SIZE = 10;

const NEWS_URL_FIELDS = {
  category: { type: 'string' as const },
  deletedStatus: { type: 'string' as const },
};

const DELETED_STATUS_ENUM = {
  notDeleted: { text: '未删除' },
  deleted: { text: '已删除' },
};

function parseDeletedStatus(value: unknown): DeletedStatus {
  if (value === 'deleted' || value === 'notDeleted' || value === 'all') {
    return value;
  }
  return 'all';
}

/** 后台分类选项（仅未删除） */
async function fetchAdminCategoryOptions() {
  try {
    const result = await newsCategoriesAdminControllerFindAllV1({
      page: 1,
      limit: 100,
    });
    return (result?.data ?? []).map((item) => ({
      label: item.name,
      value: item.name,
    }));
  } catch {
    return [];
  }
}

function isDeleted(article: API.NewsArticle) {
  return Boolean(article.deletedAt);
}

function toIso(value: NewsFormValues['publishedAt']) {
  if (!value) return undefined;
  return dayjs(value).toISOString();
}

type NewsFormModalProps = {
  mode: 'create' | 'edit';
  article?: API.NewsArticle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const NewsFormModal: React.FC<NewsFormModalProps> = ({
  mode,
  article,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { message } = App.useApp();

  return (
    <ModalForm<NewsFormValues>
      title={mode === 'create' ? '新建资讯' : '编辑资讯'}
      open={open}
      onOpenChange={onOpenChange}
      modalProps={{
        destroyOnHidden: true,
        width: 720,
      }}
      grid
      rowProps={{ gutter: 16 }}
      initialValues={
        mode === 'edit' && article
          ? {
              title: article.title,
              summary: article.summary,
              url: article.url,
              category: article.category,
              coverImage: article.coverImage,
              sourceName: article.sourceName,
              sourceId: article.sourceId,
              publishedAt: article.publishedAt
                ? dayjs(article.publishedAt)
                : undefined,
            }
          : {
              publishedAt: dayjs(),
            }
      }
      onFinish={async (values) => {
        const publishedAt = toIso(values.publishedAt);
        if (!publishedAt) {
          message.warning('请填写发布时间');
          return false;
        }

        const payload: API.CreateNewsArticleDto = {
          title: values.title.trim(),
          summary: values.summary.trim(),
          url: values.url.trim(),
          category: values.category.trim(),
          coverImage: values.coverImage?.trim() || undefined,
          sourceName: values.sourceName.trim(),
          sourceId: values.sourceId.trim(),
          publishedAt,
        };

        if (mode === 'create') {
          await newsArticlesAdminControllerCreateV1(payload);
          message.success('创建成功');
        } else if (article?.id) {
          await newsArticlesAdminControllerUpdateV1(
            { id: article.id },
            payload,
          );
          message.success('更新成功');
        }
        onSuccess();
        return true;
      }}
    >
      <ProFormText
        name="title"
        label="标题"
        colProps={{ span: 24 }}
        rules={[{ required: true, message: '请输入标题' }]}
        fieldProps={{ maxLength: 200 }}
      />
      <ProFormTextArea
        name="summary"
        label="摘要"
        colProps={{ span: 24 }}
        rules={[{ required: true, message: '请输入摘要' }]}
        fieldProps={{ rows: 3, maxLength: 1000, showCount: true }}
      />
      <ProFormText
        name="url"
        label="原文链接"
        colProps={{ span: 24 }}
        rules={[
          { required: true, message: '请输入原文链接' },
          { type: 'url', warningOnly: true, message: '建议填写合法 URL' },
        ]}
      />
      <ProFormSelect
        name="category"
        label="分类"
        colProps={{ span: 12 }}
        placeholder="请选择分类"
        rules={[{ required: true, message: '请选择分类' }]}
        showSearch
        request={fetchAdminCategoryOptions}
        fieldProps={{
          allowClear: true,
          optionFilterProp: 'label',
        }}
      />
      <ProFormDateTimePicker
        name="publishedAt"
        label="发布时间"
        colProps={{ span: 12 }}
        rules={[{ required: true, message: '请选择发布时间' }]}
        fieldProps={{ style: { width: '100%' } }}
      />
      <ProFormText
        name="sourceName"
        label="来源名称"
        colProps={{ span: 12 }}
        rules={[{ required: true, message: '请输入来源名称' }]}
      />
      <ProFormText
        name="sourceId"
        label="来源 ID"
        colProps={{ span: 12 }}
        rules={[{ required: true, message: '请输入来源 ID' }]}
      />
      <Col span={24}>
        <ProForm.Item
          name="coverImage"
          label="封面图"
          extra="上传走公共接口 /api/v1/files/upload，也可粘贴外部图片 URL"
        >
          <ImageUpload />
        </ProForm.Item>
      </Col>
    </ModalForm>
  );
};

const NewsList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const { syncUrl, onReset, formRef, pagination, manualRequest } =
    useTableUrlQuery<NewsListFilters>({
      defaultPageSize: DEFAULT_PAGE_SIZE,
      fields: NEWS_URL_FIELDS,
      actionRef,
    });
  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });

  const handleDelete = async (record: API.NewsArticle) => {
    await newsArticlesAdminControllerRemoveV1({ id: record.id });
    message.success('已删除');
    actionRef.current?.reload();
  };

  const handleRestore = async (record: API.NewsArticle) => {
    await newsArticlesAdminControllerRestoreV1({ id: record.id });
    message.success('已恢复');
    actionRef.current?.reload();
  };

  const columns: ProColumns<API.NewsArticle>[] = [
    {
      title: '封面',
      dataIndex: 'coverImage',
      search: false,
      width: 72,
      render: (_, record) =>
        record.coverImage ? (
          <Image
            src={record.coverImage}
            alt={record.title}
            width={48}
            height={48}
            style={{ objectFit: 'cover', borderRadius: 4 }}
          />
        ) : (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 4,
              background: '#f0f0f0',
            }}
          />
        ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      ellipsis: true,
      search: false,
    },
    {
      title: '分类',
      dataIndex: 'category',
      width: 140,
      valueType: 'select',
      request: fetchAdminCategoryOptions,
      fieldProps: {
        showSearch: true,
        allowClear: true,
        optionFilterProp: 'label',
      },
    },
    {
      title: '状态',
      dataIndex: 'deletedAt',
      search: false,
      width: 100,
      render: (_, record) =>
        isDeleted(record) ? (
          <Tag color="error">已删除</Tag>
        ) : (
          <Tag color="success">正常</Tag>
        ),
    },
    {
      title: '来源',
      dataIndex: 'sourceName',
      search: false,
      width: 120,
      ellipsis: true,
    },
    {
      title: '发布时间',
      dataIndex: 'publishedAt',
      valueType: 'dateTime',
      search: false,
      width: 170,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      search: false,
      width: 170,
    },
    {
      title: '删除状态',
      dataIndex: 'deletedStatus',
      hideInTable: true,
      valueType: 'select',
      valueEnum: DELETED_STATUS_ENUM,
      fieldProps: {
        allowClear: true,
        placeholder: '全部',
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 180,
      fixed: 'right',
      render: (_, record) => {
        if (isDeleted(record)) {
          return (
            <Popconfirm
              title="确认恢复该资讯？"
              onConfirm={() => handleRestore(record)}
            >
              <Button type="link" size="small">
                恢复
              </Button>
            </Popconfirm>
          );
        }
        return (
          <Space size={0}>
            <Button
              type="link"
              size="small"
              onClick={() => setModalState({ type: 'edit', article: record })}
            >
              编辑
            </Button>
            <Popconfirm
              title="确认删除该资讯？"
              description="删除为软删除，可稍后恢复"
              onConfirm={() => handleDelete(record)}
            >
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.NewsArticle>
        headerTitle="资讯列表"
        actionRef={actionRef}
        formRef={formRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        scroll={{ x: 1100 }}
        manualRequest={manualRequest}
        onReset={onReset}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalState({ type: 'create' })}
          >
            新建资讯
          </Button>,
        ]}
        request={async (params) => {
          const page = params.current ?? 1;
          const limit = params.pageSize ?? DEFAULT_PAGE_SIZE;
          const category =
            typeof params.category === 'string' && params.category
              ? params.category
              : undefined;
          const deletedStatus = parseDeletedStatus(params.deletedStatus);

          syncUrl({
            current: page,
            pageSize: limit,
            category,
            deletedStatus: deletedStatus === 'all' ? undefined : deletedStatus,
          });

          const result = await newsArticlesAdminControllerFindAllV1({
            page,
            limit,
            category,
            deletedStatus,
          });

          const list = result?.data ?? [];
          return {
            data: list,
            success: true,
            total: result?.total ?? list.length,
          };
        }}
        columns={columns}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
        }}
      />

      <NewsFormModal
        mode={modalState.type === 'edit' ? 'edit' : 'create'}
        article={modalState.type === 'edit' ? modalState.article : null}
        open={modalState.type !== 'none'}
        onOpenChange={(open) => {
          if (!open) setModalState({ type: 'none' });
        }}
        onSuccess={() => {
          setModalState({ type: 'none' });
          actionRef.current?.reload();
        }}
      />
    </PageContainer>
  );
};

export default NewsList;
