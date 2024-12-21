import request from '@/utils/request'

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
export function findById(id) {
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
export function queryPage(params) {
  return request({
    url: '/workflow/listener/queryPage',
    method: 'get',
    params
  })
}
