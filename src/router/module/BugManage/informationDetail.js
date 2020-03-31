import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

const detail = Loadable({
  loader: () => import('@/pages/BugManage/Information/Detail'),
  loading: Loading
})

export default detail