import { Component } from 'react'
import { connect } from 'dva'
import { Form, Input, Button, message, Modal } from 'antd'
import api from '@/services/api'
import './style.less'
import { debounce } from 'lodash'

const { Item } = Form
const { TextArea } = Input

class Reject extends Component {
  constructor (props) {
    super(props)
    this.state = {
      reject: {
        visible: false,
        orderId: ''
      }
    }
    this.rejectHandleSubmit = debounce(this.rejectHandleSubmit, 800)
  }
  componentDidMount () {
    this.props.reject(this)
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
          title="拒绝接单"
          className="over-scroll-modal"
          width="650px"
          visible={this.state.reject.visible}
          onOk={this.rejectHandleOk}
          onCancel={this.handleCancel}
          footer={null}>
          <Form onSubmit={(e) => {e.preventDefault(), this.rejectHandleSubmit()}} className="work-order-form">
            <div className="form-content">
              <Item {...formItemLayout} label="拒绝原因">
                {getFieldDecorator('rejectReason', {
                  rules: [{ required: true, message: '请输入拒绝原因' }, { max: 300, message: '请输入1-300个字符' }]
                })(
                  <TextArea placeholder="请输入拒绝原因" rows={4} type="rejectReason" />
                )}
              </Item>
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
  rejectHandleSubmit = () => {
    this.props.form.validateFields((err, { rejectReason }) => {
      if (!err) {
        let param = {
          receiveStatus: false,
          orderId: this.state.reject.orderId,
          rejectReason
        }
        api.workOrderReceiveStatus(param).then(response => {
          if (response && response.head && response.head.code === '200') {
            message.success('拒绝成功！')
            this.handleCancel()
            this.props.refresh()
          } else {
            message.error('操作失败！' + response.body)
          }
        })
      }
    })
  }
  //弹出
  rejectWorkOrder = (id) => {
    this.setState({
      reject: {
        visible: true,
        orderId: id
      }
    })
  }
  //取消
  handleCancel = (e) => {
    this.setState({
      reject: {
        visible: false
      }
    })
    this.props.form.resetFields()
  }
}

// const mapStateToProps = () => {
// }

const rejectForm = Form.create()(Reject)
export default connect()(rejectForm)
