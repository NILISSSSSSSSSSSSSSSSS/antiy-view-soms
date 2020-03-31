
import request from '@u/request'

export default {
  //首页 未安装补丁数量
  getHomePatchNumber: ()=>
    request('/vul/statistic/assetPatch')
  ,
  //首页 未修复漏洞资产数量
  getBugNumber: ()=>
    request('/vul/statistic/assetVul')
  ,
  //补丁安装管理 资产维度
  getInstallManageAssetList: (params)=>
    request('/patch/install/asset/list', { params })
  ,
  //补丁安装管理 资产维度查询补丁
  getInstallManageAssetListInfo: (params)=>
    request('/patch/assetRel/patchOnAsset/list', { params })
  ,
  //补丁安装管理 资产、补丁维度批量安装
  outPatchInstall: (params)=>
    request('/patch/install/batch/config', { params })
  ,
  //补丁安装管理 资产维度 查询资产详情
  getInstallManageAssetList_detail: (params)=>
    request('/vul/asset/info', { params })
  ,
  //补丁信息管理 批量忽略任务
  patchBatchIgnore: (params)=>
    request('/patch/dispose/batchIgnore', { params })
  ,
  //补丁信息管理 批量提交任务
  patchBatchSubmit: (params)=>
    request('/patch/dispose/batchSubmit', { params })
  ,
  //补丁信息管理 获取列表
  patchInfoList: (params)=>
    request('/patch/dispose/info/list', { params })
  ,
  //补丁安装管理 内层批量忽略任务
  patchInstallBatchIgnore: (params)=>
    request('/patch/install/batch/ignore', { params })
  ,
  //补丁安装管理 内层批量人工安装
  patchInstallBatchRepair: (params)=>
    request('/patch/install/repair/artificial', { params })
  ,
  //补丁安装管理 内层批量自动安装
  patchInstallAutoRepair: (params)=>
    request('/patch/install/batch/autoInstall', { params })
  ,
  //补丁安装管理 内层入网
  patchInstallInternet: (params)=>
    request('/patch/install/batch/repair', { params })
  ,
  //补丁安装管理 内层批量退回
  patchInstallRollback: (params)=>
    request('/patch/install/batch/rollback', { params })
  ,
  //补丁安装管理 补丁维度查询补丁
  getInstallManagePatchtList: (params)=>
    request('/patch/install/patch/list', { params })
  ,
  //补丁安装管理 补丁维度查询资产
  getInstallManagePatchtListInfo: (params)=>
    request('/patch/assetRel/assetOnPatch/list', { params })
  ,
  //补丁安装管理 补丁维度维度 查询补丁详情
  getInstallManagePatchList_detail: (params)=>
    request('/patch/info/patchAndSuggestion/query', { params })
  ,
  //应急补丁 登记
  postPatchRegister: (params)=>
    request('/patch/info/save', { params })
  ,
  //应急补丁 修改
  postPatchEdits: (params)=>
    request('/patch/info/edit', { params })
  ,
  //应急补丁 删除补丁
  deleteEmergencyPatch: (params)=>
    request('/patch/info/delete/id', { params })
  ,
  //应急补丁 删除补丁附件信息
  deletePatchRegisterAccessory: (params)=>
    request('/patch/entity/deleteByIds', { params })
  ,
  //应急补丁 获取补丁附件信息
  getPatchRegisterAccessory: (params)=>
    request('/patch/entity/onPatch/list', { params })
  ,
  //应急补丁 上传补丁附件信息
  upPatchRegisterAccessory: (params)=>
    request('/patch/file/upload', { params })
  ,
  //应急补丁 保存补丁附件信息
  savePatchRegisterAccessory: (params)=>
    request('/patch/entity/save/entity', { params })
  ,
  //应急补丁 新增附件信息 查询硬件平台列表
  savePatchRegisterAccessory_hardware: (params)=>
    request('/asset/assethardsoftlib/query/all', { params })
  ,
  //查询前置补丁
  getPrePatchList: (params)=>
    request('/patch/prePatch/list',  { params })
  ,
  //前置补丁 删除
  deletePatchPre: (params)=>
    request('/patch/prePatch/delete',  { params })
  ,
  //前置补丁 增加
  deletePatchAdd: (params)=>
    request('/patch/prePatch/add',  { params })
  ,
  //前置补丁 过滤
  deletePatchFilter: (params)=>
    request('/patch/prePatch/filter',  { params })
  ,
  //补丁关联服务 新增
  AddPatchServer: (params)=>
    request('/patch/server/add',  { params })
  ,
  //补丁关联服务 删除
  deletePatchServer: (params)=>
    request('/patch/server/delete',  { params })
  ,
  //补丁关联服务 查询
  getPatchServerList: (params)=>
    request('/patch/server/list',  { params })
  ,
  //补丁关联端口 新增
  addPatchPort: (params)=>
    request('/patch/port/add',  { params })
  ,
  //补丁关联端口 删除
  deletePatchPort: (params)=>
    request('/patch/port/delete',  { params })
  ,
  //补丁关联端口 查询
  getPatchPortList: (params)=>
    request('/patch/port/list',  { params })
  ,
  //补丁管理 漏洞
  getPatchBugList: (params)=>
    request('/patch/vuln/list',  { params })
  ,
  //补丁应急管理 补丁知识库管理 列表页
  getPatchKnowledgeLists: (params)=>
    request('/patch/info/manage/list',  { params })
  ,
  //获取补丁详情信息
  getPatchInfos: (params)=>
    request('/patch/info/detail',  { params })
  ,
  //获取补丁处置 补丁关联资产列表
  getPatchDisposeList: (params)=>
    request('/patch/dispose/assetByPatch/list',  { params })
  ,
  //补丁处置 该任务
  postPatchDisposeTask: (params)=>
    request('/patch/dispose/repair/submit',  { params })
  ,
  //补丁处置 忽略该任务
  ignorePatchDisposeTask: (params)=>
    request('/patch/dispose/updateStatus',  { params })
  ,
  //添加补丁弹窗列表
  templateAddPatch: (params)=>
    request('/patch/info/template/rel',  { params })
  ,
  //补丁安装 资产维度的安装建议
  getPatchInstallAsset_suggest: (params)=>
    request('/vul/suggestion/asset/query',  { params })
  ,
  //补丁安装 补丁维度的安装建议
  getPatchInstallPatch_suggest: (params)=>
    request('/vul/suggestion/patch/query',  { params })
  ,
  //工作台补丁处置数量
  workbenchPatchHandle: (params) =>
    request('/vul/workbench/patchHandle/count ', { method: 'post', params: params })
}