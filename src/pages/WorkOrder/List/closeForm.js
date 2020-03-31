import { Component } from 'react'
import { connect } from 'dva'
import { Form, Input, Button, message, Modal, Select } from 'antd'
import api from '@/services/api'
import './style.less'
import { debounce } from 'lodash'

const { Option } = Select
const { Item } = Form
const { TextArea } = Input

class Close extends Component {
  constructor (props) {
    super(props)
    this.state = {
      close: {
        visible: false,
        orderId: '',
        closedStatus: 'true'
      }
    }
    this.handleSubmit = debounce(this.handleSubmit, 800)
  }
  componentDidMount () {
    this.props.close(this)
  }
  render () {
    const { getFieldDecorator } = this.props.form
    const formItemLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 12
      }
    }
    return (
      <div>
        <Modal
          title="关闭工单"
          width="650px"
          className="over-scroll-modal"
          visible={this.state.close.visible}
          onOk={this.closeHandleOk}
          onCancel={this.handleCancel}
          footer={null}>
          <Form onSubmit={(e) => {e.preventDefault(), this.handleSubmit()}} className="work-order-form">
            <div className="form-content">
              <Item {...formItemLayout} label="是否关闭">
                {getFieldDecorator('closedStatus', { rules: [{ required: true, message: '请选择是否同意关闭' }]
                })(
                  <Select onChange={this.onChange} placeholder="请选择是否同意关闭">
                    <Option key={true}>同意</Option>
                    <Option key={false}>不同意</Option>
                  </Select>
                )}
              </Item>
              {
                <Item {...formItemLayout} label="原因">
                  {getFieldDecorator('closedReason', {
                    rules: [{ required: true, message: '请输入原因' }, { max: 300, message: '请输入1-300个字符' }]
                  })(
                    <TextArea placeholder="请输入" rows={4} type="closedReason" />
                  )}
                </Item>
              }
            </div>
            <div className="Button-center">
              <div>
                <Button type="primary" htmlType="submit">确定</Button>
                <Button type="primary" ghost onClick={this.handleCancel}>取消</Button>
              </div>
            </div>
          </Form>
        </Modal>
      </div>
    )
  }

  //提交
  handleSubmit = () => {
    this.props.form.validateFields((err, { closedReason, closedStatus }) => {
      if (!err) {
        let param = {
          closedStatus,
          orderId: this.state.close.orderId
        }
        param.closedReason = closedReason
        // api.inspectPlanCloseById(param).then(response =>{
        //   if(response && response.head && response.head.code === '200' ){
        //     let text = closedStatus === 'true' ? '关闭' : '操作'
        //     message.success(text + '成功！')
        //     this.handleCancel()
        //     this.props.refresh()
        //   }else {
        //     message.error('操作失败！' + response && response.body)
        //   }
        // }).catch(err=>{})
        api.workOrderClosedStatus(param).then(response => {
          if(response && response.head && response.head.code === '200' ){
            let text = closedStatus === 'true' ? '关闭' : '操作'
            message.success(text + '成功！')
            this.handleCancel()
            this.props.refresh()
          }else {
            message.error('操作失败！' + response && response.body)
          }
        }).catch(err=>{})
      }
    })
  }
  //选择是否关闭
  onChange = (value) => {
    let close = Object.assign({}, this.state.close, { closedStatus: value })
    this.setState({ close })
  }
  //弹出
  closeWorkOrder = (id) => {
    console.log(id)
    let close = Object.assign({}, this.state.close, { orderId: id, visible: true })
    this.setState({ close })
  }
  //取消
  handleCancel = (e) => {
    let close = Object.assign({}, this.state.close, { visible: false })
    this.setState({ close })
    this.props.form.resetFields()
  }
}

// const mapStateToProps = () => {
// }

const CloseForm = Form.create()(Close)
export default connect()(CloseForm)
