import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

export default {
  Oa: Loadable({
    loader: () => import('@/pages/Asset/Oa'),
    loading: Loading
  }),
  Handle: Loadable({
    loader: () => import('@/pages/Asset/Oa/Handle'),
    loading: Loading
  })
}