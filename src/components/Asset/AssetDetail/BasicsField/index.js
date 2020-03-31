import React, { Component, Fragment } from 'react'
import DetailFiedls from '@c/common/DetailFiedls'
import { COMPUTING_DEVICE, NETWORK_DEVICE, SAFETY_DEVICE, STORAGE_DEVICE, ASSETS_IMPORTANT } from '@a/js/enume'
import './index.less'
export default class BasicsField extends Component {
  render () {
    const { data, categoryModel } = this.props
    let fields = [
      { key: 'categoryModelName', name: '资产类型', showTips: false },
      { key: 'manufacturer', name: '厂商' },
      { key: 'name', name: '名称' },
      { key: 'version', name: '版本' },
      { key: 'operationSystemName', name: '操作系统', shows: [COMPUTING_DEVICE.value, SAFETY_DEVICE.value] },
      { key: 'number', name: '资产编号' },
      { key: 'responsibleUserName', name: '使用者' },
      { key: 'importanceDegree', name: '重要程度', render: (e) => (ASSETS_IMPORTANT.find(it => it.value === e) || {}).name, showTips: false },
      { key: 'areaName', name: '归属区域' },
      { key: 'maximumStorage', name: '最大存储量', shows: [STORAGE_DEVICE.value], showTips: false, render: (v)=> `${v || 0}GB` },
      { key: 'assetSourceName', name: '资产来源', showTips: false },
      { key: 'assetSourceName1', name: '是否孤岛设备', shows: [COMPUTING_DEVICE.value] },
      { key: 'newVersion', name: '软件版本', shows: ()=>(categoryModel === SAFETY_DEVICE.value && data.manufacturer !== 'antiy') }
    ]
    const computerFields = [ //看返回几对
      { key: 'assetSourceName1', name: '从属业务', shows: [COMPUTING_DEVICE.value] },
      { key: 'assetSourceName1', name: '业务影响', shows: [COMPUTING_DEVICE.value] }
    ]
    const column = void 0
    let ipFileds = [{ name: 'IP', value: '无', showTips: false }]
    let porteSizeFileds = [{ key: 'portSize', name: '网口数目', shows: [NETWORK_DEVICE.value], showTips: false }]
    let macFileds = [{ name: 'MAC', value: '无', showTips: false }]
    if (data.ip && data.ip.length) {
      ipFileds = (data.ip || []).map((it) => {
        return { name: 'IP', render: () => it.ip, showTips: false }
      })
    }
    if (data.mac && data.mac.length) {
      macFileds = (data.mac || []).map((it) => {
        return { name: 'MAC', render: () => it.mac, showTips: false }
      })
    }
    fields = fields.filter(e => {
      if(typeof e.shows === 'function'){
        return e.shows()
      }
      return e.shows ? e.shows.includes(categoryModel) : true
    })
    if (NETWORK_DEVICE.value === categoryModel) {
      ipFileds = (data.ip || []).map((it) => {
        return { name: '网口与IP', render: () => `${it.net || ''} ${it.ip || '无'}`, showTips: false }
      })
    }
    return (
      <div className="asset-basics-field-container">
        <DetailFiedls fields={fields} data={data} column={column} />
        {
          COMPUTING_DEVICE.value === categoryModel && (
            <Fragment>
              <div className="line" />
              <DetailFiedls fields={computerFields} column={column} />
            </Fragment>
          )
        }
        {
          STORAGE_DEVICE.value !== categoryModel && (
            <Fragment>
              <div className="line" />
              <DetailFiedls fields={macFileds} column={column} />
            </Fragment>
          )
        }
        {
          STORAGE_DEVICE.value !== categoryModel && (
            <Fragment>
              <div className="line" />
              {NETWORK_DEVICE.value === categoryModel && <DetailFiedls fields={porteSizeFileds} column={column} data={data} />}
              <DetailFiedls fields={ipFileds} column={column} />
            </Fragment>
          )
        }
      </div>
    )
  }
}
