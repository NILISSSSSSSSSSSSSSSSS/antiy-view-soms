import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

const list = Loadable({
  loader: () => import('@/pages/BugManage/Information/List'),
  loading: Loading
})

export default list