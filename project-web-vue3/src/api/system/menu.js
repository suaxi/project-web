import request from '@/utils/request'
import qs from 'qs'

export function add(data) {
  return request({
    url: '/menu',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/menu',
    method: 'put',
    data
  })
}

export function del(ids) {
  return request({
    url: '/menu',
    method: 'delete',
    data: ids
  })
}

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

export function superiorMenuList(id) {
  return request({
    url: `/menu/superior-menu-list?id=${id}`,
    method: 'get'
  })
}

export function getMenu(id) {
  return request({
    url: `/menu/id/${id}`,
    method: 'get'
  })
}

export function page(params) {
  return request({
    url: '/menu/page?' + qs.stringify(params, { indices: false }),
    method: 'get'
  })
}

export function tree(data) {
  return request({
    url: '/menu/menu-tree',
    method: 'post',
    data
  })
}
