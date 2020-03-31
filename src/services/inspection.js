
import request from '@/utils/request'
// GET 巡检人信息
export function getTodoList (params) {
  return request('/routine/workOrder/query/agencyList', { params: params })
}
//GET 巡检任务列表
export function getAllList (params) {
  return request('/routine/workOrder/query/list', { params: params })
}
//通过id关闭计划
export function inspectPlanCloseById (params) {
  return request('/routine/inspectPlan/close/id', { method: 'post', params: params })
}
//通过id删除接口
export function inspectPlanDeleteById (params) {
  return request('/routine/inspectPlan/delete/id', { method: 'post', params: params })
}
//通过id查询
export function inspectPlanQueryById (params) {
  return request('/routine/inspectPlan/query/id', { params: params })
}
//批量查询接口
export function inspectPlanQueryList (params) {
  return request('/routine/inspectPlan/query/list', { params: params })
}
//保存接口
export function inspectPlanSaveSingle (params) {
  return request('/routine/inspectPlan/save/single', { method: 'post', params: params })
}
//修改接口
export function inspectPlanUpdateSingle (params) {
  return request('/routine/inspectPlan/update/single', { method: 'post', params: params })
}
//查看报告（批量查询接口）
export function inspectplanworkQueryList (params) {
  return request('/routine/inspectplanwork/query/list', { params: params })
}