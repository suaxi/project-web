import request from '@/utils/request'

// 新增流程达式
export function add(data) {
  return request({
    url: '/workflow/expression',
    method: 'post',
    data: data
  })
}

// 修改流程达式
export function update(data) {
  return request({
    url: '/workflow/expression',
    method: 'put',
    data: data
  })
}

// 删除流程达式
export function del(ids) {
  return request({
    url: '/workflow/expression',
    method: 'delete',
    data: ids
  })
}

// 根据ID查询流程达式信息
export function findById(id) {
  return request({
    url: `/workflow/expression/id/${id}`,
    method: 'get'
  })
}

// 查询流程达式列表
export function list(data) {
  return request({
    url: '/workflow/expression/list',
    method: 'post',
    data
  })
}
