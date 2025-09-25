import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import { getToken } from '../utils/auth.js'

export const constantRoutes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login.vue')
  },
  {
    path: '/',
    name: 'layout',
    component: Layout,
    redirect: '/index',
    children: [
      {
        path: 'index',
        name: 'Index',
        component: () => import('@/views/index.vue'),
        meta: { title: '首页', icon: 'dashboard', affix: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
})

router.beforeEach(async (to, from) => {
  document.title = to.meta.title || 'project'
  if (getToken()) {
    if (to.name === 'login') {
      return { path: '/' }
    } else {
      // TODO
    }
  } else if (to.name !== 'login') {
    return { name: 'login' }
  } else {
    return true
  }
})

export default router
