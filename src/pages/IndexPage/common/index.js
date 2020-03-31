import { Fragment } from 'react'

const ASSETS_STATUS = [{
  name: '资产登记',
  value: 1
}, {
  name: '模板实施',
  value: 3
}, {
  name: '结果验证',
  value: 4
}, {
  name: '入网实施',
  value: 5
}, {
  name: '安全检查',
  value: 7
}, {
  name: '安全整改',
  value: 8
}, {
  name: '退役发起',
  value: 6
}, {
  name: '退役实施',
  value: 10
}]

export function onRow (ob, record) {
  let assetId, configId, bugpatchId, bugpatchInfoId = ''
  if (!record.businessId.includes('&') && record.businessId) {
    assetId = record.businessId //资产跳转
  } else if (record.businessId.split('&').length >= 3) {
    let len = record.businessId.split('&').length
    configId = record.businessId.split('&')[len - 1] //配置跳转
  } else if (['漏洞退回', '补丁处置', '补丁退回'].includes(record.name)) {
    bugpatchInfoId = record.businessId.split('&')[1]
  } else {
    bugpatchId = record.businessId.split('&')[0]//漏洞补丁跳转
  }
  switch (record.name) {
    case '基准配置':
      ob.push('/basesetting/manage?businessId=' + configId)
      break
    case '基准加固':
      ob.push('/basesetting/list/validation?businessId=' + configId)
      break
    case '基准核查':
      ob.push('/basesetting/list/enforcement?businessId=' + configId)
      break
    case (ASSETS_STATUS.some(item => item.name === record.name) ? record.name : ''):
      let init = ASSETS_STATUS.filter(item => item.name === record.name)[0].value
      ob.push(`/asset/manage?assetStatusList=${init}&conditionShow=true&id=` + assetId)
      break
    case (record.name.indexOf('装机模板') > -1 ? record.name : ''):
      ob.push('/asset/installtemplate?id=' + assetId)
      break
    case (['漏洞修复', '漏洞处置'].includes(record.name) ? record.name : ''):
      ob.push('/bugpatch/bugmanage/dispose?id=' + bugpatchId)
      break
    case '漏洞退回':
      ob.push('/bugpatch/bugmanage/information?id=' + bugpatchInfoId)
      break
    case '补丁安装':
      ob.push('/bugpatch/patchmanage/install?stringid=' + bugpatchId)
      break
    case '补丁处置':
      ob.push('/bugpatch/patchmanage/information?stringid=' + bugpatchInfoId)
      break
    case '补丁退回':
      ob.push('/bugpatch/patchmanage/information?stringid=' + bugpatchInfoId)
      break
    default:
      break
  }
}
//筛选流程类型
export function filterType (iData) {
  iData.forEach(item => {
    let init = item.processDefinitionId.split(':')[0]
    if (['assetAdmittance', 'installTemplate', 'assetRetire'].includes(init)) {
      item.typeName = '资产管理'
    } else if (['baselineConfig'].includes(init)) {
      item.typeName = '配置管理'
    } else if (['vulRepair'].includes(init)) {
      item.typeName = '漏洞管理'
    } else if (['patchInstall'].includes(init)) {
      item.typeName = '补丁管理'
    }
  })
  return iData
}
//大于四个字符返回万为单位
export const CharRegroup = (v)=>{
  if(!v) return 0
  v = String(v)
  if(v.length > 4) v = (
    <Fragment>
      {v.slice(0, v.length - 4)}
      <span style={{ display: 'inline-block', fontSize: '16px' }}>万</span>
    </Fragment>
  )
  return v
}

//图表配置
export const doughnutChart = {
  Dchart1: {
    order: 1,
    id: 'circle-chart-1',
    color: ['#3B6CFF', '#5BCDFF', '#AD7AFF', '#05CC7F', '#FFC438'],
    service: 'getHardware',
    title: '资产类型分布'
  },
  Dchart2: {
    order: 2,
    id: 'circle-chart-2',
    color: ['#4083FF', '#46ECFF', '#A569FF'],
    service: 'getAssetLevel',
    title: '资产重要程度分布'
  },
  Dchart3: {
    order: 3,
    id: 'circle-chart-3',
    color: ['#C22A4E', '#FF8E64', '#FFDA38', '#4083FF'],
    service: 'getWarningData',
    title: '告警等级分布'
  },
  Dchart4: {
    order: 4,
    id: 'circle-chart-4',
    color: ['#4083FF', '#46ECFF', '#A569FF', '#22B37A', '#FFDA38', '#FF8E64', '#4545FF'],
    service: 'getWarningDataChart',
    title: '告警类型分布'
  }
}