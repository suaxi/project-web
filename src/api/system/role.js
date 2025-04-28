import request from '@/utils/request'
import qs from 'qs'

export function add(data) {
  return request({
    url: '/role',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/role',
    method: 'put',
    data
  })
}

export function del(ids) {
  return request({
    url: '/role',
    method: 'delete',
    data: ids
  })
}

export function updateRoleMenu(data) {
  return request({
    url: '/role/update-role-menu',
    method: 'put',
    data
  })
}

export function getRole(id) {
  return request({
    url: `/role/id/${id}`,
    method: 'get'
  })
}

export function list(data) {
  return request({
    url: '/role/list',
    method: 'post',
    data
  })
}

export function page(params) {
  return request({
    url: '/role/page?' + qs.stringify(params, { indices: false }),
    method: 'get'
  })
}
