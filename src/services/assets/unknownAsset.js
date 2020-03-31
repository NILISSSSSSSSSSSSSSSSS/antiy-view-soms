import request from '@/utils/request'
/**
 * 获取获取资产实时探测信息
 */
export const getAssetDetect = () => {
  return request('/discovery/realtime/realAssetDetectionProgress', { method: 'post' })
}
/**
 * 提交资产探测
 * @param params {object} {
 *                          alarm : 'Boolean' 是否告警
 *                          netSegmentId : 'Array[String]' 网段id集合列表
 *                          portGroupId : 'Array[String]' 端口id集合列表
 *                         }
 */
export const submitAssetDetect = (params) => {
  return request('/discovery/realtime/realtimeAssetDetection', { method: 'post', params })
}
/**
 * 终止资产探测
 */
export const stopAssetDetect = () => {
  return request('/discovery/realtime/terminateRealAssetDetection', { method: 'post' })
}
