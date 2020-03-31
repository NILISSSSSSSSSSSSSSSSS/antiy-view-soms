import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

const VersionMange = Loadable({
  loader: () => import('@/pages/Safe/VersionManage'),
  loading: Loading
})
const FeatureMange = Loadable({
  loader: () => import('@/pages/Safe/FeatureMange'),
  loading: Loading
})
const CommonInformationUpgrade = Loadable({
  loader: () => import('@/pages/Safe/Common/InformationUpgrade'),
  loading: Loading
})
const CommonManageUpgrade = Loadable({
  loader: () => import('@/pages/Safe/Common/ManageUpgrade'),
  loading: Loading
})
const CommonDetail = Loadable({
  loader: () => import('@/pages/Safe/Common/Detail'),
  loading: Loading
})

const PerformanceList = Loadable({
  loader: () => import('@/pages/Safe/Performance'),
  loading: Loading
})
const PerformanceDetail = Loadable({
  loader: () => import('@/pages/Safe/Performance/Detail'),
  loading: Loading
})
const PerformanceCharts = Loadable({
  loader: () => import('@/pages/Safe/Performance/Charts'),
  loading: Loading
})

const EquipmentList = Loadable({
  loader: () => import('@/pages/Safe/Equipment/List'),
  loading: Loading
})
const EquipmentChange = Loadable({
  loader: () => import('@/pages/Safe/Equipment/Change'),
  loading: Loading
})
const EquipmentDetail = Loadable({
  loader: () => import('@/pages/Safe/Equipment/Detail'),
  loading: Loading
})

const ThreatList = Loadable({
  loader: () => import('@/pages/Safe/Threat'),
  loading: Loading
})
const ZhiJiaDetail = Loadable({
  loader: () => import('@/pages/Safe/Threat/ZhiJia/Detail'),
  loading: Loading
})
const TanHaiDetail = Loadable({
  loader: () => import('@/pages/Safe/Threat/TanHai/Detail'),
  loading: Loading
})
export default { VersionMange, FeatureMange, CommonInformationUpgrade, CommonManageUpgrade, PerformanceList, PerformanceDetail, PerformanceCharts, CommonDetail, EquipmentList, EquipmentChange, EquipmentDetail, ThreatList, ZhiJiaDetail, TanHaiDetail }

