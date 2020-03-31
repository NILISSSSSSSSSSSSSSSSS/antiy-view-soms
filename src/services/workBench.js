import request from '@/utils/request'

// 获取我的硬件登记待办
export function getMyWaitRegistCount () {
  let userId = sessionStorage.getItem('id')
  if(userId) return request('/asset/query/waitRegistCount', { params: { user: userId } })
}
// 获取我的探测资产代办
export function getMyWaitDetectCount () {
  return request('/asset/query/unknownAssetAmount', {})
}
