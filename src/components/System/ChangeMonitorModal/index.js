import { Component } from 'react'
import { connect } from 'dva'
import { Form, InputNumber, Button, Message, Modal } from 'antd'
import api from '@/services/api'
const { Item } = Form

class SystemChangeMonitor extends Component {
  constructor (props) {
    super(props)
    this.state = {

    }
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    if (JSON.stringify(this.props.changeModal) !== JSON.stringify(nextProps.changeModal)) {
      this.props.form.setFieldsValue({
        threshold: nextProps.changeModal.value
      })
    }
  }

  render () {
    const { getFieldDecorator } = this.props.form
    const formItemLayout = {
      labelCol: {
        span: 4
      },
      wrapperCol: {
        span: 20
      }
    }
    return (
      <div>
        <Modal
          title="监测规则"
          visible={this.props.changeModal.visible}
          onOk={this.handleOkPwd}
          onCancel={this.handleCancel}
          footer={null}>
          <Form onSubmit={this.handleSubmitPwd}>
            <Item {...formItemLayout} label="临界值">
              {getFieldDecorator('threshold', {
                rules: [{ required: true, message: '请输临界值' }]
              })(
                <InputNumber min={0} max={999} style={{ width: 176 }} />
              )}
            </Item>
            <Item style={{ textAlign: 'right' }}>
              <Button style={{ marginRight: '20px' }} type="primary" htmlType="submit">确定</Button>
              <Button onClick={this.handleCancel}>取消</Button>
            </Item>
          </Form>
        </Modal>
      </div>
    )
  }

  //提交
  handleSubmitPwd = (e) => {
    e.preventDefault()
    const _this = this
    this.props.form.validateFields((err, values) => {
      if (!err) {
        _this.props.form.validateFields((err, { threshold }) => {
          if (!err) {
            api.sysMonitorItemUpdate({
              id: _this.props.changeModal.id,
              threshold
            }).then(response => {
              if(response && response.head && response.head.code === '200' ){
                Message.success('变更成功！')
                _this.refurbish()
              }
            })
          }
        })
      }
    })
  }

  //刷新列表
  refurbish = () => {
    this.handleCancel()
    this.props.refurbish()
  }

  //取消
  handleCancel = () => {
    this.props.handleCancel()
    this.props.form.resetFields()
  }
}

const SystemChangeMonitorForm = Form.create()(SystemChangeMonitor)
export default connect()(SystemChangeMonitorForm)
