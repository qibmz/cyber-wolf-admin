import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Tag } from 'antd';
import React, { useRef } from 'react';
import { usersControllerFindAllV1 } from '@/services/cyber-wolf/users';

const ROLE_VALUE_ENUM = {
  1: { text: 'Admin', status: 'Error' },
  2: { text: 'User', status: 'Default' },
} as const;

const STATUS_VALUE_ENUM = {
  1: { text: 'Active', status: 'Success' },
  2: { text: 'Inactive', status: 'Default' },
} as const;

const UserList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);

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
    </PageContainer>
  );
};

export default UserList;
