import api from '@/services/api'
// import { message } from 'antd'

export default {
  namespace: 'Logs',
  state: {
    logHandleList: {},
    systemLogList: {},
    logListDetails: {},
    logListDetailsTable: [],
    logAuitList: {},
    logAuitDetails: {}
  },
  effects: {
    *getLogHandleList ({ payload }, { call, put }) {
      const data = yield call(api.getLogHandleList, payload)
      if(data.head && data.head.code === '200')
        yield put({ type: 'save', payload: { logHandleList: data.body } })
    },
    *getLogHandletId ({ payload }, { call, put }) {
      const data = yield call(api.getLogHandleListId, payload)
      if(data.head && data.head.code === '200')
        yield put({ type: 'save', payload: { logListDetails: data.body } })
    },
    *getLogHandleListAuditId ({ payload }, { call, put }) {
      const data = yield call(api.getLogHandleListAuditId, payload)
      if(data.head && data.head.code === '200')
        yield put({ type: 'save', payload: { logListDetailsTable: data.body } })
    },
    *getSystemLogList ({ payload }, { call, put }) {
      const data = yield call(api.getSystemLogList, payload)
      if(data.head && data.head.code === '200')
        yield put({ type: 'save', payload: { systemLogList: data.body } })
    },
    *getAuditLogList ({ payload }, { call, put }) {
      const data = yield call(api.getAuditLogList, payload)
      if(data.head && data.head.code === '200')
        yield put({ type: 'save', payload: { logAuitList: data.body } })
    },
    *getAuditLogDetails ({ payload }, { call, put }) {
      const data = yield call(api.getAuditLogDetails, payload)
      if(data.head && data.head.code === '200')
        yield put({ type: 'save', payload: { logAuitDetails: data.body } })
    }
  },
  reducers: {
    save (state, action) {
      return { ...state, ...action.payload }
    }
  }
}
