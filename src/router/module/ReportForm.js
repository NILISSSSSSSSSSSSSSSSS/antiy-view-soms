import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

const Asset = Loadable({
  loader: () => import('@/pages/ReportForm/Asset/List'),
  loading: Loading
})
const Patch = Loadable({
  loader: () => import('@/pages/ReportForm/Patch'),
  loading: Loading
})
const Vul = Loadable({
  loader: () => import('@/pages/ReportForm/Vul'),
  loading: Loading
})
const Warn = Loadable({
  loader: () => import('@/pages/ReportForm/Warn'),
  loading: Loading
})
const Group = Loadable({
  loader: () => import('@/pages/ReportForm/Group'),
  loading: Loading
})
export default { Asset, Patch, Vul, Warn, Group }
