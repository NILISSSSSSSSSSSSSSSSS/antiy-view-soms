import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

export default {
  RelationList: Loadable({
    loader: () => import('@/pages/Asset/Relation'),
    loading: Loading
  }),
  RelationDetails: Loadable({
    loader: () => import('@/pages/Asset/Relation/Details'),
    loading: Loading
  })
}