import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/views/login'
import { getToken } from '@/utils/auth'
import User from '@/views/system/user'
import Role from '@/views/system/role'
import Menu from '@/views/system/menu'
import Dept from '@/views/system/dept'
import Job from '@/views/system/job'
import Dict from '@/views/system/dict'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home'),
    children: [
      {
        path: 'system/user',
        name: 'User',
        component: User
      },
      {
        path: 'system/role',
        name: 'Role',
        component: Role
      },
      {
        path: 'system/menu',
        name: 'Menu',
        component: Menu
      },
      {
        path: 'system/dept',
        name: 'Dept',
        component: Dept
      },
      {
        path: 'system/job',
        name: 'Job',
        component: Job
      },
      {
        path: 'system/dict',
        name: 'Dict',
        component: Dict
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {
  if (getToken()) {
    if (to.name === 'Login') {
      // 已登录
      next('/')
    } else {
      next()
    }
  } else if (to.name !== 'Login') {
    // 未登录
    next({ name: 'Login' })
  } else {
    next()
  }
})

export default router
