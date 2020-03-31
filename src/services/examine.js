import request from '@/utils/request'

// 获取领导审批
export function findWaitingApprove (params) {
  return request('/activiti/findWaitingApprove', { params: params })
}
//审批
export function examineApprove (params) {
  return request('/asset/statusjump', { params: params })
}
