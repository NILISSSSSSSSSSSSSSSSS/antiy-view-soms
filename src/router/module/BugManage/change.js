import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

const change = Loadable({
  loader: () => import('@/pages/BugManage/Unexpected/Change'),
  loading: Loading
})

export default change