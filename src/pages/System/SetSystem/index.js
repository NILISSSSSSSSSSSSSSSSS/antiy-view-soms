import { Component } from 'react'
import { connect } from 'dva'
import { Form, Modal, Button, InputNumber, Tabs, Icon } from 'antd'
import Account from '@/components/System/Strategy/Account'
import Password from '@/components/System/Strategy/Password'
import api from '@/services/api'
import './style.less'
const { Item } =  Form
const { TabPane } = Tabs
class SetSystem extends Component {
  constructor (props){
    super(props)
    this.state = {
      active: '1',
      body: {}
    }
  }
  componentDidMount (){
    this.getSetQueryList()
  }
  //获取设置项数据
  getSetQueryList=()=>{
    api.getSetQueryList().then(response => {
      this.setState({ body: response.body }, this.classifySet)
    }).catch(err => {})
  }
  //分类设置
  classifySet = ()=>{
    let { body, active } = this.state
    let init = {} 
    if(active === '1'){
      ['passwordShortest', 'passwordMaxUsed', 'passwordMinUsed', 'passwordLetterContinuous', 'newpasswordHistoryCount'].forEach(item=>{
        init[item] = body[item]
      })
      this.props.form.setFieldsValue(init)
    }else {
      ['sessionTimeout', 'passwordLimitedMinute', 'passwordLockDuration', 'passwordAllowCount'].forEach(item=>{
        init[item] = body[item]
      })
      this.props.form.setFieldsValue(init)
    }
  }
  //重置
  Reset=(e)=>{
    this.props.form.resetFields()
  }
  //提交
  Submit=(e)=>{
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let { active } = this.state
        api[active === '1' ? 'updatePasswoprd' : 'setSetUpdate'](values).then(response => {
          if(response && response.head && response.head.code === '200' ){
            Modal.success({
              icon: <Icon type="close" onClick={() => { Modal.destroyAll() }} />,
              content: '保存成功',
              okText: '确定'
            })
            this.getSetQueryList()
          }
        })
      }
    })
  }
  //切换tab
  callback = (key)=>{
    this.setState({ active: key }, this.classifySet)
  }
  render (){
    let { active } = this.state
    return(
      <div className="main-table-content">
        <Form className="form-single set-system" onSubmit={this.Submit} onReset={this.Reset}>
          <Tabs defaultActiveKey={active} onChange={this.callback}>
            <TabPane tab="密码策略" key="1">
              <Password {...this.props.form}></Password>
            </TabPane>
            <TabPane tab="账户锁定策略" key="2">
              <Account {...this.props.form } Item={Item}></Account>
            </TabPane>
          </Tabs>
          <div className="Button-center">
            <div>
              <Button type="primary" htmlType="submit">提交</Button>
              <Button className="back-btn" type='primary' ghost htmlType='reset'>重置</Button>
            </div>
          </div>
        </Form>
      </div>
    )
  }
}

const mapStateToProps = ({ vul }) => {
  return {
  }
}
const SetSystemFrom = Form.create()(SetSystem)
export default connect(mapStateToProps)(SetSystemFrom)
