
import request from '@/utils/request'
//装机模板列表
export function queryInstallTempList (params) {
  return request('/asset/assetinstalltemplate/query/list', { method: 'post', params })
}

// 模板编号去重
export function noRepetitionNumberCode (params) {
  return request('/asset/assetinstalltemplate/query/numberCode', { method: 'post', params })
}
//模板创建/编辑-操作系统查询
export function createInstallTemplateOs (params) {
  return request('/asset/assetinstalltemplate/query/os', { method: 'post', params })
}

//模板列表查询适用系统
export function listInstallTemplateOs (params) {
  return request('/asset/assetinstalltemplate/query/osList', { method: 'post', params })
}

//模板下拉状态
export function listInstallTemplateStatus (params) {
  return request('/asset/assetinstalltemplate/query/statusList', { method: 'post', params })
}

//通过id删除装机模板
export function installTemplateDeleteById (params) {
  return request('/asset/assetinstalltemplate/delete/id', { params })
}

//修改（启用/禁用）
export function installTemplateUpDate (params) {
  return request('/asset/assetinstalltemplate/update/single', { method: 'post', params })
}

//模板创建
export function installTemplateSubmit (params) {
  return request('/asset/assetinstalltemplate/submit', { method: 'post', params })
}

//通过id查询
export function installTemplateById (params) {
  return request('/asset/assetinstalltemplate/query/id', { params })
}

//通过id查询软件列表
export function installTemplateSoftList (params) {
  return request('/asset/assetinstalltemplate/query/softList', { method: 'post', params })
}

//通过id查询软件列表
export function installTemplatePatchList (params) {
  return request('/asset/assetinstalltemplate/query/patchList', { method: 'post', params })
}

//装机模板编辑软件列表
export function installTemplateEditSoftList (params) {
  return request('/asset/assetinstalltemplate/query/softs', { method: 'post', params })
}

//装机模板编辑软件列表
export function installTemplateEditPatchList (params) {
  return request('/asset/assetinstalltemplate/query/patchs', { method: 'post', params })
}

//创建/编辑添加弹窗列表
export function assetHardSoftLibList (params) {
  return request('/asset/assethardsoftlib/query/softList', { method: 'post', params })
}

//模板审核
export function assetInstallTemplateCheck (params) {
  return request('/asset/assetinstalltemplate/check', { method: 'post', params })
}

//审核记录
export function assetInstallTemplateAuditInfo (params) {
  return request('/asset/assetinstalltemplate/query/auditInfo', { method: 'post', params })
}

/**
 * 查询装机模板是否存在
 * @param params { Object }
 * {
 *   stringId: String, 装机模板的ID
 * }
 */
export function getInstallTemplateIsExist (params) {
  return request('/asset/assetinstalltemplate/query/isExist', { method: 'post', params })
}
