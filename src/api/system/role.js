import request from '@/utils/request'

export function queryPage() {
  return request({
    url: '/role/queryPage',
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: '/role',
    method: 'post',
    data
  })
}

export function edit(data) {
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

export function editRoleMenu(data) {
  return request({
    url: '/role/menu',
    method: 'put',
    data
  })
}

export function queryById(id) {
  return request({
    url: `/role/id/${id}`,
    method: 'get'
  })
}
