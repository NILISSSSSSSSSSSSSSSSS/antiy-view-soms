import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

const Overview = Loadable({
  loader: () => import('@/pages/Asset/Overview'),
  loading: Loading
})

export default Overview