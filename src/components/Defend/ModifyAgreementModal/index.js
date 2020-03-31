import React, { Component } from 'react'
import { connect } from 'dva'
import { Form, Button, Col, message, Spin } from 'antd'
import { emptyFilter } from '@/utils/common'
import { PROTOCOL_LIST, PROTOCOL_PORT } from '@a/js/enume'
import { encrypt } from '@/utils/common'
import CommonModal from '@/components/common/Modal'
import CommonForm from '@/components/common/Form'
import * as regExp from '@/utils/regExp'
import './style.less'

const { Item } = Form
const formLayout = {
  labelCol: {
    span: 8
  },
  wrapperCol: {
    span: 12
  }
}
export class ModifyAgreement extends Component {
  state = {
    defaultPort: ''
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    if (nextProps.visible && JSON.stringify(this.props.visible) !== JSON.stringify(nextProps.visible)) {
      this.setState({
        defaultPort: nextProps.record.port
      })
    }
  }
  modalHandleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { passwd, repeatPassword } = values
        const { pwdChanged } = this.props
        if(pwdChanged){
          if(passwd !== repeatPassword) return message.error('新密码与确认密码不一致，请重新输入')
          values.passwd = encrypt(passwd)
          delete values.repeatPassword
        }
        this.props.submit(values)
      }
    })
  }
  // 修改协议，默认端口对应改变
  onProtocolChange = val => {
    this.setState({
      defaultPort: PROTOCOL_PORT[val]
    })
  }
  // 修改失败时关闭弹窗，需提示“修改失败”
  errStatusClose = () => {
    message.info('修改失败！')
    this.props.onClose()
  }
  render () {
    const { visible, form, pwdChanged, tips, onClose, record  = {}, modalLoading = false } = this.props
    const { defaultPort } = this.state
    const formFields = [
      { name: '协议类型', key: 'protocol', type: 'select', defaultValue: record.protocol || 'ssh', multiple: false, placeholder: '请选择', data: PROTOCOL_LIST, onChange: this.onProtocolChange, rules: [{ required: true, message: '请选择协议类型!' }] },
      { name: '端口', key: 'port', type: 'input', defaultValue: defaultPort || PROTOCOL_PORT.ssh, placeholder: '请输入端口', rules: [{ required: true, message: '请输入端口!' }, { pattern: regExp.numberPattern, message: '请输入数字！' }] }
    ]
    const modifyPwdFields = [
      { name: '新密码', maxLength: 30, key: 'passwd', type: 'input', inputType: 'password', placeholder: '输入新密码', rules: [{ required: true, message: '请输入新密码!' }] },
      { name: '确认密码', maxLength: 30, key: 'repeatPassword', type: 'input', inputType: 'password', placeholder: '再次输入新密码', rules: [{ required: true, message: '请再次输入新密码!' }] }
    ]
    // 注：密码修改后，表单内容增加新密码的输入
    const formContent = pwdChanged ? formFields.concat(modifyPwdFields) : formFields
    return (
      <CommonModal
        type="normal"
        className="modify-agreement-modal"
        title="修改协议"
        visible={visible}
        width={650}
        onClose={tips ? this.errStatusClose : onClose}
      >
        <Spin spinning={modalLoading}>
          <div className="info-wrap">
            <Col span={12}>
              <Col className="item-label" span={8}>编号：</Col><Col span={12}>{emptyFilter(record.number)}</Col>
            </Col>
            <Col span={12}>
              <Col className="item-label" span={8}>厂商：</Col><Col span={12}>{emptyFilter(record.manufacturer)}</Col>
            </Col>
            <Col span={12}>
              <Col className="item-label" span={8}>名称：</Col><Col span={12}>{emptyFilter(record.name)}</Col>
            </Col>
            <Col span={12}>
              <Col className="item-label" span={8}>版本：</Col><Col span={12}>{emptyFilter(record.version)}</Col>
            </Col>
            <Col span={12}>
              <Col className="item-label" span={8}>IP：</Col><Col span={12}>{emptyFilter(record.ip)}</Col>
            </Col>
          </div>
          <CommonForm
            column={2}
            fields={formContent}
            form={form}
            FormItem={Item}
            formLayout={formLayout}
          />
          <div className="tips">{tips || ''}</div>
          <div className="Button-center btn-wrap">
            <div>
              <Button type="primary" onClick={this.modalHandleSubmit}>
                确定
              </Button>
              <Button type="primary" ghost onClick={tips ? this.errStatusClose : onClose}>
                取消
              </Button>
            </div>
          </div>
        </Spin>
      </CommonModal>
    )
  }
}
const ModifyAgreementModal = Form.create()(ModifyAgreement)
export default connect()(ModifyAgreementModal)
