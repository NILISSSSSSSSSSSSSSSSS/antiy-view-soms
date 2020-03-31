import api from '@/services/api'
import { message } from 'antd'

export default {
  namespace: 'personalCenter',
  state: {
    currentUserInfo: {}
  },
  effects: {
    *saveInfo ({ payload }, { call, put, select }){
      console.log('effects===saveInfo', payload, api)
      const data = yield call(api.saveUserInfo, payload)
      console.log('saveInfo===data', data)
      if(data.head && data.head.code === '200'){
        const personalCenter = yield select((data)=> data.personalCenter)
        const currentUserInfo = { ...personalCenter.currentUserInfo, ...payload }
        let cacheUser = sessionStorage.getItem('currentUser')
        cacheUser = JSON.parse(cacheUser)
        // 把修改过后的信息添加到sess中
        for(let k in currentUserInfo){
          if(currentUserInfo.hasOwnProperty(k)){
            cacheUser[k] = currentUserInfo[k]
          }
        }
        sessionStorage.setItem('currentUser', JSON.stringify(cacheUser))
        yield put({ type: 'save', payload: { currentUserInfo } })
        message.success('更新信息成功！')
      }
    },
    *updatePwd ({ payload }, { call, put, select }){
      console.log('effects===updatePwd', payload, api)
      const data = yield call(api.updatePwdServer, payload)
      console.log('===updatePwd====data', data)
      if(data.head && data.head.code === '200'){
        message.info('更新信息成功,将在3秒后退出登录！')
      }
    }
  },
  reducers: {
    save (state, action) {
      return { ...state, ...action.payload }
    }
  }
}
