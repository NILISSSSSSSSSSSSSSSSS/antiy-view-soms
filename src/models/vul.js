import api from '@/services/api'

export default {
  namespace: 'vul',
  state: {
    body: {},
    AssetAndVulListBody: [],
    VulnerabilityDetailBody: [],
    VulManageListBody: [],
    VulnerabilityListBody: {},
    VulLogListBody: [],
    VulPatchLogListBody: [],
    LoopholeAnalysisBody: [],
    PatchAnalysisBody: [],
    AnalysisBody: [],
    PatchList: [],
    AssetList: {},
    undoBody: {},
    vulList: [],
    assetList: [],
    undoList: [{ key: 'e45b7279-901b-4edd-9f9a-98ba9db2289e', name: '漏洞登记', value: 0 },
      { key: '_720c74a4-ab88-40be-bb2e-a2eaae81b1dd', name: '漏洞分析', value: 0 },
      { key: 'ed74e532-ad10-47da-a9ea-add655d87e1b', name: '待漏洞补丁分析', value: 0 },
      { key: '_103145ba-13db-4a92-96b0-b0ecfe3f5ac7', name: '补丁登记', value: 0 },
      { key: 'cb32ceff-11aa-4d10-8d2f-d8e2072e8680', name: '补丁分析', value: 0 }], //待办事务统计
    assetMapVulRepairBody: {},
    assetGroupBody: [],
    userInAssetBody: [],
    manufacturerBody: [],
    osListBody: [],
    inspectListBody: {},
    assetAndPatchListBody: {},
    PatchDetailBody: {},
    RelatedVulnListBody: {},
    EffectAssetListBody: {},
    PatchStatucBody: [],
    assetOnPatchInstallBody: {},
    assetOnManualInstallBody: {},
    vulListByAssetIdBody: {},
    insertedPatchId: {},
    vulAssetRelateList: [],
    patchAssetRelateList: [],
    vulTypeList: [],
    getBugUsers: []
  },
  effects: {
    *getList ({ payload }, { call, put }) {
      const data = yield call(api.getList, payload)
      yield put({ type: 'save', payload: { body: data.body } })
    },

    *getListPatchByAssetId ({ payload }, { call, put }) {
      const data = yield call(api.getListPatchByAssetId, payload)

      yield put({ type: 'save', payload: { assetOnManualInstallBody: data.body } })
    },

    *getPatchDetail ({ payload }, { call, put }) {
      const data = yield call(api.getPatchDetail, payload)
      yield put({ type: 'save', payload: { PatchDetailBody: data.body } })
    },

    *getPatchListOnPatchVulAnalyze ({ payload }, { call, put }) {
      const data = yield call(api.getPatchList, payload)
      yield put({ type: 'save', payload: { PatchList: data.body  } })
    },

    *getPatchList ({ payload }, { call, put }) {
      const data = yield call(api.getPatchList, payload)
      yield put({ type: 'save', payload: { body: data.body  } })
    },

    *getPatchListOnVulUpdate ({ payload }, { call, put }) {
      const data = yield call(api.getPatchList, payload)
      yield put({ type: 'save', payload: { PatchList: data.body  } })
    },

    * getBugUserss ({ payload }, { call, put }){
      const data = yield call(api.getBugUsers, payload)
      yield put({ type: 'save', payload: { getBugUsers: data.body } })
    },

    *getPatchListOnAnalyze ({ payload }, { call, put }) {
      const data = yield call(api.getPatchListOnAnalyze, payload)
      yield put({ type: 'save', payload: { PatchList: data.body  } })
    },
    *getVulTypeList ({ payload }, { call, put }) {
      const data = yield call(api.getVulTypeList, payload)
      yield put({ type: 'save', payload: { vulTypeList: data.body || [] } })
    },
    *getListAssetAndPatch ({ payload }, { call, put }) {
      const data = yield call(api.getListAssetAndPatch, payload)
      yield put({ type: 'save', payload: { body: data.body } })
    },
    *getListAssetByPatchId ({ payload }, { call, put }) {
      const data = yield call(api.getListAssetByPatchId, payload)
      yield put({ type: 'save', payload: { body: data.body } })
    },
    *getListAssetByPatch ({ payload }, { call, put }) {
      const data = yield call(api.getListAssetByPatch, payload)
      yield put({ type: 'save', payload: { EffectAssetListBody: data.body || {} } })
    },

    *getVulManageList ({ payload }, { call, put }) {
      const data = yield call(api.getVulManageList, payload)
      yield put({ type: 'save', payload: { VulManageListBody: data.body } })
    },

    *getAssetAndVulList ({ payload }, { call, put }) {
      const data = yield call(api.getAssetAndVulList, payload)
      yield put({ type: 'save', payload: { AssetAndVulListBody: data.body } })
    },

    *getListAssetByVulId ({ payload }, { call, put }) {
      const data = yield call(api.getListAssetByVulId, payload)
      yield put({ type: 'save', payload: { AssetList: data.body || {} } })
    },

    *getListAssetByVulIdOnBugDetail ({ payload }, { call, put }) {
      const data = yield call(api.getListAssetByVulId, payload)
      yield put({ type: 'save', payload: { AssetList: data.body || {} } })
    },

    *getVulnerabilityDetail ({ payload }, { call, put }) {
      const data = yield call(api.getVulnerabilityDetail, payload)
      yield put({ type: 'save', payload: { VulnerabilityDetailBody: data.body } })
    },

    *getVulLogList ({ payload }, { call, put }) {
      const data = yield call(api.getVulLogList, payload)
      yield put({ type: 'save', payload: { VulLogListBody: data.body } })
    },

    *getVulPatchLogList ({ payload }, { call, put }) {
      const data = yield call(api.getVulPatchLogList, payload)
      yield put({ type: 'save', payload: { VulPatchLogListBody: data.body } })
    },

    *getLoopholeAnalysis ({ payload }, { call, put }) {
      const data = yield call(api.getLoopholeAnalysis, payload)
      yield put({ type: 'save', payload: { LoopholeAnalysisBody: data.body } })
    },

    *getPatchAnalysis ({ payload }, { call, put }) {
      const data = yield call(api.getPatchAnalysis, payload)
      yield put({ type: 'save', payload: { PatchAnalysisBody: data.body } })
    },

    *getAnalysis ({ payload }, { call, put }) {
      const data = yield call(api.getAnalysis, payload)
      yield put({ type: 'save', payload: { AnalysisBody: data.body } })
    },
    *saveVul ({ payload }, { call, put }) {
      const data = yield call(api.saveVul, payload)
      yield put({ type: 'save', payload: { VulnerabilityDetailBody: data.body } })
    },
    *modifyVul ({ payload }, { call, put }) {
      const data = yield call(api.modifyVul, payload)
      yield put({ type: 'save', payload: { modifyBody: data.body } })
    },
    *savePatch ({ payload }, { call, put }) {
      const data = yield call(api.savePatch, payload)
      yield put({ type: 'save', payload: { insertedPatchId: data.body } })
    },
    *updateForRegister  ({ payload }, { call, put }) {
      const data = yield call(api.updateForRegister, payload)
      yield put({ type: 'save', payload: { updateForRegisterBody: data.body } })
    },
    *updateForRegisterForBug  ({ payload }, { call, put }) {
      const data = yield call(api.updateForRegisterForBug, payload)
      yield put({ type: 'save', payload: { updateForBugRegisterBody: data.body } })
    },
    //查询漏洞补丁工作台我的待办数
    *getMyBugPatchUndoCount ({ payload }, { call, put }) {
      const data = yield call(api.getMyBugPatchUndoCount)
      let undoList = [{ key: 'e45b7279-901b-4edd-9f9a-98ba9db2289e', name: '漏洞登记', value: 0 },
        { key: '_720c74a4-ab88-40be-bb2e-a2eaae81b1dd', name: '漏洞分析', value: 0 },
        { key: 'ed74e532-ad10-47da-a9ea-add655d87e1b', name: '待漏洞补丁分析', value: 0 },
        { key: '_103145ba-13db-4a92-96b0-b0ecfe3f5ac7', name: '补丁登记', value: 0 },
        { key: 'cb32ceff-11aa-4d10-8d2f-d8e2072e8680', name: '补丁分析', value: 0 }] //待办事务统计
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

    *getAssetMapVulRepairBody ( { payload }, { call, put } ){
      const data = yield call(api.getAssetVulStateList, payload)
      yield put({ type: 'save', payload: { assetMapVulRepairBody: data.body } })
    },

    *getAssetGroup ( { payload }, { call, put } ){
      const data = yield call(api.getAssetGroup, payload)
      yield put({ type: 'save', payload: { assetGroupBody: data.body } })
    },

    *getUserInAsset ( { payload }, { call, put } ){
      const data = yield call(api.getUserInAsset, payload)
      yield put({ type: 'save', payload: { userInAssetBody: data.body } })
    },

    *getManufacturer ( { payload }, { call, put } ){
      const data = yield call(api.getManufacturer, payload)
      yield put({ type: 'save', payload: { manufacturerBody: data.body } })
    },

    *getOsList ( { payload }, { call, put } ){
      const data = yield call(api.getOsList, payload)
      yield put({ type: 'save', payload: { osListBody: data.body } })
    },

    *inspectList ( { payload }, { call, put } ){
      const data = yield call(api.getInspectList, payload)
      yield put({ type: 'save', payload: { inspectListBody: data.body } })
    },

    *assetAndPatchList ( { payload }, { call, put } ){
      const data = yield call(api.getAssetAndPatchList, payload)
      yield put({ type: 'save', payload: { assetAndPatchListBody: data.body } })
    },
    *getListVulByPatchId ({ payload }, { call, put }) {
      const data = yield call(api.getListVulByPatchId, payload)
      yield put({ type: 'save', payload: { RelatedVulnListBody: data.body } })
    },
    *getPatchStatus ({ payload }, { call, put }) {
      const data = yield call(api.getPatchStatus, payload)
      yield put({ type: 'save', payload: { PatchStatucBody: data.body } })
    },
    *getVulnerabilityList ({ payload }, { call, put }) {
      const data = yield call(api.getVulnerabilityList, payload)
      yield put({ type: 'save', payload: { VulnerabilityListBody: data.body } })
    },
    *getListAssetOnPatchInstall ({ payload }, { call, put }) {
      const data = yield call(api.listAssetOnPatchInstall, payload)
      yield put({ type: 'save', payload: { assetOnPatchInstallBody: data.body } })
    },
    *deleteVulPatchRel ({ payload }, { call, put }) {
      const data = yield call(api.deleteVulPatchRel, payload)
      yield put({ type: 'save', payload: { deVulPathBody: data.body } })
    },
    *deleteVulAssetRel ({ payload }, { call, put }) {
      const data = yield call(api.deleteVulAssetRel, payload)
      yield put({ type: 'save', payload: { deVulAssetBody: data.body } })
    },
    *deletePatchAssetRel ({ payload }, { call, put }) {
      const data = yield call(api.deletePatchAssetRel, payload)
      yield put({ type: 'save', payload: { deVulAssetBody: data.body } })
    },
    *vulListByAssetId ({ payload }, { call, put }) {
      const data = yield call(api.vulListByAssetId, payload)
      yield put({ type: 'save', payload: { vulListByAssetIdBody: data.body } })
    },
    *patchActivitiClaimTask ({ payload }, { call, put }) {
      const data = yield call(api.patchActivitiClaimTask, payload)
      yield put({ type: 'save', payload: { patchActivitiClaimTaskBody: data.body } })
    },
    *getVulAssetRelateList ({ payload }, { call, put }) {
      const data = yield call(api.getVulAssetRelateList, payload)
      yield put({ type: 'save', payload: { vulAssetRelateList: data.body } })
    },
    *getPatchAssetRelateList ({ payload }, { call, put }) {
      const data = yield call(api.getPatchAssetRelateList, payload)
      yield put({ type: 'save', payload: { patchAssetRelateList: data.body } })
    }
  },
  reducers: {
    save (state, action) {
      return { ...state, ...action.payload }
    }
  }
}
