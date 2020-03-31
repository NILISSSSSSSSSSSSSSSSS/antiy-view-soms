import request from '@u/request'
//获取漏洞信息列表(漏洞管理维度)
export function getVulManageList (params) {
  return request('/vul/vulnerability/vulManageList', { method: 'post', params: params })
}
//漏洞查询列表
export function getBugList (params) {
  return request('post', '/vuln/vulninfo/query/list', params )
}
//查询关联漏洞
export function getRelevanceBugList (params) {
  return request('post', '/vuln/vulninfo/query/nameList', params )
}
//漏洞删除
export function deleteBug (params) {
  return request('post', '/vuln/vulninfo/delete', params )
}
//漏洞详情
export function getBugDetail (params) {
  return request('post', '/vuln/vulninfo/query/detail', params )
}
//漏洞变更
export function bugChange (params) {
  return request('post', '/vuln/vulninfo/update', params )
}
//漏洞导入
export function bugImport (params) {
  return request('post', '/vuln/vulninfo/import', params )
}
//漏洞入库批量
export function bugInto (params) {
  return request('post', '/vuln/vulninfo/into', params )
}
//漏洞类型列表
export function listVulType (params) {
  return request('post', '/vuln/vulninfo/listVulType', params )
}
//服务列表
export function getServerList (params) {
  return request('post', '/vuln/vulnserver/query/list', params )
}
//漏洞关联的服务列表
export function getBugServerList (params) {
  return request('post', '/vuln/vulnserver/query/all', params )
}
//新增服务
export function AddBugServer (params) {
  return request('post', '/vuln/vulnserver/insert/batchEffactServerAdd', params )
}
//删除服务映射
export function deleteBugServer (params) {
  return request('post', '/vuln/vulnserver/delect/batch', params )
}
//漏洞关联的链接列表
export function getBugLinkList (params) {
  return request('post', '/vuln/vulnreference/query/vulnId', params )
}
//新增链接
export function AddBugLink (params) {
  return request('post', '/vuln/vulnreference/save/single', params )
}
//删除链接映射
export function deleteBugLink (params) {
  return request('post', '/vuln/vulnreference/delete/list', params )
}
//漏洞关联的端口列表
export function getBugPortList (params) {
  return request('post', '/vuln/vulnport/effectPortList', params )
}
//新增端口
export function addBugPort (params) {
  return request('post', '/vuln/vulnport/effectPortAdd', params )
}
//删除端口映射
export function deleteBugPort (params) {
  return request('post', '/vuln/vulnport/batchDelete', params )
}
//查询方案
export function getBugPlanList (params) {
  return request('post', '/vuln/vulnsolution/query/all', params )
}
//删除方案
export function deleteBugPlan (params) {
  return request('post', '/vuln/vulnsolution/delete/id', params )
}
//新增方案
export function AddBugPlan (params) {
  return request('post', '/vuln/vulnsolution/save/single', params )
}
//修改方案
export function editBugPlan (params) {
  return request('post', '/vuln/vulnsolution/update/single', params )
}
//漏洞解决方案：模糊查询补丁
export function bugQueryPatch (params) {
  return request('post', '/patch/query/nameList', params )
}
//漏洞解决方案：删除补丁
export function bugQueryDelete (params) {
  return request('post', '/vuln/vulnpatchmap/delete/id', params )
}
//漏洞解决方案：保存补丁
export function addPatchQuery (params) {
  return request('post', '/vuln/vulnpatchmap/save/batch', params )
}
//漏洞解决方案：查询关联补丁
export function queryBugPatchPage (params) {
  return request('post', '/vuln/vulnpatchmap/queryPatch/list', params )
}
//获取资产类型
export function getVulnCpe (params) {
  return request('post', '/vuln/vulnCpe/queryList', params )
}
//保存资产类型
export function saveVulnCpe (params) {
  return request('post', '/vuln/vulnCpe/save', params )
}
//删除资产类型
export function deleteVulnCpe (params) {
  return request('post', '/vuln/vulnCpe/delete', params )
}
//查看漏洞方案是否被删除
export function checkBugPlan (params) {
  return request('post', '/vuln/vulnsolution/query/status', params )
}
//查看漏洞是否被删除
export function checkBug (params) {
  return request('post', '/vuln/vulninfo/queryVulStatus', params )
}
//查看漏洞去重后的资产类型
export function getBugCategory (params) {
  return request('post', '/hardsoftlib/query/category', params )
}
//模糊查询漏洞编号
export function getfilterPatch (params) {
  return request('post', '/patch/edit/filter/pre/patch', params )
}

/*****test*****/
//漏洞修复跟踪（资产维度）通过资产Id查询关联的漏洞信息列表
export function vulListByAssetId (params){
  return request('/vul/query/listVulByAssetId', { method: 'post', params: params })
}
//获取漏洞信息列表(资产管理维度)
export function getAssetAndVulList (params) {
  return request('/vul/query/listAssetAndVul', { method: 'post', params: params })
}
//获取资产漏洞修复信息列表
export function getAssetVulStateList (params) {
  return request('/vul/query/listAssetOnVulRepair', { method: 'post', params: params })
}
//获取资产知识库补丁列表
export function getPatcList (params) {
  return request('post', '/patch/info/query', params)
}

