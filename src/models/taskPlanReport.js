import api from '@/services/api'
import { removeEmpty } from '@/utils/common'
const { queryTaskAutomaticWorkList } = api
export default {
  namespace: 'taskPlanReport',
  state: {
    list: [],
    pagination: {
      showSizeChanger: true,
      showQuickJumper: true,
      current: 1,
      total: 0,
      pageSize: 10
    }
  },
  // subscriptions: {
  //   setup ({ dispatch, history }) {
  //     history.listen(({ pathname, search }) => {
  //       if (!search) return
  //       const query = analysisUrl(search)
  //       query.planId = decodeURIComponent(query.planId)
  //       if (pathname === '/timing/report') {
  //         const payload = { currentPage: 1, pageSize: 10, ...query }
  //         dispatch({
  //           type: 'query',
  //           payload
  //         })
  //       }
  //     })
  //   }
  // },
  effects: {
    *query ({ payload = {} }, { call, put }) {
      payload = removeEmpty(payload)
      const data = yield call(queryTaskAutomaticWorkList, payload)
      if (data) {
        yield put({
          type: 'querySuccess',
          payload: {
            list: data.body.items,
            pagination: {
              current: Number(payload.currentPage) || 1,
              pageSize: Number(payload.pageSize) || 10,
              total: data.body.totalRecords
            }
          }
        })
      }
    }
  },
  reducers: {
    querySuccess (state, { payload }) {
      const { list, pagination } = payload
      return {
        ...state,
        list,
        pagination: {
          ...state.pagination,
          ...pagination
        }
      }
    }
  }
}