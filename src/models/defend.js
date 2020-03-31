import api from '@/services/api'

export default {
  namespace: 'defend',
  state: {
    defendSupplierList: [],
    defendVersionList: [],
    defendNameList: []
  },
  effects: {
    // 获取厂商列表
    *getDefendSupplier ({ payload }, { call, put }) {
      const data = yield call(api.getDefendSupplier, payload)
      yield put({ type: 'save', payload: { defendSupplierList: (data.body || []).map(e => ({ name: e, value: e })) } })
    },
    // 获取名称列表
    *getDefendName ({ payload }, { call, put }) {
      const data = yield call(api.getDefendName, payload)
      yield put({ type: 'save', payload: { defendNameList: (data.body || []).map(e => ({ name: e, value: e })) } })
    },
    // 获取版本列表
    *getDefendVersion ({ payload }, { call, put }) {
      const data = yield call(api.getDefendVersion, payload)
      yield put({ type: 'save', payload: { defendVersionList: (data.body || []).map(e => ({ name: e, value: e })) } })
    },
    *clearDefendName ({ payload }, { call, put }) {
      yield put({ type: 'save', payload: { defendNameList: [], defendVersionList: [] } })
    },
    *cleaDefendVersion ({ payload }, { call, put }) {
      yield put({ type: 'save', payload: { defendVersionList: [] } })
    }
  },
  reducers: {
    save (state, action) {
      return { ...state, ...action.payload }
    }
  }
}
