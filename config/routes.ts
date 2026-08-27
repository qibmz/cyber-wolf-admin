export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './user/login',
      },
    ],
  },
  {
    path: '/welcome',
    name: 'welcome',
    icon: 'smile',
    component: './Welcome',
  },
  {
    path: '/users',
    name: 'users',
    icon: 'team',
    access: 'canAdmin',
    component: './user-list',
  },
  {
    path: '/news',
    name: 'news',
    icon: 'read',
    access: 'canAdmin',
    routes: [
      {
        path: '/news',
        redirect: '/news/articles',
      },
      {
        path: '/news/articles',
        name: 'articles',
        component: './news-list',
      },
      {
        path: '/news/categories',
        name: 'categories',
        component: './news-category-list',
      },
    ],
  },
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    component: './exception/404',
    layout: false,
    path: './*',
  },
];
