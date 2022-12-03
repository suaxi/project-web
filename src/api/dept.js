import request from '@/utils/request'

export function getDeptList(params) {
  return request({
    url: '/dept/queryChildListByPid',
    method: 'get',
    params
  })
}

export function getDeptSuperiorList(ids) {
  const data = ids.length || ids.length === 0 ? ids : Array.of(ids)
  return request({
    url: '/dept/querySuperiorListByIds',
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
