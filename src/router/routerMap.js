import WorkOrder from './module/workOrder'
import Timing from './module/timing'
import Inspection from './module/inspection'
import Asset from './module/Asset'
import bugManage from './module/BugManage'
import PatchManage from './module/PatchManage'
import System from './module/System'
import Log from './module/log'
import Knowledge from './module/Knowledge'
import Alarm from './module/Alarm'
import BaseSetting from './module/BaseSetting'
import Examine from './module/Examine'
import Safe from './module/Safe'
import IndexPage from './module/IndexPage'
import ReportForm from './module/ReportForm'
import PersonalCenter from './module/PersonalCenter'
import Workbench from './module/Workbench'
import Defend from './module/Defend'
import {
  configPermission,
  bugPermission,
  assetsPermission,
  systemPermission,
  patchPermission,
  logAlarmPermission,
  safetyPermission,
  routinePermission,
  reportPermission,
  defendPermission

} from '@a/permission'

export default [
  { path: '/personalcenter', component: PersonalCenter.PersonalCenter, tag: 'center' },
  { path: '/workbench', component: Workbench.Index, tag: 'workbench' },
  { path: '/indexPage', component: IndexPage.IndexPage, tag: 'shouye' },
  { path: '/backlog', component: IndexPage.IndexPageBacklog, tag: 'shouye' },
  { path: '/routine/workorder/add', component: WorkOrder.Add, tag: 'routine:work:dj' },
  { path: '/routine/workorder/:page', component: WorkOrder.List, tag: ['routine:work:db', 'routine:work:yb', 'routine:work:fq'] },
  { path: '/routine/workorder/:page/detail', component: WorkOrder.Detail, tag: ['routine:work:db:ckxq', 'routine:work:yb:ckxq', 'routine:work:fq:ckxq'] },
  { path: '/system/timing', component: Timing.List, tag: systemPermission.sysTimer },
  { path: '/system/timing/detail', component: Timing.Report, tag: systemPermission.sysTimerViewreport },
  { path: '/routine/inspection', component: Inspection.List, tag: routinePermission.routineInspection },
  { path: '/routine/inspection/detail', component: Inspection.Report, tag: routinePermission.routineInspectCheckin },

  { path: '/asset/overview', component: Asset.Overview, tag: assetsPermission.ASSET_GL },
  { path: '/asset/oa', component: Asset.Oa.Oa, tag: assetsPermission.ASSET_ZCZ_CK },
  { path: '/asset/oa/handle', component: Asset.Oa.Handle, tag: assetsPermission.ASSET_ZCZ_CK },
  { path: '/asset/borrow', component: Asset.Borrow.Borrow, tag: assetsPermission.ASSET_ZCZ_CK },
  { path: '/asset/borrow/details', component: Asset.Borrow.Details, tag: assetsPermission.ASSET_ZCZ_CK },
  { path: '/asset/borrow/history', component: Asset.Borrow.History, tag: assetsPermission.ASSET_ZCZ_CK },
  { path: '/asset/business/details', component: Asset.Business.Details, tag: assetsPermission.ASSET_ZCZ_CK },
  { path: '/asset/business', component: Asset.Business.Manager, tag: assetsPermission.ASSET_ZCZ_CK },
  { path: '/asset/business/register', component: Asset.Business.Register, tag: assetsPermission.ASSET_ZCZ_CK },
  { path: '/asset/business/update', component: Asset.Business.Register, tag: assetsPermission.ASSET_ZCZ_CK },
  { path: '/asset/group/details', component: Asset.Group.Details, tag: assetsPermission.ASSET_ZCZ_CK },
  { path: '/asset/group', component: Asset.Group.Manager, tag: assetsPermission.ASSET_ZCZ },
  { path: '/asset/group/register', component: Asset.Group.Register, tag: assetsPermission.ASSET_ZCZ_DJ },
  { path: '/asset/group/update', component: Asset.Group.Register, tag: assetsPermission.ASSET_ZCZ_BJ },
  { path: '/asset/personnel/identitymanager', component: Asset.Personnel.IdentityManager, tag: assetsPermission.ASSET_RGSF },
  { path: '/asset/key', component: Asset.Key.Key, tag: assetsPermission.ASSET_RGSF },
  { path: '/asset/personnel/organization', component: Asset.Personnel.Organization, tag: assetsPermission.ASSET_ZZJG },
  // { path: '/asset/retirement/scheme', component: Asset.Retirement.Scheme, tag: 'asset:hard:ty' },
  // { path: '/asset/retirement/implement', component: Asset.Retirement.Implement, tag: 'asset:hard:ty' },
  { path: '/asset/admittance', component: Asset.Admittance.AdmittanceManage, tag: assetsPermission.ASSET_ZT },
  { path: '/asset/admittance/hisAccessRecord', component: Asset.Admittance.HisAccessRecord, tag: assetsPermission.ASSET_ZT },
  { path: '/asset/relation', component: Asset.Relation.RelationList, tag: assetsPermission.ASSET_TL_SEE },
  { path: '/asset/relation/:page', component: Asset.Relation.RelationDetails, tag: assetsPermission.ASSET_TL_SET },
  { path: '/asset/manage', component: Asset.Manager.Main, tag: assetsPermission.ASSET_INFO },
  { path: '/asset/manage/register', component: Asset.AssetRegister, tag: assetsPermission.ASSET_DJ },
  { path: '/asset/manage/change', component: Asset.AssetChange, tag: assetsPermission.ASSET_UPDATE },
  { path: '/asset/manage/detail', component: Asset.AssetDetail, tag: assetsPermission.ASSET_INFO_VIEW },
  { path: '/asset/installtemplate', component: Asset.InstallTemplate.list, tag: assetsPermission.ASSET_ZJMB },
  { path: '/asset/installtemplate/create', component: Asset.InstallTemplate.Create, tag: assetsPermission.ASSET_ZJMB_ADD },
  { path: '/asset/installtemplate/edit', component: Asset.InstallTemplate.Create, tag: assetsPermission.ASSET_ZJMB_EDIT },
  { path: '/asset/installtemplate/detail', component: Asset.InstallTemplate.Detail, tag: assetsPermission.ASSET_ZJMB_VIEW },
  // { path: '/asset/category/modelmanage', component: Asset.Category.ModelManage, tag: 'asset:pinleixinghao' },
  { path: '/asset/topo/physical', component: Asset.Topo.Physical, tag: assetsPermission.ASSET_WL },

  { path: '/bugpatch/bugmanage/unexpected', component: bugManage.unexpectedList, tag: bugPermission.burstManage },
  { path: '/bugpatch/bugmanage/unexpected/dispose', component: bugManage.unexpectedDispose, tag: bugPermission.burstHandle },
  { path: '/bugpatch/bugmanage/unexpected/register', component: bugManage.register, tag: bugPermission.burstCheckin },
  { path: '/bugpatch/bugmanage/unexpected/change', component: bugManage.change, tag: bugPermission.burstEdit },
  { path: '/bugpatch/bugmanage/information', component: bugManage.informationList, tag: bugPermission.vulInfo },
  { path: '/bugpatch/bugmanage/information/detail', component: bugManage.informationDetail, tag: bugPermission.vulView },
  { path: '/bugpatch/bugmanage/unexpected/detail', component: bugManage.unexpectedDetail, tag: bugPermission.burstView },
  { path: '/bugpatch/bugmanage/dispose/detail', component: bugManage.disposeDetail, tag: bugPermission.vulHandleView },
  { path: '/bugpatch/bugmanage/knowledge/detail', component: bugManage.knowledgeDetail, tag: bugPermission.vulKnowView },
  { path: '/bugpatch/bugmanage/information/dispose', component: bugManage.informationDispose, tag: bugPermission.vulHandle },
  { path: '/bugpatch/bugmanage/dispose', component: bugManage.disposeList, tag: bugPermission.vulHandleManage },
  { path: '/bugpatch/bugmanage/dispose/disposebybug', component: bugManage.disposeByBug, tag: bugPermission.vulHandleManage },
  { path: '/bugpatch/bugmanage/dispose/disposeByUnexpected', component: bugManage.disposeByUnexpected, tag: bugPermission.vulHandleManage },
  { path: '/bugpatch/bugmanage/dispose/disposebyassets', component: bugManage.disposeByAssets, tag: bugPermission.vulHandleManage },
  { path: '/bugpatch/bugmanage/knowledge', component: bugManage.knowledgeList, tag: bugPermission.vulKnow },

  { path: '/bugpatch/patchmanage/emergency', component: PatchManage.emergency, tag: patchPermission.patchEmergencyManage },
  { path: '/bugpatch/patchmanage/emergency/register', component: PatchManage.emergencyRegister, tag: patchPermission.patchEmergencyManageReg },
  { path: '/bugpatch/patchmanage/emergency/detail', component: PatchManage.emergencyDetail, tag: patchPermission.patchEmergencyManageDetail },
  { path: '/bugpatch/patchmanage/emergency/edit', component: PatchManage.emergencyEdit, tag: patchPermission.patchEmergencyManageEdit },
  { path: '/bugpatch/patchmanage/information', component: PatchManage.information, tag: patchPermission.PatchInfoManage },
  { path: '/bugpatch/patchmanage/information/dispose', component: PatchManage.informationDispose, tag: patchPermission.PatchInfoManageDispose },
  { path: '/bugpatch/patchmanage/information/detail', component: PatchManage.informationDetail, tag: patchPermission.PatchInfoManageDetail },
  { path: '/bugpatch/patchmanage/install', component: PatchManage.install, tag: patchPermission.PatchInstallManage },
  { path: '/bugpatch/patchmanage/install/asset', component: PatchManage.installAssetInstall, tag: patchPermission.PatchInstallManageInstall },
  { path: '/bugpatch/patchmanage/install/patch', component: PatchManage.installPatchInstall, tag: patchPermission.PatchInstallManageInstall },
  { path: '/bugpatch/patchmanage/install/detail', component: PatchManage.installDetail, tag: patchPermission.PatchInstallManageDetail },
  { path: '/bugpatch/patchmanage/repository', component: PatchManage.repository, tag: patchPermission.PatchKnowManage },
  { path: '/bugpatch/patchmanage/repository/detail', component: PatchManage.repositoryDetail, tag: patchPermission.PatchKnowManageDetail },

  { path: '/system/userManage', component: System.UserList, tag: systemPermission.sysUser },
  { path: '/system/userManage/informationRegister', component: System.InformationRegister, tag: systemPermission.sysUserCheckin },
  { path: '/system/userManage/informationChange', component: System.InformationChange, tag: systemPermission.sysUserUpdate },
  { path: '/system/userManage/informationCheck', component: System.InformationCheck, tag: systemPermission.sysUserView },
  { path: '/system/assetManage', component: System.AssetManage, tag: systemPermission.sysArea },
  { path: '/system/roleManage/list', component: System.RoleList, tag: systemPermission.sysRolePermission },
  { path: '/system/roleManage/roleRegister', component: System.RoleRegister, tag: systemPermission.sysRoleCheckin },
  { path: '/system/MessageManage', component: System.MessageManage, tag: systemPermission.sysMsg },
  { path: '/system/setsystem/parameter', component: System.SetSystem, tag: systemPermission.sysUser },
  { path: '/system/monitor', component: System.Monitor, tag: systemPermission.sysMonitor },
  { path: '/system/setsystem/roleworkflow', component: System.RoleWorkflow, tag: systemPermission.sysSetCustomflowrole },
  { path: '/system/setsystem/roleworkflow/hardwareregister', component: System.WorkflowHardwareRegister, tag: systemPermission.sysSetCustomflowroleEdit },
  { path: '/system/setsystem/roleworkflow/hardwareback', component: System.WorkflowHardwareBack, tag: systemPermission.sysSetCustomflowroleEdit },
  { path: '/system/setsystem/roleworkflow/baseLine', component: System.WorkflowBaseLine, tag: systemPermission.sysSetCustomflowroleEdit },
  { path: '/system/setsystem/roleworkflow/assetinstall', component: System.WorkflowAssetInstall, tag: systemPermission.sysSetCustomflowroleEdit },
  { path: '/system/setsystem/roleworkflow/patchregister', component: System.WorkflowPatchRegister, tag: systemPermission.sysSetCustomflowroleEdit },
  { path: '/system/setsystem/roleworkflow/vulregister', component: System.WorkflowVulRegister, tag: systemPermission.sysSetCustomflowroleEdit },
  { path: '/system/setsystem/roleworkflow/scrap', component: System.WorkflowAssetScrap, tag: systemPermission.sysSetCustomflowroleEdit },
  { path: '/system/setsystem/upgrade/set', component: System.UpgradeSet, tag: systemPermission.sysUpgradeSet },
  { path: '/system/setsystem/upgrade/record', component: System.UpgradeRecord, tag: systemPermission.sysUpgradeRecord },
  { path: '/system/setsystem/port', component: System.PortManage, tag: systemPermission.sysSetPort },
  { path: '/system/setsystem/network', component: System.NetworkManage, tag: systemPermission.sysSetNetsegment },
  { path: '/system/setsystem/netmanage', component: System.NetTypeManage, tag: systemPermission.sysSetNetsegment },
  { path: '/system/setsystem/strategy', component: System.StrategyConfig, tag: systemPermission.sysStrategy },
  { path: '/system/setsystem/service', component: System.ServiceConfig, tag: systemPermission.sysSetNetsegment },

  { path: '/logalarm/log/manage', component: Log.Manage, tag: logAlarmPermission.logManageOperate },
  { path: '/logalarm/log/manage/details', component: Log.ManageDetails, tag: logAlarmPermission.logManageOperateView },
  { path: '/logalarm/log/system', component: Log.logDetails, tag: logAlarmPermission.logManageSystem },
  { path: '/logalarm/log/audit', component: Log.logAudit, tag: logAlarmPermission.logManageReport },
  { path: '/logalarm/log/audit/details', component: Log.logAuditDetails, tag: logAlarmPermission.logManageReportView },
  { path: '/logalarm/alarm/manage', component: Alarm.Manage, tag: logAlarmPermission.alarmMManage },
  { path: '/logalarm/alarm/manage/details', component: Alarm.ManageDetails, tag: logAlarmPermission.alarmMManageCurrentView },
  { path: '/logalarm/alarm/regulation', component: Alarm.Regulation, tag: logAlarmPermission.alarmManageRule },
  { path: '/logalarm/alarm/regulation/create', component: Alarm.AssetruleCreate, tag: logAlarmPermission.alarmManageRule },
  { path: '/logalarm/alarm/regulation/edit', component: Alarm.AssetruleCreate, tag: logAlarmPermission.alarmManageRule },
  { path: '/logalarm/alarm/regulation/detail', component: Alarm.AssetruleDetail, tag: logAlarmPermission.alarmManageRule },

  { path: '/routine/knowledge', component: Knowledge.List, tag: routinePermission.routineKnowledge },
  { path: '/routine/knowledge/detail', component: Knowledge.Detail, tag: routinePermission.routineKnowledgeChckin },

  { path: '/basesetting/model', component: BaseSetting.ModelList, tag: configPermission.configBasetemplate },
  { path: '/basesetting/model/edit', component: BaseSetting.ModelEdit, tag: configPermission.newBasetemplate },
  { path: '/basesetting/model/update', component: BaseSetting.ModelEdit, tag: configPermission.editBasetemplate },
  { path: '/basesetting/model/checkdetail', component: BaseSetting.CheckDetail, tag: configPermission.viewBasetemplate },
  { path: '/basesetting/storage', component: BaseSetting.Storage, tag: configPermission.configBaseitem },
  { path: '/basesetting/storage/detail', component: BaseSetting.UpdateBase, tag: configPermission.baseitemView },
  { path: '/basesetting/manage', component: BaseSetting.Manage, tag: configPermission.viewBaseConfig },
  { path: '/basesetting/manage/setting', component: BaseSetting.ManageSetting, tag: configPermission.baseConfig },
  { path: '/basesetting/list/:page', component: BaseSetting.Validation, tag: [configPermission.viewBaseInspect, configPermission.viewBaseFixed] },
  { path: '/basesetting/model/scandetail', component: BaseSetting.ViewScanBasetemplate, tag: configPermission.viewScanBasetemplate },

  { path: '/examine/list/:page', component: Examine.ExamineList, tag: [configPermission.viewBaseInspect, configPermission.viewBaseFixed] },
  { path: '/examine/check', component: Examine.ExamineCheck, tag: configPermission.viewBaseFixed },

  { path: '/safe/version', component: Safe.VersionMange, tag: safetyPermission.SAFETY_VERSION },
  { path: '/safe/feature', component: Safe.FeatureMange, tag: safetyPermission.SAFETY_TZKGL },
  { path: '/safe/equipment/versionInformationUpgrade', component: Safe.CommonInformationUpgrade, tag: safetyPermission.SAFETY_VERSION_BG }, // 版本升级I
  { path: '/safe/equipment/featureInformationUpgrade', component: Safe.CommonInformationUpgrade, tag: safetyPermission.SAFETY_TZKGL_BG }, // 特征库升级
  { path: '/safe/version/manageUpgrade', component: Safe.CommonManageUpgrade, tag: safetyPermission.SAFETY_VERSION_AZ },  // 版本恩安装
  { path: '/safe/feature/manageUpgrade', component: Safe.CommonManageUpgrade, tag: safetyPermission.SAFETY_TZKGL_AZ }, // 特征库安装
  { path: '/safe/version/detail', component: Safe.CommonDetail, tag: safetyPermission.SAFETY_VERSION_CK }, // 版本详情
  { path: '/safe/feature/detail', component: Safe.CommonDetail, tag: safetyPermission.SAFETY_TZKGL_CK }, // 特征库询详情
  { path: '/safe/performance/detail', component: Safe.PerformanceDetail, tag: safetyPermission.SAFETY_XN_CK },
  { path: '/safe/performance', component: Safe.PerformanceList, tag: safetyPermission.SAFETY_XN },
  { path: '/safe/equipment', component: Safe.EquipmentList, tag: safetyPermission.SAFETY_SB },
  { path: '/safe/equipment/register', component: Safe.EquipmentChange, tag: safetyPermission.SAFETY_SB_BG },
  { path: '/safe/equipment/change', component: Safe.EquipmentChange, tag: safetyPermission.SAFETY_SB_BG },
  { path: '/safe/equipment/detail', component: Safe.EquipmentDetail, tag: safetyPermission.SAFETY_SB_CK },
  { path: '/safe/threat', component: Safe.ThreatList, tag: safetyPermission.SAFETY_WXSJ },
  { path: '/safe/threat/ZhiJiaDetail', component: Safe.ZhiJiaDetail, tag: safetyPermission.SAFETY_WXSJ_ZJ },
  { path: '/safe/threat/TanHaiDetail', component: Safe.TanHaiDetail, tag: safetyPermission.SAFETY_WXSJ_TH },
  { path: '/reportForm/asset', component: ReportForm.Asset, tag: reportPermission.REPORT_ASSET },
  { path: '/reportForm/patch', component: ReportForm.Patch, tag: reportPermission.REPORT_PATCH },
  { path: '/reportForm/vul', component: ReportForm.Vul, tag: reportPermission.REPORT_VUL },
  { path: '/reportForm/warn', component: ReportForm.Warn, tag: reportPermission.REPORT_ALARM },
  { path: '/reportForm/group', component: ReportForm.Group, tag: reportPermission.REPORT_ALARM },
  { path: '/defend/manage/list', component: Defend.ManageList, tag: defendPermission.PORTAL_EQUIPMENT },
  { path: '/defend/equipment', component: Defend.Equipment, tag: defendPermission.PORTAL_OPERATE },
  { path: '/defend/audit/operationList', component: Defend.OperationList, tag: defendPermission.PORTAL_OPERATE_LIST },
  { path: '/defend/audit/logList', component: Defend.LogList, tag: defendPermission.PORTAL_LOG_LIST }
]
