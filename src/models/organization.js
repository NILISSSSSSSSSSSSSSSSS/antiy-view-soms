import api from '@/services/api'

export default {
  namespace: 'assetOrganization',
  state: {
    departmentNode: [],
    flag: {}
  },
  effects: {
    *getDepartmentTree ({ payload }, { call, put }) {
      const data = yield call(api.getDepartmentTree, payload)
      yield put({ type: 'save', payload: { departmentNode: [data.body] } })
    },
    *addDepartment ({ payload }, { call, put }) {
      const data = yield call(api.saveDepartment, payload)
      yield put({ type: 'save', payload: { flag: data } })
    }
  },
  reducers: {
    save (state, action) {
      return { ...state, ...action.payload }
    }
  }
}
