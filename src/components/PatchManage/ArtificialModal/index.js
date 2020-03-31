import { Component } from 'react'
import { Form, Message, Modal, Input, Button, DatePicker, Select } from 'antd'
import moment from 'moment'
import { disabledDateTime } from '@/utils/common'
const { Item } = Form
const { TextArea } = Input
const Option = Select.Option
const formItemLayout = {
  labelCol: {
    span: 7
  },
  wrapperCol: {
    span: 12
  }
}

@Form.create()
//人工修复
class ManualRepairModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      vulStatus: 1
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
        title="人工安装"
        width={650}
        footer={null}
        visible={visible}
        maskClosable={false}
        onCancel={this.handleCancel}>
        <Form>
          <div className="form-content">
            <Item {...formItemLayout} label="补丁安装状态">
              {getFieldDecorator('status', {
                rules: [{ required: true, message: '请选择安装状态' }]
              })(
                <Select onChange={(v) => this.setState({ vulStatus: v })}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  style={{ width: '100%' }}
                  placeholder="请选择">
                  <Option value={1}>安装成功</Option>
                  <Option value={2}>安装失败</Option>
                </Select>
              )}
            </Item>
            <Item {...formItemLayout} label='安装时间'>
              {getFieldDecorator('time', {
                rules: [{ required: true, message: '请选择安装时间' }],
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
              vulStatus === 1 &&
              <Item {...formItemLayout} label="备注信息">
                {
                  getFieldDecorator('repairSuggestions', {
                    rules: [{ required: true, message: '请输入备注信息' }, { message: '最多500个字符！', max: 900 }]
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
          Message.info('修复时间不能大于当前时间！')
          return false
        }
        onsubmit(values,  this.props.form)
      }
    })
  }

  //取消
  handleCancel = () => {
    const { form, onCancel } = this.props
    form.resetFields()
    onCancel()
  }
}
export default ManualRepairModal
