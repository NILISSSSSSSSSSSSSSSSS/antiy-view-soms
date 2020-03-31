import request from '@/utils/request'
//安全设备列表
export function equipmentList (params) {
  return request('/ops/portal/osafeeqpt/query/list', { method: 'post', params: params })
}
// 纳入管理
export function intoManagement (params) {
  return request('/ops/portal/osafeeqpt/management/asset', { method: 'post', params: params })
}
// 修改协议
export function updateProtocol (params) {
  return request('/ops/portal/osafeeqpt/update/protocol', { method: 'post', params: params })
}
// 修改密码
export function modifyPwd (params) {
  return request('/ops/portal/osafeeqpt/update/password', { method: 'post', params: params })
}
// 踢出管理
export function outManagement (params) {
  return request('/ops/portal/osafeeqpt/remove/asset', { method: 'post', params: params })
}
// 运维审计列表
export function auditQueryList (params) {
  return request('/ops/session/query/list', { method: 'post', params: params })
}
// 查看会话详情
export function getSessionDetail (params) {
  return request('/ops/session/details', { method: 'post', params: params })
}
// 登录日志列表
export function loginlogList (params) {
  return request('/ops/loginlog/query/list', { method: 'post', params: params })
}
// 操作日志列表
export function operatelogList (params) {
  return request('/ops/optlog/query/list', { method: 'post', params: params })
}

// 用户列表
export function userList (params) {
  return request('/ops/session/pullDown/user', { method: 'post', params: params })
}

// 跳转luna前，queryUserId
export function queryUserId (params) {
  return request('/ops/users/queryUserId', { method: 'post', params: params })
}

// 更新审计状态
export function updateAuditStatus (params) {
  return request('/ops/session/update/auditStatus', { method: 'post', params: params })
}

// ==========安全运维门户的厂商、名称、版本============
// 获取厂商列表
export function getDefendSupplier (params) {
  return request('/ops/portal/osafeeqpt/query/manufacturerList', { method: 'post', params: params })
}
// 获取名称列表
export function getDefendName (params) {
  return request('/ops/portal/osafeeqpt/query/nameList', { method: 'post', params: params })
}
// 获取版本列表
export function getDefendVersion (params) {
  return request('/ops/portal/osafeeqpt/query/versionList', { method: 'post', params: params })
}