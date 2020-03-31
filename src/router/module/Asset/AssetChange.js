import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

const AssetChange = Loadable({
  loader: () => import('@/pages/Asset/Manage/AssetChange'),
  loading: Loading
})

export default AssetChange
