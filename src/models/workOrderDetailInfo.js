import api from '@/services/api'
// import queryString from 'querystring'

export default {
  namespace: 'workOrderDetailInfo',
  state: {
    workOrderDetail: null,
    workOrderScheduleVOList: [],
    workOrderStatusLogList: [],
    workOrderAttachmentDetailList: []
  },
  effects: {
    *query ({ payload = {} }, { call, put }) {
      const data = yield call(api.getWorkOrderDetailInfo, payload)
      console.log(data)
      if (data) {
        yield put({
          type: 'querySuccess',
          payload: {
            workOrderDetail: data.body.workOrderDetailVO,
            workOrderScheduleVOList: data.body.workOrderScheduleVOList,
            workOrderStatusLogList: data.body.workOrderStatusLogList,
            workOrderAttachmentDetailList: data.body.workOrderAttachmentDetailList
          }
        })
      }
    }
  },
  reducers: {
    querySuccess (state, { payload }) {
      const { workOrderDetail, workOrderScheduleVOList, workOrderStatusLogList, workOrderAttachmentDetailList } = payload
      return {
        ...state,
        workOrderDetail,
        workOrderScheduleVOList,
        workOrderStatusLogList,
        workOrderAttachmentDetailList
      }
    }
  }
}
