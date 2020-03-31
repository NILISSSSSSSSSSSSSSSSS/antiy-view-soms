import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

export default {
  AdmittanceManage: Loadable({
    loader: () => import('@/pages/Asset/Admittance'),
    loading: Loading
  }),
  HisAccessRecord: Loadable({
    loader: () => import('@/pages/Asset/Admittance/HisAccessRecord'),
    loading: Loading
  })
}