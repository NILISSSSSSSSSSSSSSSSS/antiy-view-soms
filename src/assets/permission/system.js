export default {
  /**系统管理**/
  sys: 'sys', //系统管理
  //用户管理
  sysUser: 'sys:user',  // 用户管理
  sysUserCheckin: 'sys:user:checkin', //登记
  sysUserUpdate: 'sys:user:update', //变更
  sysUserUpdownunlock: 'sys:user:updownunlock', //禁用/启用/解锁
  sysUserResetpwd: 'sys:user:resetpwd', //重置密码
  sysUserView: 'sys:user:view', //查看详情

  //角色权限管理
  sysRolePermission: 'sys:role:permission',	//角色权限管理
  sysRoleCheckin: 'sys:role:permission:checkin',	//登记
  sysRoleUpdate: 'sys:role:permission:update',	//变更
  sysRoleView: 'sys:role:permission:view',	//查看详情

  //区域管理
  sysArea: 'sys:area',	//区域管理
  sysAreaAdd: 'sys:area:add',	//添加
  sysAreaDelete: 'sys:area:delete',	//删除
  sysAreaEdit: 'sys:area:edit',	//修改
  sysAreaSave: 'sys:area:save',	//保存

  //消息管理
  sysMsg: 'sys:msg', //消息管理
  sysMsgFlag: 'sys:msg:flag',	//标为已读
  sysMsgBatchdelete: 'sys:msg:batchdelete',	//批量删除
  sysMsgDelete: 'sys:msg:delete',	//删除
  sysMonitor: 'sys:monitor',	//运行监测
  sysMonitorOverview: 'sys:monitor:overview',	//系统运行监测概览
  sysMonitorOverviewUpdown: 'sys:monitor:overview:updown',	//启用/禁用
  sysMonitorRule: 'sys:monitor:rule',	//系统运行监测规则
  sysMonitorRuleUpdown: 'sys:monitor:rule:updown', //启用/禁用
  sysMonitorRuleUpdownUpdate: 'sys:monitor:rule:updown:update',	//变更

  /*系统设置*/
  sysSet: 'sys:set', //系统设置
  //自定义流程角色
  sysSetCustomflowrole: 'sys:set:customflowrole',	//自定义流程角色
  sysSetCustomflowroleEdit: 'sys:set:customflowrole:edit',	//编辑
  sysUpgradeSet: 'sys:set:upgrade', // 升级设置
  sysUpgradeRecord: 'sys:set:upgrade:record', // 升级记录
  sysSetUpgradeOnline: 'sys:set:upgrade:online',	//在线升级配置
  sysSetUpgradeOffline: 'sys:set:upgrade:offline',	//离线升级
  sysSetUpgradeOfflineImport: 'sys:set:upgrade:offline:import',	//导入

  //端口管理
  sysSetPort: 'sys:set:port',	//端口管理
  sysSetPortNew: 'sys:set:port:new',	//新建端口组
  sysSetPortEdit: 'sys:set:port:edit',	//编辑
  sysSetPortDelete: 'sys:set:port:delete', //删除

  //网段管理
  sysSetNetsegment: 'sys:set:netsegment',	//网段管理
  sysSetNetsegmentNew: 'sys:set:netsegment:new',	//新建网段
  sysSetNetsegmentEdit: 'sys:set:netsegment:edit',	//编辑
  sysSetNetsegmentDelete: 'sys:set:netsegment:delete',	//删除

  // 系统参数
  sysSetSysparam: 'sys:set:sysparam',	//系统参数

  // 定时任务
  sysTimer: 'sys:timer',	//定时任务
  sysTimerCheckin: 'sys:timer:checkin',	//登记任务
  sysTimerUpdown: 'sys:timer:updown',	//启动/挂起
  sysTimerEdit: 'sys:timer:edit',	//编辑
  sysTimerViewreport: 'sys:timer:viewreport',	//查看报告

  sysStrategy: 'sys:set:strategeconfig'
}