import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

const Add = Loadable({
  loader: () => import('@/pages/WorkOrder/Add'),
  loading: Loading
})
const List = Loadable({
  loader: () => import('@/pages/WorkOrder/List'),
  loading: Loading
})
const Detail = Loadable({
  loader: () => import('@/pages/WorkOrder/Detail'),
  loading: Loading
})

export default { Add, List, Detail }