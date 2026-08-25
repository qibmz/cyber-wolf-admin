import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProFormDigit,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, Popconfirm, Space, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import { useTableUrlQuery } from '@/hooks/useTableUrlQuery';
import {
  newsCategoriesAdminControllerCreateV1,
  newsCategoriesAdminControllerFindAllV1,
  newsCategoriesAdminControllerRemoveV1,
  newsCategoriesAdminControllerRestoreV1,
  newsCategoriesAdminControllerUpdateV1,
} from '@/services/cyber-wolf/adminNewsCategories';

type CategoryFormValues = {
  name: string;
  sortOrder?: number;
};

type ModalState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'edit'; category: API.NewsCategory };

type DeletedStatus = NonNullable<
  API.NewsCategoriesAdminControllerFindAllV1Params['deletedStatus']
>;

type CategoryListFilters = {
  deletedStatus?: DeletedStatus;
};

const DEFAULT_PAGE_SIZE = 10;

const CATEGORY_URL_FIELDS = {
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

function isDeleted(category: API.NewsCategory) {
  return Boolean(category.deletedAt);
}

type CategoryFormModalProps = {
  mode: 'create' | 'edit';
  category?: API.NewsCategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  mode,
  category,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { message } = App.useApp();

  return (
    <ModalForm<CategoryFormValues>
      title={mode === 'create' ? '新建分类' : '编辑分类'}
      open={open}
      onOpenChange={onOpenChange}
      modalProps={{
        destroyOnHidden: true,
        width: 480,
      }}
      initialValues={
        mode === 'edit' && category
          ? {
              name: category.name,
              sortOrder: category.sortOrder,
            }
          : {
              sortOrder: 0,
            }
      }
      onFinish={async (values) => {
        const name = values.name.trim();
        if (!name) {
          message.warning('请填写分类名称');
          return false;
        }

        const payload: API.CreateNewsCategoryDto = {
          name,
          sortOrder:
            typeof values.sortOrder === 'number' ? values.sortOrder : undefined,
        };

        if (mode === 'create') {
          await newsCategoriesAdminControllerCreateV1(payload);
          message.success('创建成功');
        } else if (category?.id) {
          await newsCategoriesAdminControllerUpdateV1(
            { id: category.id },
            payload,
          );
          message.success('更新成功');
        }
        onSuccess();
        return true;
      }}
    >
      <ProFormText
        name="name"
        label="名称"
        rules={[{ required: true, message: '请输入分类名称' }]}
        fieldProps={{ maxLength: 100 }}
      />
      <ProFormDigit
        name="sortOrder"
        label="排序"
        tooltip="数值越小越靠前"
        min={0}
        fieldProps={{ precision: 0 }}
      />
    </ModalForm>
  );
};

const NewsCategoryList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const { syncUrl, onReset, formRef, pagination, manualRequest } =
    useTableUrlQuery<CategoryListFilters>({
      defaultPageSize: DEFAULT_PAGE_SIZE,
      fields: CATEGORY_URL_FIELDS,
      actionRef,
    });
  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });

  const handleDelete = async (record: API.NewsCategory) => {
    await newsCategoriesAdminControllerRemoveV1({ id: record.id });
    message.success('已删除');
    actionRef.current?.reload();
  };

  const handleRestore = async (record: API.NewsCategory) => {
    await newsCategoriesAdminControllerRestoreV1({ id: record.id });
    message.success('已恢复');
    actionRef.current?.reload();
  };

  const columns: ProColumns<API.NewsCategory>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      ellipsis: true,
      search: false,
      render: (_, record) => (
        <Space size={8}>
          <span>{record.name}</span>
          {isDeleted(record) ? <Tag color="error">已删除</Tag> : null}
        </Space>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      width: 100,
      search: false,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false,
      width: 180,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      search: false,
      width: 180,
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
              title="确认恢复该分类？"
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
              onClick={() => setModalState({ type: 'edit', category: record })}
            >
              编辑
            </Button>
            <Popconfirm
              title="确认删除该分类？"
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
      <ProTable<API.NewsCategory>
        headerTitle="资讯分类"
        actionRef={actionRef}
        formRef={formRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        scroll={{ x: 800 }}
        manualRequest={manualRequest}
        onReset={onReset}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalState({ type: 'create' })}
          >
            新建分类
          </Button>,
        ]}
        request={async (params) => {
          const page = params.current ?? 1;
          const limit = params.pageSize ?? DEFAULT_PAGE_SIZE;
          const deletedStatus = parseDeletedStatus(params.deletedStatus);

          syncUrl({
            current: page,
            pageSize: limit,
            deletedStatus: deletedStatus === 'all' ? undefined : deletedStatus,
          });

          const result = await newsCategoriesAdminControllerFindAllV1({
            page,
            limit,
            deletedStatus,
          });

          const list = result?.data ?? [];
          return {
            data: list,
            success: true,
            total:
              typeof result?.total === 'number' ? result.total : list.length,
          };
        }}
        columns={columns}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (t) => `共 ${t} 条`,
        }}
      />

      <CategoryFormModal
        mode={modalState.type === 'edit' ? 'edit' : 'create'}
        category={modalState.type === 'edit' ? modalState.category : null}
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

export default NewsCategoryList;
