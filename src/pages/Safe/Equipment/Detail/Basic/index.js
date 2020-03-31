import { Component, Fragment } from 'react'
import { Col } from 'antd'
import api from '@/services/api'
import './style.less'
import moment from 'moment'
import DetailFiedls from '@/components/common/DetailFiedls'

export default class BasicDetail extends Component {
  constructor (props) {
    super(props)
    this.state = {
      body: {}
    }
    // 基础信息字段
    this.assetInfoList = [
      { name: '资产名称', key: 'name' },
      { name: '版本', key: 'version' },
      { name: '厂商', key: 'manufacturer' },
      { name: '资产编号', key: 'number' },
      { name: 'IP地址', key: 'ip', showTips: false },
      { name: 'MAC地址', key: 'mac', showTips: false },
      {
        name: '首次入网时间', key: 'firstEnterNett', showTips: false,
        render: (timestamp) => {
          const num = Number(timestamp)
          const text = num > 0 ? moment(num).format('YYYY-MM-DD HH:mm:ss') : ''
          return text
        }
      },
      { name: '网络连接', key: 'networkState', showTips: false },
      { name: '区域', key: 'area' },
      { name: '机房位置', key: 'houseLocation' },
      { name: '描述', key: 'memo', overFlow: 'visible', showTips: false }
    ]
    // 业务信息字段
    this.businessInfoList = [
      { name: '软件版本', key: 'newVersion' },
      { name: '特征库版本', key: 'maxFeatureLibrary' },
      { name: 'URL地址', key: 'url', overFlow: 'visible', showTips: false },
      { name: '命令与控制通道检测引擎版本号', key: 'commandControlChannel' },
      { name: 'AVLX检测引擎版本号', key: 'avlxVersion' }
    ]
  }
  componentDidMount () {
    // 获取设备详情
    api.equipmentQueryById({ primaryKey: this.props.id }).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          body: response.body ? response.body : ''
          // assetId: response.body.assetId
        })
      }
    })
  }
  // 渲染详细字段
  renderAssetInfo = (list = [], body = {}, spans = [2, 6]) => {
    return list.map((it, i) => {
      const value = body[it.key] ? body[it.key] : ''
      let valueClass = 'detail-item detail-item detail-item-value'
      if (it.key !== 'url') {
        valueClass += ' text-ellipsis'
      }
      return (
        <Fragment key={i}>
          <Col span={spans[0]} className="detail-item" ><span className="detail-content-label">{it.name}：</span></Col>
          <Col span={spans[1]} className={valueClass}>{it.render ? it.render(value) : value}</Col>
          {/* {line} */}
        </Fragment>
      )
    })
  }

  render () {
    const { body } = this.state
    return (
      <div className="main-detail-content safe-equ-base">
        <p className="detail-title">通用信息</p>
        <div className="detail-base">
          <div className="detail-content detail-base-content">
            <DetailFiedls fields={this.assetInfoList.slice(0, -1)} data={body} />
            <DetailFiedls fields={this.assetInfoList.slice(this.assetInfoList.length - 1)} column={1} data={body} />
          </div>
        </div>
        <p className="detail-title">业务信息</p>
        <div className="detail-business">
          <div className="detail-content detail-business-content">
            <DetailFiedls fields={this.businessInfoList} data={body} />
          </div>
        </div>
      </div>
    )
  }
}
