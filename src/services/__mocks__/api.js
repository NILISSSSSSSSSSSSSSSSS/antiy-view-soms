// GET 根据ID获取资产详情

export function getAssetHardWareById (params) {
  return Promise.resolve({
    head: { code: '200' },
    body: { asset: { stringId: '-------------' } }
  })
}

export function batchRelation (params) {
  return Promise.resolve({
    head: { code: '200' },
    body: { }
  })
}

export function claimTaskBatch (params) {
  return Promise.resolve({
    head: { code: '200' }
  })
}

export function querySuddenList (params) {
  return Promise.resolve({
    head: { code: '200' },
    body: {
      items: [
        {
          antiyVulnId: '12345'
        }
      ],
      totalRecords: 1
    }
  })
}
export function getList (params) {
  return Promise.resolve({
    head: { code: '200' },
    body: {
      items: [{}],
      totalRecords: 1
    }
  })
}
export function scanUrl (params) {
  return Promise.resolve({
    head: { code: '200' },
    body: {
      onProgress: 10,
      errorMessage: '',
      findAssetNums: 10
    }
  })
}
export function getBugUsers (params) {
  return Promise.resolve({
    head: { code: '200' },
    body: []
  })
}
export function onBackSubmit (params) {
  return Promise.resolve({
    head: { code: '200' },
    body: []
  })
}
export function getAdvise (params) {
  return Promise.resolve({
    head: { code: '200' },
    body: {}
  })
}
export function getVulnCpe (params) {
  return Promise.resolve({
    head: { code: '200' },
    body: {
      items: [],
      totalRecords: 1
    }
  })
}
export default {
  scanUrl,
  getAdvise,
  onBackSubmit,
  getBugUsers,
  getList,
  getAssetHardWareById,
  batchRelation,
  claimTaskBatch,
  querySuddenList,
  getVulnCpe
}
