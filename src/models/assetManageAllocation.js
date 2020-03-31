
import api from '@/services/api'
import unescape from 'lodash/unescape'
import  { message } from 'antd'
const { statusJump, getAssetHardWareById, recieveTask, getSchemeAssetIdAndType } = api
//遍历配置项
const eachOption = (obj)=>{
  let option = []
  for(let i = 0 ; i < obj.number;i++){
    let rul = obj.rules[i] ? [{ required: true, message: `请输入${obj.title[i]}！` }] : []
    option.push({
      title: `${obj.title[i]}`,
      key: `${obj.key[i]}`,
      rule: rul,
      value: `${obj.values[i]}`
    })
  }
  return option
}
export default {
  namespace: 'assetManageAllocation',
  state: { cpuEl: [], mainboardEl: [], memoryEl: [], hardEl: [], networkEl: [], fileInfo: [] },
  effects: {
    *alysisDetail ({ payload = {} }, { call, put }) {
      console.log('Received values of form: ', payload)
      const data = yield call(getAssetHardWareById, payload)
      if (data) {
        yield put({
          type: 'initAlysisDetail',
          payload: {
            hardwareAsset: data.body
          }
        })
      }
    },
    // 获取方案信息
    *getSchemeAssetIdAndType ({ payload = {} }, { call, put }) {
      const data = yield call(getSchemeAssetIdAndType, payload)
      if (data) {
        console.log('获取方案信息 ==> ', data)
        console.log(unescape(data.body.fileInfo))
        yield put({
          type: 'initVerifyDetail',
          payload: {
            fileInfo: JSON.parse(unescape(data.body.fileInfo || '[]')),
            content: data.body.content,
            memo: data.body.memo
          }
        })
      }
    },
    // 基准配置
    *alysis ({ payload = {} }, { call, put }) {
      console.log('TCL: *alysis -> payload', payload)
      const { stringId, taskId, classify, remarkInfo, baseline, fileInfo, startTime, handle, url,
        endTime, operator, workLevel, content, assetName, assetNumber, isAllow, isChange } = payload
      payload = {
        assetId: stringId,
        assetStatus: 'WAIT_SETTING',
        agree: isAllow,
        assetFlowCategoryEnum: isChange ? 'HARDWARE_CHANGE' : 'HARDWARE_REGISTER',
        schemeRequest: {
          memo: remarkInfo,
          extension: `{baseline: ${baseline}}`,
          fileInfo: fileInfo,
          schemeSource: 1,
          type: 6
        },
        software: classify
      }
      if (isAllow) {
        payload.activityHandleRequest = {
          formData: `{"validateBaselineUserId":\"${operator}\", "result": 1}`,
          taskId: taskId
        }
        payload.workOrderVO = {
          content: content || `对资产 ${assetName} - ${assetNumber} 进行配置`,
          endTime: endTime,
          executeUserId: operator,
          name: '基准配置',
          orderSource: 1,
          orderType: 8,
          startTime: startTime,
          workLevel: workLevel,
          workOrderAttachments: []
        }
      } else {
        payload.activityHandleRequest = {
          formData: '{result: -1}',
          taskId: taskId
        }
      }
      console.log('基准配置参数', payload)
      const data = yield call(statusJump, payload)
      if (data && data.head && data.head.code === '200') {
        handle.history.push(url)
        message.success(`${data.head.result}`)
      }
    },
    // 领取任务
    *recieveTask ({ payload = {} }, { call, put }) {
      // { userId: 16, taskId: taskId }
      let data = yield call(recieveTask, payload)
      console.log('领取任务 ==》 ', data)
      if(data.head.code !== '200') {
        return
      }
      console.log('任务领取成功')
    },
    // 基准验证
    *verify ({ payload = {} }, { call, put }) {
      console.log('Received values of form: ', payload)
      const { stringId, taskId, remark, isAllow, fileInfo, operator } = payload
      payload = {
        activityHandleRequest: {
          formData: `{"implementUserId":\"${operator}\", "result": \"${isAllow}\"}`,
          taskId: taskId
        },
        assetId: stringId,
        assetStatus: 'WAIT_VALIDATE',
        agree: isAllow,
        assetFlowCategoryEnum: 'HARDWARE_REGISTER',
        schemeRequest: {
          memo: remark,
          extension: '{baseline: false}',
          fileInfo: fileInfo,
          schemeSource: 1,
          type: 7
        },
        software: false
      }
      const data = yield call(statusJump, payload)
      if (data && data.head && data.head.code === '200') {
        message.success(`${data.head.result}`)
      }
    },
    // 基准入网
    *net ({ payload = {} }, { call, put }) {
      console.log('Received values of form: ', payload)
      const { stringId, taskId, remark, isAllow, fileInfo, operator, startTime, endTime, workLevel, name: assetName, number: assetNumber } = payload
      payload = {
        activityHandleRequest: {
          formData: `{"resultCheckUserId": \"${operator}\", "result": \"${isAllow}\"}`,
          taskId: taskId
        },
        assetId: stringId,
        assetStatus: 'WAIT_NET',
        agree: isAllow,
        assetFlowCategoryEnum: 'HARDWARE_REGISTER',
        schemeRequest: {
          memo: remark,
          extension: '{baseline: false}',
          fileInfo: fileInfo,
          schemeSource: 1,
          type: 1
        },
        software: false,
        workOrderVO: {
          content: `对资产 ${assetName} - ${assetNumber} 进行入网`,
          endTime: endTime,
          executeUserId: operator,
          name: '基准入网',
          orderSource: 1,
          startTime: startTime,
          workLevel: workLevel,
          workOrderAttachments: []
        }
      }
      console.log('基准入网参数', payload)
      const data = yield call(statusJump, payload)
      if (data && data.head && data.head.code === '200') {
        message.success(`${data.head.result}`)
      }
    },
    // 基准检查
    *check ({ payload = {} }, { call, put }) {
      console.log('Received values of form: ', payload)
      const { stringId, taskId, remark, isAllow, fileInfo, operator } = payload
      payload = {
        activityHandleRequest: {
          formData: `{"topologyUserId": \"${operator}\", "result": \"${isAllow}\"}`,
          taskId: taskId
        },
        assetId: stringId,
        assetStatus: 'WAIT_CHECK',
        agree: isAllow,
        assetFlowCategoryEnum: 'HARDWARE_REGISTER',
        schemeRequest: {
          content: remark,
          extension: '{baseline: false}',
          fileInfo: fileInfo,
          schemeSource: 1,
          type: 2
        },
        software: false
      }
      console.log('基准检查参数', payload)
      const data = yield call(statusJump, payload)
      if (data && data.head && data.head.code === '200') {
        message.success(`${data.head.result}`)
      }
    },
    // 制定方案
    *scheme ({ payload = {} }, { call, put }) {
      // console.log('Received values of form: ', payload)
      // const { stringId, taskId, DefinedScheme, dispatch, fileInfo, handle } = payload
    },
    // 实施退役
    *implement ({ payload = {} }, { call, put }) {
      console.log('Received values of form: ', payload)
      const { stringId, taskId, DefinedScheme, fileInfo } = payload
      payload = {
        activityHandleRequest: {
          // formData: '{topologyUserId:"5,7,16", result:1}',
          formData: '{"result":1}',
          taskId: taskId
        },
        assetId: stringId,
        assetStatus: 'WAIT_RETIRE',
        agree: true,
        assetFlowCategoryEnum: 'HARDWARE_IMPL_RETIRE',
        schemeRequest: {
          content: DefinedScheme,
          fileInfo: fileInfo,
          schemeSource: 1,
          type: 4
        },
        software: false
      }
      console.log('方案实施参数', payload)
      const data = yield call(statusJump, payload)
      if (data && data.head && data.head.code === '200') {
        message.success(`${data.head.result}`)
      }
    }
  },
  reducers: {
    initAlysisDetail (state, { payload }) {
      console.log('硬件详情响应', payload)
      let obj = {
        cpuEl: [],
        mainboardEl: [],
        memoryEl: [],
        hardEl: [],
        networkEl: []
      }
      const { hardwareAsset } = payload
      if (hardwareAsset.assetCpu) {// CPU部件
        hardwareAsset.assetCpu.forEach((value, index) => {
          obj.cpuEl.push(eachOption({
            number: 6,
            title: ['品牌', '型号', '序列号', 'CPU主频', '线程数', '处理核心数'],
            key: [ `cpu_brand_${index}`, `cpu_model_${index}`, `cpu_serial_${index}`, `cpu_mainFrequency_${index}`,
              `cpu_threadSize_${index}`, `cpu_coreSize_${index}`],
            rules: [1, 0, 0, 1, 0, 0],
            values: [value.brand ? value.brand : '', value.model ? value.model : '',
              value.serial ? value.serial : '', value.mainFrequency ? value.mainFrequency : '',
              value.threadSize ? value.threadSize : '', value.coreSize ? value.coreSize : '']
          }))
        })
      }
      if(hardwareAsset.assetMainborad){// 主板
        hardwareAsset.assetMainborad.forEach((value, index) => {
          obj.mainboardEl.push(eachOption({
            number: 5,
            title: ['品牌', '型号', '序列号', 'bios版本', 'bios日期'],
            key: [ `mainboard_brand_${index}`, `mainboard_model_${index}`, `mainboard_serial_${index}`, `mainboard_biosVersion_${index}`,
              `mainboard_biosDate_${index}`],
            rules: [1, 0, 0, 0, 0],
            values: [value.brand ? value.brand : '', value.model ? value.model : '',
              value.serial ? value.serial : '', value.biosVersion ? value.biosVersion : '',
              value.biosDate ? value.biosDate : '']
          }))
        })
      }
      if(hardwareAsset.assetMemory){// 内存assetMemory
        hardwareAsset.assetMemory.forEach((value, index) => {
          obj.memoryEl.push(eachOption({
            number: 8,
            title: ['品牌', '内存类型', '序列号', '内存容量', '内存主频', '插槽类型', '是否带散热', '针脚数'],
            key: [ `memory_brand_${index}`, `memory_transferType_${index}`, `memory_serial_${index}`, `memory_capacity_${index}`,
              `memory_frequency_${index}`, `memory_slotType_${index}`, `memory_heatsink_${index}`, `memory_stitch_${index}`],
            rules: [1, 1, 0, 1, 1, 0, 0, 0],
            values: [value.brand ? value.brand : '', value.transferType ? value.transferType : '', value.serial ? value.serial : '',
              value.capacity ? value.capacity : '', value.frequency ? value.frequency : '', value.slotType ? value.slotType : '',
              value.heatsink ? value.heatsink : '', value.stitch ? value.stitch : '']
          }))
        })
      }
      if(hardwareAsset.assetHardDisk){// 硬盘 assetHardDisk
        hardwareAsset.assetHardDisk.forEach((value, index) => {
          obj.hardEl.push(eachOption({
            number: 7,
            title: ['品牌', '硬盘型号', '序列号', '容量', '接口类型', '磁盘类型', '购买日期'],
            key: [ `hardDisk_brand_${index}`, `hardDisk_model_${index}`, `hardDisk_serial_${index}`, `hardDisk_capacity_${index}`,
              `hardDisk_interfaceType_${index}`, `hardDisk_diskType_${index}`, `hardDisk_buyDate_${index}`],
            rules: [1, 1, 0, 1, 0, 1, 0],
            values: [value.brand ? value.brand : '', value.model ? value.model : '', value.serial ? value.serial : '',
              value.capacity ? value.capacity : '', value.interfaceType ? value.interfaceType : '', value.diskType ? value.diskType : '',
              value.buyDate ? value.buyDate : '']
          }))
        })
      }
      if(hardwareAsset.assetNetworkCard){// 网卡 assetNetworkCard
        hardwareAsset.assetNetworkCard.forEach((value, index) => {
          obj.networkEl.push(eachOption({
            number: 7,
            title: ['品牌', '型号', '序列号', 'ip地址', 'mac地址', '子网掩码', '默认网卡'],
            key: [ `networkCard_brand_${index}`, `networkCard_model_${index}`, `networkCard_serial_${index}`, `networkCard_ipAddress_${index}`,
              `networkCard_macAddress_${index}`, `networkCard_subnetMask_${index}`, `networkCard_defaultGateway_${index}`],
            rules: [1, 0, 0, 0, 0, 0, 0],
            values: [value.brand ? value.brand : '', value.model ? value.model : '', value.serial ? value.serial : '',
              value.ipAddress ? value.ipAddress : '', value.macAddress ? value.macAddress : '', value.subnetMask ? value.subnetMask : '',
              value.defaultGateway ? value.defaultGateway : '']
          }))
        })
      }
      return {
        ...state,
        ...obj
      }
    },
    initVerifyDetail (state, { payload }) {
      return {
        ...state,
        ...payload
      }
    }
  }
}
