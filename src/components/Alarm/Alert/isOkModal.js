import { Component } from 'react'
import { connect } from 'dva'
import { Input, Form, Modal, Button } from 'antd'

const { Item } = Form
const { TextArea } = Input
class  changeInfo extends Component {
  constructor (props){
    super(props)
    this.state = {
    }
  }
  render (){
    const { getFieldDecorator } = this.props.form
    const formItemLayout = {
      labelCol: {
        span: 8
      },
      wrapperCol: {
        span: 12
      }
    }
    return(
      <div>
        <Modal className='over-scroll-modal' visible={this.props.visible}
          title='确认告警'
          width={600}
          onCancel={this.onCancel}
          footer={null}>
          <Form className="form-single" style={{ paddingLeft: 30 }} onSubmit={this.isOkSubmit}>
            <div className='form-content'>
              <Item {...formItemLayout} label="告警处理建议">
                {
                  getFieldDecorator('suggestion', {
                    rules: [{ required: true, message: '请输入处理建议' }, { max: 300,  message: '请输入300个以内字符' }],
                    initialValue: ''
                  })(
                    <TextArea style={{ marginLeft: 10 }} className='ant-form-item-control-wrapper'  placeholder='请输入处理建议'/>
                  )
                }
              </Item>
            </div>
            <div className="Button-center">
              <div>
                <Button type="primary" htmlType='submit'>提交</Button>
                <Button type="primary" ghost onClick={this.onCancel}> 取消 </Button>
              </div>
            </div>
          </Form>
        </Modal>
      </div>
    )
  }

  //取消
  onCancel = () =>{
    this.props.onCancelModal()
    this.props.form.resetFields()
  }
  // 确认
  isOkSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields(['suggestion'], (err, values)=>{
      if (!err) {
        this.props.isOkSubmit(values)
        this.props.form.resetFields()
      }
    })
  }
}
const mapStateToProps = ({ Alarms }) => {
  return {
  }
}
const changeInfos = Form.create()(changeInfo)
export default connect(mapStateToProps)(changeInfos)