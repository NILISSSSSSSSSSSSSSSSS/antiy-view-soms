import { Component } from 'react'
import { Row, Col, Divider, Button } from 'antd'
import moment from 'moment'
import api from '@/services/api'
import './style.less'

class SystemMonitor extends Component {
  constructor (props) {
    super(props)
    this.state = {
      info: {}
    }
  }
  componentDidMount () {
    this.getInfo()
  }
  UNSAFE_componentWillReceiveProps ( nextProps ){
  }

  render () {
    const { info } = this.state
    return (
      <div className="detail-box">
        <p className="title">运行监测规则详情</p>
        <div className="detail-content">
          <Row>
            <Col span={2}><span className="detail-content-label">监测项：</span></Col>
            <Col span={6}>{info.itemString}</Col>
            <Col span={2}><span className="detail-content-label">规则名：</span></Col>
            <Col span={6}>{info.ruleName}</Col>
            <Col span={2}><span className="detail-content-label">监测项单位：</span></Col>
            <Col span={6}>{info.unit}</Col>
          </Row>
          <Divider className="detail-content-divider" />
          <Row>
            <Col span={2}><span className="detail-content-label">临界值：</span></Col>
            <Col span={6}>{info.threshold}</Col>
            <Col span={2}><span className="detail-content-label">监测频率：</span></Col>
            <Col span={6}>{info.frequency}</Col>
            <Col span={2}><span className="detail-content-label">监测频率单位：</span></Col>
            <Col span={6}>{info.unitString}</Col>
          </Row>
          <Divider className="detail-content-divider" />
          <Row>
            <Col span={2}><span className="detail-content-label">规则状态：</span></Col>
            <Col span={6}>{info.statusString}</Col>
            <Col span={2}><span className="detail-content-label">创建人：</span></Col>
            <Col span={6}>{info.createUser}</Col>
            <Col span={2}><span className="detail-content-label">创建时间：</span></Col>
            <Col span={6}>{info.gmtModified && moment(info.gmtModified).format('YYYY-MM-DD HH:mm:ss')}</Col>
          </Row>
          <Divider className="detail-content-divider" />
          <Row>
            <Col span={2}><span className="detail-content-label">修改人：</span></Col>
            <Col span={6}>{info.createUserName}</Col>
            <Col span={2}><span className="detail-content-label">修改时间：</span></Col>
            <Col span={6}>{info.gmtCreate && moment(info.gmtCreate).format('YYYY-MM-DD HH:mm:ss')}</Col>
          </Row>
          <Row>
            <Col span={2}><span className="detail-content-label">规则描述：</span></Col>
            <Col span={6}>{info.ruleDesc}</Col>
          </Row>
          <Divider className="detail-content-divider" />
          <Button className="back-btn" onClick={this.props.history.goBack}>返回</Button>
        </div>
      </div>
    )
  }
  //获取用户信息
  getInfo = () => {
    api.sysMonitorItemQuery({
      id: this.props.match.params.id
    }).then(response => {
      if(response && response.head && response.head.code === '200' ){
        this.setState({
          info: response.body
        })
      }
    }).catch(err => {})
  }
}
export default SystemMonitor
