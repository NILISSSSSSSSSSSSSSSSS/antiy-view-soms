import request from '@/utils/request'

export function login (params) {
  return request('/oauth/sys/login', { method: 'post', params: params })
}

export function getImageCode (params) {
  return request('/oauth/sys/code', { params: params })
}

export function resetPwd (params) {
  return request('/user/users/password', { method: 'post', params: params })
}

export function logout (params) {
  return request('/oauth/remove_token', { params: params })
}

export function getUserList (params) {
  return request('/user/users', { params: params })
}
//GET /api/v1/user/getAllUser
export function getAllUserList (params) {
  return request('/user/getAllUser', { params: params })
}
export function getUserByRoleCodeAndAreald (params) {
  return request('/user/getUsersByRoleCodeAndAreaId', { params: params })
}
//获取资产区域树
export function getTree () {
  return request('/user/area/tree', {})
}
//获取用户列表
export function getUsers (params) {
  return request('/user/users', { params: params })
}
//获取用户信息
export function getUserInfo (params) {
  return request('/user/getById', { params: params })
}
//禁用用户
export function forbiddenUser (params) {
  return request('/user/forbiddenUser', { method: 'post', params: params })
}
//重置密码
export function adminResetUserPassword (params) {
  return request('/user/adminResetUserPassword', { method: 'post', params: params })
}
//分页查询消息列表
export function getMessagePageList (params) {
  return request('/user/message/pageList', { params: params })
}
export function getMessagePageUpdate (params) {
  return request('/user/message/update', { method: 'post', params: params })
}
// 批量删除
export function messagePageDelete (params) {
  return request('/user/message/batchDeleteMessage', { method: 'post', params: params })
}

//获取设置项
export function getSetQueryList (params) {
  return request('/user/syssetting/queryList', { params: params })
}
//通过用户ID获取区域树
export function getAreasByUserId (params) {
  return request('/user/getAreasByUserId', { params: params })
}
//获取当前用户所在区域的下级所有用户
export function getUsersByAreaOfCurrentUser (params) {
  return request('/user/getUsersByAreaOfCurrentUser', { params: params })
}
export function getAllStatusUserInAreaOfCurrentUser (params) {
  return request('/user/getAllStatusUserInAreaOfCurrentUser', { params: params })
}
//查询当前用户关联的区域树
export function getLoginUserTree (params) {
  return request('/user/area/LoginUserTree', { params: params })
}
//查询所有角色信息
export function getAllRoles (params) {
  return request('/user/role/getAllRoles', { params: params })
}
//登记用户
export function userRegister (params) {
  return request('/user/users-anon/register', { method: 'post', params: params })
}
//变更用户
export function updateUsers (params) {
  return request('/user/updateUsers', { method: 'post', params: params })
}
//变更用户
export function enableUser (params) {
  return request('/user/enableUser', { method: 'post', params: params })
}
//分页查询角色列表
export function getRolePagelist (params) {
  return request('/user/role/pagelist', { params: params })
}
//查询角色详情
export function getRoleById (params) {
  return request('/user/role/getRoleById', { params: params })
}
//查询角色菜单权限集合
export function getMenusByRoleId (params) {
  return request('/user/role/getMenusByRoleId', { params: params })
}
//查询角色菜单权限集合
export function getMenuTree (params) {
  return request('/user/menuTree', { params: params })
}
//添加角色
export function saveRole (params) {
  return request('/user/role/save', { method: 'post', params: params })
}
//修改角色
export function updateRole (params) {
  return request('/user/role/update', { method: 'post', params: params })
}
//修改资产区域
export function updateSingle (params) {
  return request('/user/area/update/single', { method: 'post', params: params })
}
//新增资产区域
export function saveSingle (params) {
  return request('/user/area/save/single', { method: 'post', params: params })
}
//删除资产区域
export function deleteSingle (params) {
  return request('/user/area/delete/id', { method: 'post', params: params })
}
//迁移资产区域
export function migrateArea (params) {
  return request('/user/area/migrate', { method: 'post', params: params })
}
//合并资产区域
export function mergeArea (params) {
  return request('/user/area/merge', { method: 'post', params: params })
}
//查询单个监测项接口
export function sysMonitorItemQuery (params) {
  return request('/monitor/sysMonitorItem/query/id', { params: params })
}
//监测项列表查询
export function sysMonitorItemList (params) {
  return request('/monitor/sysMonitorItem/query/pageList', { params: params })
}
//监测项变更
export function sysMonitorItemUpdate (params) {
  return request('/monitor/sysMonitorItem/update', { method: 'post', params: params })
}
//概览启用停用
export function sysMonitorserverUpdate (params) {
  return request('/monitor/sysmonitorserver/update', { method: 'post', params: params })
}
//监测记录列表
export function sysMonitorRecordList (params) {
  return request('/monitor/sysMonitorRecord/query/pageList', { params: params })
}
//监测记录保存
export function sysMonitorRecordSave (params) {
  return request('/monitor/sysMonitorRecord/save', { method: 'post', params: params })
}
//监测服务器列表
export function sysmonitorserverList (params) {
  return request('/monitor/sysmonitorserver/query/pageList', { params: params })
}
//通过服务器id和监测类型查找相应的详情
export function monitorDetail (params) {
  return request('/monitor/sysmonitorserver/query/monitorDetail', { params: params })
}
//查询所有可监测项接口
export function sysMonitorItemQueryAll (params) {
  return request('/monitor/sysMonitorItem/query/all', { params: params })
}
//获取自定义流程列表
export function getworkflowList () {
  return request('/user/workflow/list')
}
//获取流程节点配置的角色相关的人员
export function getAllWorkflowRoles () {
  return request('/user/role/getAllRoles')
}
//获取流程节点配置的角色相关的人员
export function getWorkflowUser (params) {
  return request('/user/workflow/listRy', { params: params })
}
//更新流程节点角色
export function workflowUpdate (params) {
  return request('/user/workflow/update', { method: 'post', params: params })
}
//通过流程id获取指定流程节点信息
export function flowNodeList (params) {
  return request('/user/workflow/flowNodeList', { params: params })
}
//查询端口列表
export function getParamPortList (params) {
  return request('/discovery/port/group/query/list', { method: 'post', params: params })
}
//新增端口
export function addPortGroup (params) {
  return request('/discovery/port/group/add', { method: 'post', params: params })
}
//编辑端口
export function eitPortGroup (params) {
  return request('/discovery/port/group/edit', { method: 'post', params: params })
}
//删除端口
export function delPortGroup (params) {
  return request('/discovery/port/group/delete', { method: 'post', params: params })
}
//查询网段列表
export function getNetsegment (params) {
  return request('/discovery/netsegment/query/list', { method: 'post', params: params })
}
//新增网段
export function addNetsegment (params) {
  return request('/discovery/netsegment/add', { method: 'post', params: params })
}
//编辑网段
export function updateNetsegment (params) {
  return request('/discovery/netsegment/update', { method: 'post', params: params })
}
//删除网段
export function delNetsegment (params) {
  return request('/discovery/netsegment/delete', { method: 'post', params: params })
}

// 升级记录列表
export function getUpgradeRecordList (params) {
  return request('/routine/upgrade/record/query/record', { method: 'post', params: params })
}
// 查询服务器地址
export const queryServerSet = (params) => {
  return request('/routine/upgrade/task/queryMasterUrl', { method: 'post', params: params })
}
// 设置服务器地址
export const setServer = (params) => {
  return request('/routine/upgrade/task/modifyMasterUrl', { method: 'post', params: params })
}
// 查询定时任务
export const queryTaskInfo = (params) => {
  return request('/routine/upgrade/task/queryTaskInfo', { method: 'post', params: params })
}
// 设置定时任务
export const setTaskInfo = (params) => {
  return request('/routine/upgrade/task/modifyTaskInfo', { method: 'post', params: params })
}
// 下载：全库升级包判空
export const judgeAll = (params) => {
  return request('/routine/upgrade/master/judge/all', { method: 'post', params: params })
}
// 下载： 资产升级包判空
export const judgeAssets = (params) => {
  return request('/routine/upgrade/master/judge/asset', { method: 'post', params: params })
}
// 下载：配置升级包判空
export const judgeBaseline = (params) => {
  return request('/routine/upgrade/master/judge/baseline', { method: 'post', params: params })
}
// 下载：漏洞升级包判空
export const judgeVuln = (params) => {
  return request('/routine/upgrade/master/judge/vuln', { method: 'post', params: params })
}
// 下载：补丁升级包判空
export const judgePatch = (params) => {
  return request('/routine/upgrade/master/judge/patch', { method: 'post', params: params })
}
// 未读消息
export const getMsgcount = (params) => {
  return request('/user/message/getMsgcount', { method: 'post', params: params })
}
//修改密码策略
export const updatePasswoprd = (params)=>{
  return request ('/user/syssetting/updatePasswordStrategy', { method: 'post', params: params })
}
//更新用户策略
export function setSetUpdate (params) {
  return request('/user/syssetting/updateLockStrategy', { method: 'post', params: params })
}