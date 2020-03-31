import request from '@/utils/request'

export default {
  //获取操作日志列表
  getLogHandleList: (params)=>
    request('/log/query/operation/logs', { params: params } )
  ,
  //根据ID查询操作日志详情
  getLogHandleListId: (params)=>
    request('/log/query/operation/log/id', { params: params })
  ,
  //删除审计报告上传文件
  deleteAuditReportFile: (params)=>
    request('/log/delete/file?fileUrl', { method: 'post', params: params })
  ,
  //操作日志 审计报告提交
  postAuditReport: (params)=>
    request('/log/audit/operation/log', { method: 'post', params: params })
  ,
  //根据ID查询操作日志的审计信息
  getLogHandleListAuditId: (params)=>
    request('/log/query/operation/log/audits/log/id', { params: params })
  ,
  //系统日志查询
  getSystemLogList: (params)=>
    request('/log/query/system/logs', { params: params })
  ,
  //日志审计查询
  getAuditLogList: (params)=>
    request('/log/query/audit/records', { params: params })
  ,
  //日志审计详情查询
  getAuditLogDetails: (params)=>
    request('/log/query/audit/record/id', { params: params })
  ,
  //设备运行日志（未归档）
  getDeviceLogList: (params)=>
    request('/device/log/query', { params: params })
  ,
  // 设备运行操作系统
  allSystemTree: (params)=>
    request('/device/log/system/item', { params: params })
  ,
  // 设备运行导入日志类型
  logTypeList: (params)=>
    request('/device/log/import/system/item', { params: params })
}
