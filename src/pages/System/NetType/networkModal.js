import React, { Component } from 'react'
import { connect } from 'dva'
import { Modal, Form, Input, Button, Row } from 'antd'
import api from '@/services/api'
import { debounce } from 'lodash'
import './style.less'

const { Item } = Form
const { TextArea } = Input

const formItemLayout = {
  labelCol: {
    span: 8
  },
  wrapperCol: {
    span: 12
  }
}
export class ModalForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      nowId: ''
    }
    this.handleSubmit = debounce(this.handleSubmit, 800)
  }

  render () {
    const { props, form } = this.props
    const { getFieldDecorator } = form

    return (
      <Modal
        className="over-scroll-modal"
        title={props.title}
        width='650px'
        footer={null}
        maskClosable={false} visible={props.visible} onOk={this.handleSubmit} onCancel={() => {
          props.onCancel()
          this.resetForm()
        }}>
        <Form>
          <div className="form-content">
            <Row>
              <Item label="网络类型名称：" {...formItemLayout}>
                {getFieldDecorator('name', {
                  rules: [{ required: true, message: '请输入网络类型名称' },
                    { whitespace: true, message: '输入字符中不能有空格！' },
                    { message: '最多80个字符！', max: 80 }],
                  initialValue: props.modalData && props.modalData.name
                })(
                  <Input autoComplete="off" placeholder="请输入" />
                )}
              </Item>
            </Row>
            <Row>
              <Item label="描述" {...formItemLayout}>
                {getFieldDecorator('describe', {
                  rules: [{ max: 300, min: 1, message: '最多输入 1~300个字符！' }, {
                  }],
                  initialValue: props.modalData && props.modalData.describe
                })(
                  <TextArea rows={5} placeholder='请输入'/>
                )}
              </Item>
            </Row>
          </div>
        </Form>
        <div className="Button-center">
          <div>
            <Button type="primary" onClick={this.handleSubmit} disabled={this.state.result}>确定</Button>
            <Button style={{ marginLeft: '8px' }} type='primary' ghost onClick={() => {
              props.onCancel()
              this.resetForm()
            }}>取消</Button>
          </div>
        </div>
      </Modal>)
  }
  //提交表单
  handleSubmit = () => {
    const { props } = this.props
    this.props.form.validateFields((err, values) => {
      if (!err) {
        
      }
    })
  }
  resetForm = () => {
    this.props.form.resetFields()
  }
}
const ModalFormWrap = Form.create()(ModalForm)
export default connect()(ModalFormWrap)