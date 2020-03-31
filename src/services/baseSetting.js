import request from '@/utils/request'
//基准项管理列表
export function baselineItemQuery (params) {
  return request('/config/baselineconfiginfo/query/list', { method: 'post', params: params })
}
//基准项通过ID获取详情
export function baselineItemById (params) {
  return request('/config/baselineconfiginfo/query/id', { method: 'post', params: params })
}
//获取适用系统
export function getConfigOsList (params) {
  return request('/config/baselineconfiginfo/os/list', { method: 'post', params: params })
}
/**
 * 获取所有模板列表
 * @param params { Object }{
 *   isConfig: 1, //非必许 资产登记时，如果选择操作系统，没有筛选出模板，这给出通用模板列表
 * }
 */
export function getConfigTemplateList (params) {
  return request('/config/baselinetemplate/query/list', { method: 'post', params: params })
}
//新建模板基础信息
export function addConfigTemplate (params) {
  return request('/config/baselinetemplate/save/single', { method: 'post', params: params })
}
//编辑模板基础信息
export function editConfigTemplate (params) {
  return request('/config/baselinetemplate/update/single', { method: 'post', params: params })
}
//禁用模板
export function disableTemplate (params) {
  return request('/config/baselinetemplate/disable/id', { method: 'post', params: params })
}
//验证模板名称、编号的唯一性
export function checkTemplateName (params) {
  return request('/baseline/template/checkTemplateName', { method: 'post', params: params })
}
//验证模板名称、编号的唯一性
export function checkTemplateNo (params) {
  return request('/baseline/template/checkTemplateNo', { method: 'post', params: params })
}
//获取软件列表
export function getListSoftware (params) {
  return request('/config/baselinetemplate/listSoftware', { method: 'post', params: params })
}
//查看模板基础信息
export function getConfigTemplateById (params) {
  return request('/config/baselinetemplate/query/id', { method: 'post', params: params })
}
// 获取模板相关的资产信息
export function listAssetForTemplateByPage (params) {
  return request('/config/baselinetemplate/listAssetForTemplateByPage', { method: 'post', params: params })
}
/**
 * 分页的模板关联基准项
 * @param params {Object} {
 *                          templateId: String //基准模板ID
 *                        }
 */
export function listConfigForTemplateByPage (params) {
  return request('/config/baselinetemplate/listConfigForTemplateByPage', { method: 'post', params: params })
}
//分页的模板关联软件
export function listSoftwareForTemplateByPage (params) {
  return request('/config/baselinetemplate/listSoftwareForTemplateByPage', { method: 'post', params: params })
}
//不分页的模板关联基准项
export function listConfigForTemplate (params) {
  return request('/config/baselinetemplate/listConfigForTemplate', { method: 'post', params: params })
}
//不分页的模板关联软件
export function listSoftwareForTemplate (params) {
  return request('/config/baselinetemplate/listSoftwareForTemplate', { method: 'post', params: params })
}
//获取配置项列表
export function getbaseList (params) {
  return request('/baseline/item/query', { method: 'post', params: params })
}
//修改配置项
export function modifyTemplate (params) {
  return request('/baseline/template/modifyTemplate', { method: 'post', params: params })
}
//基准验证
export function checkValidation (params) {
  return request('/baseline/operate/saveAnalysisResult', { method: 'post', params: params })
}
//获取验证详情
export function configResultInfo (params) {
  return request('/baseline/operate/queryResult', { method: 'post', params: params })
}
//检验是否实施首次配置
export function isFirstConfig (params) {
  return request('/baseline/baselineConfig/isFirstConfig', { method: 'post', params: params })
}
//自动实施的拒绝备注信息
export function getAutoFeedbackInfo (params) {
  return request('/baseline/config/getAutoFeedbackInfo', { method: 'post', params: params })
}
// 修改资产配置信息
export function modifyAssetConfig (params) {
  return request('/baseline/operate/saveAssetConfig', { method: 'post', params: params })
}
// 基准配置待配置资产列表
export function getConfigAssetsList (params) {
  return request('/config/baselinewaitingconfig/query/list', { method: 'post', params: params })
}
// 基准配置待配置资产列表通过id获取
export function getConfigAssetsListById (params) {
  return request('/config/baselinewaitingconfig/query/assetInfo', { method: 'post', params: params })
}
// 基准配置保存
export function saveConfig (params) {
  return request('/config/baselinefinishedconfig/save/config', { method: 'post', params: params })
}
// 基准核查列表
export function getCheckList (params) {
  return request('/config/check/query/list', { method: 'post', params: params })
}
// 人工核查状态变更
export function checkStatusChange (params) {
  return request('/config/check/automaticToManualCheck', { method: 'post', params: params })
}
// 基准加固列表
export function getReinforceList (params) {
  return request('/config/fix/query/list', { method: 'post', params: params })
}
// 人工加固状态变更
export function reinforceStatusChange (params) {
  return request('/config/fix/automaticToManualFix', { method: 'post', params: params })
}
// 获取核查时显示的备注及附件
export function getCheckResult (params) {
  return request('/config/check/getCheckResult', { method: 'post', params: params })
}
// 获取加固时显示的备注及附件
export function getReinforceResult (params) {
  return request('/config/fix/getFixResult', { method: 'post', params: params })
}
// 保存核查
export function saveCheck (params) {
  return request('/config/baselinecheckresult/save/single', { method: 'post', params: params })
}
// 保存加固
export function saveReinforce (params) {
  return request('/config/fix/save/registrationFixResults', { method: 'post', params: params })
}
// 自动核查
export function automaticCheck (params) {
  return request('/config/check/reAutomaticCheck/id', { method: 'post', params: params })
}
// 自动加固
export function automaticReinforce (params) {
  return request('/config/fix/automaticFix/id', { method: 'post', params: params })
}
//获取核查报告
export function getCheckReport (params) {
  return request('/config/check/getCheckReport', { method: 'post', params: params })
}
//获取加固报告
export function getReinforceReport (params) {
  return request('/config/fix/getFixReport', { method: 'post', params: params })
}
//更新资产的模板
export function updateAssetTemplate (params) {
  return request('/asset/update/baselineTemplate', { method: 'post', params: params })
}
//获取基准类型
export function getBaseLineType () {
  return request('/config/baselinetype/query/all')
}
//获取适用系统
export function getBaseLineTypeBy (params) {
  return request('/config/baselinetype/query/name', { method: 'post', params: params })
}
//忽略资产
export function ignoreBaseLineConfig (params) {
  return request('/config/baselinewaitingconfig/ignore', { method: 'post', params: params })
}
//是否阻断入网
export function entryOperation (params) {
  return request('/asset/entryControl/query/entryOperation', { method: 'post', params: params })
}
//更新入网状态
export function updateEntryStatus (params) {
  return request('/asset/entryControl/update/entryStatus', { method: 'post', params: params })
}
//新建扫描任务
export function newTemplateScan (params) {
  return request('/config/templatescan/save/single', { method: 'post', params: params })
}
//获取扫描任务列表
export function queryTemplateScan (params) {
  return request('/config/templatescan/query', { method: 'post', params: params })
}
//获取扫描任务详情
export function queryTemplateScanById (params) {
  return request('/config/templatescan/query/id', { method: 'post', params: params })
}
//获取扫描结果
export function queryTemplateScanByPage (params) {
  return request('/config/templatescan/query/page', { method: 'post', params: params })
}
//模板批量变更
export function updateTemplateScan (params) {
  return request('/config/templatescan/update/all', { method: 'post', params: params })
}