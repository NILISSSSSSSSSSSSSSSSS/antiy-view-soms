import { Component } from 'react'
import { connect } from 'dva'
import { Modal, Form, Radio, Select, LocaleProvider, DatePicker, Input } from 'antd'
import zhCN from 'antd/lib/locale-provider/zh_CN'
import './style.less'

const { Item } = Form
const { Group } = Radio
const { Option } = Select
const { TextArea } = Input

class ModalForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
    }
  }
  render () {
    const { type, visible, form } = this.props
    let title, statusLabel, peopleLabel, dateLabel
    switch (type) {
      case 'validate':
        title = '基准验证'
        statusLabel = '验证情况'
        peopleLabel = '验证人员'
        dateLabel = '生效时间'
        break
      case 'enter':
        title = '准入实施'
        statusLabel = '实施情况'
        peopleLabel = '实施人员'
        dateLabel = '实施时间'
        break
      case 'examine':
        title = '准入效果检查'
        statusLabel = '检查情况'
        peopleLabel = '检查人员'
        dateLabel = '检查时间'
        break
      default:
        break
    }

    const { getFieldDecorator } = form
    const formItemLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 16
      }
    }
    return (
      <Modal maskClosable={false} title={title} visible={visible} onOk={this.handleSubmit} onCancel={this.props.close}>
        <Form>
          <Item {...formItemLayout} label={statusLabel}>
            {getFieldDecorator('status')(
              <Group>
                <Radio value="0">验证通过</Radio>
                <Radio value="1">验证未通过</Radio>
              </Group>
            )}
          </Item>
          <Item {...formItemLayout} label={peopleLabel}>
            {getFieldDecorator('people')(
              <Select placeholder={`请选择${peopleLabel}`}>
                <Option key="0">人员1</Option>
                <Option key="1">人员2</Option>
              </Select>
            )}
          </Item>
          <Item {...formItemLayout} label={dateLabel}>
            <LocaleProvider locale={zhCN}>
              {getFieldDecorator('date')(
                <DatePicker className="work-order-list-modal-date" />
              )}
            </LocaleProvider>
          </Item>
          <Item {...formItemLayout} label="备注信息">
            {getFieldDecorator('remark')(
              <TextArea placeholder="请输入内容" rows={4} />
            )}
          </Item>
        </Form>
      </Modal>
    )
  }
}

const ModalFormWrap = Form.create()(ModalForm)
export default connect()(ModalFormWrap)
