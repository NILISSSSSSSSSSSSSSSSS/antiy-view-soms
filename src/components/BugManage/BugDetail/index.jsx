import React, { Component, Fragment } from 'react'
import { Row, Col } from 'antd'
import moment from 'moment'
import { object, bool } from 'prop-types'
import './index.less'

const span = { xxl: 6, xl: 8 }
const blockSpan = { xxl: 24, xl: 24 }

class BugDetail extends Component {
  static propTypes = {
    //详情数据
    detailData: object,
    //是否显示标题
    isShowTitle: bool
  }

  static defaultProps = {
    detailData: {},
    isShowTitle: false
  }
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  componentDidMount () {

  }

  render () {
    const { detailData, isShowTitle } = this.props
    let cvss = ''
    const _cvss = detailData.cvss
    if (_cvss) {
      _cvss.forEach((item, index) => {
        const values = item.split('-')
        cvss += `${values[0]}（${values[1]}）`
        if (index !== _cvss.length - 1) {
          cvss += '，'
        }
      })
    }
    return (
      <Fragment>
        {
          isShowTitle && <p className="detail-title">漏洞信息</p>
        }
        <div className="detail-content detail-content-layout bug-detail">
          <Row>
            <div className="clearfix detail-border">
              <Col {...span}><span className="detail-content-label">CNNVD编号：</span>{detailData.cnnvd}</Col>
              <Col {...span}><span className="detail-content-label">CNVD编号：</span>{detailData.cnvd}</Col>
              <Col {...span}><span className="detail-content-label">CVE编号：</span>{detailData.cve}</Col>
              <Col {...span}><span className="detail-content-label">其他编号：</span>{detailData.otherNo}</Col>
            </div>
            <Col {...span}><span className="detail-content-label">漏洞名称：</span>{detailData.vulName}</Col>
            <Col {...span}><span className="detail-content-label">漏洞类型：</span>{detailData.vulnTypeStr}</Col>
            <Col {...span}><span className="detail-content-label">漏洞发布时间：</span>
              {detailData.vulReleaseTime ? moment(detailData.vulReleaseTime).format('YYYY-MM-DD') : ''}
            </Col>
            <Col {...span}><span className="detail-content-label">危害等级：</span>{detailData.warnLevelStr}</Col>
            <Col {...span}><span className="detail-content-label">漏洞来源：</span>{detailData.vulSource}</Col>
            <Col {...span}><span className="detail-content-label">CVSS：</span>{cvss}</Col>
            <Col {...blockSpan}><span className="detail-content-label">漏洞描述：</span>{detailData.vulDesc}</Col>
          </Row>
        </div>
      </Fragment>
    )
  }
}

export default BugDetail
