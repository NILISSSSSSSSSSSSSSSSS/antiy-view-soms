import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

export default {
  IdentityManager: Loadable({
    loader: () => import('@/pages/Asset/Personnel/Identity'),
    loading: Loading
  }),
  Organization: Loadable({
    loader: () => import('@/pages/Asset/Personnel/Organization'),
    loading: Loading
  })
}