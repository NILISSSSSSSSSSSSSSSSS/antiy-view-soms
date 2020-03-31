import request from '@/utils/request'
//最新威胁
export function topThreatEvent (params) {
  return request('/safety/threateventapt/query/topThreatEvent', { params: params })
}
//展示存在漏洞的资产数
export function numberOfAssetWithVul (params) {
  return request('/vul/assetVulRel/numberOfAssetWithVul', { method: 'post', params: params })
}
//展示存在未修复补丁的资产数
export function numberOfAssetWithPath (params) {
  return request('/patch/assertPatchRel/numberOfAssetWithPath', { method: 'post', params: params })
}
//查询安全设备类别和数量
export function safetyequipmentQueryCategory (params) {
  return request('/safety/safetyequipment/query/safetyCategory', { params: params })
}
//安全设备数概览
export function safetyequipmentEquipments (params) {
  return request('/safety/safetyequipment/query/equipments', { params: params })
}
//获取最新10条的威胁数据
export function safetyequipmentTopThreat (params) {
  return request('/safety/threatevent/get/topThreat', { params: params })
}
//通过威胁事件类型统计威胁事件
export function safetyequipmentThreat (params) {
  return request('/safety/threatevent/count/threat', { params: params })
}

//文件上传
export function safeFileUpload (params) {
  return request('/safety/file/upload', { method: 'post', params: params })
}
//特性库信息列表查询
export function featureSafetyEquipmentList (params) {
  return request('/safety/featurelibrary/query/safetyEquipmentList', { params: params })
}
//特性库信息查询版本
export function featureSafetyVersion (params) {
  return request('/safety/featurelibrary/query/equipmentVersion', { params: params })
}
//特性库管理查询版本
export function featurelibraryQueryVersion (params) {
  return request('/safety/featurelibrary/query/version', { params: params })
}
//特性库综合查询
export function featureSafetyQueryList (params) {
  return request('/safety/featurelibrary/query/list', { params: params })
}
//注销特性库
export function featurelibraryCancel (params) {
  return request('/safety/featurelibrary/cancel/single', { method: 'post', params: params })
}
//特征库版本号
export function featurelibraryVersion (params) {
  return request('/safety/featurelibrary/query/version', { params: params })
}
//版本信息详情查询
export function equipmentQueryById (params) {
  return request('/safety/safetyequipment/query/id', { params: params })
}
//升级包版本升级
export function upgradePackageInstall (params) {
  return request('/safety/upgrade/query/upgradePackageInstall', { method: 'post', params: params })
}
//升级包安装
export function upgradePackageUpgrade (params) {
  return request('/safety/upgrade/query/equipmentUpgrade', { method: 'post', params: params })
}
//导出升级包
export function upgradePackageExport (params) {
  return request('/safety/upgrade/export/file', { params: params })
}
//查询当前设备可安装的升级包列表
export function upgradeablePackageList (params) {
  return request('/safety/upgrade/query/upgradeablePackageList', { params: params })
}
//查询升级包可安装的设备列表
export function installableEquipmentList (params) {
  return request('/safety/upgrade/query/installableEquipmentList', { params: params })
}
//查询升级包详情
export function queryPackageDetail (params) {
  return request('/safety/upgradepackage/query/queryPackageDetail', { params: params })
}
//升级包登记
export function safeSingle (params) {
  return request('/safety/upgradepackage/save/single', { method: 'post', params: params })
}
//升级包文件下载
export function safeFileDown (params) {
  return request('/safety/upgradepackage/file/download', { params: params })
}
//升级包修改
export function safeUpdate (params) {
  return request('/safety/upgradepackage/update/single', { method: 'post', params: params })
}
//查询安全设备列表/版本信息列表
export function safetyEquipmentList (params) {
  return request('/safety/upgradepackage/query/safetyEquipmentList', { params: params })
}
//查询所有升级包版本号下拉列表接口
export function safetyPulldown (params) {
  return request('/safety/upgrade/query/pulldown/version', { params: params })
}
//查询版本信息指定版本号
export function safetyUpgradePulldown (params) {
  return request('/safety/upgrade/query/pulldown/categoryModel', { params: params })
}
//保存升级包结果
export function versionUpgradeResult (params) {
  return request('/safety/upgrade/save/upgradeResult', { method: 'post', params: params })
}
//保存特征库结果
export function featureUpgradeResult (params) {
  return request('/safety/featurelibraryrelation/update/batch', { method: 'post', params: params })
}
//查询指定升级包版本号下拉列表接口
export function safetyQueryPulldown (params) {
  return request('/safety/upgradepackage/query/pulldown/categoryModel', { params: params })
}
//升级包管理列表/版本库管理列表
export function upgradePackageList (params) {
  return request('/safety/upgradepackage/query/upgradePackageList', { params: params })
}
//注销 升级包管理列表/版本库管理列表
export function upgradepackageLogout (params) {
  return request(`/safety/upgradepackage/logout/id?primaryKey=${params.primaryKey}`, { method: 'post', params: params })
}

//注销特征库版本
export function featureCancel (params) {
  return request('/safety/featurelibrary/cancel/single', { method: 'post', params: params })
}
//特征库升级
export function featureInstall (params) {
  return request('/safety/featurelibrary/operator/install', { method: 'post', params: params })
}
//特征库升综合查询
export function featureInstallQuery (params) {
  return request('/safety/featurelibraryrelation/query/asset', { params: params })
}
//查询已纳入管理的设备特征库版本
export function featureQueryEquipmentVersion (params) {
  return request('/safety/featurelibrary/query/equipmentVersion', { params: params })
}
//批量自动安装特征库
export function featureQueryBatch (params) {
  return request('/safety/featurelibraryrelation/save/batch', { method: 'post', params: params })
}
//通过ID查询详情页面(版本管理)
export function featureQueryId (params) {
  return request('/safety/featurelibrary/query/equipmentUpgradeList', { params: params })
}
//特征库综合查询接口
export function featureQueryList (params) {
  return request('/safety/featurelibrary/query/list', { params: params })
}
//查询特征库信息列表
export function featureQuerySafetyEquipmentList (params) {
  return request('/safety/featurelibrary/query/safetyEquipmentList', { params: params })
}
//导出查询特征库资产
export function featureQuerySafetyExport (params) {
  return request('/safety/featurelibraryrelation/export/asset', { params: params })
}
//获取安全设备厂商
export function safetyManufacturer (params) {
  return request('/safety/safetyequipment/query/safetyManufacturer', { params: params })
}
//通过资产类型查找厂商
export function categoryModelFindManufacturer (params) {
  return request('/safety/safetyequipment/query/manufacturer', { params: params })
}
//id查询特征库信息
export function featureQuerySafetyQuery (params) {
  return request('/safety/featurelibrary/query/id', { params: params })
}
//id查询特征库当前设备信息
export function featurelibraryrelationQuery (params) {
  return request('/safety/featurelibraryrelation/query/id', { params: params })
}
//批量查询可升级特征库
export function featureQueryUpdateList (params) {
  return request('/safety/featurelibrary/query/updateList', { params: params })
  // return request('/safety/featurelibrary/query/canUpgradeList', {   params: params })
}
//查询特征库指定版本
export function featureQueryVersion (params) {
  return request('/safety/featurelibrary/query/version', { params: params })
}
//保存接口
export function featureSave (params) {
  return request('/safety/featurelibrary/save/single', { method: 'post', params: params })
}
//特征库信息修改/变更
export function featureUpdate (params) {
  return request('/safety/featurelibrary/update/single', { method: 'post', params: params })
}
//特征库升级(单个)
export function featureUpgrade (params) {
  return request('/safety/featurelibrary/upgrade/safetyFeatureLibrary', { method: 'post', params: params })
}
//特征库修改(单个)
export function featurelibraryrelationBatch (params) {
  return request('/safety/featurelibraryrelation/update/batch/install', { method: 'post', params: params })
}
//判断版本号
export function versionComparison (params) {
  return request('/safety/upgradepackage/query/versionComparison', { params: params })
}

//设备管理（综合查询）
export function equipmentQueryList (params) {
  return request('/safety/safetyequipment/query/list', { params: params })
}
//设备管理（剔除+纳入）
export function equipmentDeleteAddById (params) {
  return request('/safety/safetyequipment/eliminateManagedById', { params: params })
}
//设备管理（变更）
export function equipmentChange (params) {
  return request('/safety/safetyequipment/change/safetyEquipment', { method: 'post', params: params })
}
// 资产类型查询(树形)
export function getcategoryModelNodeTree (params) {
  return request('/safety/safetyequipment/query/safetyList', { params: params })
}
//查询该设备的已安装的特征库（历史）
export function featureQueryHistory (params) {
  return request('/safety/featurelibraryrelation/query/historyLibrary', { params: params })
}
//历史
export function upgradeQueryHistory (params) {
  return request('/safety/upgrade/query/list', { params: params })
}
//获取安全资产类型树
export function safetyCategoryNode (params) {
  return request('/safety/safetyequipment/query/safetyCategoryNode', { params: params })
}
//威胁列表
export function threateventList (params) {
  return request('/safety/threatevent/query/list', { params: params })
}
//通过id查现在告警
export function getCurrentAlarmQueryId (params) {
  return request('/alarm/current/query/asset/id', { params: params })
}
//通过id查历史告警
export function getHistoryAlarmQueryId (params) {
  return request('/alarm/history/query/asset/id', { params: params })
}
//通过id查历史告警
export function safetyNodeManaged () {
  return request('/safety/safetyequipment/query/safetyNode/managed')
}
//查询高级威胁所属安全设备
export function getsafetythreataptEquip () {
  return request('/safety/threateventapt/query/asset/select')
}
//高级威胁列表
export function getsafetythreataptList (params) {
  return request('/safety/threateventapt/query/list', { params: params })
}
//查询高级威胁详情
export function getsafetythreataptByid (params) {
  return request('/safety/threateventapt/query/id', { params: params })
}
//查询探海威胁所属安全设备
export function getsafetythreattanhaiEquip () {
  return request('/safety/threateventtanhai/query/asset/select')
}
//探海威胁列表
export function getsafetythreattanhaiList (params) {
  return request('/safety/threateventtanhai/query/list', { params: params })
}
//查询探海威胁详情
export function getsafetythreattanhaiByid (params) {
  return request('/safety/threateventtanhai/query/id', { params: params })
}
//查询病毒威胁所属安全设备
export function getsafetythreatvirusEquip () {
  return request('/safety/threateventvirus/query/asset/select')
}
//病毒威胁列表
export function getsafetythreatvirusList (params) {
  return request('/safety/threateventvirus/query/list', { params: params })
}
//威胁文件详情
export function getsafetythreatFile (params) {
  return request('/safety/threatevent/query/threatFile', { params: params })
}
//终端详情
export function getsafetyterminalInfo (params) {
  return request('/safety/safetyequipment/query/terminalInfo', { params: params })
}
export function getthreateventaptrel (params) {
  return request('/safety/threateventaptrel/query/terminal', { params: params })
}
//查询指定资产类型的所有升级包版本号下拉列表接口
export function safetySoftVersion (params) {
  return request('/safety/upgradepackage/query/pulldown/categoryModel', { params })
}
//查询指定资产类型的所有升级包特征库下拉列表接口
export function sefetyFeatureLibrary (params) {
  return request('/safety/featurelibrary/query/version', { params })
}
//获取指定的页面的资产类型
export function sefetySpecifiedCategoryNode (params) {
  return request('/safety/safetyequipment/query/safetyNode', { params })
}
//删除版本、特征的说明包
export function deleteFile (params) {
  return request('/safety/file/delete', { method: 'post', params })
}
//检测当前安全设备是否有最新的版本库，特征库
export function checkVersion (params) {
  return request('/safety/safetyequipment/update/checkVersion', { method: 'post', params })
}

/************************性能请求*********************************/
// 性能监控综合查询
export function safetyequipmentPerformanceindex (params) {
  return request('/safety/performanceindex/query/list', { params: params })
}
//批量查询接口（性能）
export function getPerformanceLineList (params) {
  return request('/safety/performanceindex/query/list', { params: params })
}
//通过ID查询指定安全设备历史性能
export function getHistoryPerformance (params) {
  return request('/safety/performanceindex/query/historyPerformance', { params: params })
}
//通过ID查询性能指标信息
export function getPerformanceLineChart (params) {
  return request('/safety/performanceindex/query/performanceLineChart', { params: params })
}
//通过安全设备品类ID查询厂商列表
export function getSafetyFacturer (params) {
  return request('/safety/safetyequipment/query/manufacturer', { params: params })
}
//获取威胁关联的安全设备信息
export function getThreatEquipmentQueryById (params) {
  return request('/safety/safetyequipment/query/threat/id', { params: params })
}
/************************新增的厂商、版本、名称接口*********************************/

// 厂商
export function getSafetySupplier (params) {
  return request('/safety/safetyequipment/safetyEquipment/supplier', { method: 'post', params })
}
//版本
export function getSafetyVersion (params) {
  return request('/safety/safetyequipment/safetyEquipment/version', { method: 'post', params })
}
//名称
export function getSafetyName (params) {
  return request('/safety/safetyequipment/safetyEquipment/name', { method: 'post', params })
}