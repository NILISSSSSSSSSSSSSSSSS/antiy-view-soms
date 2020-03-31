import request from '@/utils/request'

/**
 * 查询部门树形结构
 */
export function getDepartmentTree () {
  return request('/asset/department/query/node')
}

/**
 * 分页查询部门信息
 */
export function getDepartmentPageList (params) {
  return request('/asset/department/query/list', { params: params })
}

/**
 * 通过部门id查询部门和子部门
 */
export function getDepartmentAndChildById (params) {
  return request('/asset/department/get/id', { params: params })
}

/**
 * 通过部门id查询单条部门信息
 */
export function getDepartmentAndChildById1 (params) {
  return request('/asset/department/query/id', { params: params })
}

/**
 * 通过部门id删除部门
 */
export function deleteDepartmentById (params) {
  return request('/asset/department/delete/id', { method: 'post', params: params })
}

/**
 * 修改部门信息
 */
export function updateDepartment (params) {
  return request('/asset/department/update/single', { method: 'post', params: params })
}

/**
 * 保存部门信息
 */
export function saveDepartment (params) {
  return request('/asset/department/save/single', { method: 'post', params: params })
}
