
import request from '@/utils/request'
//分页查询接口(初始列表)
export function getKnowledgeList (params) {
  return request('/routine/knowledge/query/pageList', { params: params })
}
//根据id查询单个知识库记录（查看）
export function getKnowledgeDetail (params) {
  return request('/routine/knowledge/query', { params: params })
}
//新增知识库记录(登记)
export function KnowledgeSave (params) {
  return request('/routine/knowledge/save', { method: 'post', params: params })
}
//修改知识库记录(变更)
export function knowledgeUpdate (params) {
  return request('/routine/knowledge/update', {  method: 'post', params: params })
}
//删除知识库记录（剔除）
export function deleteKnowledge (params) {
  return request('/routine/knowledge/delete/knowledge', { method: 'post', params: params })
}