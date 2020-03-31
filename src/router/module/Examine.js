import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

export default {
  ExamineCheck: Loadable({
    loader: () => import('@/pages/Examine/Check'),
    loading: Loading
  }),
  ExamineList: Loadable({
    loader: () => import('@/pages/Examine/List'),
    loading: Loading
  })
}