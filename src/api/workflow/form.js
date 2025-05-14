import request from '@/utils/request'

// 查询流程表单列表
export function listForm(query) {
  return request({
    url: '/workflow/form/list',
    method: 'get',
    params: query
  })
}
export function listAllForm(data) {
  return request({
    url: '/workflow/form/list',
    method: 'post',
    data
  })
}

// 查询流程表单详细
export function getForm(formId) {
  return request({
    url: `/workflow/form/form-id/${formId}`,
    method: 'get'
  })
}

// 新增流程表单
export function addForm(data) {
  return request({
    url: '/workflow/form',
    method: 'post',
    data: data
  })
}

// 修改流程表单
export function updateForm(data) {
  return request({
    url: '/workflow/form',
    method: 'put',
    data: data
  })
}
// 挂载表单
export function mountFlowForm(data) {
  return request({
    url: '/workflow/form/mount-flow-form',
    method: 'post',
    data: data
  })
}

// 删除流程表单
export function delForm(formIds) {
  return request({
    url: '/workflow/form/',
    method: 'delete',
    data: formIds
  })
}

// 分页查询
export function page(params) {
  return request({
    url: '/workflow/form/page',
    method: 'get',
    params
  })
}

// 导出流程表单
export function exportForm(query) {
  return request({
    url: '/workflow/form/export',
    method: 'get',
    params: query
  })
}
