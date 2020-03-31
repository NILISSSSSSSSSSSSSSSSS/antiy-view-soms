import request from '@/utils/request'

//资产异常统计总数
export function assetErrorCount () {
  return request('/asset/normal/count', { method: 'post' })
}

//存在告警的资产
export function assetAlarmCount () {
  return request('/asset/alarm/count', { method: 'post' })
}
// 异常统计
export function eacthAssetErrorCount (params) {
  return request('/asset/vul/count', { method: 'post', params: params })
}
//保存用户信息
export function userAdd (params) {
  return request('/asset/user/save/single', { method: 'post', params: params })
}

//品类统计（硬件）
export function assetCountCategory () {
  return request('/asset/count/category')
}
//厂商统计（硬件）
export function assetCountManufacturer () {
  return request('/asset/count/manufacturer')
}
//状态统计（硬件）
export function assetCountManuStatus () {
  return request('/asset/count/status')
}
//厂商统计（软件）
export function assetCountManufacturerSoftware () {
  return request('/asset/software/count/manufacturer')
}

//状态统计（软件）
export function assetCountManuStatusSoftware () {
  return request('/asset/software/count/status')
}

//准入列表
export function getAdmittanceList (params) {
  return request('/asset/entryControl/query/list', { params: params })
}
//允许准入，禁止准入
export function getAdmittanceAccess (params) {
  return request('/asset/entryControl/update/entryStatus', { method: 'post', params: params })
}
//导出准入数据
export function exportAdmittance (params) {
  return request('/asset/entryControl/access/export', { params: params })
}
//准入历史记录
export function getAdmittanceListRecord (params) {
  return request('/asset/entryControl/query/record', { params: params })
}

//资产下拉基准模板
export function baselineTemplate (params) {
  return request('/asset/query/baselineTemplate', { params: params })
}

/**
 * 获取可关联的软件列表
 * @param params
 *        {
 *          assetId: { String } 资产ID
 *          baselineTemplateId: { String } 基准模板ID
 *          currentPage,
 *          isBatch: { Boolean } 是否批量操作
 *          productName: { String } 软件名称
 *          supplier : { String } 厂商
 *        }
 */
export function installableList (params) {
  return request('/asset/softwarerelation/query/installableList', { method: 'post', params: params })
}

//关联软件保存
export function batchRelation (params) {
  return request('/asset/softwarerelation/query/batchRelation', { method: 'post', params: params })
}

//查询软件资产列表数据
export function getSoftwareList (params) {
  return request('/asset/software/query/list', { params: params })
}

//查询下拉项的资产组信息
export function getGroupInfo () {
  return request('/asset/group/query/groupInfo')
}
//查询厂商信息
export function getManufacturerInfo (params) {
  return request('/asset/assethardsoftlib/pullDown/supplier', { method: 'post', params: params })
}
//资产漏洞扫描
export function scanBySingleAsset (params) {
  return request('/vul/scanner/bySingleAsset', { method: 'post', params: params } )
}
//资产漏洞扫描批量
export function queryProcessAsset (params) {
  return request('/vul/scanner/queryProcess', { method: 'post', params: params } )
}
//资产整改漏洞数量判断
export function untreatedVulAsset (params) {
  return request('/vul/untreated/list', { method: 'post', params: params } )
}

//资产配置检查
export function baselineassetAsset (params) {
  return request('/config/baselineasset/query/status', { method: 'post', params: params } )
}
//查询下拉项的资产使用者信息
export function getUserInAsset () {
  return request('/asset/user/query/userInAsset')
}

//查询区域树形列表
export function getUserAreaTree (params) {
  return request('/user/area/LoginUserTree', { params: params })
}
//硬件资产登记
export function saveAsset (params){
  return request('/asset/save/single', { method: 'post', params: params })
}
//查询人员身份
export function getPersonnelIdentityManagerList (params) {
  return request('/asset/user/query/list', { params: params })
}
//查詢所属组织树形列表
export function getDepartmentNode () {
  return request('/asset/department/query/node')
}
//通过ID删除资产组
export function removeGroupItems (params){
  return request('/asset/group/delete/id ', { method: 'post', params: params })
}
//查询资产组信息
export function getGroupManagerList (params) {
  return request('/asset/group/query/list', { params: params })
}
//查询资产组详情
export function getGroupQueryId (params) {
  return request('/asset/group/query/id', { params: params })
}

//查询资产
export function getAssetList (params) {
  return request('/asset/query/list', { method: 'post', params: params })
}

//查看加固报告
export function getFixReportAsset (params) {
  return request('/config/fix/getFixReport', { method: 'post', params: params })
}

//查看验证报告
export function getCheckReportAsset (params) {
  return request('/config/check/getCheckReport', { method: 'post', params: params })
}

// POST /asset/categorymodel/save/single;
export function addCategoryModel (payload) {
  return request('/asset/categorymodel/save/single', { method: 'post', params: payload })
}

// POST /asset/categorymodel/save/single;
export function editCategoryModel (payload) {
  return request('/asset/categorymodel/update/single', { method: 'post', params: payload })
}

// POST /asset/categorymodel/delete/{id};
export function deleteCategoryModel (params) {
  return request('/asset/categorymodel/delete/id', { method: 'post', params: params })
}
// POST /api/v1/asset/group/save/single
export function saveAssetGroup (params){
  return request('/asset/group/save/single', { method: 'post', params: params })
}

// POST /api/v1/asset/group/save/single
export function updateAssetGroup (params){
  return request('/asset/group/update/single', { method: 'post', params: params })
}

//查询配置管理员
export function getUsersByRoleCodeAndAreaId (params) {
  //接口切换（待测试）
  return request('/user/workflow/listRy', { params: params })
}
// GET 根据ID获取资产详情
export function getAssetHardWareById (params){
  return request('/asset/query/id', {  params: params })
}

//流程上一步操作积累
export function previousBatch (params) {
  return request('/asset/changeLog/preNote/batch', { method: 'post', params: params })
}

// 资产状态跃迁(实施，验证，检查，整改，入网，待退役，退役)
export function statusJump (params) {
  return request('/asset/statusjump', { method: 'post', params: params })
}
// 给硬件资产安装软件
export function installSoftware (params){
  return request('/asset/softwarerelation/software/install', {  method: 'post', params: params })
}
// 更改用户信息
export function updateUser (params) {
  return request('/asset/user/update/single', { method: 'post', params: params })
}
// 注销用户
export function deleteUser (params) {
  return request('/asset/user/cancel', { method: 'post', params: params })
}

//查询工作台我的待办事项
export function getMyUndoCount () {
  let userId = sessionStorage.getItem('id')
  if(userId) return request('/activiti/findWaitingTaskNums', { params: { user: userId } })
}
// 领取任务
export function recieveTask (params) {
  return request('/activiti/claimTask', { method: 'post', params: params })
}
// 领取任务批量
export function claimTaskBatch (params) {
  return request('/activiti/claimTaskBatch', { method: 'post', params: params })
}
// 方案信息
export function getSchemeAssetIdAndType (params) {
  return request('/asset/scheme/query/AssetIdAndType', { params: params })
}
// 导入计算设备
export function assetImportComputer (formData) {
  return request('/asset/import/computer', { method: 'post', params: formData })
}
// 导入网络设备
export function assetImportNet (formData) {
  return request('/asset/import/net', { method: 'post', params: formData })
}
// 导入其他设备
export function assetImportOthers (formData) {
  return request('/asset/import/ohters', { method: 'post', params: formData })
}
// 导入安全设备
export function assetImportSafety (formData) {
  return request('/asset/import/safety', { method: 'post', params: formData })
}

// 导入存储设备
export function assetImportStorage (formData) {
  return request('/asset/import/storage', { method: 'post', params: formData })
}
// 导入软件数据
export function assetImportSoftware (params, formData) {
  return request(`/asset/software/import/file?${params}`, { method: 'post', params: formData })
}
// 查询登录用户所属区域树
export function getAreasByUserId (params) {
  return request('/user/getAreasByUserId', { params: params })
}

// 不予登记
export function assetNoRegister (params){
  return request('/asset/statusjump/noRegister', { method: 'post', params: params })
}

//硬件资产变更
export function changAsset (params){
  // return request('/asset/changerecord/save/single', { method: 'post', params: params })
  return request('/asset/change/asset', { method: 'post', params: params })
}

//获取创建人下拉 数据
export function assetGroupCreateUser (){
  return request('/asset/group/query/createUser')
}

//获取资产基准管理列表
export function getConfigList (params) {
  return request('/baseline/baselineConfig/asset/assetWaitingConfigList', { method: 'post', params: params })
}

//获取模板信息
export function getTempletInfo (params) {
  return request('/baseline/template/detailById', { method: 'post', params: params })
}

//获取模板列表
export function getTempletList (params) {
  return request('/baseline/template/listTempByPageOnConfig', { method: 'post', params: params })
}

//获取通联列表
export function assetLinkedList (params) {
  return request('/asset/linkrelation/query/assetLinkedCount', { params: params })
}

//post提交软件安装 配置
export function assetSoftwareAllocation (params){
  return request('/asset/software/asset/setting', { method: 'post', params: params })
}

//**通联管理子项 */

//通联管理 资产信息
export function assetRelationDetailsObj (params){
  return request('/asset/query/id', { params: params })
}

//通联管理 通联关系
export function assetRelationDetailsList (params){
  return request('/asset/linkrelation/query/linkedAssetListByAssetId', { params: params })
}

//通联管理 通联关系 移除
export function assetRelationDetailsListDelete (params){
  return request('/asset/linkrelation/delete/id', { method: 'post', params: params })
}

//通联管理 通联关系 配置 资产组
export function assetRelationDetailsListAddAssetGroup (params){
  return request('/asset/group/query/unconnectedGroupInfo', { params: params })
}
//通联管理 通联关系 添加页面列表（未关联）
export function assetRelationDetailsListAddList (params){
  return request('/asset/query/unconnectedList', { params: params })
}

//通联管理 通联关系 添加页面详情ip和网口
export function relationUseableIpNet (params){
  return request('/asset/linkrelation/query/useableip', { method: 'post', params: params })
}
//通联管理 通联关系 添加页面详情
export function assetRelationDetailsListAddDetailsAdd (params){
  return request('/asset/linkrelation/save/single', { method: 'post', params: params })
}

// 获取资产详情-配置信息tab下的列表
export function getAssetDetailBaseline (params) {
  return request('/baseline/assets/assetsItemPage', { method: 'post', params })
}

// 删除上传文件
export function assetDeleteFile (params) {
  return request('/asset/file/delete', { method: 'post', params })
}
export function getCategorymodelWithoutnode (params) {
  return request('/asset/categorymodel/query/withoutnode', { method: 'post', params })
}

//资产流程操作是否上传相关附件查询接口
export function baselineFileAsset (params) {
  return request('/asset/baselineFile/query', { method: 'post', params })
}

//非资产使用

//查询操作系统接口
export function getAssetsOS (params) {
  return request('/asset/assethardsoftlib/pullDown/os', { method: 'post', params: params })
}

//license

export function assetHardwareAuthNum () {
  return request('/asset/license/validate/authNum')
}
// 修改资产配置信息
export function modifyAssetConfig (params) {
  return request('/baseline/operate/saveAssetConfig', { method: 'post', params: params })
}

//下载判断
export const checkDownloadAuth = (url, params) => {
  return request('post', '/user/isAuth', params)
}

/**
 * 获取资产信息
 * @param params {Object}{ id: String } 资产ID
 */
export const getAssetAssemblyInfo = (params) => {
  return request('/asset/get/assemblyInfo', { params })
}

/**
 * 获取厂商下拉列表数据
 * @param params {Object}{ supplier: String } 厂商字符串
 */
export const getSupplierList = (params) => {
  return request('/asset/assethardsoftlib/pullDown/supplier', { params })
}
/**
 * 获取资产名称下拉列表数据
 * @param params {Object}{ supplier: String, name: String }
 */
export const getNameList = (params) => {
  return request('/asset/assethardsoftlib/pullDown/name', { params })
}
/**
 * 获取资产版本下拉列表数据
 * @param params {Object}{ supplier: String, name: String, version: String }
 */
export const getVersionList = (params) => {
  return request('/asset/assethardsoftlib/pullDown/version', { params })
}
/**
 * 获取所有组件列表
 * @param params {Object}{ supplier: String, productName : String }
 */
export const getSubassemblyList = (params) => {
  return request('/asset/assetassembly/query/enableList', { params })
}
/**
 * 获取资产关联的软件列表， 不分页显示
 * @param params {Object}{
 *                        primaryKey: String, // 资产ID
 *                        isBatch: Boolean // 是否批量
 *                        }
 */
export const getSoftList = (params) => {
  return request('/asset/softwarerelation/query/installedList', { params })
}
/**
 * 获取资产关联的软件列表,分页显示
 * @param params {Object}{
 *                        primaryKey: String, // 资产ID
 *                        currentPage: Number,
 *                        pageSize: Number,
 *                        }
 */
export const getSoftPageList = (params) => {
  return request('/asset/softwarerelation/query/installedPageList', { params })
}
/**
 * 获取资产的上一步的驳回信息
 * @param params {Object}{ ids: Array }
 */
export const getPreNoteInfo = (params) => {
  return request('/asset/changeLog/preNote/batch', { params })
}
/**
 * 验证资产编号是否已经存在
 * @param params {Object}{ number: String }
 */
export const CheckRepeatNumber = (params) => {
  return request('/asset/CheckRepeatNumber', { params })
}
/**
 * 验证MAC是否已经存在
 * @param params {Object}{ mac: String }
 */
export const CheckRepeatMAC = (params) => {
  return request('/asset/CheckRepeatMAC', { params })
}
/**
 * 获取资产动态数据，后台不分页，前端自己分页
 * @param params {Object}{ primaryKey: String }
 */
export const getAssetLog = (params) => {
  return request('/asset/changeLog/query', { params })
}
/**
 * 获取资产已经关联的装机模板信息
 * @param params {Object}{ primaryKey: String }
 */
export const getAssetInstallTemplateInfo = (params) => {
  console.log('555')
  return request('/asset/assetinstalltemplate/query/relationInfo', { params })
}
/**
 * 获取资产的漏洞列表
 * @param params {Object}{
 *                  assetId : String 资产ID
 *                  beginTime: TimeNumber
 *                  endTime : TimeNumber
 *                  currentPage  : Number
 *                  pageSize  : Number
 *                  history   : Boolean 是否是历史数据，不是历史就为当前
 *                  threatLevel   : String 危害等级
 *                  vulName   : String 漏洞名称
 *                  vulNo   : String 漏洞编号
 *                  status   : String 漏洞处理状态
 * }
 */
export const getAssetValList = (params) => {
  return request('/vul/dispose/vulByAssetId/list', { params })
}
/**
 * 获取资产的补丁列表
 * @param params {Object}{
 *                  assetId : String 资产ID
 *                  beginTime: TimeNumber
 *                  endTime : TimeNumber
 *                  currentPage  : Number
 *                  pageSize  : Number
 *                  history   : Boolean 是否是历史数据，不是历史就为当前
 *                  level   : String 危害等级
 *                  patchName   : String 漏洞名称
 *                  patchNo   : String 漏洞编号
 *                  status   : String 补丁处理状态
 * }
 */
export const getAssetPatchList = (params) => {
  return request('/patch/dispose/patchByAsset/list', { params })
}
/**
 * 通过cpe的版本查询出所关联的组件
 * @param params {Object}{
 *                  primaryKey : 版本的businessId
 * }
 */
export const getCPEAssemblyList = (params) => {
  return request('/asset/assetassemblylib/query/assembly/id', { params })
}
/**
 * 操作前验证资产的状态
 * @param params {Object} {
 *    assetId： { String } 资产ID
 *    operation: {Number} 1: 变更, 2: 登记, 3:不予登记, 4: 拟退役
 * }
 */
export const verificationAssetStatus = (params) => {
  return request('/asset/query/assetStatus', { params })
}
