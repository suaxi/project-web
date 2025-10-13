import request from '@/utils/request'
import qs from 'qs'

export function add(data) {
  return request({
    url: '/dept',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/dept',
    method: 'put',
    data
  })
}

export function del(ids) {
  return request({
    url: '/dept',
    method: 'delete',
    data: ids
  })
}

export function childList(pid) {
  return request({
    url: `/dept/child-list?pid=${pid}`,
    method: 'get'
  })
}

export function superiorList(ids) {
  const data = ids.length || ids.length === 0 ? ids : Array.of(ids)
  return request({
    url: '/dept/superior-list',
    method: 'post',
    data
  })
}

export function getDept(id) {
  return request({
    url: `/dept/id/${id}`,
    method: 'get'
  })
}

export function page(params) {
  return request({
    url: '/dept/page?' + qs.stringify(params, { indices: false }),
    method: 'get'
  })
}

export function tree(data) {
  return request({
    url: '/dept/dept-tree',
    method: 'post',
    data
  })
}
