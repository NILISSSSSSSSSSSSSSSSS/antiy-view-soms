import request from '@/utils/request'
import { encrypt } from '@/utils/common'
export default {
  //保存当前用户信息
  saveUserInfo: (params)=>{
    return request('/user/users/me', { method: 'post', params: params } )
  },
  updatePwdServer: (params)=>{
    const _param = { newPassword: encrypt(params.newPassword), oldPassword: encrypt(params.oldPassword), id: params.id }
    return request('/user/users/password', { method: 'post', params: _param } )
  }
}

// //保存当前用户信息
// export function saveUserInfo (params) {
//   return request('/user/users/me', { method: 'post', params: params } )
// }
// // 修改密码
// export function updatePwdServer (params) {
//   const _param = { newPassword: encrypt(params.newPassword), oldPassword: encrypt(params.oldPassword), id: params.id }
//   return request('/user/users/password', { method: 'post', params: _param } )
// }
