import React, { Component } from 'react'
import { Form, message, Modal, Input, Button, DatePicker, Radio } from 'antd'
import moment from 'moment'
import { disabledDateTime } from '@/utils/common'
const { Item } = Form
const { TextArea } = Input
const RadioGroup = Radio.Group
const formItemLayout = {
  labelCol: {
    span: 7
  },
  wrapperCol: {
    span: 12
  }
}

//人工修复
@Form.create()
class ManualRepairModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      vulStatus: '1'
    }
  }
  componentDidMount () {

  }

  render () {
    const { visible } = this.props
    const { vulStatus } = this.state
    const { getFieldDecorator } = this.props.form
    return (
      <Modal
        className="over-scroll-modal"
        title="人工修复"
        width={650}
        footer={null}
        visible={visible}
        maskClosable={false}
        onCancel={this.handleCancel}>
        <Form>
          <div className="form-content">
            <Item {...formItemLayout} label="修复状态">
              {getFieldDecorator('status', {
                rules: [{ required: true, message: '请选择修复状态' }],
                initialValue: vulStatus
              })(
                <RadioGroup onChange={(e) => this.setState({ vulStatus: e.target.value })}>
                  <Radio value='1'>已修复</Radio>
                  <Radio value='2'>修复失败</Radio>
                </RadioGroup>
              )}
            </Item>
            <Item {...formItemLayout} label='修复时间'>
              {getFieldDecorator('time', {
                rules: [{ required: true, message: '请选择修复时间' }],
                initialValue: moment(new Date().getTime())
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  showTime={{ format: 'YYYY-MM-DD HH:mm:ss' }}
                  format="YYYY-MM-DD HH:mm:ss"
                  disabledDate={(current) => current && current > moment().endOf('day')}
                  disabledTime={current => disabledDateTime(current)}
                  placeholder="请选择日期" />
              )}
            </Item>
            {
              vulStatus === '2' &&
              <Item {...formItemLayout} label="备注信息">
                {
                  getFieldDecorator('memo', {
                    rules: [{ required: true, message: '请输入备注信息' }, { message: '最多900个字符！', max: 900 }]
                  })(
                    <TextArea rows={3} placeholder="请输入" />
                  )
                }
              </Item>
            }
          </div>
          <div className="Button-center">
            <div>
              <Button type="primary" onClick={this.handleSubmit}>提交</Button>
              <Button type="primary" ghost onClick={this.handleCancel}>取消
              </Button>
            </div>
          </div>
        </Form>
      </Modal>
    )
  }

  //提交
  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { onsubmit } = this.props
        let { time } = values
        values.time = new Date(time).getTime()
        if (time > (new Date()).getTime()) {
          message.info('修复时间不能大于当前时间！')
          return false
        }
        onsubmit(values)
      }
    })
  }

  //取消
  handleCancel = () => {
    const { form, onCancel } = this.props
    this.setState({
      vulStatus: '1'
    })
    form.resetFields()
    onCancel()
  }
}
export default ManualRepairModal
