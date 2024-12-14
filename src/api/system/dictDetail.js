import request from '@/utils/request'

export function del(ids) {
  return request({
    url: '/dictDetail',
    method: 'delete',
    data: ids
  })
}
