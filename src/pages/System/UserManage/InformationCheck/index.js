import { Component } from 'react'
import { connect } from 'dva'
import { Row, Col, Form } from 'antd'
import moment from 'moment'
import { analysisUrl } from '@/utils/common'
import api from '@/services/api'
import './style.less'

class SystemUserCheck extends Component {
  constructor (props) {
    super(props)
    this.state = {
      userInfo: {}
    }
  }
  componentDidMount () {
    this.getUserInfo()
    console.log(this.props.location)
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
  }

  render () {
    const { userInfo } = this.state
    const { status } = userInfo
    const span = { xxl: 6, xl: 8 }
    const blockSpan = { xxl: 24, xl: 24 }
    return (
      <div className="main-detail-content detail-box">
        {/* <h2 className="page-title">用户详情信息</h2> */}
        {/* <p className="detail-title">用户信息详情</p> */}
        <div className="detail-content">
          <Row>
            <Col {...span}><span className="detail-content-label">用户名：<span>{userInfo.username}</span></span></Col>
            <Col {...span}><span className="detail-content-label">姓名：<span>{userInfo.name}</span></span></Col>
            <Col {...span}><span className="detail-content-label">职能：<span>{userInfo.duty}</span></span></Col>
            <Col {...span}><span className="detail-content-label">部门：<span>{userInfo.department}</span></span></Col>
            <Col {...span}><span className="detail-content-label">手机号：<span>{userInfo.phone}</span></span></Col>
            <Col {...span}><span className="detail-content-label">电子邮箱：<span>{userInfo.email}</span></span></Col>
            <Col {...span}><span className="detail-content-label">管理区域：<span>{userInfo.manageArea}</span></span></Col>
            <Col {...span}><span className="detail-content-label">状态：<span>{status === 0 ? '禁用' : status === 1 ? '正常' : status === 2 ? '锁定' : status === 3 ? '新建' : ''}</span></span></Col>
            <Col {...span}><span className="detail-content-label">最后一次登录时间：<span>{userInfo.lastLoginTime && moment(userInfo.lastLoginTime).format('YYYY-MM-DD HH:mm:ss')}</span></span></Col>
            <Col {...span}><span className="detail-content-label">登记人：<span>{userInfo.createUserName}</span></span></Col>
            <Col {...span}><span className="detail-content-label">创建时间：<span>{userInfo.gmtCreate && moment(userInfo.gmtCreate).format('YYYY-MM-DD HH:mm:ss')}</span></span></Col>
            <Col {...blockSpan}><span className="detail-content-label detail-content-last-child">
              <span>角色：</span>
              <span>{userInfo.roles}</span>
            </span>
            </Col>
          </Row>
        </div>
        <div className="Button-center back-btn">
          {/* <Button type="primary" ghost onClick={this.props.history.goBack}>返回</Button> */}
        </div>
      </div>
    )
  }
  //获取用户信息
  getUserInfo = () => {
    api.getUserInfo({
      id: analysisUrl(window.location.href).id
    }).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          userInfo: response.body
        })
      }
    }).catch(err => { })
  }
}

const SystemUserCheckForm = Form.create()(SystemUserCheck)

export default connect()(SystemUserCheckForm)
