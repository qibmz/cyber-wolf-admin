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
import {
  usersControllerFindAllV1,
  usersControllerUpdateNameV1,
} from '@/services/cyber-wolf/users';

const ROLE_VALUE_ENUM = {
  1: { text: 'Admin', status: 'Error' },
  2: { text: 'User', status: 'Default' },
} as const;

const STATUS_VALUE_ENUM = {
  1: { text: 'Active', status: 'Success' },
  2: { text: 'Inactive', status: 'Default' },
} as const;

/** 行操作 key —— 新增操作时在此扩展 */
type UserRowActionKey = 'editName';

type UserModalState = { type: 'none' } | { type: 'editName'; user: API.User };

function buildUserRowActions(_record: API.User): MenuProps['items'] {
  // 按行控制可见/禁用时，在这里根据 record 过滤
  return [
    {
      key: 'editName' satisfies UserRowActionKey,
      label: '修改姓名',
    },
    // 后续操作示例：
    // { key: 'editRole', label: '修改角色' },
    // { type: 'divider' },
    // { key: 'disable', label: '停用', danger: true },
  ];
}

type EditNameModalProps = {
  user: API.User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const EditNameModal: React.FC<EditNameModalProps> = ({
  user,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { message } = App.useApp();

  return (
    <ModalForm<API.UpdateUserNameDto>
      title="修改姓名"
      open={open}
      onOpenChange={onOpenChange}
      modalProps={{
        destroyOnHidden: true,
      }}
      initialValues={{
        firstName: user?.firstName,
        lastName: user?.lastName,
      }}
      onFinish={async (values) => {
        if (!user?.id) return false;

        const firstName = values.firstName?.trim();
        const lastName = values.lastName?.trim();

        if (!firstName && !lastName) {
          message.warning('请至少填写名或姓');
          return false;
        }

        await usersControllerUpdateNameV1(
          { id: String(user.id) },
          {
            ...(firstName ? { firstName } : {}),
            ...(lastName ? { lastName } : {}),
          },
        );
        message.success('姓名已更新');
        onSuccess();
        return true;
      }}
    >
      <ProFormText
        name="firstName"
        label="名 (firstName)"
        placeholder="例如 John"
        fieldProps={{ maxLength: 50 }}
      />
      <ProFormText
        name="lastName"
        label="姓 (lastName)"
        placeholder="例如 Doe"
        fieldProps={{ maxLength: 50 }}
      />
    </ModalForm>
  );
};

const UserList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [modalState, setModalState] = useState<UserModalState>({
    type: 'none',
  });

  const handleRowAction = (key: UserRowActionKey, record: API.User) => {
    switch (key) {
      case 'editName':
        setModalState({ type: 'editName', user: record });
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
      title: '姓名',
      dataIndex: 'name',
      search: false,
      render: (_, record) =>
        [record.firstName, record.lastName].filter(Boolean).join(' ') || '—',
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
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        scroll={{ x: 960 }}
        request={async (params) => {
          const page = params.current ?? 1;
          const limit = params.pageSize ?? 10;
          const roleId = params.roleId;
          const filters =
            roleId != null && roleId !== ''
              ? JSON.stringify({ roles: [{ id: Number(roleId) }] })
              : undefined;

          const result = await usersControllerFindAllV1({
            page,
            limit,
            filters,
          });

          const list = result?.data ?? [];
          const hasNextPage = Boolean(result?.hasNextPage);

          return {
            data: list,
            success: true,
            // 后端是 infinity pagination（无 total），用 hasNextPage 估算
            total: hasNextPage
              ? page * limit + 1
              : (page - 1) * limit + list.length,
          };
        }}
        columns={columns}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
        }}
      />

      <EditNameModal
        user={modalState.type === 'editName' ? modalState.user : null}
        open={modalState.type === 'editName'}
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
