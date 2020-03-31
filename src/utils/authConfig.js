
export default {

  //资产
  assetFind: 'asset:info:unknow:find',  // 资产探测
  assetRegistration: 'asset:info:list:checkin', // 资产登记
  assetImpl: 'asset:info:list:impl',  // 模板实施
  assetValid: 'asset:info:list:valid', // 结果验证
  assetNetworking: 'asset:info:list:networking', //入网实施
  assetCheck: 'asset:info:list:check',  // 安全检查
  assetTLsee: 'asset:link:set',  // 通联设置 查看
  assetUpdate: 'asset:identity:person:update',  // 变更

  assetChange: 'asset:info:list:change',  // 安全整改
  assetNty: 'asset:info:list:nty',  // 退役发起
  assetTy: 'asset:info:list:ty',  // 退役实施

  /******配置管理**************/

  configNew: 'config:basetemplate:new', //新建模板
  configConfig: 'config:base:config', //配置基准
  configVerify: 'config:inspect:verify', //配置核查
  configFixed: 'config:fixed:fixed', //配置加固
  configEdit: 'config:basetemplate:edit', //编辑模板

  /***********漏洞管理**************/
  vulRegistration: 'vul:patch:vul:burst:checkin',  //漏洞登记
  vulBurstHandle: 'vul:patch:vul:burst:handle',  //突发漏洞处置

  vulHandle: 'vul:patch:vul:info:handle',  //漏洞处置
  // vulRegistration: 'vul:patch:vul:burst:checkin',  //漏洞修复  后台说的用处置的权限

  /**********补丁管理************/
  patchRegistration: 'vul:patch:patch:burst:checkin', //补丁登记
  patchHandle: 'vul:patch:patch:info:handle', //补丁处置
  patchInstall: 'vul:patch:patch:install:install' //补丁安装
}
