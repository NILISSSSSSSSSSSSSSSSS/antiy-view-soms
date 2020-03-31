import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

const Index = Loadable({
  loader: () => import('@/pages/Workbench'),
  loading: Loading
})
export default { Index }
