import request from '@u/request'
//漏洞处置管理(漏洞维度/突发漏洞)列表
export function queryVul (params){
  return request('/vul/handle/vul/info', { method: 'post', params: params })
}
//漏洞处置管理资产维度列表
export function queryAsset (params){
  return request('/vul/handle/asset/info', { method: 'post', params: params })
}
//漏洞知识管理列表
export function queryVulninfoList (params){
  return request('/vul/info/list', { method: 'post', params: params })
}
//突发漏洞管理列表
export function querySuddenList (params){
  return request('/vul/info/sudden/list', { method: 'post', params: params })
}
//漏洞信息管理列表
export function vulHandleInfoList (params){
  return request('/vul/handle/vul/info/list', { method: 'post', params: params })
}
//删除漏洞
export function deleteVul (params){
  return request('/vul/info/delete', { method: 'post', params: params })
}
//删除漏洞端口
export function deleteVulnport (params){
  return request('/vul/port/batch/delete', { method: 'post', params: params })
}
//保存漏洞端口
export function saveVulnport (params){
  return request('/vul/port/save', { method: 'post', params: params })
}
//查询漏洞端口列表
export function queryVulnport (params){
  return request('/vul/port/list', { method: 'post', params: params })
}
//查询漏洞服务列表
export function queryVulnserver (params){
  return request('/vul/server/all', { method: 'post', params: params })
}
//新增漏洞服务
export function addVulnserver (params){
  return request('/vul/server/batch/save', { method: 'post', params: params })
}
//删除漏洞服务
export function deleteVulnserver (params){
  return request('/vul/server/batch/delete', { method: 'post', params: params })
}
//资产服务查询
export function getAssetsysservicelib (params) {
  return request('/asset/assetsysservicelib/query/list', { method: 'post', params: params })
}
//漏洞关联的链接列表
export function getBugLinkList (params) {
  return request('/vul/reference/queryByVulnId', { method: 'post', params: params } )
}
//新增链接
export function AddBugLink (params) {
  return request('/vul/reference/save', { method: 'post', params: params } )
}
//删除链接映射
export function deleteBugLink (params) {
  return request('/vul/reference/batch/delete', { method: 'post', params: params } )
}
//查询方案
export function getBugPlanList (params) {
  return request('/vul/solution/all', { method: 'post', params: params } )
}
//删除方案
export function deleteBugPlan (params) {
  return request('/vul/solution/delete/id', { method: 'post', params: params } )
}
//新增方案
export function AddBugPlan (params) {
  return request('/vul/solution/save', { method: 'post', params: params } )
}
//修改方案
export function editBugPlan (params) {
  return request('/vul/solution/batch/update', { method: 'post', params: params } )
}
//漏洞解决方案：查询补丁
export function bugQueryPatch (params) {
  return request('/patch/info/list', { method: 'post', params: params } )
}
//漏洞解决方案：删除补丁
export function bugQueryDelete (params) {
  return request('/vul/patch/delete/id', { method: 'post', params: params } )
}
//漏洞解决方案：保存补丁
export function addPatchQuery (params) {
  return request('/vul/patch/batch/save', { method: 'post', params: params } )
}
//漏洞解决方案：分页查询关联补丁
export function queryBugPatchPage (params) {
  return request('/vul/patch/list', { method: 'post', params: params } )
}
//漏洞解决方案：全量查询关联补丁
export function queryBugPatchPageAll (params) {
  return request('/vul/patch/all', { method: 'post', params: params } )
}
//漏洞编辑
export function editVulnInfo (params) {
  return request('/vul/info/edit', { method: 'post', params: params } )
}
//漏洞详情
export function vulnDetail (params) {
  return request('/vul/info/detail', { method: 'post', params: params } )
}
//漏洞类型列表
export function getListVulType (params) {
  return request('/vul/info/vulType/list', { method: 'post', params: params } )
}
//突发漏洞登记
export function vulnRegister (params) {
  return request('/vul/info/save', { method: 'post', params: params } )
}
//获取品类型号
export function getVulnCpe (params) {
  return request('/asset/assethardsoftlib/query/list', { method: 'post', params: params } )
}
//保存品类型号
export function saveVulnCpe (params) {
  return request('/vuln/vulnCpe/save', { method: 'post', params: params } )
}
//删除品类型号
export function deleteVulnCpe (params) {
  return request('/vuln/vulnCpe/delete', { method: 'post', params: params } )
}
//突发漏洞扫描
export function scanBySingleVul (params) {
  return request('/vul/scanner/bySingleVul', { method: 'post', params: params } )
}
//资产维度修复：资产详情
export function assetAndSuggestions (params) {
  return request('/vul/asset/info', { method: 'post', params: params } )
}
//资产维度修复：修复建议
export function adviseByasset (params) {
  return request('/vul/suggestion/asset/query', { method: 'post', params: params } )
}
//资产维度修复：漏洞列表
export function getVulOnAsset (params) {
  return request('/vul/vulOnAsset/list', { method: 'post', params: params } )
}
//资产维度修复：提交漏洞配置
export function vulAndPatchConfig (params) {
  return request('/vul/vulAndPatch/config', { method: 'post', params: params } )
}
//资产维度修复：提交漏洞自动修复
export function vulAndPatchRepairAuto (params) {
  return request('/vul/repair', { method: 'post', params: params } )
}
//资产维度修复：提交漏洞退回
export function vulAndPatchRollback (params) {
  return request('/vul/rollback', { method: 'post', params: params } )
}
//漏洞维度修复：资产列表
export function getAssetAndVulList (params) {
  return request('/vul/assetOnVul/list', { method: 'post', params: params })
}
//漏洞维度修复：漏洞修复建议
export function adviseByBug (params) {
  return request('/vul/suggestion/query', { method: 'post', params: params })
}
//漏洞信息管理、突发漏洞处置：获取关联的资产列表
export function listAssetByVulId (params) {
  return request('/vul/dispose/assetByVulId/list', { method: 'post', params: params })
}
//漏洞信息管理、突发漏洞处置：忽略
export function vulUpdateStatus (params) {
  return request('/vul/asset/ignore', { method: 'post', params: params })
}
//漏洞信息管理：外层批量忽略
export function outUpdateStatus (params) {
  return request('/vul/dispose/outUpdateStatus', { method: 'post', params: params })
}
//漏洞信息管理：外层批量提交
export function outSubmit (params) {
  return request('/vul/dispose/outSubmit', { method: 'post', params: params })
}
//漏洞处置管理：资产维度 外层批量修复
export function outBugRepairAsset (params) {
  return request('/vul/handle/repair/asset', { method: 'post', params: params })
}
//漏洞处置管理：漏洞、突发漏洞维度 外层批量修复
export function outBugRepairBug (params) {
  return request('/vul/handle/repair/vul', { method: 'post', params: params })
}
//漏洞信息管理、突发漏洞处置：提交运维人员
export function vulRepaireSubmit (params) {
  return request('/vul/dispose/submit', { method: 'post', params: params })
}
//漏洞信息管理、突发漏洞处置：忽略任务
export function innerUpdateStatus (params) {
  return request('/vul/dispose/updateStatus', { method: 'post', params: params })
}
//漏洞后台扫描
export function scannerBySingleVul (params) {
  return request('/vul/scanner/bySingleVul', { method: 'post', params: params })
}
//漏洞扫描进度查询
export function scannerBugprogress (params) {
  return request('/vul/scanner/bySingleVul', { method: 'post', params: params })
}
//漏洞获取人员
export function getBugUsers (params) {
  return request('/user/workflow/listRy', { method: 'post', params: params })
}
//业务流程查询接口
export function claimTaskBatch (params) {
  return request('/activiti/claimTaskBatch', { method: 'post', params: params })
}
//业务流程查询退回原因
export function findHisFormDataByTaskDefKey (params) {
  return request('/activiti/findHisFormDataByTaskDefKey', { method: 'post', params: params })
}
//业务流程查询工作台
export function findWaitingTaskNums (params) {
  return request('/activiti/findWaitingTaskNums', { method: 'post', params: params })
}
//工作台漏洞处置数量
export function workbenchVulHandle (params) {
  return request('/vul/workbench/vulHandle/count ', { method: 'post', params: params })
}
//内层批量自动修复
export function bugAutoRepair (params) {
  return request('/vul/repair/auto', { method: 'post', params: params })
}
//内层批量人工修复
export function bugMananulRepair (params) {
  return request('/vul/repair/artificial', { method: 'post', params: params })
}
//内层批量忽略
export function bugNeglect (params) {
  return request('/vul/asset/ignore', { method: 'post', params: params })
}
//内层入网
export function bugInnerInternet (params) {
  return request('/vul/repair/auto', { method: 'post', params: params })
}
//内层查询是否入网
export function isEntryOperation (params) {
  return request('/asset/entryControl/query/entryOperation', { method: 'post', params: params })
}
