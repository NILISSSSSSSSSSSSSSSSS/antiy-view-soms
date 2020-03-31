import api from '@/services/api'

export default {
  namespace: 'Alarms',
  state: {
    getAlarmRuleList: {},
    nowList: {},
    historyList: {},
    alarmDetailsList: {}
  },
  effects: {
    *getAlarmRuleList ({ payload }, { call, put }) {
      const data = yield call(api.getAlarmRuleList, payload)
      if(data.head && data.head.code === '200')
        yield put({ type: 'save', payload: { getAlarmRuleList: data.body } })
    },
    *getAlarmManagerNowList ({ payload }, { call, put }) {
      const data = yield call(api.getAlarmManagerNowList, payload)
      if(data.head && data.head.code === '200')
        yield put({ type: 'save', payload: { nowList: data.body } })
    },
    *getAlarmManagerHistoryList ({ payload }, { call, put }) {
      const data = yield call(api.getAlarmManagerHistoryList, payload)
      if(data.head && data.head.code === '200')
        yield put({ type: 'save', payload: { historyList: data.body } })
    },
    *getNowAlarmDetails ({ payload }, { call, put }) {
      const data = yield call(api.getNowAlarmDetails, { stringId: payload.stringId })
      if(data.head && data.head.code === '200'){
        if(data.body.assetId){
          let assetInfo = {}
          switch (data.body.alarmType) {
            case (1):
            case (2):
            case (3):
              assetInfo = yield call(api.getAssetHardWareById, { primaryKey: data.body.assetId })
              break
            case (5):
              assetInfo = yield call(api.equipmentQueryById, { primaryKey: data.body.assetId })
              break
            default:
              break
          }
          if(assetInfo.head && data.head.code === '200')
            data.body.assetInfo = assetInfo.body.asset
        }
        const changeList =  yield call(api.getAlarmChangeRecord, { primaryKey: data.body.stringId })
        if(changeList.head && changeList.head.code === '200')
          data.body.changeList = changeList.body
        if(data.body.workOrderCode !== ''){
          const wordStatus = yield call(api.getWorkOrderDetailInfo, { primaryKey: data.body.workOrderId } )
          if(wordStatus.head && wordStatus.head.code === '200') {
            data.body.wordInfo = wordStatus.body.workOrderDetailVO.orderStatus
            data.body.workOrderScheduleVOList = wordStatus.body.workOrderScheduleVOList
          }
        }
        const record = yield call(api.getAlarmDetailsRecord, { primaryKey: data.body.stringId })
        if(record.head && record.head.code === '200')
          data.body.record = record.body
        yield put({ type: 'save', payload: { alarmDetailsList: data.body } })
      }
    },
    *getHistoryAlarmDetails ({ payload }, { call, put }) {
      const data = yield call(api.getHistoryAlarmDetails, { stringId: payload.stringId })
      if(data.head && data.head.code === '200'){
        if(data.body.assetId){
          let assetInfo
          switch (data.body.alarmType) {
            case (1):
            case (2):
            case (3):
              assetInfo = yield call(api.getAssetHardWareById, { primaryKey: data.body.assetId })
              break
            case (5):
              assetInfo = yield call(api.equipmentQueryById, { primaryKey: data.body.assetId })
              break
            default:
              break
          }
          if(assetInfo && assetInfo.head && assetInfo.head.code === '200')
            data.body.assetInfo = assetInfo.body.asset
        }
        const changeList =  yield call(api.getAlarmChangeRecord, { primaryKey: data.body.alarmCurrentId })
        if(changeList.head && changeList.head.code === '200')
          data.body.changeList = changeList.body
        if(data.body.workOrderCode !== ''){
          const wordStatus = yield call(api.getWorkOrderDetailInfo, { primaryKey: data.body.workOrderId } )
          if (wordStatus.head && wordStatus.head.code === '200') {
            data.body.wordInfo = wordStatus.body.workOrderDetailVO.orderStatus
            data.body.workOrderScheduleVOList = wordStatus.body.workOrderScheduleVOList
          }
        }
        if(data.body.alarmCurrentId){
          const record = yield call(api.getAlarmDetailsRecord, { primaryKey: data.body.alarmCurrentId })
          if(record.head && record.head.code === '200')
            data.body.record = record.body
        }
        yield put({ type: 'save', payload: { alarmDetailsList: data.body } })
      }
    }
  },
  reducers: {
    save (state, action) {
      return { ...state, ...action.payload }
    }
  }
}
