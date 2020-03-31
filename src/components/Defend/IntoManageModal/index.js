import React, { Component } from 'react'
import { connect } from 'dva'
import { Form, Button, Spin, message } from 'antd'
import { encrypt } from '@/utils/common'
import { PROTOCOL_LIST, PROTOCOL_PORT } from '@a/js/enume'
import CommonModal from '@/components/common/Modal'
import CommonForm from '@/components/common/Form'
import * as regExp from '@/utils/regExp'
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
export class IntoManage extends Component {
  state = {
    defaultPort: PROTOCOL_PORT.ssh
  }
  modalHandleSubmit = () => {
    // getWsSocket().then(sock => {
    //   console.log(sock)
    //   this.ws = sock
    // })
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { passwd } = values
        values.passwd = encrypt(passwd)
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
  resetForm = () => {
    this.props.resetForm()
    this.props.form.resetFields()
  }
  // 纳入失败时关闭弹窗，需提示“纳入失败”
  errStatusClose = () => {
    message.info('纳入失败！')
    this.props.onClose()
  }
  render () {
    const { visible, onClose, form, tips, modalLoading } = this.props
    const { defaultPort } = this.state
    const manageFormFields = [
      { name: '账号', unAutoComplete: true, key: 'userName', type: 'input', placeholder: '请输入账号名称', rules: [{ required: true, message: '请输入账号名称！' }] },
      { name: '密码', unAutoComplete: true, key: 'passwd', type: 'input', inputType: 'password', placeholder: '请输入密码', rules: [{ required: true, message: '请输入密码！' }] },
      { name: '协议', key: 'protocol', type: 'select', defaultValue: 'ssh', multiple: false, placeholder: '请选择', data: PROTOCOL_LIST, onChange: this.onProtocolChange, rules: [{ required: true, message: '请选择协议！' }] },
      { name: '端口', key: 'port', type: 'input', defaultValue: defaultPort, placeholder: '请输入端口', rules: [{ required: true, message: '请输入端口!' }, { pattern: regExp.numberPattern, message: '请输入数字！' }] }
    ]
    return (
      <CommonModal
        type="normal"
        className="into-manage-modal"
        title="纳入管理"
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
const IntoManageModal = Form.create()(IntoManage)
export default connect()(IntoManageModal)
