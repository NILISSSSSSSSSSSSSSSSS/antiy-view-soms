import request from '@/utils/request'

//获取资产软件数据
export function getSoftware () {
  return request('/asset/software/count/category')
}
//获取资产硬件数据
export function getHardware () {
  return request('/asset/count/category')
}
//获取未安装补丁数据
export function getPatchCount (params) {
  return request('/patch/report/queryPatchCount', { method: 'post', params: params } )
}
//获取消息列表
export function getMessageListOfIndex (params) {
  return request('/alarm/current/home/page/cycle', { params })
}
//获取漏洞
export function getVulCountOnAsset () {
  return request('/vul/statistic/vulQuery')
}
//查询代办工作
export function getBacklogWork (params) {
  return request('/activiti/findAllMyWaitingTasks', { params })
}
//资产 重要程度
export function getAssetLevel (params) {
  return request('/asset/homepage/pie/assetImportanceDegree', { params })
}
//资产在线情况
export function getAssetOnLine (params) {
  return request('/asset/homepage/chart/assetOnline', { params })
}
//告警变化趋势
export function getAlarmChange (params){
  return request('/alarm/current/query/alarm/seven/count', { params })
}
//获取资产信息
export function getAssetInfos (params){
  return request('/asset/homepage/count/includeManage', { params })
}
//告警等级分布
export function getAlarmLevels (params){
  return request('/alarm/current/query/alarm/level/count', { params })
}
//高风险资产TOP5
export function getRiskAsset (params){
  return request('/alarm/current/query/risk/asset/top/five', { params })
}
//违规告警
export function getViolateAlarm (params){
  return request('/alarm/current/query/violate/baseline/count', { params })
}

//风险资产总数
export function getRiskAssetTotal (params){
  return request('/alarm/current/query/risk/asset/count', { params })
}
//获取告警数据 饼图
export function getWarningDataChart () {
  return request('/alarm/current/query/alarm/type/count')
}
//获取告警等级数据
export function getWarningData () {
  return request('/alarm/current/query/alarm/level/count')
}
//获取告警等级数据
export function getMonitoringDay () {
  return request('/alarm/current/query/alarm/level/count')
}