import { Component } from 'react'
import { Form, Input, Button, Modal, DatePicker, Radio, message } from 'antd'
import momnet from 'moment'
import { disabledDateTime } from '@/utils/common'
const { Item } = Form
const { TextArea } = Input
const RadioGroup = Radio.Group
/**
 * props initvalue { status： 'SUCCESS' | 'FAIL', memo: '', installTime: moment }  默认参数，可以不传
 * prros visible 是否可见
 * props onSubmit 确认提交函数
 * props handleCancel 取消函数
 * */
// 人工安装界面弹窗
@Form.create()
export default class ManualInstallModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      installType: ''
    }
    this.installTime = momnet()
  }
  componentDidMount () {
  }

  /**
   * 生成验证规则
   * @param max 最多字符数
   * @param rules {Array} 验证规则
   * @returns {*[]}
   */
  generateRules = (max = 30, rules = []) => {
    return [
      { max, message: `最多输入${max}字符！` },
      { whitespace: true, message: '不能为空字符！' },
      ...rules
    ]
  }
  // 禁止选择当天以后的日期
  disabledDate = (current) => {
    return current.isAfter(momnet())
  }
  //提交
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { status, installTime, memo } = values
        const { onSubmit } = this.props
        if(installTime.valueOf() > momnet().valueOf()){
          message.info('安装时间不能大于当前时间!')
          return
        }
        onSubmit && onSubmit({ status, installTime, memo })
      }
    })
  }

  //改变安装状态
  onChange = (e) => {
    const installType = e.target.value
    console.log(installType)
    this.setState({
      installType
    })
  }
  //取消
  handleCancel = () => {
    this.setState({
      installType: ''
    })
    this.props.form.resetFields()
    this.props.handleCancel()
  }
  render () {
    const { getFieldDecorator } = this.props.form
    const { installType } = this.state
    const formItemLayout = {
      labelCol: {
        span: 4
      },
      wrapperCol: {
        span: 20
      }
    }
    const { visible, initValue, width = '530px', title = '人工安装' } = this.props
    const { status = 'SUCCESS', installTime = this.installTime, memo = '' } = initValue || {}
    return (
      <div>
        {
          visible ?
            <Modal
              title={title}
              width={width}
              visible={visible}
              maskClosable={false}
              onCancel={this.handleCancel}
              footer={null}>
              <Form onSubmit={this.handleSubmit}>
                <Item {...formItemLayout} label="安装状态">
                  {getFieldDecorator('status', {
                    initialValue: status
                    // rules: [{ required: true, message: '请选择安装状态' }]
                  })(
                    <RadioGroup placeholder="请选择安装状态" onChange={this.onChange}>
                      <Radio value="SUCCESS">成功</Radio>
                      <Radio value="FAIL">失败</Radio>
                    </RadioGroup>
                  )}
                </Item>
                <Item label='安装时间' {...formItemLayout}>
                  {getFieldDecorator('installTime', {
                    initialValue: installTime,
                    rules: [{ required: true, message: '请选择安装时间' }]
                  })(
                    <DatePicker
                      showTime={{ format: 'HH:mm:ss' }}
                      format="YYYY-MM-DD HH:mm:ss"
                      style={{ width: 300 }}
                      disabledDate={this.disabledDate}
                      disabledTime={current => disabledDateTime(current)} />
                  )}
                </Item>
                {
                  installType === 'FAIL' ?
                    <Item {...formItemLayout} label="备注">
                      {getFieldDecorator('memo', {
                        initialValue: memo,
                        rules: [{ required: true, message: '请输入备注' }, ...this.generateRules(300)]
                      })(
                        <TextArea placeholder='请输入备注' rows={4} />
                      )}
                    </Item>
                    : null
                }
                <div className="Button-center">
                  <div>
                    <Button type="primary" htmlType="submit">确定</Button>
                    <Button type="primary" ghost onClick={this.handleCancel}>取消</Button>
                  </div>
                </div>
              </Form>
            </Modal>
            : null
        }
      </div>
    )
  }
}
