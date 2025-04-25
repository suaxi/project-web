import request from '@/utils/request'

export function edit(data) {
  return request({
    url: '/job',
    method: 'put',
    data
  })
}

export function del(ids) {
  return request({
    url: '/job',
    method: 'delete',
    data: ids
  })
}

export function list() {
  return request({
    url: '/job/list',
    method: 'get'
  })
}
