import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

const List = Loadable({
  loader: () => import('@/pages/Timing/List'),
  loading: Loading
})
const Report = Loadable({
  loader: () => import('@/pages/Timing/Report'),
  loading: Loading
})

export default { List, Report }