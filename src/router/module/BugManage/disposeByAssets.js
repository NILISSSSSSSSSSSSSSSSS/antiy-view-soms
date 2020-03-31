import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

const list = Loadable({
  loader: () => import('@/pages/BugManage/Dispose/DisposeByAssets'),
  loading: Loading
})

export default list