import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

export default {
  Borrow: Loadable({
    loader: () => import('@/pages/Asset/Borrow'),
    loading: Loading
  }),
  Details: Loadable({
    loader: () => import('@/pages/Asset/Borrow/Details'),
    loading: Loading
  }),
  History: Loadable({
    loader: () => import('@/pages/Asset/Borrow/History'),
    loading: Loading
  })
}