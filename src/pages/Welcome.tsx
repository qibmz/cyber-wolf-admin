import { LoginOutlined, ReadOutlined, TeamOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useAccess, useIntl, useModel } from '@umijs/max';
import { Button, Card, Col, Result, Row, Typography } from 'antd';
import React from 'react';

const { Paragraph, Text, Title } = Typography;

const Welcome: React.FC = () => {
  const intl = useIntl();
  const access = useAccess();
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const userName = currentUser?.name;

  return (
    <PageContainer
      title={intl.formatMessage({
        id: 'pages.welcome.celebrationTitle',
        defaultMessage: '欢迎使用 Cyber Wolf Admin',
      })}
    >
      <Card>
        {!currentUser ? (
          <Result
            status="info"
            icon={<LoginOutlined />}
            title={intl.formatMessage({
              id: 'pages.welcome.guest.title',
              defaultMessage: '请先登录',
            })}
            subTitle={intl.formatMessage({
              id: 'pages.welcome.guest.desc',
              defaultMessage: '登录后可使用用户管理等后台功能。',
            })}
            extra={
              <Button
                type="primary"
                icon={<LoginOutlined />}
                onClick={() => history.push('/user/login')}
              >
                {intl.formatMessage({
                  id: 'pages.welcome.guest.action',
                  defaultMessage: '去登录',
                })}
              </Button>
            }
          />
        ) : (
          <>
            <Title level={4} style={{ marginTop: 0 }}>
              {intl.formatMessage(
                {
                  id: 'pages.welcome.hello',
                  defaultMessage: '你好，{name}',
                },
                { name: userName },
              )}
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: 24 }}>
              {intl.formatMessage({
                id: 'pages.welcome.alertMessage',
                defaultMessage:
                  '这里是 Cyber Wolf 后台管理系统。你可以从左侧菜单进入业务模块，或使用下方快捷入口。',
              })}
            </Paragraph>

            {access.canAdmin ? (
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Card size="small" hoverable>
                    <div className="mb-3 flex items-center gap-2">
                      <TeamOutlined
                        style={{ fontSize: 20, color: '#1677ff' }}
                      />
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
                      onClick={() => history.push('/users')}
                    >
                      {intl.formatMessage({
                        id: 'pages.welcome.card.users.action',
                        defaultMessage: '进入用户管理',
                      })}
                    </Button>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card size="small" hoverable>
                    <div className="mb-3 flex items-center gap-2">
                      <ReadOutlined
                        style={{ fontSize: 20, color: '#1677ff' }}
                      />
                      <Text strong>
                        {intl.formatMessage({
                          id: 'pages.welcome.card.news.title',
                          defaultMessage: '资讯管理',
                        })}
                      </Text>
                    </div>
                    <Paragraph type="secondary" style={{ minHeight: 44 }}>
                      {intl.formatMessage({
                        id: 'pages.welcome.card.news.desc',
                        defaultMessage: '创建、编辑与管理资讯内容与封面。',
                      })}
                    </Paragraph>
                    <Button
                      type="primary"
                      onClick={() => history.push('/news/articles')}
                    >
                      {intl.formatMessage({
                        id: 'pages.welcome.card.news.action',
                        defaultMessage: '进入资讯管理',
                      })}
                    </Button>
                  </Card>
                </Col>
              </Row>
            ) : null}
          </>
        )}
      </Card>
    </PageContainer>
  );
};

export default Welcome;
