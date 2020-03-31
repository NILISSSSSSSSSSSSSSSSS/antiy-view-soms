import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

export default {
  Physical: Loadable({
    loader: () => import('@/pages/Asset/Topo/Physical'),
    loading: Loading
  })
}