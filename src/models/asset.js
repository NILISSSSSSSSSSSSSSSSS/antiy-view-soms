import api from '@/services/api'

export default {
  namespace: 'asset',
  state: {
    softwareBody: { items: [] }, // 软件资产列表
    categoryModelNode: [], // 硬件资产类型
    groupInfoBody: [], // 资产组
    manufacturerList: [], // 厂商
    baselineTemplate: [], //基准模板
    userInAssetList: [], // 使用者
    installableList: {}, //关联软件列表
    getAssetsOS: [], // 操作系统
    previousBatch: [
      {
        note: '',
        fileInfo: ''
      }
    ],
    baseTableList: [],
    allList: { items: [], total: 0 },
    userAreaTree: {
      childrenNode: []
    }, // 区域树
    personnelIdentityManagerBody: {}, //人员身份+-
    departmentNode: {},  //部门节点
    groupManagerBody: {
      items: [],
      totalRecords: {}
    }, //资产组信息
    assetBody: { items: [], totalRecords: 0 }, //资产信息
    assetLinkedList: {},
    baseCategoryModelByTree: [], //硬件登记操作系统
    registrationAreaId: '',
    hardwareAsset: { //硬件信息
      asset: {},
      assetCpu: [],
      assetNetworkCard: [],
      assetMemory: [],
      assetHardDisk: [],
      assetMainborad: [],
      assetNetworkEquipment: {},
      assetSafetyEquipment: {},
      assetStorageMedium: {},
      assetSoftware: [],
      assetSoftwareRelationList: {}
    },
    flag: {},
    usersByRoleCodeAndAreaIdList: [], // 资产管理员
    undoBody: {},
    undoList: [{ key: '_62020450-3ccd-4650-a689-cd72e90edd19', name: '资产登记', value: 0 },
      { key: '_66dccce3-2fae-4fda-8ce8-dfd4a8603f2a', name: '硬件配置基准', value: 0 },
      { key: 'cde0a8a0-f9ae-4586-88fe-3f47e3eadd68', name: '硬件基准验证', value: 0 },
      { key: 'cee0ab3a-5864-42fc-8361-af6d9a1fd89f', name: '硬件准入实施', value: 0 },
      { key: 'a5a86cff-80c4-4ebe-a789-5fcaafa4bb05', name: '硬件效果检查', value: 0 },
      { key: 'ad642852-9c46-464f-803f-757228ac879a', name: '拓扑登记', value: 0 },
      { key: '_9fb0a68d-d0db-4176-b7f1-c97a93827985', name: '资产变更', value: 0 },
      { key: '_857515e4-8d85-47bd-81cf-d0421dfadf07', name: '硬件待退役', value: 0 },
      { key: 'bb60271e-f4cf-4447-8211-e52a2e99d28b', name: '硬件退役', value: 0 },
      { key: '_17c5f80e-a65b-45b1-bb18-22537f511133', name: '软件配置基准', value: 0 }
    ], //待办事务统计
    userAreasNode: [], // 用户所属区域树
    configList: {}, // 资产基准管理列表
    templetInfo: {}, // 模板信息
    templetList: {}, // 模板列表
    userList: {}, // 执行人列表
    /** 通联管理开始*/
    assetRelationDetailsObj: {
      asset: {}
    }, //资产信息
    assetRelationDetailsList: {
      items: []
    }, //通联关系
    assetRelationDetailsListDelete: '', // 移除
    assetRelationDetailsListAddAssetGroup: [], // 资产组
    assetRelationDetailsListAddList: {}, //添加页面列表
    relationUseableIpNet: [], //添加页面详情ip和网口
    assetRelationDetailsListAddDetailsAdd: '', //新增通联返回数据
    /** 通联管理结束*/
    importAssetLoading: false,
    getGroupQueryId: {}//资产组详情
  },
  effects: {
    * getSoftwareList ({ payload }, { call, put }) {
      const data = yield call(api.getSoftwareList, payload)
      yield put({ type: 'save', payload: { softwareBody: data.body } })
    },
    *getGroupInfo ({ payload }, { call, put }) {
      const data = yield call(api.getGroupInfo, payload)
      yield put({ type: 'save', payload: { groupInfoBody: data.body } })
    },
    * getManufacturerInfo ({ payload }, { call, put }) {
      const data = yield call(api.getManufacturerInfo, payload)
      yield put({ type: 'save', payload: { manufacturerList: data.body } })
    },
    * getUserInAsset ({ payload }, { call, put }) {
      const data = yield call(api.getUserInAsset, payload)
      yield put({ type: 'save', payload: { userInAssetList: data.body || [] } })
    },
    *getAssetsOS ({ payload }, { call, put }) {
      const data = yield call(api.getAssetsOS, payload)
      yield put({ type: 'save', payload: { getAssetsOS: data.body } })
    },
    * getUserAreaTree ({ payload }, { call, put }) {
      const data = yield call(api.getUserAreaTree, payload)
      yield put({ type: 'save', payload: { userAreaTree: data.body } })
    },
    * getPersonnelIdentityManagerList ({ payload }, { call, put }) {
      const data = yield call(api.getPersonnelIdentityManagerList, payload)
      yield put({ type: 'save', payload: { personnelIdentityManagerBody: data.body } })
    },
    * getDepartmentNode ({ payload }, { call, put }) {
      const data = yield call(api.getDepartmentNode, payload)
      yield put({ type: 'save', payload: { departmentNode: data.body ? data.body : [] } })
    },
    * getGroupManagerList ({ payload }, { call, put }) {
      const data = yield call(api.getGroupManagerList, payload)
      yield put({ type: 'save', payload: { groupManagerBody: data.body } })
    },
    * getAssetList ({ payload }, { call, put }) {
      const data = yield call(api.getAssetList, payload)
      yield put({ type: 'save', payload: { assetBody: data.body } })
    },

    * addCategoryModel ({ payload }, { call, put }) {
      const data = yield call(api.addCategoryModel, payload)
      yield put({ type: 'save', payload: { flag: data } })
    },
    * editCategoryModel ({ payload }, { call, put }) {
      payload.isDefault = 1
      const data = yield call(api.editCategoryModel, payload)
      yield put({ type: 'save', payload: { flag: data } })
    },
    * savaAssetGroup ({ payload }, { call, put }) {
      const data = yield call(api.savaAssetGroup, payload)
      yield put({ type: 'save', payload: { body: data.body } })
    },
    * getUsersByRoleCodeAndAreaId ({ payload }, { call, put }) {
      const data = yield call(api.getUsersByRoleCodeAndAreaId, payload)
      yield put({ type: 'save', payload: { usersByRoleCodeAndAreaIdList: data.body || [] } })
    },
    * getAssetHardWareById ({ payload }, { call, put }) {
      const data = yield call(api.getAssetHardWareById, payload)
      yield put({ type: 'save', payload: { hardwareAsset: data.body } })
    },
    * assetLinkedList ({ payload }, { call, put }) {
      const data = yield call(api.assetLinkedList, payload)
      if (data.head && data.head.code === '200')
        yield put({ type: 'save', payload: { assetLinkedList: data.body } })
    },
    //查询工作台我的待办事项
    * getMyUndoCount ({ payload }, { call, put }) {
      const data = yield call(api.getMyUndoCount)
      let undoList = [{ key: '_62020450-3ccd-4650-a689-cd72e90edd19', name: '资产登记', value: 0 },
        { key: '_66dccce3-2fae-4fda-8ce8-dfd4a8603f2a', name: '硬件配置基准', value: 0 },
        { key: 'cde0a8a0-f9ae-4586-88fe-3f47e3eadd68', name: '硬件基准验证', value: 0 },
        { key: 'cee0ab3a-5864-42fc-8361-af6d9a1fd89f', name: '硬件准入实施', value: 0 },
        { key: 'a5a86cff-80c4-4ebe-a789-5fcaafa4bb05', name: '硬件效果检查', value: 0 },
        { key: 'ad642852-9c46-464f-803f-757228ac879a', name: '拓扑登记', value: 0 },
        { key: '_9fb0a68d-d0db-4176-b7f1-c97a93827985', name: '资产变更', value: 0 },
        { key: '_857515e4-8d85-47bd-81cf-d0421dfadf07', name: '硬件待退役', value: 0 },
        { key: 'bb60271e-f4cf-4447-8211-e52a2e99d28b', name: '硬件退役', value: 0 },
        { key: '_17c5f80e-a65b-45b1-bb18-22537f511133', name: '软件配置基准', value: 0 }
      ] //待办事务统计
      if (data.body) {
        let body = data.body
        undoList.map(e => {
          if (body[e.key]) {
            e.value = body[e.key]
          }
          return e
        })
      }
      yield put({ type: 'save', payload: { undoBody: data.body, undoList: undoList } })
    },
    * getAreasByUserId ({ payload }, { call, put }) {
      const data = yield call(api.getAreasByUserId, payload)
      yield put({ type: 'save', payload: { userAreasNode: data.body } })
    },
    // 获取资产基准管理列表
    * getConfigList ({ payload }, { call, put }) {
      const data = yield call(api.getConfigList, payload)
      yield put({ type: 'save', payload: { configList: data.body } })
    },
    // 获取模板信息
    * getTempletInfo ({ payload }, { call, put }) {
      const data = yield call(api.getTempletInfo, payload)
      yield put({ type: 'save', payload: { templetInfo: data.body } })
    },

    // 获取模板列表
    * getTempletList ({ payload }, { call, put }) {
      const data = yield call(api.getTempletList, payload)
      yield put({ type: 'save', payload: { templetList: data.body } })
    },
    //**通用配置子项start */
    * assetRelationDetailsObj ({ payload }, { call, put }) {
      const data = yield call(api.assetRelationDetailsObj, payload)
      yield put({ type: 'save', payload: { assetRelationDetailsObj: data.body } })
    },
    * assetRelationDetailsList ({ payload }, { call, put }) {
      const data = yield call(api.assetRelationDetailsList, payload)
      yield put({ type: 'save', payload: { assetRelationDetailsList: data.body } })
    },
    * assetRelationDetailsListDelete ({ payload }, { call, put }) {
      const data = yield call(api.assetRelationDetailsListDelete, payload)
      yield put({ type: 'save', payload: { assetRelationDetailsListDelete: data.body } })
    },
    * assetRelationDetailsListAddAssetGroup ({ payload }, { call, put }) {
      const data = yield call(api.assetRelationDetailsListAddAssetGroup, payload)
      yield put({ type: 'save', payload: { assetRelationDetailsListAddAssetGroup: data.body } })
    },
    * assetRelationDetailsListAddList ({ payload }, { call, put }) {
      const data = yield call(api.assetRelationDetailsListAddList, payload)
      yield put({ type: 'save', payload: { assetRelationDetailsListAddList: data.body } })
    },
    * relationUseableIpNet ({ payload }, { call, put }) {
      const data = yield call(api.relationUseableIpNet, payload)
      yield put({ type: 'save', payload: { relationUseableIpNet: data.body } })
    },
    * assetRelationDetailsListAddDetailsAdd ({ payload }, { call, put }) {
      const data = yield call(api.assetRelationDetailsListAddDetailsAdd, payload)
      yield put({ type: 'save', payload: { assetRelationDetailsListAddDetailsAdd: data.body } })
    },
    * installableList ({ payload }, { call, put }) {
      const data = yield call(api.installableList, payload)
      yield put({ type: 'save', payload: { installableList: data.body } })
    },
    * baselineTemplate ({ payload }, { call, put }) {
      const data = yield call(api.baselineTemplate, payload)
      yield put({ type: 'save', payload: { baselineTemplate: data.body } })
    },
    * previousBatch ({ payload }, { call, put }) {
      const data = yield call(api.previousBatch, payload)
      yield put({ type: 'save', payload: { previousBatch: data.body } })
    },
    //**通用配置子项end */
    //查询资产组详情
    * getGroupQueryId ({ payload }, { call, put }) {
      const data = yield call(api.getGroupQueryId, payload)
      yield put({ type: 'save', payload: { getGroupQueryId: data.body } })
    }
  },
  reducers: {
    save (state, action) {
      return { ...state, ...action.payload }
    },
    saveOperateStatus (state, { payload }) {
      return {
        ...state,
        from: payload.from
      }
    },
    saveRegisterInfo (state, { payload }) {
      return {
        ...state,
        allList: payload.allList,
        assetGroupName: payload.assetGroupName,
        remark: payload.remark
      }
    },
    importAssetLoading (state, { payload }) {
      return {
        ...state,
        importAssetLoading: payload
      }
    },
    registrationAreaId (state, { payload }) {
      return {
        ...state,
        registrationAreaId: payload
      }
    }
  }
}
