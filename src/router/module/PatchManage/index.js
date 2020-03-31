
import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'

export default {
  //补丁应急
  emergency: Loadable({
    loader: () => import('@/pages/PatchManage/Emergency/List'),
    loading: Loading
  }),
  emergencyRegister: Loadable({
    loader: () => import('@/pages/PatchManage/Emergency/Register'),
    loading: Loading
  }),
  emergencyEdit: Loadable({
    loader: () => import('@/pages/PatchManage/Emergency/Edit'),
    loading: Loading
  }),
  emergencyDetail: Loadable({
    loader: () => import('@/pages/PatchManage/Emergency/Detail'),
    loading: Loading
  }),
  //补丁信息
  information: Loadable({
    loader: () => import('@/pages/PatchManage/Information/List'),
    loading: Loading
  }),
  informationDispose: Loadable({
    loader: () => import('@/pages/PatchManage/Information/Dispose'),
    loading: Loading
  }),
  informationDetail: Loadable({
    loader: () => import('@/pages/PatchManage/Information/Detail'),
    loading: Loading
  }),
  //补丁安装
  install: Loadable({
    loader: () => import('@/pages/PatchManage/Install/List'),
    loading: Loading
  }),
  installAssetList: Loadable({
    loader: () => import('@/pages/PatchManage/Install/Asset'),
    loading: Loading
  }),
  installAssetInstall: Loadable({
    loader: () => import('@/pages/PatchManage/Install/Asset/install.js'),
    loading: Loading
  }),
  installPatchList: Loadable({
    loader: () => import('@/pages/PatchManage/Install/Patch'),
    loading: Loading
  }),
  installPatchInstall: Loadable({
    loader: () => import('@/pages/PatchManage/Install/Patch/install'),
    loading: Loading
  }),
  installDetail: Loadable({
    loader: () => import('@/pages/PatchManage/Install/Details'),
    loading: Loading
  }),
  //补丁知识
  repository: Loadable({
    loader: () => import('@/pages/PatchManage/Knowledge/List'),
    loading: Loading
  }),
  repositoryDetail: Loadable({
    loader: () => import('@/pages/PatchManage/Knowledge/Detail'),
    loading: Loading
  })
}