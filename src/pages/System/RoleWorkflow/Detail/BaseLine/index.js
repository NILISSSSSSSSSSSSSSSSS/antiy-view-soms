import { Component } from 'react'
import { connect } from 'dva'
import { Button, Select, Row, Col, Modal, message, Tooltip, Icon } from 'antd'
import './style.less'
import _ from 'lodash'
import { analysisUrl } from '@/utils/common'
import api from '@/services/api'

const Option  =  Select.Option

class HardwareRgisterForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      show: false,
      userList: [],
      showName: '',
      userMap: {
        config_base: '无',
        config_check: '无',
        config_steady: '无',
        config_fixed_sp: '无'
      },
      list: [{
        flowId: analysisUrl(this.props.location.search).flowId,
        flowNodeTag: 'config_base',
        roleId: ''
      },
      {
        flowId: analysisUrl(this.props.location.search).flowId,
        flowNodeTag: 'config_check',
        roleId: ''
      },
      {
        flowId: analysisUrl(this.props.location.search).flowId,
        flowNodeTag: 'config_steady',
        roleId: ''
      },
      {
        flowId: analysisUrl(this.props.location.search).flowId,
        flowNodeTag: 'config_fixed_sp',
        roleId: ''
      }],
      text: undefined,
      init: undefined
    }
  }
  componentDidMount () {
    this.getRole()
    this.getDetail(analysisUrl(this.props.location.search).flowId)
  }
  render () {
    let { userList, show, userMap, init, text } = this.state
    return (
      <div className="BaseLine">
        <h2 className="page-title">配置基准流程</h2>
        <div className="detail-content">
          <div className="main-content" draggable="true" onMouseDown={this.drags}>
            <img src={require('@/assets/allocation.svg')} alt=""/>
            <div className="handle">
              {
                userMap.config_base.length > 5 ? (
                  <Tooltip title={userMap.config_base} placement="top">
                    <Button type="primary" icon="user" className="backbtnClass2"
                      onClick={()=>this.showModal('config_base')}>{ userMap.config_base}</Button>
                  </Tooltip>
                ) : (<Button type="primary" icon="user" className="backbtnClass2"
                  onClick={()=>this.showModal('config_base')}>{ userMap.config_base}</Button>)
              }
              {
                userMap.config_check.length > 5 ? (
                  <Tooltip title={userMap.config_check} placement="top">
                    <Button type="primary" icon="user" className="backbtnClass3"
                      onClick={()=>this.showModal('config_check')}>{ userMap.config_check}</Button>
                  </Tooltip>
                ) : (<Button type="primary" icon="user" className="backbtnClass3"
                  onClick={()=>this.showModal('config_check')}>{ userMap.config_check}</Button>)
              }
              {
                userMap.config_steady.length > 5 ? (
                  <Tooltip title={userMap.config_steady} placement="top">
                    <Button type="primary" icon="user" className="backbtnClass4"
                      onClick={()=>this.showModal('config_steady')}>{ userMap.config_steady}</Button>
                  </Tooltip>
                ) : (<Button type="primary" icon="user" className="backbtnClass4"
                  onClick={()=>this.showModal('config_steady')}>{ userMap.config_steady}</Button>)
              }
              {
                userMap.config_fixed_sp.length > 5 ? (
                  <Tooltip title={userMap.config_fixed_sp} placement="top">
                    <Button type="primary" icon="user" className="backbtnClass1"
                      onClick={()=>this.showModal('config_fixed_sp')}>{ userMap.config_fixed_sp}</Button>
                  </Tooltip>
                ) : (<Button type="primary" icon="user" className="backbtnClass1"
                  onClick={()=>this.showModal('config_fixed_sp')}>{ userMap.config_fixed_sp}</Button>)
              }
            </div>
          </div>
          <div className="Button-center">
            <div>
              <Button type="primary" onClick={this.Submit}>部署</Button>
              {/* <Button className="back-btn" type="primary" ghost onClick={this.cancel}>返回</Button> */}
            </div>
          </div>
        </div>
        <Modal title='' visible={show} onOk={()=>this.changeStatus(init)} onCancel={this.handleCancel} width={450}>
          <Row>
            <Col span={8}>选择对应流程角色:</Col>
            <Col span={16}>
              <Select  placeholder='请选择' value={text} showSearch
                optionFilterProp='children'
                style={{ width: '200px' }} onSelect={(v, opt) =>{
                  this.setState({ init: opt.key, text: v }) }}>
                {
                  userList.map((item, i) => (
                    <Option value={item.name} key={item.stringId}>{item.name}</Option>
                  ))
                }
              </Select>
            </Col>
          </Row>
        </Modal>
      </div>
    )
  }
  changeStatus = (v) => {
    let { userMap, list } = this.state
    if(v){
      _.find(list, { 'flowNodeTag': `${this.state.showName}` }).roleId = v
      userMap[`${this.state.showName}`] = _.find(this.state.userList, { 'stringId': v }).name
      this.setState({
        userMap,
        list,
        init: undefined,
        show: false,
        text: undefined
      })
    }else{
      message.info('请选择流程角色！')
    }
  }
  getDetail = (id) => {
    api.flowNodeList({ stringId: id }).then(response => {
      if(response && response.head && response.head.code === '200' ){
        let data = response.body
        let { userMap } = this.state
        data.forEach(item => {
          if(userMap[item.nodeTag]){
            userMap[item.nodeTag] = item.roleName ? item.roleName : '无'
          }
        })
        this.setState({
          userMap
        })
      }
    })
  }
  getRole = () => {
    api.getAllWorkflowRoles().then(response => {
      if(response && response.head && response.head.code === '200' ){
        this.setState({
          userList: response.body
        })
      }
    })
  }
  showModal = (v) => {
    let init = this.state.userMap[v]
    this.setState({
      show: true,
      showName: v,
      text: init
    })
  }
  Submit = () => {
    let { list } = this.state
    let obItem = []
    list.forEach(item => {
      if(item.roleId){
        obItem.push(item)
      }
    })
    if(!obItem.length){
      message.success('部署成功！')
      this.props.history.goBack()
      return
    }
    api.workflowUpdate({ list: obItem }).then(response => {
      if(response && response.head && response.head.code === '200' ){
        this.props.history.goBack()
      }
    }).catch(err => {})
  }
  handleCancel = () => {
    this.setState({
      show: false,
      init: undefined
    })
  }
  cancel = () => {
    const _this = this
    Modal.confirm({
      className: 'alert-confirm-content',
      icon: <Icon type="close" onClick={() => { Modal.destroyAll() }} />,
      content: '确认返回吗？如您现在离开，您所做的操作将不会保存！',
      onOk () {
        _this.props.history.goBack()
      }
    })
  }
}
export default connect()(HardwareRgisterForm)
