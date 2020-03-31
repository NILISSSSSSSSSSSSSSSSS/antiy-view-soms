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
        patch_install: '无'
      },
      list: [{
        flowId: analysisUrl(this.props.location.search).flowId,
        flowNodeTag: 'patch_install',
        roleId: ''
      }],
      init: undefined,
      text: undefined
    }
  }
  componentDidMount () {
    this.getRole()
    this.getDetail(analysisUrl(this.props.location.search).flowId)
  }
  render () {
    let { userList, show, userMap, init, text } = this.state
    return (
      <div className="PatchRegister">
        <h2 className="page-title">补丁安装流程</h2>
        <div className="detail-content">
          <div className="main-content">
            <img src={require('@/assets/patch.svg')} alt=""/>
            <div className="handle">
              <Button type="primary" icon="user" className="patchbtnClass1" style={{ opacity: '0' }}>补丁操作员</Button>
              {
                userMap.patch_install.length > 5 ? (
                  <Tooltip title={userMap.patch_install} placement="top">
                    <Button type="primary" icon="user" className="patchbtnClass"
                      onClick={()=>this.showModal('patch_install')}>{ userMap.patch_install}</Button>
                  </Tooltip>
                ) : (<Button type="primary" icon="user" className="patchbtnClass"
                  onClick={()=>this.showModal('patch_install')}>{ userMap.patch_install}</Button>)
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
                style={{ width: '200px' }} onSelect={(v, opt) => this.setState({ init: opt.key, text: v })}>
                {
                  userList.map(item => (
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
  getRole = () => {
    api.getAllWorkflowRoles().then(response => {
      if(response && response.head && response.head.code === '200' ){
        this.setState({
          userList: response.body
        })
      }
    }).catch(err => {})
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
