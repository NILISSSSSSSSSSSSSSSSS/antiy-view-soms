import api from '@/services/api'

export default {
  namespace: 'information',
  state: {
    getAssetsOS: [], // 操作系统
    getGroupInfo: [], // 资产组
    getUserInAsset: [], // 使用者
    getManufacturerInfo: [], // 厂商
    baselineTemplate: [], //基准模板
    getUserAreaTree: {
      childrenNode: []
    } // 区域树

  },
  effects: {
    * getAssetsOS ({ payload }, { call, put }) {
      const data = yield call(api.getAssetsOS, payload)
      yield put({ type: 'save', payload: { getAssetsOS: data.body } })
    },
    * getGroupInfo ({ payload }, { call, put }) {
      const data = yield call(api.getGroupInfo, payload)
      yield put({ type: 'save', payload: { getGroupInfo: data.body } })
    },
    * getManufacturerInfo ({ payload }, { call, put }) {
      const data = yield call(api.getManufacturerInfo, payload)
      yield put({ type: 'save', payload: { getManufacturerInfo: data.body } })
    },
    * getUserInAsset ({ payload }, { call, put }) {
      const data = yield call(api.getUserInAsset, payload)
      yield put({ type: 'save', payload: { getUserInAsset: data.body || [] } })
    },
    * getUserAreaTree ({ payload }, { call, put }) {
      const data = yield call(api.getUserAreaTree, payload)
      yield put({ type: 'save', payload: { getUserAreaTree: data.body } })
    },
    * baselineTemplate ({ payload }, { call, put }) {
      const data = yield call(api.baselineTemplate, payload)
      yield put({ type: 'save', payload: { baselineTemplate: data.body } })
    }
  },
  reducers: {
    save (state, action) {
      return { ...state, ...action.payload }
    }
  }
}
