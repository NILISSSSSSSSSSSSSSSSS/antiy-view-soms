import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

const register = Loadable({
  loader: () => import('@/pages/BugManage/Unexpected/Register'),
  loading: Loading
})

export default register