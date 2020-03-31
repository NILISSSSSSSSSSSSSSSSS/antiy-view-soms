import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

export default {
  UserList: Loadable({
    loader: () => import('@/pages/System/UserManage/List'),
    loading: Loading
  }),
  
  InformationRegister: Loadable({
    loader: () => import('@/pages/System/UserManage/InformationRegister'),
    loading: Loading
  }),
  
  InformationChange: Loadable({
    loader: () => import('@/pages/System/UserManage/InformationChange'),
    loading: Loading
  }),
  
  InformationCheck: Loadable({
    loader: () => import('@/pages/System/UserManage/InformationCheck'),
    loading: Loading
  }),
  
  RoleList: Loadable({
    loader: () => import('@/pages/System/RoleManage/List'),
    loading: Loading
  }),
  
  RoleRegister: Loadable({
    loader: () => import('@/pages/System/RoleManage/RoleRegister'),
    loading: Loading
  }),
  
  AssetManage: Loadable({
    loader: () => import('@/pages/System/AssetManage'),
    loading: Loading
  }),
  MessageManage: Loadable({
    loader: () => import('@/pages/System/MessageManage'),
    loading: Loading
  }),
  SetSystem: Loadable({
    loader: () => import('@/pages/System/SetSystem'),
    loading: Loading
  }),
  Monitor: Loadable({
    loader: () => import('@/pages/System/Monitor'),
    loading: Loading
  }),
  MonitorDetail: Loadable({
    loader: () => import('@/pages/System/Monitor/Detail'),
    loading: Loading
  }),
  RoleWorkflow: Loadable({
    loader: () => import('@/pages/System/RoleWorkflow/List'),
    loading: Loading
  }),
  WorkflowHardwareRegister: Loadable({
    loader: () => import('@/pages/System/RoleWorkflow/Detail/HardwareRegister'),
    loading: Loading
  }),
  WorkflowAssetInstall: Loadable({
    loader: () => import('@/pages/System/RoleWorkflow/Detail/AssetInstall'),
    loading: Loading
  }),
  WorkflowHardwareBack: Loadable({
    loader: () => import('@/pages/System/RoleWorkflow/Detail/HardwareBack'),
    loading: Loading
  }),
  WorkflowBaseLine: Loadable({
    loader: () => import('@/pages/System/RoleWorkflow/Detail/BaseLine'),
    loading: Loading
  }),
  WorkflowPatchRegister: Loadable({
    loader: () => import('@/pages/System/RoleWorkflow/Detail/PatchRegister'),
    loading: Loading
  }),
  WorkflowVulRegister: Loadable({
    loader: () => import('@/pages/System/RoleWorkflow/Detail/VulRegister'),
    loading: Loading
  }),
  WorkflowAssetScrap: Loadable({
    loader: () => import('@/pages/System/RoleWorkflow/Detail/AssetScrap'),
    loading: Loading
  }),
  UpgradeSet: Loadable({
    loader: () => import('@/pages/System/UpgradeSet'),
    loading: Loading
  }),
  UpgradeRecord: Loadable({
    loader: () => import('@/pages/System/UpgradeRecord'),
    loading: Loading
  }),
  PortManage: Loadable({
    loader: () => import('@/pages/System/PortManage'),
    loading: Loading
  }),
  NetworkManage: Loadable({
    loader: () => import('@/pages/System/NetworkManage'),
    loading: Loading
  }),
  NetTypeManage: Loadable({
    loader: () => import('@/pages/System/NetType'),
    loading: Loading
  }),
  ServiceConfig: Loadable({
    loader: () => import('@/pages/System/Service'),
    loading: Loading
  }),
  StrategyConfig: Loadable({
    loader: () => import('@/pages/System/Strategy'),
    loading: Loading
  })
}
