import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

export default {
  Details: Loadable({
    loader: () => import('@/pages/Asset/Group/Details'),
    loading: Loading
  }),
  Manager: Loadable({
    loader: () => import('@/pages/Asset/Group/Manager'),
    loading: Loading
  }),
  Register: Loadable({
    loader: () => import('@/pages/Asset/Group/Register'),
    loading: Loading
  })
}