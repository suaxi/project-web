<template>
  <div :class="{ 'has-logo': showLogo }" class="sidebar-container">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="getMenuBackground"
        :text-color="getMenuTextColor"
        :unique-opened="true"
        :active-text-color="theme"
        :collapse-transition="false"
        mode="vertical"
        :class="sideTheme"
      >
        <sidebar-item
          v-for="(route, index) in sidebarRouters"
          :key="route.path + index"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import Logo from './Logo.vue'
import SidebarItem from './SidebarItem.vue'
import variables from '@/assets/styles/variables.module.scss'
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
// import usePermissionStore from '@/store/modules/permission'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const appStore = useAppStore()
const settingsStore = useSettingsStore()
// const permissionStore = usePermissionStore()

// const sidebarRouters = computed(() => permissionStore.sidebarRouters)
const sidebarRouters = computed(() => [
  {
    alwaysShow: true,
    children: [
      {
        alwaysShow: false,
        component: 'system/user/index',
        hasChildren: false,
        hasParent: true,
        hidden: false,
        id: 2,
        meta: {
          icon: 'peoples',
          noCache: true,
          title: '用户管理'
        },
        name: 'User',
        parentId: 1,
        path: 'user'
      },
      {
        alwaysShow: false,
        component: 'system/role/index',
        hasChildren: false,
        hasParent: true,
        hidden: false,
        id: 3,
        meta: {
          icon: 'role',
          noCache: true,
          title: '角色管理'
        },
        name: 'Role',
        parentId: 1,
        path: 'role'
      },
      {
        alwaysShow: false,
        component: 'system/menu/index',
        hasChildren: false,
        hasParent: true,
        hidden: false,
        id: 5,
        meta: {
          icon: 'menu',
          noCache: true,
          title: '菜单管理'
        },
        name: 'Menu',
        parentId: 1,
        path: 'menu'
      },
      {
        alwaysShow: false,
        component: 'system/dept/index',
        hasChildren: false,
        hasParent: true,
        hidden: false,
        id: 35,
        meta: {
          icon: 'dept',
          noCache: true,
          title: '部门管理'
        },
        name: 'Dept',
        parentId: 1,
        path: 'dept'
      },
      {
        alwaysShow: false,
        component: 'system/job/index',
        hasChildren: false,
        hasParent: true,
        hidden: false,
        id: 37,
        meta: {
          icon: 'Steve-Jobs',
          noCache: true,
          title: '岗位管理'
        },
        name: 'Job',
        parentId: 1,
        path: 'job'
      },
      {
        alwaysShow: false,
        component: 'system/dict/index',
        hasChildren: false,
        hasParent: true,
        hidden: false,
        id: 39,
        meta: {
          icon: 'dictionary',
          noCache: true,
          title: '字典管理'
        },
        name: 'Dict',
        parentId: 1,
        path: 'dict'
      }
    ],
    component: 'Layout',
    hasChildren: true,
    hasParent: true,
    hidden: false,
    id: 1,
    meta: {
      icon: 'system',
      noCache: true,
      title: '系统管理'
    },
    name: '系统管理',
    path: '/system',
    redirect: 'noredirect'
  },
  {
    alwaysShow: true,
    children: [
      {
        alwaysShow: false,
        component: 'workflow/definition/index',
        hasChildren: false,
        hasParent: true,
        hidden: false,
        id: 118,
        meta: {
          icon: 'tab',
          noCache: true,
          title: '流程定义'
        },
        name: 'Definition',
        parentId: 117,
        path: 'definition'
      },
      {
        alwaysShow: false,
        component: 'workflow/definition/index',
        hasChildren: false,
        hasParent: true,
        hidden: false,
        id: 118,
        meta: {
          icon: 'tab',
          noCache: true,
          title: '流程定义'
        },
        name: 'Definition',
        parentId: 117,
        path: 'definition'
      },
      {
        alwaysShow: false,
        component: 'workflow/definition/model',
        hasChildren: false,
        hasParent: true,
        hidden: true,
        id: 130,
        meta: {
          icon: 'dev',
          noCache: true,
          title: '流程定义Model'
        },
        name: 'WorkFlowDesignerModel',
        parentId: 117,
        path: 'definition/model'
      },
      {
        alwaysShow: false,
        component: 'workflow/task/flowForm',
        hasChildren: false,
        hasParent: true,
        hidden: true,
        id: 131,
        meta: {
          icon: 'edit',
          noCache: true,
          title: '流程表单设计'
        },
        name: 'WorkFlowForm',
        parentId: 117,
        path: 'task/flowForm'
      },
      {
        alwaysShow: false,
        component: 'workflow/task/form/index',
        hasChildren: false,
        hasParent: true,
        hidden: false,
        id: 119,
        meta: {
          icon: 'system',
          noCache: true,
          title: '表单配置'
        },
        name: 'Form',
        parentId: 117,
        path: 'task/form'
      },
      {
        alwaysShow: false,
        component: 'workflow/task/form/index',
        hasChildren: false,
        hasParent: true,
        hidden: false,
        id: 119,
        meta: {
          icon: 'system',
          noCache: true,
          title: '表单配置'
        },
        name: 'Form',
        parentId: 117,
        path: 'task/form'
      },
      {
        alwaysShow: false,
        component: 'workflow/expression/index',
        hasChildren: false,
        hasParent: true,
        hidden: false,
        id: 124,
        meta: {
          icon: 'nested',
          noCache: true,
          title: '流程表达式'
        },
        name: 'Expression',
        parentId: 117,
        path: 'expression'
      },
      {
        alwaysShow: false,
        component: 'workflow/listener/index',
        hasChildren: false,
        hasParent: true,
        hidden: false,
        id: 125,
        meta: {
          icon: 'monitor',
          noCache: true,
          title: '流程监听'
        },
        name: 'Listener',
        parentId: 117,
        path: 'Listener'
      }
    ],
    component: 'Layout',
    hasChildren: true,
    hasParent: true,
    hidden: false,
    id: 117,
    meta: {
      icon: 'tree-table',
      noCache: true,
      title: '流程管理'
    },
    name: '流程管理',
    path: '/workflow',
    redirect: 'noredirect'
  },
  {
    alwaysShow: true,
    children: [
      {
        alwaysShow: false,
        component: 'workflow/task/myProcess/index',
        hasChildren: false,
        hasParent: true,
        hidden: false,
        id: 121,
        meta: {
          icon: 'develop',
          noCache: true,
          title: '已发任务'
        },
        name: 'TaskList',
        parentId: 120,
        path: 'list'
      },
      {
        alwaysShow: false,
        component: 'workflow/task/myProcess/index',
        hasChildren: false,
        hasParent: true,
        hidden: false,
        id: 121,
        meta: {
          icon: 'develop',
          noCache: true,
          title: '已发任务'
        },
        name: 'TaskList',
        parentId: 120,
        path: 'list'
      },
      {
        alwaysShow: false,
        component: 'workflow/task/todo/index',
        hasChildren: false,
        hasParent: true,
        hidden: false,
        id: 122,
        meta: {
          icon: 'tools',
          noCache: true,
          title: '待办任务'
        },
        name: 'ToDoTaskList',
        parentId: 120,
        path: 'todo'
      },
      {
        alwaysShow: false,
        component: 'workflow/task/todo/index',
        hasChildren: false,
        hasParent: true,
        hidden: false,
        id: 122,
        meta: {
          icon: 'tools',
          noCache: true,
          title: '待办任务'
        },
        name: 'ToDoTaskList',
        parentId: 120,
        path: 'todo'
      },
      {
        alwaysShow: false,
        component: 'workflow/task/finished/index',
        hasChildren: false,
        hasParent: true,
        hidden: false,
        id: 123,
        meta: {
          icon: 'menu',
          noCache: true,
          title: '已办任务'
        },
        name: 'FinishedTaskList',
        parentId: 120,
        path: 'finished'
      },
      {
        alwaysShow: false,
        component: 'workflow/task/myProcess/start/index',
        hasChildren: false,
        hasParent: true,
        hidden: true,
        id: 132,
        meta: {
          icon: 'dev',
          noCache: true,
          title: '发起流程'
        },
        name: 'WorkFlowMyProcessStart',
        parentId: 120,
        path: 'myProcess/start'
      },
      {
        alwaysShow: false,
        component: 'workflow/task/myProcess/detail/index',
        hasChildren: false,
        hasParent: true,
        hidden: true,
        id: 133,
        meta: {
          icon: 'dev',
          noCache: true,
          title: '流程详情'
        },
        name: 'WorkFlowMyProcessDetail',
        parentId: 120,
        path: 'myProcess/detail'
      },
      {
        alwaysShow: false,
        component: 'workflow/task/todo/detail/index',
        hasChildren: false,
        hasParent: true,
        hidden: true,
        id: 134,
        meta: {
          icon: 'dev',
          noCache: true,
          title: '流程审批'
        },
        name: 'WorkFlowToDoDetail',
        parentId: 120,
        path: 'todo/detail'
      }
    ],
    component: 'Layout',
    hasChildren: true,
    hasParent: true,
    hidden: false,
    id: 120,
    meta: {
      icon: 'list',
      noCache: true,
      title: '任务管理'
    },
    name: '任务管理',
    path: '/workflow/task',
    redirect: 'noredirect'
  },
  {
    alwaysShow: true,
    children: [
      {
        alwaysShow: false,
        component: 'system/nested-menu/index',
        hasChildren: false,
        hasParent: true,
        hidden: false,
        id: 22,
        meta: {
          icon: 'menu',
          noCache: true,
          title: '二级菜单1'
        },
        name: 'NestedMenu1',
        parentId: 21,
        path: 'nested-menu-1'
      },
      {
        alwaysShow: false,
        component: 'system/nested-menu/index',
        hasChildren: false,
        hasParent: true,
        hidden: false,
        id: 23,
        meta: {
          icon: 'menu',
          noCache: true,
          title: '二级菜单2'
        },
        name: 'NestedMenu2',
        parentId: 21,
        path: 'nested-menu-2'
      }
    ],
    component: 'Layout',
    hasChildren: true,
    hasParent: true,
    hidden: false,
    id: 21,
    meta: {
      icon: 'menu',
      noCache: true,
      title: '多级菜单'
    },
    name: '多级菜单',
    path: '/system',
    redirect: 'noredirect'
  }
])
const showLogo = computed(() => settingsStore.sidebarLogo)
const sideTheme = computed(() => settingsStore.sideTheme)
const theme = computed(() => settingsStore.theme)
const isCollapse = computed(() => !appStore.sidebar.opened)

// 获取菜单背景色
const getMenuBackground = computed(() => {
  if (settingsStore.isDark) {
    return 'var(--sidebar-bg)'
  }
  return sideTheme.value === 'theme-dark' ? variables.menuBg : variables.menuLightBg
})

// 获取菜单文字颜色
const getMenuTextColor = computed(() => {
  if (settingsStore.isDark) {
    return 'var(--sidebar-text)'
  }
  return sideTheme.value === 'theme-dark' ? variables.menuText : variables.menuLightText
})

const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})
</script>

<style lang="scss" scoped>
.sidebar-container {
  background-color: v-bind(getMenuBackground);

  .scrollbar-wrapper {
    background-color: v-bind(getMenuBackground);
  }

  .el-menu {
    border: none;
    height: 100%;
    width: 100% !important;

    .el-menu-item,
    .el-sub-menu__title {
      &:hover {
        background-color: var(--menu-hover, rgba(0, 0, 0, 0.06)) !important;
      }
    }

    .el-menu-item {
      color: v-bind(getMenuTextColor);

      &.is-active {
        color: var(--menu-active-text, #409eff);
        background-color: var(--menu-hover, rgba(0, 0, 0, 0.06)) !important;
      }
    }

    .el-sub-menu__title {
      color: v-bind(getMenuTextColor);
    }
  }
}
</style>
