import { DownOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import type { MenuProps } from 'antd';
import { App, Button, Dropdown, Space, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import { useTableUrlQuery } from '@/hooks/useTableUrlQuery';
import {
  usersControllerFindAllV1,
  usersControllerUpdateV1,
} from '@/services/cyber-wolf/users';

const ROLE_VALUE_ENUM = {
  1: { text: 'Admin', status: 'Error' },
  2: { text: 'User', status: 'Default' },
} as const;

const STATUS_VALUE_ENUM = {
  1: { text: 'Active', status: 'Success' },
  2: { text: 'Inactive', status: 'Default' },
} as const;

const DEFAULT_PAGE_SIZE = 10;

const USER_URL_FIELDS = {
  roleId: { type: 'number' as const },
};

type UserListFilters = {
  roleId?: number;
};

/** 行操作 key —— 新增操作时在此扩展 */
type UserRowActionKey = 'editNickname';

type UserModalState =
  | { type: 'none' }
  | { type: 'editNickname'; user: API.User };

function buildUserRowActions(_record: API.User): MenuProps['items'] {
  return [
    {
      key: 'editNickname' satisfies UserRowActionKey,
      label: '修改昵称',
    },
  ];
}

type EditNicknameModalProps = {
  user: API.User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const EditNicknameModal: React.FC<EditNicknameModalProps> = ({
  user,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { message } = App.useApp();

  return (
    <ModalForm<{ nickname?: string }>
      title="修改昵称"
      open={open}
      onOpenChange={onOpenChange}
      modalProps={{
        destroyOnHidden: true,
      }}
      initialValues={{
        nickname: user?.nickname,
      }}
      onFinish={async (values) => {
        if (!user?.id) return false;

        const nickname = values.nickname?.trim();
        if (!nickname) {
          message.warning('请填写昵称');
          return false;
        }

        await usersControllerUpdateV1({ id: String(user.id) }, { nickname });
        message.success('昵称已更新');
        onSuccess();
        return true;
      }}
    >
      <ProFormText
        name="nickname"
        label="昵称"
        rules={[{ required: true, message: '请填写昵称' }]}
        fieldProps={{ maxLength: 50 }}
      />
    </ModalForm>
  );
};

const UserList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { syncUrl, onReset, formRef, pagination, manualRequest } =
    useTableUrlQuery<UserListFilters>({
      defaultPageSize: DEFAULT_PAGE_SIZE,
      fields: USER_URL_FIELDS,
      actionRef,
    });
  const [modalState, setModalState] = useState<UserModalState>({
    type: 'none',
  });

  const handleRowAction = (key: UserRowActionKey, record: API.User) => {
    switch (key) {
      case 'editNickname':
        setModalState({ type: 'editNickname', user: record });
        break;
      default: {
        const _exhaustive: never = key;
        return _exhaustive;
      }
    }
  };

  const columns: ProColumns<API.User>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 72,
      search: false,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      copyable: true,
      ellipsis: true,
      search: false,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      search: false,
      ellipsis: true,
      render: (_, record) => record.nickname || '—',
    },
    {
      title: '角色',
      dataIndex: 'roleId',
      valueType: 'select',
      valueEnum: ROLE_VALUE_ENUM,
      render: (_, record) => {
        const roleId = record.role?.id;
        if (roleId === 1) return <Tag color="red">Admin</Tag>;
        if (roleId === 2) return <Tag>User</Tag>;
        return record.role?.name || '—';
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      search: false,
      valueEnum: STATUS_VALUE_ENUM,
      render: (_, record) => {
        const statusId = record.status?.id;
        if (statusId === 1) return <Tag color="success">Active</Tag>;
        if (statusId === 2) return <Tag>Inactive</Tag>;
        return record.status?.name || '—';
      },
    },
    {
      title: '登录方式',
      dataIndex: 'provider',
      search: false,
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false,
      width: 180,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: buildUserRowActions(record),
            onClick: ({ key }) =>
              handleRowAction(key as UserRowActionKey, record),
          }}
        >
          <Button type="link" size="small">
            <Space size={4}>
              操作
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.User>
        headerTitle="用户列表"
        actionRef={actionRef}
        formRef={formRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        scroll={{ x: 960 }}
        manualRequest={manualRequest}
        onReset={onReset}
        request={async (params) => {
          const page = params.current ?? 1;
          const limit = params.pageSize ?? DEFAULT_PAGE_SIZE;
          const roleId =
            params.roleId != null && params.roleId !== ''
              ? Number(params.roleId)
              : undefined;
          const filters =
            roleId != null && Number.isFinite(roleId)
              ? JSON.stringify({ roles: [{ id: roleId }] })
              : undefined;

          syncUrl({
            current: page,
            pageSize: limit,
            roleId,
          });

          const result = await usersControllerFindAllV1({
            page,
            limit,
            filters,
          });

          const list = Array.isArray(result?.data) ? result.data : [];
          const total =
            typeof result?.total === 'number' ? result.total : list.length;

          return {
            data: list,
            success: true,
            total,
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

      <EditNicknameModal
        user={modalState.type === 'editNickname' ? modalState.user : null}
        open={modalState.type === 'editNickname'}
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

export default UserList;
