import request from '@/utils/request'
import qs from 'qs'

// 新增流程监听
export function add(data) {
  return request({
    url: '/workflow/listener',
    method: 'post',
    data: data
  })
}

// 修改流程监听
export function update(data) {
  return request({
    url: '/workflow/listener',
    method: 'put',
    data: data
  })
}

// 删除流程监听
export function del(ids) {
  return request({
    url: '/workflow/listener/',
    method: 'delete',
    data: ids
  })
}

// 根据ID查询流程监听信息
export function getListener(id) {
  return request({
    url: `/workflow/listener/id/${id}`,
    method: 'get'
  })
}

// 查询流程监听列表
export function list(data) {
  return request({
    url: '/workflow/listener/list',
    method: 'post',
    data
  })
}

// 分页查询流程监听
export function page(params) {
  return request({
    url: '/workflow/listener/page?' + qs.stringify(params, { indices: false }),
    method: 'get'
  })
}
