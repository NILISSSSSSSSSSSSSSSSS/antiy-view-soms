import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

export default {
  Main: Loadable({
    loader: () => import('@/pages/Asset/Manage'),
    loading: Loading
  })
}
