import React, { Component } from 'react'
import { Row, Col } from 'antd'
import { object } from 'prop-types'

const span = { xxl: 6, xl: 8 }

class AssetsDetail extends Component {
  static propTypes = {
    detailData: object
  }
  constructor (props) {
    super(props)
    this.state = {

    }
  }

  componentDidMount () {

  }

  render () {
    const { detailData = {} } = this.props
    return (
      <div className="bug-test">
        <p className="detail-title">资产信息</p>
        <div className="detail-content detail-content-layout">
          <Row>
            <Col {...span}><span className="detail-content-label">资产名称：</span>{detailData.assetName}</Col>
            <Col {...span}><span className="detail-content-label">资产编号：</span>{detailData.assetNo}</Col>
            <Col {...span}><span className="detail-content-label">资产类型：</span>{detailData.assetType}</Col>
            <Col {...span}><span className="detail-content-label">IP：</span>{detailData.ip}</Col>
            <Col {...span}><span className="detail-content-label">MAC：</span>{ detailData.mac}</Col>
            <Col {...span}><span className="detail-content-label">维护方式：</span>{detailData.installType}</Col>
            <Col {...span}><span className="detail-content-label">使用者：</span>{detailData.assetUser}</Col>
            <Col {...span}><span className="detail-content-label">资产状态：</span>{detailData.assetStatus}</Col>
            <Col {...span}><span className="detail-content-label">重要性：</span>{detailData.importantGrade}</Col>
            <Col {...span}><span className="detail-content-label">资产区域：</span>{detailData.areaStr}</Col>
          </Row>
        </div>
      </div>
    )
  }

}

export default AssetsDetail
