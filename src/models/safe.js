import api from '@/services/api'

export default {
  namespace: 'safe',
  state: {
    //版本号下拉列表
    safetyQueryPulldown: [],
    featurelibraryVersion: [],
    facturer: [],
    assetId: '',
    categoryModelNode: [],
    safetythreataptList: {},
    safetythreataptEquip: [],
    safetythreattanhaiList: {},
    safetythreattanhaiEquip: [],
    safetythreatvirusList: {},
    safetythreatvirusEquip: [],
    specifiedCategoryNode: [], // 指定页面的资产类型
    safetySupplierList: [],
    safetyVersionList: [],
    safetyNameList: []
  },
  effects: {
    //所有特征库版本号
    *featurelibraryVersion ({ payload }, { call, put }) {
      const data = yield call(api.featurelibraryVersion, payload)
      yield put({ type: 'save', payload: { safetyQueryPulldown: data.body || [] } })
    },
    //升级包指定版本号
    *safetyQueryPulldown ({ payload }, { call, put }) {
      const data = yield call(api.safetyQueryPulldown, payload)
      yield put({ type: 'save', payload: { safetyQueryPulldown: data.body || [] } })
    },
    //升级包所有版本号
    *safetyPulldown ({ payload }, { call, put }) {
      const data = yield call(api.safetyPulldown, payload)
      yield put({ type: 'save', payload: { safetyQueryPulldown: data.body || [] } })
    },
    //特性库信息查询版本
    *featureSafetyVersion ({ payload }, { call, put }) {
      const data = yield call(api.featureSafetyVersion, payload)
      yield put({ type: 'save', payload: { safetyQueryPulldown: data.body || [] } })
    },
    //特性库管理查询版本
    *featurelibraryQueryVersion ({ payload }, { call, put }) {
      const data = yield call(api.featurelibraryQueryVersion, payload)
      yield put({ type: 'save', payload: { safetyQueryPulldown: data.body || [] } })
    },
    //特征所有版本号
    *featureQueryVersion ({ payload }, { call, put }) {
      const data = yield call(api.featureQueryVersion, payload)
      yield put({ type: 'save', payload: { safetyQueryPulldown: data.body || [] } })
    },
    //获取安全设备厂商
    *safetyManufacturer ({ payload }, { call, put }) {
      const data = yield call(api.safetyManufacturer, payload)
      yield put({ type: 'save', payload: { facturer: data.body || [] } })
    },
    //资产类型树
    *getcategoryModelNodeTree ({ payload }, { call, put }) {
      const data = yield call(api.getcategoryModelNodeTree, payload)
      yield put({ type: 'save', payload: { categoryModelNode: data.body } })
    },
    *equipmentIncludeById ({ payload }, { call, put }) {
      yield put({ type: 'save', payload: { assetId: payload.id } })
    },
    *getsafetythreataptList ({ payload }, { call, put }) {
      const data = yield call(api.getsafetythreataptList, payload)
      yield put({ type: 'save', payload: { safetythreataptList: data.body || [] } })
    },
    *getsafetythreataptEquip ({ payload }, { call, put }) {
      const data = yield call(api.getsafetythreataptEquip, payload)
      yield put({ type: 'save', payload: { safetythreataptEquip: data.body || [] } })
    },
    *getsafetythreattanhaiList ({ payload }, { call, put }) {
      const data = yield call(api.getsafetythreattanhaiList, payload)
      yield put({ type: 'save', payload: { safetythreattanhaiList: data.body || [] } })
    },
    *getsafetythreattanhaiEquip ({ payload }, { call, put }) {
      const data = yield call(api.getsafetythreattanhaiEquip, payload)
      yield put({ type: 'save', payload: { safetythreattanhaiEquip: data.body || [] } })
    },
    *getsafetythreatvirusList ({ payload }, { call, put }) {
      const data = yield call(api.getsafetythreatvirusList, payload)
      yield put({ type: 'save', payload: { safetythreatvirusList: data.body || [] } })
    },
    *getsafetythreatvirusEquip ({ payload }, { call, put }) {
      const data = yield call(api.getsafetythreatvirusEquip, payload)
      yield put({ type: 'save', payload: { safetythreatvirusEquip: data.body || [] } })
    },
    //获取管理区域树
    *getCurrentUserAreas ({ payload }, { call, put }) {
      const data = yield call(api.getUserAreaTree, payload)
      yield put({ type: 'save', payload: { treeData: [data.body] } })
    },
    // 获取指定页面的资产类型
    *sefetySpecifiedCategoryNode ({ payload }, { call, put }) {
      const data = yield call(api.sefetySpecifiedCategoryNode, payload)
      yield put({ type: 'save', payload: { specifiedCategoryNode: data.body || [] } })
    },
    // 获取厂商列表
    *getSafetySupplier ({ payload }, { call, put }) {
      const data = yield call(api.getSafetySupplier, payload)
      yield put({ type: 'save', payload: { safetySupplierList: (data.body || []).map(e => ({ name: e.val, value: e.val })) } })
    },
    // 获取版本列表
    *getSafetyVersion ({ payload }, { call, put }) {
      const data = yield call(api.getSafetyVersion, payload)
      yield put({ type: 'save', payload: { safetyVersionList: (data.body || []).map(e => ({ name: e.val, value: e.val })) } })
    },
    // 获取名称列表
    *getSafetyName ({ payload }, { call, put }) {
      const data = yield call(api.getSafetyName, payload)
      yield put({ type: 'save', payload: { safetyNameList: (data.body || []).map(e => ({ name: e.val, value: e.val })) } })
    },
    *clearSafetyName ({ payload }, { call, put }) {
      yield put({ type: 'save', payload: { safetyNameList: [], safetyVersionList: [] } })
    },
    *clearSafetyVersion ({ payload }, { call, put }) {
      yield put({ type: 'save', payload: { safetyVersionList: [] } })
    }
  },
  reducers: {
    save (state, action) {
      return { ...state, ...action.payload }
    }
  }
}
