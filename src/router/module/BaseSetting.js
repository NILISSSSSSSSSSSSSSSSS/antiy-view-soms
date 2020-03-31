import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

export default {
  ModelList: Loadable({
    loader: () => import('@/pages/BaseSetting/Model/List'),
    loading: Loading
  }),
  ModelEdit: Loadable({
    loader: () => import('@/pages/BaseSetting/Model/Edit'),
    loading: Loading
  }),
  UpdateBase: Loadable({
    loader: () => import('@/pages/BaseSetting/Storage/Detail'),
    loading: Loading
  }),
  Manage: Loadable({
    loader: () => import('@/pages/BaseSetting/Manage/List'),
    loading: Loading
  }),
  ManageSetting: Loadable({
    loader: () => import('@/pages/BaseSetting/Manage/Setting'),
    loading: Loading
  }),
  Storage: Loadable({
    loader: () => import('@/pages/BaseSetting/Storage/List'),
    loading: Loading
  }),
  CheckDetail: Loadable({
    loader: () => import('@/pages/BaseSetting/Model/CheckDetail'),
    loading: Loading
  }),
  Validation: Loadable({
    loader: () => import('@/pages/BaseSetting/Validation/List'),
    loading: Loading
  }),
  ViewScanBasetemplate: Loadable({
    loader: () => import('@/pages/BaseSetting/Model/List/ModelScan/Detail'),
    loading: Loading
  })
}