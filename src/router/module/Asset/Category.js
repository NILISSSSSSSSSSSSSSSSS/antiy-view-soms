import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

export default {
  ModelManage: Loadable({
    loader: () => import('@/pages/Asset/Category/ModelManage'),
    loading: Loading
  })
}