import request from '@/utils/request'

export function getChild(id) {
  return request({
    url: `/menu/queryMenuListById?id=${id}`,
    method: 'get'
  })
}

export function getChildListByPid(pid) {
  return request({
    url: `/menu/queryChildListByPid?pid=${pid}`,
    method: 'get'
  })
}

export function querySameLevelAndSuperiorMenuListById(id) {
  return request({
    url: `/menu/querySameLevelAndSuperiorMenuListById?id=${id}`,
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
