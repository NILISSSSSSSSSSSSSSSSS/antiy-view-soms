import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

const AssetDetail = Loadable({
  loader: () => import('@/pages/Asset/Manage/AssetDetail'),
  loading: Loading
})

export default AssetDetail
