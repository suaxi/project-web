import request from '@/utils/request'

export function getUserRouter() {
  return request({
    url: '/menu/user-routers',
    method: 'get'
  })
}

export function child(id) {
  return request({
    url: `/menu/menu-list?id=${id}`,
    method: 'get'
  })
}

export function childList(pid) {
  return request({
    url: `/menu/child-list?pid=${pid}`,
    method: 'get'
  })
}

export function querySameLevelAndSuperiorMenuListById(id) {
  return request({
    url: `/menu/superior-menu-list?id=${id}`,
    method: 'get'
  })
}

export function del(ids) {
  return request({
    url: '/menu',
    method: 'delete',
    data: ids
  })
}
