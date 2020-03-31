import React, { Component } from 'react'
import { connect } from 'dva'
import { Form, message, Button, Spin } from 'antd'
import { encrypt } from '@/utils/common'
import CommonModal from '@/components/common/Modal'
import CommonForm from '@/components/common/Form'
import './style.less'

const { Item } = Form
const formLayout = {
  labelCol: {
    span: 6
  },
  wrapperCol: {
    span: 14
  }
}
export class ModifyPwd extends Component {
  modalHandleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { passwd, repeatPassword } = values
        if(passwd !== repeatPassword) return message.error('新密码与确认密码不一致，请重新输入')
        values.passwd = encrypt(passwd)
        delete values.repeatPassword
        this.props.submit(values)
      }
    })
  }
  resetForm = () => {
    this.props.resetForm()
    this.props.form.resetFields()
  }
  // 修改密码失败时关闭弹窗，需提示“修改失败”
  errStatusClose = () => {
    message.info('修改失败！')
    this.props.onClose()
  }
  render () {
    const { visible, onClose, tips, form, modalLoading } = this.props
    const manageFormFields = [
      { name: '新密码', maxLength: 30, key: 'passwd', type: 'input', inputType: 'password', placeholder: '输入新密码', rules: [{ required: true, message: '请输入新密码!' }] },
      { name: '确认密码', maxLength: 30, key: 'repeatPassword', type: 'input', inputType: 'password', placeholder: '再次输入新密码', rules: [{ required: true, message: '请再次输入新密码!' }] }
    ]
    return (
      <CommonModal
        type="normal"
        className="modify-pwd-modal"
        title="修改密码"
        visible={visible}
        width={650}
        onClose={tips ? this.errStatusClose : onClose}
      >
        <Spin spinning={modalLoading}>
          <CommonForm
            column={1}
            fields={manageFormFields}
            form={form}
            FormItem={Item}
            formLayout={formLayout}
          />
          <div className="tips">{tips || ''}</div>
          <div className="Button-center btn-wrap">
            <div>
              {tips ?
                <Button type="primary" onClick={this.resetForm}>重新输入</Button>
                : <Button type="primary" onClick={this.modalHandleSubmit}>确定</Button>
              }
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
const ModifyPwdModal = Form.create()(ModifyPwd)
export default connect()(ModifyPwdModal)
