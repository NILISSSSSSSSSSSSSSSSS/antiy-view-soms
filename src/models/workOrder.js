import api from '@/services/api'

export default {
  namespace: 'workOrder',
  state: {
    body: null,
    list: []/*,
    workOrderEntity: {}*/
  },
  effects: {
    *getTodoList ({ payload }, { call, put }) {
      const data = yield call(api.getTodoList, payload)
      yield put({ type: 'save', payload: { body: data.body } })
    },

    *getFinishList ({ payload }, { call, put }) {
      const data = yield call(api.getFinishList, payload)
      yield put({ type: 'save', payload: { body: data.body } })
    },

    *getCreateList ({ payload }, { call, put }) {
      const data = yield call(api.getCreateList, payload)
      yield put({ type: 'save', payload: { body: data.body } })
    },

    *getAllList ({ payload }, { call, put }) {
      const data = yield call(api.getAllList, payload)
      yield put({ type: 'save', payload: { body: data.body } })
    }/*,
    *getWorkOrderEntity ({ payload }, { call, put }) {
      const data = yield call(api.getWorkOrderDetailInfo, payload)
      yield put({ type: 'save', payload: { workOrderEntity: data.body } })
    }*/

  },
  reducers: {
    save (state, action) {
      return { ...state, ...action.payload }
    }
  }
}
