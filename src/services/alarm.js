import request from '@/utils/request'

export default {
  //告警规则 list批量查询
  getAlarmRuleList: (params)=>
    request('/alarm/rule/query/alarm/rules', { params: params } )
  ,
  //告警规则 变更级别
  postAlarmRuleListChange: (params)=>
    request('/alarm/rule/change/alarm/level', { method: 'post', params: params } )
  ,
  //告警规则 变更级别
  postAlarmRuleListReset: (params)=>
    request('/alarm/rule/restore/default/settings', { method: 'post', params: params } )
  ,
  // 资产监控规则（批量查询）
  getAssetMonitorRuleList: (params)=>
    request('/asset/monitorrule/query/list',  { params: params } )
  ,
  // 通过ID查询
  queryruleinfo: (params)=>
    request('/asset/monitorrule/query/rule/info',  { params: params } )
  ,
  // 启用/禁用
  monitorRuleStatus: (params)=>
    request('/asset/monitorrule/edit/rule/status',  {  method: 'post', params: params } )
  ,
  //新建资产监控规则
  addAssetMonitorRule: (params)=>
    request('/asset/monitorrule/save/single',  {  method: 'post', params: params } )
  ,
  //编辑资产监控规则
  editAssetMonitorRule: (params)=>
    request('/asset/monitorrule/update/single',  {  method: 'post', params: params } )
  ,
  // 删除资产监控规则
  deleteMonitorRuleById: (params)=>
    request('/asset/monitorrule/delete/uniqueId',  {  method: 'post', params: params } )
  ,
  // 关联资产全量数据
  allAssetMonitorRulerelationList: (params)=>
    request('/asset/assetmonitorrulerelation/query/list',  {  method: 'post', params: params } )
  ,
  // 规则名称去重
  monitorRuleNameNoRepeat: (params)=>
    request('/asset/monitorrule/nameNoRepeat',  {  method: 'post', params: params } )
  ,
  //获取当前 告警list
  getAlarmManagerNowList: (params)=>
    request('/alarm/current/alarms', { params: params } )
  ,
  //获取历史 告警list
  getAlarmManagerHistoryList: (params)=>
    request('/alarm/history/alarms', { params: params } )
  ,
  //清除 当前告警
  deleteNowAlarm: (params)=>
    request('/alarm/current/clean/current/alarm', { method: 'post', params: params } )
  ,
  //批量清除 当前告警
  deleteNowAlarmList: (params)=>
    request('/alarm/current/batch/clean/current/alarms', { method: 'post', params: params } )
  ,
  // 更改 当前告警状态
  postNowAlarmStatus: (params)=>
    request('/alarm/current/modify/current/status', { method: 'post', params: params } )
  ,
  //批量更改 当前告警状态
  postNowAlarmStatusList: (params)=>
    request('/alarm/current/batch/modify/current/alarms/status', { method: 'post', params: params } )
  ,
  //变更 当前告警级别
  postNowAlarmChangeLevel: (params)=>
    request('/alarm/current/modify/current/content', { method: 'post', params: params } )
  ,
  //创建 当前告警工单
  postCreateWorkOrder: (params)=>
    request('/alarm/work/order/save/single', { method: 'post', params: params } )
  ,
  //当前告警 查看详情
  getNowAlarmDetails: (params)=>
    request('/alarm/current/query/current/id', { params: params } )
  ,
  //历史告警 查看详情
  getHistoryAlarmDetails: (params)=>
    request('/alarm/history/query/history/id', { params: params } )
  ,
  //通过告警ID 来查询变更记录
  getAlarmChangeRecord: (params)=>
    request('/alarm/change/records/query/change/records', { params: params } )
  ,
  //获取告警 详情界面的操作记录
  getAlarmDetailsRecord: (params)=>
    request('/alarm/change/records/query/operation/records', { params: params })
  ,
  //获取资产当前告警详情
  alarmDetailsAssetCurrent: (params)=>
    request('/alarm/current/query/asset/id', { params: params })
  ,
  //获取资产历史告警详情
  alarmDetailsAssetHistory: (params)=>
    request('/alarm/history/query/asset/id', { params: params })
  ,
  getAlarmPerSafetyList: (params)=>
    request('/alarm/rule/query/rules/safety/performance', { params: params })
  ,
  changeAlarmPerSafetyList: (params)=>
    request('/alarm/rule/change/rules/safety/performance', { method: 'post', params: params })
  ,
  getAlarmMenSafetyList: (params)=>
    request('/alarm/rule/query/rules/threat', { params: params })
  ,
  changeAlarmMenSafetyList: (params)=>
    request('/alarm/rule/change/rules/threat', { method: 'post', params: params })
}