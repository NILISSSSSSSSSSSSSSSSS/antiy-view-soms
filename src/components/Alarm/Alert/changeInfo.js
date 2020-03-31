import { Component } from 'react'
import { connect } from 'dva'
import { Row, Col, Input, Form, Modal, message, Select, Button } from 'antd'

import api from '@/services/api'
const { Item } = Form
const Option  =  Select.Option
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 22 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 1 }
  }
}
class  changeInfo extends Component {
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
        <Modal title='告警信息变更' className='over-scroll-modal' visible={show} onCancel={this.handleCancel} width={600} footer={null}>
          <Form style={{ paddingLeft: 30 }} {...formItemLayout} className="form-single" layout="horizontal" onSubmit={this.Submit} >
            <div className='form-content'>
              <Row>
                <Col span={24}>
                  <Item label="告警名称">
                    {
                      getFieldDecorator('alarmName', {
                        rules: [{ required: true, message: '请输入告警名称!' }, { min: 1, max: 40, message: '请输入40个以内字符' }, { whitespace: true, message: '不能为空字符！' } ]
                      })(
                        <Input autoComplete="off" />
                      )
                    }
                  </Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Item label="告警级别">
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
        values.stringId = ids
        api.postNowAlarmChangeLevel(values).then(data=>{
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
      'alarmName': data.alarmName,
      'alarmLevel': data.alarmLevel })
  }
}
const mapStateToProps = ({ Alarms }) => {
  return {
  }
}
const changeInfos = Form.create()(changeInfo)
export default connect(mapStateToProps)(changeInfos)