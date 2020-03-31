import request from '@/utils/request'

//批量查询
export const getBusinessList = params => {
  return request('/asset/assetbusiness/query/list', { method: 'post', params })
}

//查询业务信息
export const getBusinessInfo = params => {
  return request('/asset/assetbusiness/query/info', { method: 'post', params })
}

//保存接口
export const saveBusinessSingle = params => {
  return request('/asset/assetbusiness/save/single', { method: 'post', params })
}

//修改接口
export const updateBusinessSingle = params => {
  return request('/asset/assetbusiness/update/single', { method: 'post', params })
}

//业务已关联资产信息
export const businessAndAsset = params => {
  return request('/asset/assetbusiness/query/assetRelation/list', { method: 'post', params })
}

//查询可添加资产
export const getbusinessIsAsset = params => {
  return request('/asset/assetbusiness/query/asset/list', { method: 'post', params })
}
//通过uniqueId删除接口
export const deleteBusiness = params => {
  return request('/asset/assetbusiness/delete', { method: 'post', params })
}

