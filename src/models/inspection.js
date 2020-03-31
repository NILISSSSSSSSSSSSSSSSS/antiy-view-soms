import api from '@/services/api'

export default {
  namespace: 'inspection',
  state: {
    body: null,
    list: []
  },
  effects: {
    *getTodoList ({ payload }, { call, put }) {
      const data = yield call(api.getTodoList, payload)
      yield put({ type: 'save', payload: { body: data.body } })
    },
    *getAllList ({ payload }, { call, put }) {
      const data = yield call(api.getAllList, payload)
      yield put({ type: 'save', payload: { body: data.body } })
    }
  },
  reducers: {
    save (state, action) {
      return { ...state, ...action.payload }
    }
  }
}
