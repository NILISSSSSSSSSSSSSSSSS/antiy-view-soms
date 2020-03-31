import { Component } from 'react'
import { connect } from 'dva'
import { Row, Col, Input, Form, Modal, message, Select, Button } from 'antd'

import api from '@/services/api'
const { Item } = Form
const Option  =  Select.Option
const FormLayout = {
  labelCol: {
    span: 9
  },
  wrapperCol: {
    span: 15
  }
}
class  changeLevel extends Component {
  constructor (props){
    super(props)
    this.state = {
      show: false,
      ids: null
    }
  }
  componentDidMount (){
    this.props.childrens(this)
  }
  render (){
    const { show } = this.state
    const { getFieldDecorator } = this.props.form

    return(
      <div>
        <Modal className='over-scroll-modal' title='告警级别变更' visible={show} width={600} onCancel={this.handleCancel} footer={null}>
          <Form style={{ paddingLeft: 30 }} className="form-single" layout="horizontal" onSubmit={this.Submit} >
            <div className='form-content'>
              <Row>
                <Col span={24}>
                  <Item {...FormLayout} label="告警原级别">
                    {
                      getFieldDecorator('alarmOldLevel')(
                        <Input autoComplete="off" disabled />
                      )
                    }
                  </Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Item {...FormLayout} label="告警新级别">
                    {
                      getFieldDecorator('alarmLevel', {
                        rules: [{ required: true, message: '请选择告警新级别!' }]
                      })(
                        <Select allowClear={true} placeholder="请选择" >
                          {
                            ['紧急', '重要', '次要', '提示'].map((item, index)=>{
                              return(<Option value={index + 1} key={index}>{item}</Option>)
                            })
                          }
                        </Select>
                      )
                    }
                  </Item>
                </Col>
              </Row>
            </div>
            <div className="Button-center">
              <div>
                <Button type="primary" onClick={this.Submit}>确定</Button>
                <Button type="primary" ghost onClick={this.handleCancel}>
                取消
                </Button>
              </div>
            </div>
          </Form>
        </Modal>
      </div>
    )
  }

  //提交
  Submit= (e)=>{
    e.preventDefault()
    let { ids } = this.state
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values = {
          id: ids,
          alarmLevel: values.alarmLevel
        }
        api.postAlarmRuleListChange(values).then(data=>{
          if(data.head && data.head.code === '200'){
            message.success(`${data.head.result}!`)
            this.props.success()
            this.handleCancel()
          }
        })
      }
    })
  }
  //取消
  handleCancel= ()=>{
    this.setState({
      show: false
    })
    this.props.form.resetFields()
  }
  //显示弹窗
  show = (data)=>{
    this.setState({
      show: true,
      ids: data.stringId
    })
    this.props.form.setFieldsValue({
      'alarmOldLevel': ['', '紧急', '重要', '次要', '提示'][data.alarmOldLevel] })
  }
}
const mapStateToProps = ({ Logs }) => {
  return {
  }
}
const changeLevels = Form.create()(changeLevel)
export default connect(mapStateToProps)(changeLevels)