import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import { getToken } from '../utils/auth.js'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import useUserStore from '@/store/modules/user'
import usePermissionStore from '@/store/modules/permission'
import { ElMessage } from 'element-plus'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login']

export const constantRoutes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404' },
    hidden: true
  },
  {
    path: '',
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

export const dynamicRoutes = []

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
})

router.beforeEach((to, from, next) => {
  NProgress.start()
  document.title = to.meta.title || 'Project Web'
  if (getToken()) {
    if (to.name === 'login') {
      // 已登录
      next('/')
      NProgress.done()
    } else if (whiteList.includes(to.path)) {
      next()
    } else {
      if (useUserStore().roles.length === 0) {
        useUserStore()
          .getUserInfo()
          .then(() => {
            usePermissionStore()
              .generateRoutes()
              .then((res) => {
                res.forEach((route) => {
                  router.addRoute(route)
                })
                next({ ...to, replace: true })
              })
          })
          .catch((err) => {
            useUserStore()
              .logOut()
              .then(() => {
                ElMessage.error(err)
                next('/')
              })
          })
      } else {
        next()
      }
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router
