import { Component } from 'react'
import { connect } from 'dva'
import { Form, Input, Button, message, Modal } from 'antd'
import api from '@/services/api'
import './style.less'
const { Item } = Form
const { TextArea } = Input

class Close extends Component {
  constructor (props) {
    super(props)
    this.state = {
      close: {
        visible: false
      },
      ids: []
    }
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
          title="终止计划"
          width="650px"
          className="over-scroll-modal"
          visible={this.state.close.visible}
          onOk={this.closeHandleOk}
          onCancel={this.handleCancel}
          footer={null}>
          <Form onSubmit={this.handleSubmit}>
            <div className="form-content">
              {
                <Item {...formItemLayout} label="终止原因">
                  {getFieldDecorator('closedReason', {
                    rules: [{ required: true, message: '请输入终止原因' }, { max: 300, message: '请输入1-300个字符' }]
                  })(
                    <TextArea placeholder="请输入..." rows={4} />
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
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, { closedReason }) => {
      if (!err) {
        let param = {
          ids: this.state.ids.split(','),
          closedReason
        }
        api.inspectPlanCloseById(param).then(response =>{
          if(response && response.head && response.head.code === '200' ){
            message.success( '操作成功！')
            this.handleCancel()
            this.props.getList()
          }else {
            message.error('操作失败！' + response && response.body)
          }
        })
      }
    })
  }
  //弹出
  closeBox = (ids) => {
    let close = Object.assign({}, this.state.close, { visible: true })
    this.setState({
      close,
      ids
    })
  }
  //取消
  handleCancel = (e) => {
    let close = Object.assign({}, this.state.close, { visible: false })
    this.setState({ close })
    this.props.form.resetFields()
  }
}

const CloseForm = Form.create()(Close)
export default connect()(CloseForm)
