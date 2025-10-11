import request from '@/utils/request'
import qs from 'qs'

export function add(data) {
  return request({
    url: '/dict',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/dict',
    method: 'put',
    data
  })
}

export function del(ids) {
  return request({
    url: '/dict',
    method: 'delete',
    data: ids
  })
}

export function getDict(id) {
  return request({
    url: `/dict/id/${id}`,
    method: 'get'
  })
}

export function page(params) {
  return request({
    url: '/dict/page?' + qs.stringify(params, { indices: false }),
    method: 'get'
  })
}
