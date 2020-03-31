import api from '@/services/api'
import { removeEmpty, arrayToString } from '@/utils/common'
import _ from 'lodash'
const { queryTaskPlanList, saveTaskPlan, queryTaskAutomaticWorkList, startupTaskPlan, pauseTaskPlan, updateTaskPlan } = api
export default {
  namespace: 'taskPlan',
  state: {
    list: [],
    pagination: {
      showQuickJumper: true,
      showSizeChanger: true,
      current: 1,
      total: 0,
      pageSize: 10
    },
    typeMapping: {
      'ASSETS_SCAN': '定时资产扫描',
      'PATCH_SCAN': '定时补丁扫描',
      'VUL_SCAN': '定时漏洞扫描',
      // 'BASELINE_SCAN': '定时配置扫描',
      'ASSET_DISCOVERY': '定时资产探测'
    },
    scanNumMapping: {
      'ASSETS_SCAN': '扫描终端数',
      'PATCH_SCAN': '扫描终端数',
      'VUL_SCAN': '扫描资产数量',
      'BASELINE_SCAN': '扫描终端数',
      'ASSET_DISCOVERY': '扫描终端数'

    },
    matchNumMapping: {
      'ASSETS_SCAN': '下发终端数',
      'PATCH_SCAN': '下发终端数',
      'VUL_SCAN': '存在漏洞资产数量',
      'BASELINE_SCAN': '下发终端数',
      'ASSET_DISCOVERY': '未知资产数'
    },
    noMatchNumMapping: {
      'ASSETS_SCAN': '未下发终端数',
      'PATCH_SCAN': '未下发终端数',
      'VUL_SCAN': '未存在漏洞资产数量',
      'BASELINE_SCAN': '未下发终端数'
    },
    monthday: 0,
    stateMapping: {
      RUNNING: '启动',
      PAUSED: '挂起'
    },
    taskCycleMapping: {
      ONCE: '一次',
      DAILY: '每天',
      WEEKLY: '每周',
      MONTH: '每月'
    },
    modalVisible: false,
    modalCycle: 'once'
  },
  // subscriptions: {
  //   setup ({ dispatch, history }) {
  //     history.listen(({ pathname }) => {
  //       if (pathname === '/timing/list') {
  //         const payload = { currentPage: 1, pageSize: 10 }
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
      const data = yield call(queryTaskPlanList, payload)
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
    },
    *save ({ payload = {} }, { call, put }) {
      payload = removeEmpty(payload)
      payload = arrayToString(payload)
      const data = yield call(saveTaskPlan, payload)
      if (data) {
        if(data && data.head && data.head.code === '200' ) return true
        const payload = { currentPage: 1, pageSize: 10 }
        yield put({
          type: 'query',
          payload
        })
        // yield put({
        //   type: 'modifyModalVisible',
        //   payload: {
        //     modalVisible: false
        //   }
        // })
      }
    },
    *update ({ payload = {} }, { call, put }) {
      payload = removeEmpty(payload)
      payload = arrayToString(payload)
      const data = yield call(updateTaskPlan, payload)
      if (data) {
        if(data && data.head && data.head.code === '200' ) return true
        const payload = { currentPage: 1, pageSize: 10 }
        yield put({
          type: 'query',
          payload
        })
        // yield put({
        //   type: 'modifyModalVisible',
        //   payload: {
        //     modalVisible: false
        //   }
        // })
      }
    },
    *queryTaskAutomaticWorkList ({ payload = {} }, { call, put }) {
      payload = removeEmpty(payload)
      const data = yield call(queryTaskAutomaticWorkList, payload)
      if (data) {
        const payload = { currentPage: 1, pageSize: 10 }
        yield put({
          type: 'query',
          payload
        })
        yield put({
          type: 'modifyModalVisible',
          payload: {
            modalVisible: false
          }
        })
      }
    },
    *startupTaskPlan ({ payload = {} }, { call, put }) {
      payload = removeEmpty(payload)
      const data = yield call(startupTaskPlan, payload)
      if (data) {
        const payload = { currentPage: 1, pageSize: 10 }
        yield put({
          type: 'query',
          payload
        })
      }
    },
    *pauseTaskPlan ({ payload = {} }, { call, put }) {
      payload = removeEmpty(payload)
      const data = yield call(pauseTaskPlan, payload)
      if (data) {
        const payload = { currentPage: 1, pageSize: 10 }
        yield put({
          type: 'query',
          payload
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
    },
    modifyModalVisible (state, { payload }) {
      const { modalVisible, record } = payload
      return {
        ...state,
        modalVisible,
        modalData: record,
        modalCycle: record && record.taskCycle.toLowerCase() || 'once'
      }
    },
    getMonthDay (state, { payload }) {
      let value = payload.modalCycle
      let startYear = Number(payload.startYear)
      let endYear = Number(payload.endYear)
      let startMonth = Number(payload.startMonth)
      let endMonth = Number(payload.endMonth)
      let list = []
      value.forEach(ob => {
        let arr = []
        // 如果开始时间与结束时间在同一年
        if (startYear === endYear) {
          arr.push(new Date( startYear, (ob), 0 ).getDate())
        }
        // 如果不在同一年
        // 需根据当前遍历的选择的月份，与开始时间所在的月份和结束时间所在的月份做比较
        else {
          if (ob >= startMonth) {
            if (ob <= endMonth) {
              for ( let i = startYear; i <= endYear; i += 1 ) {
                arr.push(new Date( i, (ob), 0 ).getDate())
              }
            } else {
              for ( let i = startYear; i <= endYear - 1; i += 1 ) {
                arr.push(new Date( i, (ob), 0 ).getDate())
              }
            }
          } else {
            if (ob <= endMonth) {
              for ( let i = startYear + 1; i <= endYear; i += 1 ) {
                arr.push(new Date( i, (ob), 0 ).getDate())
              }
            } else {
              for ( let i = startYear + 1; i <= endYear - 1; i += 1 ) {
                arr.push(new Date( i, (ob), 0 ).getDate())
              }
            }
          }
        }
        const curMonthDays =  _.min(arr)
        list.push(curMonthDays)
      })
      let str = _.min(list)
      return {
        ...state,
        monthday: str
      }
    },
    modifyTaskCycle (state, { payload }) {
      return {
        ...state,
        ...payload
      }
    }
  }
}