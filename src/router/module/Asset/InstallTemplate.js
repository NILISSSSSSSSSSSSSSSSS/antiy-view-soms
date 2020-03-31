import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

export default {
  list: Loadable({
    loader: () => import('@/pages/Asset/InstallTemplate/index.jsx'),
    loading: Loading
  }),
  Create: Loadable({
    loader: () => import('@/pages/Asset/InstallTemplate/Create/index.jsx'),
    loading: Loading
  }),
  Detail: Loadable({
    loader: () => import('@/pages/Asset/InstallTemplate/Detail/index.jsx'),
    loading: Loading
  })
}