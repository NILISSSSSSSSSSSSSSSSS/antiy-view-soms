import request from '@/utils/request'

export function queryTaskPlanList (params) {
  return request('/routine/taskPlan/query/list', { params: params })
}

export function saveTaskPlan (params) {
  return request('/routine/taskPlan/save/single', { method: 'post', params: params })
}

export function updateTaskPlan (params) {
  return request('/routine/taskPlan/update/single', { method: 'post', params: params })
}

export function startupTaskPlan (params) {
  return request('/routine/taskPlan/startup/id', { method: 'post', params: params })
}

export function pauseTaskPlan (params) {
  return request('/routine/taskPlan/pause/id', { method: 'post', params: params })
}