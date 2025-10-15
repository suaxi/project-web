import request from '@/utils/request.js'
import qs from 'qs'

export function page(params) {
  return request({
    url: '/log/page?' + qs.stringify(params, { indices: false }),
    method: 'get'
  })
}
