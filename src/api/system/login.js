import request from '@/utils/request'

export function login(username, password, code, uuid) {
  return request({
    url: 'auth/login',
    method: 'post',
    data: {
      username,
      password,
      code,
      uuid
    }
  })
}

export function getUserInfo() {
  return request({
    url: 'user/getUserInfo',
    method: 'get'
  })
}

export function getCode() {
  return request({
    url: 'auth/getCaptcha',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: 'auth/logout',
    method: 'get'
  })
}
