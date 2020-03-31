import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

export default {
  ManageList: Loadable({
    loader: () => import('@/pages/Defend/Manage/List'),
    loading: Loading
  }),
  Equipment: Loadable({
    loader: () => import('@/pages/Defend/Equipment'),
    loading: Loading
  }),
  OperationList: Loadable({
    loader: () => import('@/pages/Defend/Audit/OperationList'),
    loading: Loading
  }),
  LogList: Loadable({
    loader: () => import('@/pages/Defend/Audit/LogList'),
    loading: Loading
  })
}