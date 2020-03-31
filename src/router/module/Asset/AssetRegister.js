import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

const AssetRegister = Loadable({
  loader: () => import('@/pages/Asset/Manage/AssetRegister'),
  loading: Loading
})

export default AssetRegister
