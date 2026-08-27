import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import {
  FormattedMessage,
  Helmet,
  SelectLang,
  useIntl,
  useModel,
} from '@umijs/max';
import { Alert, App } from 'antd';
import { createStyles } from 'antd-style';
import React, { startTransition, useState } from 'react';
import { Footer } from '@/components';
import { authControllerLoginV1 } from '@/services/cyber-wolf/auth';
import {
  getSafeRedirectUrl,
  mapUserToCurrentUser,
  saveAuthTokens,
} from '@/utils/auth';
import Settings from '../../../../config/defaultSettings';

const useStyles = createStyles(({ token }) => {
  return {
    lang: {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
  };
});

const Lang = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.lang} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      title={content}
      type="error"
      showIcon
    />
  );
};

type LoginFormValues = {
  email: string;
  password: string;
};

const Login: React.FC = () => {
  const [loginError, setLoginError] = useState(false);
  const { setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const { message } = App.useApp();
  const intl = useIntl();

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      setLoginError(false);
      const data = await authControllerLoginV1({
        email: values.email,
        password: values.password,
      });
      saveAuthTokens({
        token: data.token,
        refreshToken: data.refreshToken,
        tokenExpires: data.tokenExpires,
      });
      const currentUser = mapUserToCurrentUser(data.user);
      startTransition(() => {
        setInitialState((s) => ({
          ...s,
          currentUser,
        }));
      });
      message.success(
        intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        }),
      );
      const urlParams = new URL(window.location.href).searchParams;
      window.location.href = getSafeRedirectUrl(urlParams.get('redirect'));
    } catch {
      setLoginError(true);
      message.error(
        intl.formatMessage({
          id: 'pages.login.failure',
          defaultMessage: '登录失败，请重试！',
        }),
      );
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '登录页',
          })}
          {Settings.title && ` - ${Settings.title}`}
        </title>
      </Helmet>
      <Lang />
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/images/brand/logo-head.webp" />}
          title="Cyber Wolf"
          subTitle={intl.formatMessage({
            id: 'pages.layouts.userLayout.title',
          })}
          onFinish={async (values) => {
            await handleSubmit(values as LoginFormValues);
          }}
        >
          {loginError && (
            <LoginMessage
              content={intl.formatMessage({
                id: 'pages.login.accountLogin.errorMessage',
                defaultMessage: '账户或密码错误（admin@example.com / secret）',
              })}
            />
          )}
          <ProFormText
            name="email"
            fieldProps={{
              size: 'large',
              prefix: <MailOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.login.email.placeholder',
              defaultMessage: '邮箱: admin@example.com',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.login.email.required"
                    defaultMessage="请输入邮箱!"
                  />
                ),
              },
              {
                type: 'email',
                message: (
                  <FormattedMessage
                    id="pages.login.email.invalid"
                    defaultMessage="邮箱格式不正确!"
                  />
                ),
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.login.password.placeholder',
              defaultMessage: '密码: secret',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.login.password.required"
                    defaultMessage="请输入密码！"
                  />
                ),
              },
            ]}
          />
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
