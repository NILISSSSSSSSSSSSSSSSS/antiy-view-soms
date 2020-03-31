import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

const List = Loadable({
  loader: () => import('@/pages/Knowledge/List'),
  loading: Loading
})
const Detail = Loadable({
  loader: () => import('@/pages/Knowledge/Detail'),
  loading: Loading
})
export default { List, Detail }