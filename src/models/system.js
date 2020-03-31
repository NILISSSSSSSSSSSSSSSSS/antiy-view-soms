import api from '@/services/api'

const findMenuOpenKey = (payload) => {
  const openKeys = (sessionStorage.getItem('openKeys') || '').split(',')
  if(payload.length){
    const _openKey = []
    let curOpenKey = ''
    for(let  i = 0, len = payload.length; i < len - 1; ++i ){
      curOpenKey += ('/' + payload[i])
      _openKey.push(curOpenKey)
    }
    return [ ...new Set([ ...openKeys, ..._openKey ]) ]
  }else {
    return openKeys
  }
}

export default {
  namespace: 'system',
  state: {
    userList: [],
    //角色权限
    menus: [],
    //管理区域树
    treeData: [],
    workflowList: [],
    openKeys: [], // 菜单展开项
    urlArr: [],  //面包屑url
    getMsgcount: 0
  },
  subscriptions: {
    set ({ dispatch, history }) {
      history.listen(({ pathname }) => {
        const payload = pathname.split('/').splice(1)
        const openKeys = findMenuOpenKey(payload)
        dispatch({
          type: 'changeurl',
          payload: payload
        })
        dispatch({
          type: 'setMenuOpenKeys',
          payload: openKeys
        })
      })
    }
  },
  effects: {
    *getUserList ({ payload }, { call, put }) {
      const data = yield call(api.getUserList, payload)
      yield put({ type: 'save', payload: { userList: data.body.items } })
    },
    *getAllUserList ({ payload }, { call, put }) {
      const data = yield call(api.getAllUserList, payload)
      yield put({ type: 'save', payload: { userList: data.body } })
    },
    *getUserByRoleCodeAndAreald ({ payload }, { call, put }) {
      const data = yield call(api.getUserByRoleCodeAndAreald, payload)
      yield put({ type: 'save', payload: { userList: data.body } })
    },
    //获取管理区域树
    *getAreasByUserId ({ payload }, { call, put }) {
      // const data = yield call(api.getAreasByUserId, payload)
      const data = yield call(api.getTree, payload)
      yield put({ type: 'save', payload: { treeData: [data.body] } })
    },
    *getworkflowList ({ payload }, { call, put }) {
      // const data = yield call(api.getAreasByUserId, payload)
      const data = yield call(api.getworkflowList, payload)
      yield put({ type: 'save', payload: { workflowList: data.body } })
    },
    *getMsgcount ( { payload }, { call, put }){
      const data = yield call(api.getMsgcount, payload )
      yield put ( { type: 'save', payload: { getMsgcount: data.body } })
    }
  },
  reducers: {
    save (state, action) {
      return { ...state, ...action.payload }
    },
    changeurl (state, action) {
      return { ...state, urlArr: action.payload }
    },
    setMenuOpenKeys (state, action) {
      return { ...state, openKeys: action.payload }
    }
  }
}
