import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

export default {
  Manage: Loadable({
    loader: () => import('@/pages/Log/Manage/List'),
    loading: Loading
  }),
  ManageDetails: Loadable({
    loader: () => import('@/pages/Log/Manage/Details'),
    loading: Loading
  }),
  logDetails: Loadable({
    loader: () => import('@/pages/Log/System'),
    loading: Loading
  }),
  logAudit: Loadable({
    loader: () => import('@/pages/Log/Audit/List'),
    loading: Loading
  }),
  logAuditDetails: Loadable({
    loader: () => import('@/pages/Log/Audit/Details'),
    loading: Loading
  })
}