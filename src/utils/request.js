import fetch from 'dva/fetch'
import qs from 'qs'
import { message } from 'antd'
import { createHeaders } from './common'

function parseJSON (response) {
  return response.json()
}

function checkStatus (response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  }
  throw response
}

// 资产区域报表导出接口(/api/v1/asset/report/query/exportAreaTable)，由于返回值是文件流，无法调用此处的公共request函数，所以是单独调用的。
// 维护接口调用时，注意该接口需一起维护。
// 全局搜索接口地址(/api/v1/asset/report/query/exportAreaTable)可找到相应代码。

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request (url, options) {
  url = `/api/v1${url}`
  const opts = options || {}

  // 由于ID加密，密文可能存在特殊字符，如"/"，无法用url传参，所以所有get请求都改为post请求
  // 疑问：为什么不用encodeURIComponent对url中的参数进行编码来避免以上问题，而要通过get改post的方式来解决？
  opts.method = 'post'

  // 由于所有get都改为了post，所以可能存在无参数的情况
  opts.params = opts.params || {}

  // 设置请求头
  opts.headers = createHeaders(opts.params)

  // 当请求为非上传类型时，设置Content-Type
  if (!(opts.params instanceof FormData)) {
    opts.headers['Content-Type'] = 'application/json; charset=UTF-8'
  }

  // 处理参数
  if (opts.method === 'post') {
    if (opts.params instanceof FormData) {
      opts.body = opts.params
    } else {
      // post请求设置参数
      opts.body = JSON.stringify(opts.params)
    }
  } else {
    // get请求设置参数
    url = `${url}?${qs.stringify(opts.params)}`
  }

  return new Promise((resolve, reject) => {
    fetch(url, opts)
      .then(checkStatus)
      .then(parseJSON)
      .then(data => {
        const loginoutCodes = [
          '403', // 没有权限
          '421', // 您的登录状态已经失效,请重新登录
          '422', // 当前账号已有其他人使用，您被退出，请检查账号信息或联系管理员
          '423', // 没有登录
          '426', // 您的账号权限被修改，请重新登录
          '427'  // 无效令牌
        ]
        if (data.head.code === '200') { // 请求成功 且接口返回值正确时
          resolve(data)
        } else if (data.head.code === '429') { // 不全局提示错误信息
          reject(data.body.message || data.body)
        } else if (loginoutCodes.indexOf(data.head.code) !== -1) { // 请求成功 且接口提示无效登录时
          message.destroy()
          message.error(data.body)
          sessionStorage.clear()
          window.location.href = '/#/login'
          reject(data.body)
        } else { // 请求成功 且接口返回值失败时
          message.destroy()
          message.error(data.body.message || data.body)
          reject(data.body.message || data.body)
        }
      })
      .catch(err => {
        // 请求失败
        let msg = `${url} 接口请求错误`
        if (err) {
          if (err.message) {
            if (err.message === 'Failed to fetch') { // 线上运行时网络断开会进入此判断
              msg = '网络连接中断，请检查网络情况'
            } else {
              msg = `${msg} ${err.message}`
            }
          } else if (err.status) {
            if (err.status === 500 && err.statusText === 'Internal Server Error') { // 本地运行时网络断开会进入此判断
              msg = '网络连接中断，请检查网络情况'
            } else {
              msg = `${msg} ${err.status}: ${err.statusText}`
            }
          } else if (err.response) {
            msg = `${msg} ${err.response.status}: ${err.response.statusText}`
          }
        }
        message.destroy()
        message.error(msg)
        reject(err)
      })
  })
}
