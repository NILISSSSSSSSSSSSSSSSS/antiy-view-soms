import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

export default {
  Details: Loadable({
    loader: () => import('@/pages/Asset/Business/Details'),
    loading: Loading
  }),
  Manager: Loadable({
    loader: () => import('@/pages/Asset/Business'),
    loading: Loading
  }),
  Register: Loadable({
    loader: () => import('@/pages/Asset/Business/Register'),
    loading: Loading
  })
}