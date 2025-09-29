import request from '@/utils/request'
import qs from 'qs'

export function add(data) {
  return request({
    url: '/job',
    method: 'post',
    data
  })
}

export function update(data) {
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

export function getJob(id) {
  return request({
    url: `/job/id/${id}`,
    method: 'get'
  })
}

export function list() {
  return request({
    url: '/job/list',
    method: 'get'
  })
}

export function page(params) {
  return request({
    url: '/job/page?' + qs.stringify(params, { indices: false }),
    method: 'get'
  })
}
