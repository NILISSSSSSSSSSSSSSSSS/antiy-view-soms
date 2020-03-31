import api from '@/services/api'

export default {
  namespace: 'baseSetting',
  state: {
    osList: [], //适用系统
    typeList: [] //基准类型
  },
  effects: {
    // 获取配置项列表
    * getConfigOsList ({ payload }, { call, put }) {
      const data = yield call(api.getBaseLineTypeBy, payload)
      let osList = []
      osList.push({
        node: '',
        name: '适用系统',
        childrenNode: data.body
      })
      yield put({ type: 'save', payload: { osList: osList[0] } })
    },
    * getBaseLineType ({ payload }, { call, put }) {
      const data = yield call(api.getBaseLineType, payload)
      let typeList = []
      typeList.push({
        node: '',
        name: '基准类型',
        childrenNode: data.body
      })
      yield put({ type: 'save', payload: { typeList: typeList[0] } })
    }
  },
  reducers: {
    save (state, action) {
      return { ...state, ...action.payload }
    }
  }
}
