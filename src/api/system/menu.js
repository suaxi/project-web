import request from '@/utils/request'

export function getChild(id) {
  return request({
    url: `/menu/menu-list?id=${id}`,
    method: 'get'
  })
}

export function getChildListByPid(pid) {
  return request({
    url: `/menu/child-list?pid=${pid}`,
    method: 'get'
  })
}

export function querySameLevelAndSuperiorMenuListById(id) {
  return request({
    url: `/menu/superior-menu-list?id=${id}`,
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
