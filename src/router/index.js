import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/views/login'
import Home from '@/views/home'
import { getToken } from '@/utils/auth'
import store from '@/store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  }
]

const asyncRouters = {
  path: '/',
  name: 'Home',
  component: Home,
  meta: {
    title: '首页'
  },
  children: []
}

const router = new VueRouter({
  mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'project'
  if (getToken()) {
    if (to.name === 'Login') {
      // 已登录
      next('/')
    } else {
      if (store.getters.roles.length === 0) {
        store.dispatch('GetUserInfo').then(() => {
          store.dispatch('GetUserRouter').then(res => {
            buildAsyncRouter(res, asyncRouters.children)
            router.addRoute(asyncRouters)
            next({ ...to, replace: true })
          })
        }).catch(() => {
          store.dispatch('LogOut').then(() => {
            location.reload()
          })
        })
      } else if (store.getters.loadMenu) {
        store.dispatch('GetUserRouter').then(res => {
          buildAsyncRouter(res, asyncRouters.children)
          router.addRoute(asyncRouters)
          store.dispatch('LoadMenu').then(() => {
            router.push('/')
          })
        })
      } else {
        next()
      }
    }
  } else if (to.name !== 'Login') {
    // 未登录
    next({ name: 'Login' })
  } else {
    next()
  }
})

function buildAsyncRouter(userRouter, asyncRouters) {
  userRouter.forEach(item => {
    if (item.hasChildren) {
      item.children.forEach(child => {
        if (child.component === 'Layout' || child.component === 'ParentView') {
          return
        }
        const asyncRouter = {
          path: `${item.path}/${child.path}`,
          name: child.name,
          component: (resolve) => require([`@/views/${child.component}`], resolve),
          meta: { ...child.meta }
        }
        asyncRouters.push(asyncRouter)

        if (child.hasChildren) {
          buildAsyncRouter(child.children, asyncRouters)
        }
      })
    }
  })
}

export default router
