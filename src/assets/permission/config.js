
export default {
  config: 'config', //配置管理
  configBaseitem: 'config:baseitem',  // 基准项管理
  baseitemCheckin: 'config:baseitem:checkin', // 基准项登记
  baseitemUpdate: 'config:baseitem:update', // 基准项变更
  baseitemView: 'config:baseitem:view', // 基准项查看
  configBasetemplate: 'config:basetemplate',  // 基准模板管理
  //当前模板
  currentBasetemplate: 'config:basetemplate:current', //当前模板
  newBasetemplate: 'config:basetemplate:current:new',  // 新建基准模板
  editBasetemplate: 'config:basetemplate:current:edit',  // 编辑基准模板
  updownBasetemplate: 'config:basetemplate:current:updown',  // 禁用、启用基准模板
  viewBasetemplate: 'config:basetemplate:current:view', // 查看基准模板
  //历史模板
  historyBasetemplate: 'config:basetemplate:history', //历史模板
  updownHistoryBasetemplate: 'config:basetemplate:history:updown',  // 禁用、启用基准模板
  viewHistoryBasetemplate: 'config:basetemplate:history:view', // 查看基准模板

  //模板扫描
  scanBasetemplate: 'config:basetemplate:scan', //模板扫描
  newScanBasetemplate: 'config:basetemplate:scan:new',  // 新建
  viewScanBasetemplate: 'config:basetemplate:scan:view', // 查看

  exportBasetemplate: 'config:basetemplate:export', //下载模板
  viewBaseConfig: 'config:base:view',    // 查看基准配置
  baseConfig: 'config:base:config',   // 基准配置
  viewBaseInspect: 'config:inspect:view',    // 查看基准核查
  viewBaseFixed: 'config:fixed:view',    // 查看基准加固
  baseCheck: 'config:inspect:verify',   // 基准核查管理核查
  baseCheckHandle: 'config:inspect:handle',   // 基准核查管理处理
  baseFixed: 'config:fixed:fixed',   // 基准加固管理加固
  baseFixedHandle: 'config:fixed:handle'   // 基准加固管理处理
}
