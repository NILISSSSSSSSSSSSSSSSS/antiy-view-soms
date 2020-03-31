import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

const PersonalCenter = Loadable({
  loader: () => import('@/pages/PersonalCenter'),
  loading: Loading
})
export default { PersonalCenter }
