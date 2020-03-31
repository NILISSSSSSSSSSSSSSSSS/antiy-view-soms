import request from '@/utils/request'

export function queryTaskAutomaticWorkList (params) {
  return request('/routine/automaticWork/query/list', { params: params })
}