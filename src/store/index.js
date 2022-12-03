import Vue from 'vue'
import Vuex from 'vuex'
import { getToken, removeToken, setToken } from '@/utils/auth'
import { getUserInfo, login, logout } from '@/api/login'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    operation: '',
    token: getToken(),
    user: {},
    roles: []
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
    }
  },
  getters: {
    userRoles: state => state.roles.filter(role => role && role.indexOf('user') !== -1)
  }
})

const logOut = (commit) => {
  commit('SET_TOKEN', '')
  commit('SET_ROLES', [])
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
