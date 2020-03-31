import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'
const IndexPage = Loadable({
  loader: () => import('@/pages/IndexPage'),
  loading: Loading
})
const IndexPageBacklog = Loadable({
  loader: () => import('@/pages/IndexPage/Backlog'),
  loading: Loading
})
export default { IndexPage, IndexPageBacklog }
