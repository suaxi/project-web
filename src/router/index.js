import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/views/login'
import { getToken } from '@/utils/auth'
// system
import User from '@/views/system/user'
import Role from '@/views/system/role'
import Menu from '@/views/system/menu'
import Dept from '@/views/system/dept'
import Job from '@/views/system/job'
import Dict from '@/views/system/dict'
// workflow
import Definition from '@/views/workflow/definition/index'
import WorkFlowDesignerModel from '@/views/workflow/definition/model'
import TaskList from '@/views/workflow/task/myProcess/index'
import ToDoTaskList from '@/views/workflow/task/todo/index'
import ToDoTaskDetail from '@/views/workflow/task/todo/detail/index'
import FinishedTaskList from '@/views/workflow/task/finished/index'
import FinishedTaskDetail from '@/views/workflow/task/finished/detail/index'
import TaskStartProcess from '@/views/workflow/task/myProcess/start/index'
import TaskProcessDetail from '@/views/workflow/task/myProcess/detail/index'
import TaskForm from '@/views/workflow/task/form/index'
import TaskFlowForm from '@/views/workflow/task/flowForm/index'

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
      },
      {
        path: 'workflow/definition',
        name: 'Definition',
        component: Definition
      },
      {
        path: 'workflow/definition/model',
        name: 'WorkFlowDesignerModel',
        component: WorkFlowDesignerModel
      },
      {
        path: 'workflow/task/form',
        name: 'TaskForm',
        component: TaskForm
      },
      {
        path: 'workflow/task/list',
        name: 'TaskList',
        component: TaskList
      },
      {
        path: 'workflow/task/todo',
        name: 'ToDoTaskList',
        component: ToDoTaskList
      },
      {
        path: 'workflow/task/todo/detail',
        name: 'ToDoTaskDetail',
        component: ToDoTaskDetail
      },
      {
        path: 'workflow/task/finished',
        name: 'FinishedTaskList',
        component: FinishedTaskList
      },
      {
        path: 'workflow/task/finished/detail',
        name: 'FinishedTaskDetail',
        component: FinishedTaskDetail
      },
      {
        path: 'workflow/task/myProcess/start',
        name: 'TaskStartProcess',
        component: TaskStartProcess
      },
      {
        path: 'workflow/task/myProcess/detail',
        name: 'TaskProcessDetail',
        component: TaskProcessDetail
      },
      {
        path: 'workflow/task/flowForm',
        name: 'TaskFlowForm',
        component: TaskFlowForm
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
