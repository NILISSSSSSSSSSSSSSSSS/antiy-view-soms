import qs from 'qs'
import moment from 'moment'
import md5 from 'js-md5'
import _ from 'lodash'
import CryptoJS from 'crypto-js'
import { message, Tooltip } from 'antd'
import * as regExp from '@/utils/regExp'

// 解析URL中的参数
export const analysisUrl = (url) => {
  if (!url || !url.includes('?')) return {}
  let init = {}
  let Arr = url.split('?')[1].split('&')
  for (let i of Arr) {
    const arr = i.split('=')
    const key = arr[0]
    const value = arr[1]
    // 属于这些参数就进行解码
    const decodeURIID = ['areaId', 'relId', 'id', 'stringId', 'categoryModel', 'categoryModelId', 'categoryId', 'assetId', 'taskId', 'primaryKey', 'flowId', 'planId', 'asset', 'workOrderId']
    if (decodeURIID.includes(key)) {
      init[key] = value ? decodeURIComponent(value) : ''
    } else {
      init[key] = value
    }
  }
  return init
}

/**  气泡
 * @param text 要显示的内容
 */
export const TooltipFn = text => {
  return (
    <Tooltip getPopupContainer={triggerNode => triggerNode.parentNode} placement="topLeft" title={text}>
      {emptyFilter(text)}
    </Tooltip>
  )
}
/**
* 执行下载
* @method download
* @param  String url 下载地址，从/xxx开始
*/
export const download = (url, values) => {
  let params = {}
  if (!values) {
    values = {}
  }
  const headers = createHeaders(values)
  // url中，token的键名为access_token
  headers.access_token = sessionStorage.getItem('token')
  delete headers.Authorization

  params = Object.assign(headers, values)
  window.open(url + '?' + qs.stringify(params))
}

const dateFormat = 'YYYY-MM-DD HH:mm:ss'
export const getDateTime = (timeStamp) => {
  moment.locale('zh-cn')
  if (!timeStamp) {
    timeStamp = 0
  }
  return moment(timeStamp * 1000).format(dateFormat)
}

/**
* 加密
* @method encrypt
* @param  String word 待加密数据
*/
export const encrypt = (word) => {
  const key = CryptoJS.enc.Utf8.parse('abcdefgabcdefg12')
  const srcs = CryptoJS.enc.Utf8.parse(word)
  const encrypted = CryptoJS.AES.encrypt(srcs, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 })
  return encrypted.toString()
}

export const ellipsisFilter = (str, maxLength) => {
  if (str && str.length > maxLength) return `${str.substr(0, maxLength)}...`
  return str
}

/**
 * 流量转换
 * @param num {Number} 文件大小 单位为 字节 b
 * @param unit {String} 要输出的转换单位
 */
export const flowSwitch = (num, unit = 'MB') => {
  const switchArr = ['B', 'KB', 'MB', 'GB']
  let index = switchArr.findIndex((e) => e === unit.toUpperCase())
  // 没有找到对应的单位时
  if (index === -1) {
    return
  } else if (index === 0) {
    return `${num}${switchArr[0]}`
  }
  let newNum = num
  for (let i = 0; i < index; ++i) {
    newNum = (newNum / 1024)
    if (newNum < 1000) {
      index = i + 1
      break
    }
  }
  return `${parseInt(newNum, 10) === newNum ? parseInt(newNum, 10) : newNum.toFixed(2)}${switchArr[index]}`
}

/**
 * 资产附件上传类型和大小限制
 * @param file {object}上传文件
 * @param message {String} 要输出的转换单位
 */
export const uploadLimit = (file, fileList, fileSize) => {
  const regxArr = ['rar', 'zip', '7z', 'doc', 'docx', 'jpg', 'pdf', 'png', 'txt', 'xlsx', 'xls']
  const typeArr = file.name.split('.')
  const type = typeArr[typeArr.length - 1].toLowerCase()
  const fileName = file.name.substring(0, file.name.lastIndexOf('.'))

  if (!regxArr.includes(type)) {
    message.error('文件格式不对')
    return Promise.reject('格式不对')
  }
  const isLmt = file.size / 1024 / 1024 < Number(fileSize)
  if (!isLmt) {
    message.error('附件大小需要小于' + fileSize + 'M')
    return Promise.reject('附件大小需要小于' + fileSize + 'M')
  }
  if (fileList.length >= 5) {
    message.info('上传文件不能超过五个！')
    return Promise.reject()
  }
  if (file.size === 0) {
    message.info('上传文件不能为空，请重新选择')
    return Promise.reject()
  }
  if (fileName.length > 120) {
    message.info('文件名长度最多120字符，请检查')
    return Promise.reject()
  }
  return file
}

/**
 * 附件上传校验
 * @param file {object}当前上传的文件
 * @param fileLists {Array} 当前上传的文件
 * @param fileList {Array} 总共上传的文件
 * @param sizeLimit {Number} 限制上传的文件大小，默认10
 * @param sizeLimitType {String} 上传的文件大小单位，默认MB
 * @param fileTotal {Number} 上传的文件个数，默认5个
 * @param fileTypePattern {Object} RegExp,上传文件的正则匹配，默认fileTypePattern
 * @param fileNameLength {Number} 上传的文件名字数最大字符，默认120
 * @returns Promise对象的失败处理方法{Functon}
 */
export const beforeUpload = (
  file,
  fileLists = [],
  fileList = [],
  sizeLimit = 10,
  sizeLimitType = 'MB',
  fileTotal = 5,
  fileTypePattern = regExp.fileTypePattern,
  fileNameLength = 120
) => {
  const newList = [...fileList, ...fileLists]
  const index = newList.indexOf(file)
  const fileType = file.name.substring(file.name.lastIndexOf('.') + 1)
  const fileName = file.name.substring(0, file.name.lastIndexOf('.'))
  let init = 1024 * 1024 * sizeLimit
  if (sizeLimitType === 'GB') {
    init *= 1024
  }
  if (index >= fileTotal) {
    if (index === fileTotal) {
      message.info(`上传文件不能超过${fileTotal}个`)
    }
    return Promise.reject()
  }
  if (!fileTypePattern.test(fileType)) {
    message.info('请上传正确格式的文件')
    return Promise.reject()
  }
  if (file.size > init) {
    message.info(`请上传小于${sizeLimit}${sizeLimitType}的文件`)
    return Promise.reject()
  }
  if (file.size === 0) {
    message.info('上传文件不能为空，请重新选择')
    return Promise.reject()
  }
  if (fileName.length > fileNameLength) {
    message.info(`文件名长度最多${fileNameLength}字符，请检查`)
    return Promise.reject()
  }
}

// 字符串反转义
export const strUnescape = (str) => {
  if (!str) {
    return str
  } else {
    const result = _.unescape(str)
    return result
  }
}

/**
 * 查找节点树
 * @param data {Object} 资产类型树
 * @param stringId {String} 节点ID
 * @returns rootNode {Object} 节点树
 */
export function findNodeByStringID (data, stringId) {
  //此处 findNodeList 充当队列的作用
  let findNodeList = []
  findNodeList.push(data)
  while (findNodeList.length > 0) {
    let rootNode = findNodeList[0]
    if (rootNode.stringId === stringId) {
      return rootNode
    }
    //清除队列中的第一个元素
    findNodeList.shift()
    let childrenNode = rootNode.childrenNode
    if (childrenNode) {
      childrenNode.forEach(item => {
        findNodeList.push(item)
      })
    }
  }
}

/**
 * 递归获取节点下所有子节点ID
 * @param rootNode {Object} 节点树
 * @param handler {Function}
 */
export const foreachNode = (rootNode, handler) => {
  if (handler) {
    handler(rootNode)
  }
  let childrenNode = rootNode.childrenNode
  if (childrenNode) {
    childrenNode.forEach(item => {
      foreachNode(item, handler)
    })
  }
}

/**
 * 查找节点下所有子节点
 * @param data {Object} 资产类型树
 * @param stringId {String}
 * @returns stringIdArr {Array} 子节点ID的集合
 */
export const findSubNodeStringIds = (data, stringId) => {
  let stringIdArr = []
  let findNodeData = findNodeByStringID(data, stringId)
  if (findNodeData) {
    foreachNode(findNodeData, (nodeData) => {
      stringIdArr.push(nodeData.stringId)
    })
  }
  return stringIdArr
}

/**
 * 查找节点下所有子节点升级
 * @param data {Object} 资产类型树
 * @param arr {Array}
 * @returns stringIdArr {Array} 子节点ID的集合
 */
// function flattenDeep (arr) {
//   return arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), [])
// }
export const subNodeQuery = data => arr => {
  if (data && arr) {
    return [...arr.map(item => findSubNodeStringIds(data, item))].flat(Infinity)
    // return flattenDeep([...arr.map(item=>findSubNodeStringIds(data, item))])
  }
  return void (0)
}

/**
 * 生成时分秒
 * @param {Number} start
 * @param {Number} end
 * @returns {Array}
 */
function range (start, end) {
  const result = []
  for (let i = start; i < end; i++) {
    result.push(i)
  }
  return result
}

/**
 * 禁用今天24点以前的未来时分秒
 * @param {Object} current (moment对象)
 * @returns {Object}
 */
export const disabledDateTime = (current) => {
  //启用今天以前的时分秒
  if (moment(current).isBefore(new Date()) && !moment(current).isSame(new Date(), 'day')) {
    return {}
  }
  const clickHours = new Date(current).getHours()
  const clickMinutes = new Date(current).getMinutes()
  const hours = moment().hours() //0~23
  const minutes = moment().minutes() //0~59
  const seconds = moment().second() //0~59
  //当日只能选择当前时间之后的时间点
  return {
    disabledHours: () => range(hours + 1, 24),
    disabledMinutes: () => clickHours < hours ? [] : range(minutes + 1, 60),
    disabledSeconds: () => clickHours < hours || clickMinutes < minutes ? [] : range(seconds, 60)
  }
}

/**
 * 转码uri, 不对 空('', null, undefind) 进行转换，直接返回空的 ''
 * @param str{ String} 要转义的字符串
 * @return {String} 转换过后的字符串
 */
export const transliteration = (str) => {
  if (typeof str === 'number') {
    console.warn('参数是数字，将被强制转换为字符串输出')
    return `${str}`
  }
  return str ? encodeURIComponent(str) : ''
}
/**
 * 解码uri, 不对 空('', null, undefind) 进行转换，直接返回空的 ''
 * @param str{ String} 要解码的字符串
 * @return {String} 解码过后的字符串
 */
export const _decodeURIComponent = (str) => {
  return str ? decodeURIComponent(str) : ''
}
/**
 *  第一个参数与第二个参数比较情况，返回 > |  = | <
 * @param value1Num {String} 整数字符串
 * @param value2Num {String} 整数字符串
 * @return { String } > |  = | <
 */
const ratio = (value1Num = '', value2Num = '') => {
  const index1 = value1Num.length
  const index2 = value2Num.length
  if (index2 > index1) {
    const _arr = value2Num.slice(index1).split('')
    _arr.forEach(() => {
      value1Num = '0' + value1Num
    })
  }
  if (index2 < index1) {
    const _arr = value1Num.slice(index2).split('')
    console.log(_arr)
    _arr.forEach(() => {
      value2Num = '0' + value2Num
    })
  }
  let i = 0
  while (i !== value2Num.length) {
    if (Number(value1Num[i]) > Number(value2Num[i])) {
      // console.log('开始值必须小于结束值')
      return '>'
    }
    if (Number(value1Num[i]) < Number(value2Num[i])) {
      // console.log('开始值必须小于结束值')
      return '<'
    }
    ++i
  }
  return '='
}
// const rege = /^([0-9]*(\.\d{1,3})?)$/
/**
 * 超大数字比较大小
 * @return {String|string}  小于返回<  等于返回=  大于返回>
 */
export const compareNum = (value1 = '', value2 = '') => {
  // const value1 = '12345678901234567890.1'
  // const value2 = '12345678901234567891'
  if (value1 === value2) {
    return '='
  }
  const _value1 = value1.split('.')
  const _value2 = value2.split('.')
  // 开始值得整数部分
  const value1Num = _value1[0]
  // 结束值的整数部分
  const value2Num = _value2[0]
  // 比较整数部分的大小，开始值大于结束值
  if (value1Num.length > value2Num.length) {
    return '>'
  } else {
    // 比较第一个开始值整数是否大于结束值整数
    const flag = ratio(value1Num, value2Num)
    if (flag === '>') {
      return '>'
    }
    if (flag === '=') {
      /**
       * 整数相等等情况，比较小数
       * @type {string | string}
       */
      // 开始值得小数部分
      const value1Float = _value1[1] || '0'
      // 结束值的小数部分
      const value2Float = _value2[1] || '0'
      // 比较开始值小数是否大于结束值小数
      const flagFloat = ratio(value1Float, value2Float)
      return flagFloat
    }
    return '<'
  }
}

/**
 * ip比较大小
 * @return {string}
 * 返回 =  > <
 */
export const compareIp = (ip1 = '', ip2 = '') => {
  // const ip1 = '192.168.5.1'
  // const ip2 = '192.168.2.1'
  if (ip1 && ip2) {
    if (ip1 === ip2) {
      message.error('起始值不能大于等于结束值')
      return true
    }
    const ip1Arr = ip1.split('.')
    const ip2Arr = ip2.split('.')
    const idx = ip1Arr.length
    let i = 0
    while (i < idx - 1) {
      const result = ratio(ip1Arr[i], ip2Arr[i])
      if (result !== '=') {
        message.error('IP起始值前三位应等于结束值前三位')
        return true
      }
      ++i
    }
    if (ratio(ip1Arr[idx - 1], ip2Arr[idx - 1]) === '>') {
      message.error('起始值不能大于等于结束值')
      return true
    }
    return false
  }
}

/* 判断内容是否为空
 * @param s 要判断的内容
 * @return Boolean
 */
export const isEmpty = (s) => {
  return s === null || typeof s === 'undefined' || (typeof s === 'string' && s.replace(/\s*/g, '') === '')
}

/* 判断内容是否为空，为空显示占位符
 * @param str 要判断的内容
 * @return str 返回实际显示的内容
 */
export const emptyFilter = (str) => {
  if (isEmpty(str)) return '--'
  return str
}

export const validatorCode = (val, startValue, endValue, check = 0) => {
  const value = val.target.value
  const reg = /^\s+$/g
  if (!value && !check || (reg.test(value))) {
    message.error('值不能为空')
    return true
  }
  else if (value) {
    if (value.includes('.')) {
      let arr = _.compact(value.split('.'))
      let isNotNum = arr.some(item => typeof (Number(item)) !== typeof (1) || Number.isNaN(Number(item)))
      if (isNotNum) {
        message.error('请输入数字或小数点')
        return true
      }
    } else {
      if (typeof (Number(value)) !== typeof (1) || Number.isNaN(Number(value))) {
        message.error('请输入数字或小数点')
        return true
      }
    }
  }
  if (startValue === undefined || endValue === undefined) {
    return false
  }
}

/**
* json按属性名key来排序
* @param obj 待排序的json
* @return newObj 排序后的json
*/
export const sortObjByKey = (obj) => {
  const keys = Object.keys(obj).sort()
  const newObj = {}
  for (let i = 0; i < keys.length; i++) {
    const index = keys[i]
    if (obj[index]) {
      newObj[index] = obj[index]
    }
  }
  return newObj
}

/**
 * 保留搜索条件 和页码
 * @param list 当前页 page和param 的数组集合
 * @param pageIndex {history} 当前页路由name
 * @param mark (number)当前页面如果有多个表单和页码需要存储，作为标识（从0开始计算）
 * @param tagKey {string<number>} 如果存在多个标签页，作为存储范围的标识
 */
export const cacheSearchParameter = (lists, pageIndex, mark = null, tagKey = null) => {
  // 测试需要暂时屏蔽缓存功能，后面开通
  // return false
  let init = {
    list: [],
    pageIndex: pageIndex ? pageIndex.location.pathname : ''
  }
  //当前页面list中是否有值
  const classify = (item, n) => {
    if(tagKey !== null)  lists[0].tagKey = tagKey
    if(mark === null) item = lists
    else item[n] = lists[0]
    return item
  }
  //是否tab标签页
  const multilayer = (arr)=>{
    if(!tagKey) return arr
    arr.forEach(item=>item.tagKey = tagKey)
    return arr
  }
  //判斷是否存在sessionStorage
  if (sessionStorage.searchParameter) {
    let arr = JSON.parse(sessionStorage.searchParameter)
    //如果沒有跟当前页面name名称相等，就add
    if (arr.every(n => n.pageIndex !== pageIndex.location.pathname)) {
      if (mark !== null) init.list = classify(init.list, mark)
      else init.list = multilayer(lists)
      arr.push(init)
    }else {
      //在数组的位置
      let n = arr.findIndex(el => el.pageIndex === pageIndex.location.pathname)
      if (mark !== null) {
        arr[n].list = classify(arr[n].list, mark)
      } else {
        arr[n].list = multilayer(lists)
      }
    }
    sessionStorage.setItem('searchParameter', JSON.stringify(arr))
  } else {
    if (mark !== null) init.list = classify(init.list, mark)
    else init.list = multilayer(lists)
    sessionStorage.setItem('searchParameter', JSON.stringify([init]))
  }
}
/**
 * 解析sessionStorage
 * @param parent 传来的this
 * @param obj 额外的请求参数
 * @param autoSet { Boolean } 是否自动设置
 */
export const evalSearchParam = (parent, obj = null, autoSet = true) => {
  //没有sessionStorage时 直接抛出去
  if (!sessionStorage.searchParameter) return void (0)
  let init = JSON.parse(sessionStorage.searchParameter)
  let result = {}
  init.forEach((ob) => {
    if (ob.pageIndex === parent.props.history.location.pathname) {
      let { list } = ob
      let v = ['gmtCreateStart', 'gmtCreateEnd', 'enterNetStart', 'time', 'enterNetEnd', 'beginTime', 'endTime', 'releaseStartTime', 'releaseEndTime']
      result = JSON.parse(JSON.stringify(ob))
      //遍历
      list.forEach(item => {
        //如果为空不执行
        if (item === null) return void (0)
        //保留的参数项
        let { parameter } = item
        for (let now in parameter) {
          if (v.includes(now) && parameter[now]) {
            // 时间为 range时
            if (Array.isArray(parameter[now])) {
              parameter[now].forEach((ele, idx) => {
                ele && (parameter[now][idx] = moment(moment(ele).format('YYYY-MM-DD')))
              })
            } else {
              parameter[now] = moment(moment(parameter[now]).format('YYYY-MM-DD'))
            }
          }
        }
        if (parameter && parameter.currentPage && parameter.pageSize) {
          delete parameter.currentPage
          delete parameter.pageSize
        }
        // 回显并且设置查询
        autoSet && parent.props.form.setFieldsValue({
          ...parameter,
          ...obj
        })
      })
    }
  })
  if (JSON.stringify(result) === '{}') return void (0)
  return result
}

/**
 * 获取缓存，有缓存返回缓存对象，没有的话，返回 undefined
 * @param parent 调用改函数的组件的this对象
 * @param autoSet { Boolean } 是否自动设置
 * @param searchIndex { Number } 路由下的第几个缓存数据，为undefind 时，返回整个路由下的缓存列表 返回为数组结构array，为数字时，返回的是路由下下标为 searchIndex 的缓存，返回的为对象结构
 * @return {boolean|array|*}
 */
export const getCaches = (parent, autoSet = true, searchIndex) => {
  if (!sessionStorage.searchParameter) {
    return undefined
  }
  const cache = evalSearchParam(parent, {}, autoSet)
  // 有缓存时
  if (cache && cache.list && cache.list.length) {
    // searchIndex  为null 或者 undefined时，返回该路由下的全部缓存
    if (!searchIndex && searchIndex !== 0) {
      return cache.list
    }
    const first = cache.list[searchIndex]
    if (!first) {
      return undefined
    }
    const page = Object.keys(first.page)
    const parameter = Object.keys(first.parameter)
    // 有分页缓存或者参数缓存时,返回参数缓存对象
    if (parameter.length || page.length) {
      return first
    } else {
      return undefined
    }
  }
  return false
}
/**
 *@param tagKey {string|number} 根据标识局部删除
 *@param pageIndex {history} 路由
 */
//清除sessionStorage缓存条件，并取消工作台状态
export const removeCriteria = (tagKey = false, pageIndex = null) => {
  if(tagKey){
    let iData = JSON.parse(sessionStorage.getItem('searchParameter'))
    if (iData) {
      const index = iData.findIndex(el => el.pageIndex === pageIndex.location.pathname)
      iData[index].list.forEach((item, i)=>{
        if(item && item.tagKey === tagKey) iData[index].list[i] = null
      })
      sessionStorage.setItem('searchParameter', JSON.stringify(iData))
    }
  }else{
    sessionStorage.removeItem('searchParameter')
    sessionStorage.works = 0
  }
}

/** 标签页选中状态
 * @param active {string | number} tabs标签页的选项状态
 * @param pageIndex {history} 路由
 */
export const updateTabsState = (active, pageIndex)=>{
  if(!sessionStorage.searchParameter){
    sessionStorage.searchParameter = JSON.stringify([{
      list: [],
      pageIndex: pageIndex.location.pathname,
      active
    }])
  }else{
    let iData = JSON.parse(sessionStorage.searchParameter)
    const index = iData.findIndex(el => el.pageIndex === pageIndex.location.pathname)
    iData[index].active = active
    sessionStorage.searchParameter = JSON.stringify(iData)
  }
}

/*
 * 缓存对象
*/
export const cache = {
  evalSearchParam,
  cacheSearchParameter,
  getCaches,
  removeCriteria,
  updateTabsState
}

/**
* 替换Form中的别名
* @param values 待替换的form values
* @return 替换后的values
*/
export const replaceAliasName = (values) => {
  Object.keys(values).forEach(item => {
    if (item.includes('alias-')) {
      const key = item.replace('alias-', '')
      values[key] = values[item]
      delete values[item]
    }
  })
  return values
}

/**
 * 替换路由中的参数
 * @param urlParams url地址的参数 格式：?a=1&b=2
 * @param param { Object } 待替换的参数
 * @return { string }
 */
export const replaceURLParam = (urlParams, param = {}) => {
  let init = {}
  const search = urlParams.split('?')[1]
  if (search) {
    let Arr = search.split('&')
    for (let i of Arr) {
      const arr = i.split('=')
      const key = arr[0]
      const value = arr[1]
      // 属于这些参数就进行解码
      const decodeURIID = []
      if (decodeURIID.includes(key)) {
        init[key] = value ? decodeURIComponent(value) : ''
      } else {
        init[key] = value
      }
    }
  }

  const _urlParam = { ...init, ...param }
  let _parmas = ''
  let count = 0
  for (let key in _urlParam) {
    if (count === 0) {
      _parmas = `?${key}=${_urlParam[key]}`
      ++count
      continue
    }
    _parmas += (`&${key}=${_urlParam[key]}`)
  }
  return _parmas
}

/**
* 获取两个时间之间包含的星期
* @param startTime 开始时间
* @param endTime   结束时间
* @return weekArr 包含的星期列表
*/
export const getDisabledWeek = (startTime, endTime) => {
  if (!startTime || !endTime) return []
  let weekArr = []
  const weekDayBegin = Number(moment(startTime.valueOf()).format('d'))
  const weekDayEnd = Number(moment(endTime.valueOf()).format('d'))
  const t1 = weekDayBegin === 0 ? 7 : weekDayBegin
  const t2 = weekDayEnd === 0 ? 7 : weekDayEnd
  const diffDay = moment(endTime).diff(moment(startTime), 'days')
  // 计算周
  // 如果两个时间的时间差大于等于6天，便周一到周日每天都有
  if (diffDay >= 6) {
    weekArr = [1, 2, 3, 4, 5, 6, 7]
  } else {
    // 如果开始时间与结束时间在同一周
    if (t2 >= t1) {
      for (let i = t1; i <= t2; i += 1) {
        weekArr.push(i)
      }
    }
    // 如果开始时间与结束时间不在同一周
    else {
      for (let i = t1; i <= (t2 + 7); i += 1) {
        if (i - 7 >= 1) {
          weekArr.push(i - 7)
        } else {
          weekArr.push(i)
        }
      }
    }
  }
  return weekArr
}

/**
* 获取两个时间之间包含的月份
* @param startTime 开始时间
* @param endTime   结束时间
* @return weekArr 包含的月份列表
*/
export const getDisabledMonth = (startTime, endTime) => {
  if (!startTime || !endTime) return []
  let monthArr = []
  const monthBegin = Number(moment(startTime.valueOf()).format('M'))
  const monthEnd = Number(moment(endTime.valueOf()).format('M'))
  const diffMonth = moment(endTime).diff(moment(startTime), 'months')
  // 计算月
  // 如果两个时间的时间差大于等于11个月，便1到12月每月都有
  if (diffMonth >= 11) {
    monthArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  } else {
    // 如果开始时间与结束时间在同一年
    if (monthEnd >= monthBegin) {
      for (let i = monthBegin; i <= monthEnd; i += 1) {
        monthArr.push(i)
      }
    }
    // 如果开始时间与结束时间不在同一年
    else {
      for (let i = monthBegin; i <= (monthEnd + 12); i += 1) {
        if (i - 12 >= 1) {
          monthArr.push(i - 12)
        } else {
          monthArr.push(i)
        }
      }
    }
  }
  return monthArr
}

/**
 * 获取删除后的当前页码，当前页不存在数据时则递减，最小至1
 * @param total {Number} 列表总条数
 * @param currentPage { Number } 当前页码
 * @param pageSize { Number } 每页条数
 * @return {Number}
 */
export const getAfterDeletePage = (total, currentPage, pageSize) => {
  if (Math.ceil(total / pageSize) < currentPage && currentPage !== 1) {
    return getAfterDeletePage(total, currentPage - 1, pageSize)
  }
  return currentPage
}
/**
 * 生成验证规则
 * @param max 最多字符数
 * @param rules {Array} 验证规则
 * @returns {*[]}
 */
export const generateRules = (max = 30, rules = []) => {
  return [
    { max, message: `最多输入${max}个字符！` },
    { whitespace: true, message: '不能为空字符！' },
    ...rules
  ]
}

/**
* 删除json中为null的属性(如a:null)，数组中为null的项不删除(如a:[null])
* 该规则是后端(王谦)要求的
* @param obj 待删除的json
* @return obj 删除后的json
*/
const deleteEmptyProp = (obj) => {
  for (let key in obj) {
    const value = obj[key]
    if (value === null) {
      delete obj[key]
    } else if (typeof value === 'object') {
      deleteEmptyProp(value)
    }
  }
  return obj
}

/**
* 生成请求头
* @param params 传给请求接口的入参，请求头要用入参来加签
* @return headers 生成的请求头
*/
export const createHeaders = (params = {}) => {
  const headers = {}

  // 设置token
  const token = sessionStorage.getItem('token')
  if (token) {
    // headers中，token的键名为Authorization，并且键值需加上“Bearer ”
    headers.Authorization = `Bearer ${token}`
  }

  // 设置requestId
  headers.requestId = `1000000${moment().format('YYYYMMDD')}${String(Math.random()).substring(2, 11)}`

  // 设置sign
  let sign = params instanceof FormData ? {} : JSON.parse(JSON.stringify(params)) // 深拷贝参数，防止加签时原参数被改变
  sign = deleteEmptyProp(sign) // 删除空属性
  sign.key = '8db4a013a8b515349c307f1e448ce836'
  if (token) {
    // headers中，token的键名为token
    sign.token = token
  }
  sign.requestId = headers.requestId
  sign = JSON.stringify(sign).split('').sort().join('')
  sign = sign.replace(/[~`!@#$%^&*()_\-+={}\[\]|\\:;"'<>,.?\/！￥……（）——【】、：；“”‘’《》，。？]/g, '')
  sign = sign.trim()
  headers.sign = md5(sign)

  return headers
}

export const removeEmpty = (obj) => {
  // return Object.keys(obj).filter(key => ((typeof obj[key] !== 'boolean') && obj[key]) && obj[key] !== 'null' || typeof obj[key] === 'boolean').reduce(
  return Object.keys(obj).filter(key => !isEmpty(obj[key])).reduce(
    (newObj, key) => {
      newObj[key] = obj[key]
      return newObj
    }, {}
  )
}

export const arrayToString = (obj) => {
  return Object.keys(obj).reduce(
    (newObj, key) => {
      let value = obj[key]
      if (Array.isArray(value)) {
        value = value.join(',')
      }
      newObj[key] = value
      return newObj
    }, {}
  )
}

export function timeStampToTime (timeStamp) {
  moment.locale('zh-cn')
  return timeStamp ? moment(timeStamp).format('YYYY-MM-DD HH:mm:ss') : '--'
}

export const startTimeStamp = (startTime) => {
  moment.locale('zh-cn')
  return moment(startTime).format('YYYY-MM-DD 00:00:00')
}

export const endTimeStamp = (endTime) => {
  moment.locale('zh-cn')
  return moment(endTime).format('YYYY-MM-DD 23:59:59')
}

export const calculateFileSize = (size)=>{
  if(size < 1024){
    return `${size}B`
  }else if(size < (1024 * 1024)){
    return `${Math.floor((size / 1024))}KB`
  }else if(size < (1024 * 1024 * 1024)){
    return `${Math.floor(size / 1024 / 1024)}M`
  }
}

/**
 * 把数字转换为以{separator}分割的字符串
 * @param number {String | Number} 要进行转换的数字，或者数字类型的字符串
 * @param limit {Number} 数字分位的位数
 * @param separator {String} 数字分位的分隔符
 * @param precise 精确多少位小数
 * @return {string}
 */
export function thousandsSwitch (number, limit = 3, separator = ',', precise = 2) {
  number = number || '0'
  const unitArr = [
    { unit: '', length: 4, suffix: 0 },
    { unit: '万', length: 8, suffix: 4 },
    { unit: '亿', length: 12, suffix: 8 },
    { unit: '兆', length: 16, suffix: 12 }
  ]
  let unit = {}
  let unitIndex = 0
  // 小于10000，不需要转换单位
  if (parseInt(number, 10) < 1000) {
    return `${number}`
  }
  // return number.toLocaleString('en-US')
  const numberStr = `${number}`
  const temp = numberStr.split('')
  // 确认单位
  for (let i = 0, len = unitArr.length; i < len; ++i) {
    const long = unitArr[i].length
    // 匹配到单位或者截止到最后一个单位
    if (temp.length <= long || i === unitArr.length - 1) {
      unit = unitArr[i]
      unitIndex = i
      break
    }
  }
  let result = ''
  let float = '' // 小数部分
  temp.reverse()
  // 去除用单位代替的数字
  if (unitIndex !== 0) {
    // 精确位数必须大于0时并且精确的小数位数小于自己本身的位数，才进行精确小数
    if(precise > 0 && precise <= unit.suffix){
      float = temp.slice(unit.suffix - precise, unit.suffix)
      float = `${parseFloat(float.join(''))}`.split('')
      float.reverse()
      // 此处必须添加0.，否者float将会被转换为整数
      float = parseFloat('0.' + float.join(''))
      //小数只有一位数，并且为0时，不显示小数
      if(float !== 0){
        // 保留小数并且转换为字符串
        float = float.toFixed(precise).slice(1)
      }else {
        float = ''
      }
    }
    temp.splice(0, unit.suffix)
  }
  for (let start = 0; start <= temp.length;) {
    const end = start + limit
    const arr = temp.slice(start, end)
    if (arr.length) {
      arr.reverse()
      result = separator + arr.join('') + result
    }
    if (arr.length < limit) {
      result = result.slice(1) + float + (unit.unit || '')
      break
    }
    start += limit
  }
  return result
}