import axios from 'axios'
import { ElMessage, ElNotification } from 'element-plus'
import { getToken, removeToken } from '@/utils/auth'
import router from '@/router'
import Config from '@/settings'

const request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: Config.timeout
})

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const code = error.status
    if (code === 401) {
      // 后台认证信息过期，浏览器cookie还存有token时，清除cookie，重定向回登录页
      removeToken()
      router.replace('/')

      ElNotification({
        title: '提示',
        message: '当前登录状态已过期，请重新登录！',
        type: 'warning'
      })
    } else if (code === 403) {
      ElMessage.warning('访问权限不足，请联系管理员！')
    } else {
      ElMessage.error(error.response.data.message)
    }
    return Promise.reject(error)
  }
)

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    if (getToken()) {
      config.headers['Authorization'] = getToken()
    }
    return config
  },
  (error) => {
    ElMessage.error(error.response.data.message)
    return Promise.reject(error)
  }
)

export default request
