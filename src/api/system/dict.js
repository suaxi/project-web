import request from '@/utils/request'

export function del(ids) {
  return request({
    url: '/dict',
    method: 'delete',
    data: ids
  })
}
