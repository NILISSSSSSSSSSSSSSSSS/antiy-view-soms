import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

const List = Loadable({
  loader: () => import('@/pages/Inspection/List'),
  loading: Loading
})
const Report = Loadable({
  loader: () => import('@/pages/Inspection/Report'),
  loading: Loading
})

export default { List, Report }