import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

export default {
  Manage: Loadable({
    loader: () => import('@/pages/Alarm/Manage/List'),
    loading: Loading
  }),
  ManageDetails: Loadable({
    loader: () => import('@/pages/Alarm/Manage/Details'),
    loading: Loading
  }),
  Regulation: Loadable({
    loader: () => import('@/pages/Alarm/Regulation'),
    loading: Loading
  }),
  AssetruleCreate: Loadable({
    loader: () => import('@/pages/Alarm/Regulation/AssetMonitorRule/Create'),
    loading: Loading
  }),
  AssetruleDetail: Loadable({
    loader: () => import('@/pages/Alarm/Regulation/AssetMonitorRule/Detail'),
    loading: Loading
  })

}