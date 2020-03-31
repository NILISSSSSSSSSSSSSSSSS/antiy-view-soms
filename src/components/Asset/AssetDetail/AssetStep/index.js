import {
  RECTIFICATION,
  COMPUTING_DEVICE,
  NOT_REGISTER,
  WAIT_REGISTER,
  CONNECTTED,
  SCRAP_APPROVA_FAILED,
  TO_BE_RETIRED,
  RETIRED,
  CHANGING,
  NETWORK_ACCESS_PENDING_APPROVAL,
  PENDING_ADMISSION } from '@a/js/enume'
import './index.less'
import { Steps } from 'antd'
import React from 'react'
const { Step } = Steps
export default function AssetStep (props) {
  const { assetStatus: currentStep, stepNode, baselineTemplateId, categoryModel } = props.baseInfo || {}
  let steps = [] // 内部格式为 { key: 0, value: 5, name: '待检查' }
  if(currentStep === NOT_REGISTER.value){ // 异常流程
    steps = [
      { key: 0, ...WAIT_REGISTER },
      { key: 1, ...NOT_REGISTER }
    ]
  }else if(currentStep === TO_BE_RETIRED.value || currentStep === RETIRED.value){ // 退役流程
    steps = [
      { key: 0, ...CONNECTTED },
      { key: 1, ...TO_BE_RETIRED },
      { key: 2, ...RETIRED }
    ]
  }else if(stepNode === 'safetyCheck' || (!stepNode && COMPUTING_DEVICE.value === categoryModel)){ // 线上流程(上报资产、导入资产、或者安全检查的资产)
    steps = [
      { key: 0, ...WAIT_REGISTER },
      { key: 1, ...SCRAP_APPROVA_FAILED },
      { key: 2, ...RECTIFICATION },
      { key: 3, ...CONNECTTED, hideLine: true },
      { key: 4, ...CHANGING, shows: [COMPUTING_DEVICE.value] }
    ]
  }else if(stepNode === 'templateImplement'){ // 线下流程
    steps = [
      { key: 0, ...WAIT_REGISTER },
      { key: 1, ...PENDING_ADMISSION },
      { key: 2, ...RECTIFICATION },
      { key: 3, ...NETWORK_ACCESS_PENDING_APPROVAL },
      { key: 4, ...CONNECTTED, hideLine: true },
      { key: 5, ...CHANGING, shows: [COMPUTING_DEVICE.value] }
    ]
  }else if(!baselineTemplateId && categoryModel !== COMPUTING_DEVICE.value){ // 非计算设备登记之后直接入网的流程(不需要进行配置，直接入网)
    steps = [
      { key: 0, ...WAIT_REGISTER },
      { key: 1, ...CONNECTTED, hideLine: true },
      { key: 2, ...CHANGING, shows: [COMPUTING_DEVICE.value] }
    ]
  }
  // 非计算设备没有变更中的状态
  steps = steps.filter(e=>(typeof e.shows === 'undefined' ? true : e.shows.includes(categoryModel)))
  // 找出对应的状态所在的位置
  const _currentStep =  currentStep ? (steps.find(e=>e.value === currentStep) || {}).key : 0
  return (
    <Steps className="detail-step-horizontal custom-step" progressDot current={_currentStep} >
      {
        steps.map(e=><Step  key={e.key} title={e.name} className={e.hideLine ? 'custom-step-current' : ''}/>)
      }
    </Steps>
  )
}
