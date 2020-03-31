export default {
  SAFETY: 'safety',	//安全设备管理
  // SAFETY_GL: 'safety:overview',	//概览

  // 设备管理
  SAFETY_SB: 'safety:device',	//设备管理
  SAFETY_SB_DC: 'safety:device:export', //导出
  SAFETY_SB_BG: 'safety:device:update',	//变更
  SAFETY_SB_NR: 'safety:device:nrgl',	//纳入管理
  SAFETY_SB_TC: 'safety:device:tcgl',	//剔除管理
  SAFETY_SB_CK: 'safety:device:view',	//查看
  SAFETY_SB_VERSION: 'safety:device:version',	//版本升级
  SAFETY_SB_TZK: 'safety:device:tzkgl',	//特征库升级

  // 性能管理
  SAFETY_XN: 'safety:performace',	//性能管理
  SAFETY_XN_PER: 'safety:performace:per',	//性能管理
  SAFETY_XN_CK: 'safety:performace:per:view',	//查看详情
  SAFETY_XN_THRESHOLD: 'safety:performace:threshold',	//门限值设置
  SAFETY_XN_THRESHOLD_BG: 'safety:performace:threshold:update',	//变更

  //版本管理
  SAFETY_VERSION: 'safety:version',	//版本管理
  SAFETY_VERSION_DJ: 'safety:version:checkin',	//登记
  SAFETY_VERSION_ZX: 'safety:version:destroy',	//注销
  SAFETY_VERSION_BG: 'safety:version:update',	//变更
  SAFETY_VERSION_AZ: 'safety:version:install',	//安装
  SAFETY_VERSION_CK: 'safety:version:view',	//查看详情

  //特征库管理
  SAFETY_TZKGL: 'safety:tzkgl',	//特征库管理
  SAFETY_TZKGL_DJ: 'safety:tzkgl:checkin',	//登记
  SAFETY_TZKGL_ZX: 'safety:tzkgl:destroy',	//注销
  SAFETY_TZKGL_BG: 'safety:tzkgl:update',	//变更
  SAFETY_TZKGL_AZ: 'safety:tzkgl:install',	//安装
  SAFETY_TZKGL_CK: 'safety:tzkgl:view',	//查看详情

  //威胁事件
  SAFETY_WXSJ: 'safety:wxsj',	//威胁事件
  // 智甲
  SAFETY_WXSJ_ZJ: 'safety:wxsj:zjwx',	//智甲威胁
  SAFETY_WXSJ_ZJ_CKBG: 'safety:wxsj:zjwx:viewreport',	//查看报告
  SAFETY_WXSJ_ZJ_CK: 'safety:wxsj:zjwx:view',	//查看详情
  SAFETY_WXSJ_ZJ_XZ: 'safety:wxsj:zjwx:download',	//下载报告
  // 探海
  SAFETY_WXSJ_TH: 'safety:wxsj:thwx',	//探海威胁
  SAFETY_WXSJ_TH_CKBG: 'safety:wxsj:thwx:viewreport',	//查看报告
  SAFETY_WXSJ_TH_CK: 'safety:wxsj:thwx:view', //查看详情
  SAFETY_WXSJ_TH_XZ: 'safety:wxsj:thwx:download'	//下载报告
}
