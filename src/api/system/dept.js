import request from '@/utils/request'

export function childList(params) {
  return request({
    url: `/dept/child-list`,
    method: 'get',
    params
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

export function edit(data) {
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
