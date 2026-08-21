import { TeamOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useIntl, useModel } from '@umijs/max';
import { Button, Card, Col, Row, Typography } from 'antd';
import React from 'react';

const { Paragraph, Text, Title } = Typography;

const Welcome: React.FC = () => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const userName = initialState?.currentUser?.name;

  return (
    <PageContainer
      title={intl.formatMessage({
        id: 'pages.welcome.celebrationTitle',
        defaultMessage: '欢迎使用 Cyber Wolf Admin',
      })}
    >
      <Card>
        <Title level={4} style={{ marginTop: 0 }}>
          {userName
            ? intl.formatMessage(
                {
                  id: 'pages.welcome.hello',
                  defaultMessage: '你好，{name}',
                },
                { name: userName },
              )
            : intl.formatMessage({
                id: 'pages.welcome.link',
                defaultMessage: '欢迎使用',
              })}
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 24 }}>
          {intl.formatMessage({
            id: 'pages.welcome.alertMessage',
            defaultMessage:
              '这里是 Cyber Wolf 后台管理系统。你可以从左侧菜单进入业务模块，或使用下方快捷入口。',
          })}
        </Paragraph>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" hoverable>
              <div className="mb-3 flex items-center gap-2">
                <TeamOutlined style={{ fontSize: 20, color: '#1677ff' }} />
                <Text strong>
                  {intl.formatMessage({
                    id: 'pages.welcome.card.users.title',
                    defaultMessage: '用户管理',
                  })}
                </Text>
              </div>
              <Paragraph type="secondary" style={{ minHeight: 44 }}>
                {intl.formatMessage({
                  id: 'pages.welcome.card.users.desc',
                  defaultMessage: '查看与筛选系统用户、角色与状态。',
                })}
              </Paragraph>
              <Button
                type="primary"
                onClick={() => history.push('/admin/users')}
              >
                {intl.formatMessage({
                  id: 'pages.welcome.card.users.action',
                  defaultMessage: '进入用户管理',
                })}
              </Button>
            </Card>
          </Col>
        </Row>
      </Card>
    </PageContainer>
  );
};

export default Welcome;
