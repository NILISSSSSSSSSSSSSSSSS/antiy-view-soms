import { Component } from 'react'
import moment from 'moment'
import DetailFiedls from '@c/common/DetailFiedls'
import { NETWORK_DEVICE, STORAGE_DEVICE } from '@a/js/enume'
import './index.less'
export default class Maintenance extends Component {
  renderFields = () => {
    const { data = {} } = this.props
    const { categoryModel } = data
    let fields = [
      { key: 'serial', name: '序列号', showTips: false },
      { key: 'houseLocation', name: '机房位置', showTips: false },
      { key: 'installTypeName1', name: '物理位置', showTips: false },
      { key: 'assetGroup', name: '资产组', showTips: false },
      { key: 'installTypeName', name: '维护方式', showTips: false },
      { key: 'buyDate', name: '购买日期', render: (text) => text ? moment(text).format('YYYY-MM-DD') : '', showTips: false },
      { key: 'warranty', name: '保修期', showTips: false, render: (text) => text ? `${text}` : '' },
      { key: 'serviceLife', name: '到期时间', render: (text) => text ? moment(text).format('YYYY-MM-DD') : '', showTips: false }
    ]
    switch (Number(categoryModel)) {
      case (NETWORK_DEVICE.value): { // 网络设备
        fields = [].concat(fields, [
          { key: 'interfaceSize', name: '接口数目', showTips: false },
          { key: 'firmwareVersion', name: '固件版本', showTips: false },
          { key: 'subnetMask', name: '子网掩码', showTips: false },
          { key: 'isWireless', name: '是否无线', showTips: false, render: (text) => text === 1 ? '是' : '否' },
          { key: 'outerIp', name: '外网IP', showTips: false },
          { key: 'dramSize', name: 'dram大小', value: data.dramSize ? `${data.dramSize}MB` : '', showTips: false },
          { key: 'expectBandwidth', name: '预计带宽', value: data.expectBandwidth ? `${data.expectBandwidth}M` : '', showTips: false },
          { key: 'register', name: '配置寄存器', showTips: false },
          { key: 'ncrmSize', name: 'ncrm大小', value: data.ncrmSize ? `${data.ncrmSize}MB` : '', showTips: false },
          { key: 'cpuVersion', name: 'cpu(版本)', showTips: false },
          { key: 'cpuSize', name: 'cpu大小', showTips: false },
          { key: 'flashSize', name: 'flash大小', value: data.flashSize ? `${data.flashSize}MB` : '', showTips: false },
          { key: 'ios', name: 'IOS', showTips: false }
        ])
        break
      }
      case (STORAGE_DEVICE.value): { // 存储设备
        fields = [].concat(fields).concat([
          { key: 'diskNumber', name: '单机磁盘数', showTips: false },
          { key: 'highCache', name: '高速缓存', showTips: false, value: data.highCache ?  `${data.highCache }GB/S` : '' },
          { key: 'innerInterface', name: '内置接口', showTips: false },
          { key: 'raidSupport', name: 'RAID支持', showTips: false },
          { key: 'averageTransferRate', name: '平均传输率', showTips: false },
          { key: 'firmwareVersion', name: '固件', showTips: false },
          { key: 'osVersion', name: 'OS版本', showTips: false },
          { key: 'driverNumber', name: '驱动器数量', showTips: false }
        ])
        break
      }
      default:
    }
    return fields
  }
  render () {
    const { data = {} } = this.props
    const fields = this.renderFields()
    console.log(fields)
    const fields2 = [
      { key: 'describle', name: '描述', showTips: false }
    ]
    return (
      <div className="asset-maintenance-field-container">
        <DetailFiedls fields={fields} data={data} />
        <DetailFiedls fields={fields2} data={data} column={1} />
      </div>
    )
  }
}
