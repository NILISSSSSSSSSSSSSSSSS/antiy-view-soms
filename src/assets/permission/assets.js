
// assetsPermission
export default {

  //菜单
  ASSET: 'asset',  // 资产管理
  ASSET_GL: 'asset:overview',  // 概览
  ASSET_ZJMB: 'asset:install:template',  // 装机模板管理
  ASSET_INFO: 'asset:info',  // 资产信息管理
  ASSET_ZCZ: 'asset:group',  // 资产组管理
  ASSET_SF: 'asset:identity',  // 身份管理
  ASSET_ZZJG: 'asset:identity:organ',  // 组织结构管理
  ASSET_RGSF: 'asset:identity:person',  // 人员身份管理
  ASSET_TP: 'asset:topology',  // 拓扑管理
  ASSET_WL: 'asset:topology:physical',  // 物理拓扑
  ASSET_TL: 'asset:link',  // 通联管理
  ASSET_ZT: 'asset:admittance',  // 准入管理

  //资产组
  ASSET_ZCZ_DJ: 'asset:group:checkin',  //登记
  ASSET_ZCZ_BJ: 'asset:group:update',  //变更
  ASSET_ZCZ_ZX: 'asset:group:destroy',  //注销
  ASSET_ZCZ_CK: 'asset:group:view',  //查看

  //组织结构
  ASSET_ZZJG_ADD: 'asset:identity:organ:add',  //添加
  ASSET_ZZJG_DEL: 'asset:identity:organ:delete',  //删除
  ASSET_ZZJG_EDIT: 'asset:identity:organ:edit',  //修改
  ASSET_ZZJG_SAVE: 'asset:identity:organ:save',  //保存

  //人员身份管理
  ASSET_RYSF_DJ: 'asset:identity:person:checkin',  //登记
  ASSET_RYSF_BJ: 'asset:identity:person:update',  //变更
  ASSET_RYSF_ZX: 'asset:identity:person:destroy',  //注销
  ASSET_RYSF_CK: 'asset:identity:person:view',  //查看详情

  //通联管理
  ASSET_TL_SEE: 'asset:link:set',  // 通联设置
  ASSET_TL_SET: 'asset:link:set:setting',  //通联设置
  ASSET_TL_CK: 'asset:link:set:view',  //查看

  //准入管理
  ASSET_ZR_EXPORT: 'asset:admittance:export',  // 导出
  ASSET_ZR_DISA: 'asset:admittance:disable', // 禁止
  ASSET_ZR_ALLOW: 'asset:admittance:allow',  //允许

  //资产
  ASSET_INFO_LIST: 'asset:info:list',  // 资产列表

  ASSET_INFO_VIEW: 'asset:info:list:view', // 资产查看
  ASSET_EXPORT: 'asset:info:list:export',  //导出

  ASSET_IMPORT: 'asset:info:list:import',  //导入
  ASSET_DJ: 'asset:info:list:checkin',  //资产登记
  ASSET_UPDATE: 'asset:info:list:update',  // 变更
  ASSET_MBXZ: 'asset:info:list:templatedownload', // 模板下载
  ASSET_GLRJ: 'asset:info:list:glrj',  //关联软件
  ASSET_BYDJ: 'asset:info:list:bydj',  //不予登记
  ASSET_IMPL: 'asset:info:list:impl',  // 实施
  ASSET_VALID: 'asset:info:list:valid', // 验证
  ASSET_NETWORKING: 'asset:info:list:networking', //入网
  ASSET_CHECK: 'asset:info:list:check',  // 安全检查
  ASSET_CHANGE: 'asset:info:list:change',  //整改
  ASSET_NTY: 'asset:info:list:nty',  // 拟退役
  ASSET_TY: 'asset:info:list:ty',  // 退役

  /********未知资产**********/
  ASSET_UNKNOWN_INFO: 'asset:info:unknow',  // 未知资产
  ASSET_UNKNOWN_FIND: 'asset:info:unknow:find', // 未知资产探测

  // 装机模板
  ASSET_ZJMB_ADD: 'asset:install:template:create',	//创建
  ASSET_ZJMB_DEL: 'asset:install:template:delete',	//删除
  ASSET_ZJMB_EDIT: 'asset:install:template:edit',	//编辑
  ASSET_ZJMB_VIEW: 'asset:install:template:view',	//查看
  ASSET_ZJMB_UPDOWN: 'asset:install:template:updown',	//启用/禁用
  ASSET_ZJMB_CHECK: 'asset:install:template:check'	//审核
}
