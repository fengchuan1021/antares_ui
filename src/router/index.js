import { createRouter, createWebHistory } from 'vue-router'


const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { title: '我的' }
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminView.vue'),
    meta: { title: '管理' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { title: '登录' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：启动时校验 token 和用户信息
router.beforeEach(async (to) => {
  // 登录页无需校验
  if (to.path === '/login') {
    return true
  }

  const token = localStorage.getItem('token')
  if (!token) {
    return '/login'
  }

  // 管理页仅 role_id === 1 可访问
  if (to.path === '/admin') {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (user.role_id !== 1) {
        return '/'
      }
    } catch {
      return '/'
    }
  }

  return true
})

export default router
