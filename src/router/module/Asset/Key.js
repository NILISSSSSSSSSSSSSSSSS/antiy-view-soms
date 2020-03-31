import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

export default {
  Key: Loadable({
    loader: () => import('@/pages/Asset/Key'),
    loading: Loading
  })
}