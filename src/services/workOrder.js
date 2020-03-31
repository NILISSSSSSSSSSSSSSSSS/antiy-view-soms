import request from '@/utils/request'
// GET /api/v1/routine/WorkOrder/query/agencyList
export function getTodoList (params) {
  return request('/routine/workOrder/query/agencyList', { params: params })
}
//GET /api/v1/routine/WorkOrder/query/alreadyDoneList
export function getFinishList (params) {
  return request('/routine/workOrder/query/alreadyDoneList', { params: params })
}
// api/v1/routine/WorkOrder/query/MyList
export function getCreateList (params) {
  return request('/routine/workOrder/query/myList', { params: params })
}
// GET /api/v1/routine/WorkOrder/query/list
export function getAllList (params) {
  return request('/routine/workOrder/query/list', { params: params })
}

export function workOrderAdd (params) {
  return request('/routine/workOrder/save/single', { method: 'post', params: params })
}

// POST /api/v1/routine/workOrderStatusLog/receiveStatus
export function workOrderReceiveStatus (params){
  return request('/routine/workOrderStatusLog/receiveStatus', { method: 'post', params: params })
}
//POST /api/v1/routine/workOrderStatusLog/completedStatus
export function workOrderCompletedStatus (params){
  return request('/routine/workOrderStatusLog/completedStatus', { method: 'post', params: params })
}
//POST /api/v1/routine/workOrderStatusLog/closedStatus
export function workOrderClosedStatus (params){
  return request('/routine/workOrderStatusLog/closedStatus', { method: 'post', params: params })
}
// GET /api/v1/routine/workOrder/query/id
export function getWorkOrderDetailInfo (params) {
  return request('/routine/workOrder/query/id', { params: params })
}

// GET /api/v1/routine/workOrder/query/id
export function getWorkOrderDetailAlarmList (params) {
  return request('/alarm/current/query/work/order/id', { params: params })
}
