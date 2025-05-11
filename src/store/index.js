import Vue from 'vue'
import Vuex from 'vuex'
import { getToken, removeToken, setToken } from '@/utils/auth'
import { getUserInfo, login, logout } from '@/api/system/login'
import { getUserRouter } from '@/api/system/menu'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    operation: '',
    token: getToken(),
    user: {},
    roles: [],
    menus: [],
    loadMenu: false
  },
  mutations: {
    SET_OPERATION: (state, payload) => {
      state.operation = payload
    },
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_USER: (state, user) => {
      state.user = user
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_MENUS: (state, menus) => {
      state.menus = menus
    },
    SET_LOAD_MENU: (state, loadMenu) => {
      state.loadMenu = loadMenu
    }
  },
  actions: {
    // 登录
    Login({ commit }, userInfo) {
      const rememberMe = userInfo.rememberMe
      return new Promise((resolve, reject) => {
        login(userInfo.username, userInfo.password, userInfo.code, userInfo.uuid).then(res => {
          setToken(res.token, rememberMe)
          commit('SET_TOKEN', res.token)
          commit('SET_LOAD_MENU', true)
          setUserInfo(res.user, commit)
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 获取用户信息
    GetUserInfo({ commit }) {
      return new Promise((resolve, reject) => {
        getUserInfo().then(res => {
          setUserInfo(res, commit)
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 退出
    LogOut({ commit }) {
      return new Promise((resolve, reject) => {
        logout().then(res => {
          logOut(commit)
          resolve(res)
        }).catch(error => {
          logOut(commit)
          reject(error)
        })
      })
    },
    // 获取用户路由
    GetUserRouter({ commit }) {
      return new Promise((resolve, reject) => {
        getUserRouter().then(res => {
          commit('SET_MENUS', res)
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },
    LoadMenu({ commit }) {
      return new Promise((resolve, reject) => {
        commit('SET_LOAD_MENU', false)
        resolve()
      })
    }
  },
  getters: {
    user: state => state.user,
    roles: state => state.roles,
    loadMenu: state => state.loadMenu
  }
})

const logOut = (commit) => {
  commit('SET_TOKEN', '')
  commit('SET_ROLES', [])
  commit('SET_MENUS', [])
  removeToken()
}

const setUserInfo = (user, commit) => {
  // 没有权限时，赋予默认权限避免死循环
  if (user.permissions.length === 0) {
    commit('SET_ROLES', ['ROLE_SYSTEM_DEFAULT'])
  } else {
    commit('SET_ROLES', user.permissions)
  }
  commit('SET_USER', user.user)
}
