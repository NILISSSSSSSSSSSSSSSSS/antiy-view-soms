import request from '@/utils/request'
//获取补丁报表相关接口
export function getPatchReport (params) {
  return request('/patch/report/dataTable', { method: 'post', params: params })
}
//资产关联补丁
export function patchAssociateAsset (params) {
  return request('/patch/report/patchAssociateAsset', { method: 'post', params: params })
}
//补丁关联资产
export function effectAssetPatch (params) {
  return request('/patch/report/effectAsset', { method: 'post', params: params })
}
//补丁威胁程度
export function patchGradeReport (params) {
  return request('/patch/report/patchGradeReport', { method: 'post', params: params })
}
//获取漏洞报表相关接口
export function getVulReport (params) {
  return request('/vul/report/dataTable', { method: 'post', params: params })
}
//漏洞影响资产
export function vulEffectAsset (params) {
  return request('/vul/report/vulEffectAsset', { method: 'post', params: params })
}
//资产影响漏洞
export function assetEffetVul (params) {
  return request('/vul/report/effectAsset', { method: 'post', params: params })
}
//漏洞威胁程度
export function vulGradeReport (params) {
  return request('/vul/report/vulGradeReport', { method: 'post', params: params })
}
//告警列表
export function alarmReportList (params) {
  return request('/alarm/report/statistics/detail/time/range', { params: params })
}
//告警echarts
export function alarmReportEcharts (params) {
  return request('/alarm/report/statistics/time/range', { params: params })
}

//查询资产表格数据
export function getAssetTables (params){
  return request('/asset/report/query/categoryCountByTimeToTable', { params: params })
}
//查询资产图表数据
export function getAssetCharts (params){
  return request('/asset/report/query/categoryCountByTime', { params: params })
}

//查询资产区域表格数据
export function getAssetAreaTables (params){
  return request('/asset/report/query/queryAreaTable', { method: 'post', params: params })
}
//查询资产区域图表数据
export function getAssetAreaCharts (params){
  return request('/asset/report/query/queryAreaCount', { method: 'post', params: params })
}
//查询资产区域表格数据
export function getAssetGroupTables (params){
  return request('/asset/report/query/queryAssetGroupTable', { params: params })
}
//查询资产区域图表数据
export function getAssetGroupCharts (params){
  return request('/asset/report/query/groupCountTop', { params: params })
}
//导出区域数据
export function exportAssetAreaTable (params){
  return request('/asset/report/query/exportAreaTable', { method: 'post', params: params })
}
// 综合报表列表（批量查询）
export function getCompositionReportList (params){
  return request('/asset/assetcompositionreport/query/list', { params: params })
}
// 综合报表保存
export function saveAssetCompositionReport (params){
  return request('/asset/assetcompositionreport/save/single', { params: params })
}
// 综合报表修改
export function editAssetCompositionReport (params){
  return request('/asset/assetcompositionreport/update/single', { params: params })
}
// 历史检索删除
export function delHistoryTemplate (params){
  return request('/asset/assetcompositionreport/delete/id', { params: params })
}
// 历史检索下拉
export function historyTemplateData (params){
  return request('/asset/assetcompositionreport/query/list/templates', { params: params })
}
// 展开输入框的回显
export function assetCompoditionReportShowData (params){
  return request('/asset/assetcompositionreport/query/id', { params: params })
}
