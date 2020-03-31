import { Component } from 'react'
import { connect } from 'dva'
import { Form, Button, Message, Modal, Input } from 'antd'
// import PwdInput from '@/components/common/PwdInput'
import api from '@/services/api'
import { encrypt } from '@/utils/common'
import * as regExp from '@/utils/regExp'
const { Item } = Form

class SystemResetPwd extends Component {
  constructor (props) {
    super(props)
    this.state = {

    }
  }
  componentDidMount () {

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
          title="重置密码"
          visible={this.props.resetPwdModal.visible}
          onOk={this.handleOkPwd}
          onCancel={this.handleCancelPwd}
          footer={null}>
          <Form onSubmit={this.handleSubmitPwd}>
            <input  type='text' name="hideText" style={{ display: 'none' }}/>
            <Item {...formItemLayout} label="新密码">
              {getFieldDecorator('newPassword', {
                rules: [{ required: true, message: '请输入新密码' }, { pattern: regExp.pwdPattern, message: '长度8-16位，必须包含大小写字母、特殊字符、数字' }]
              })(
                <div>
                  <input type='password' className='input-password' style={{ display: 'none' }}/>
                  <Input autoComplete="new-password" maxLength={16} type="password" placeholder="请输入新密码" />
                </div>
              )}
            </Item>
            <Item style={{ textAlign: 'center' }}>
              <Button style={{ marginRight: '20px' }} type="primary" htmlType="submit">确定</Button>
              <Button onClick={this.handleCancelPwd}>取消</Button>
            </Item>
          </Form>
        </Modal>
      </div>
    )
  }

  //提交
  handleSubmitPwd = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        api.adminResetUserPassword({
          id: this.props.resetPwdModal.id,
          newPassword: encrypt(values.newPassword)
        }).then(response => {
          if(response && response.head && response.head.code === '200' ){
            Message.success('重置密码成功！')
            this.handleCancelPwd()
          }
        }).catch(err => {})
      }
    })
  }

  //取消
  handleCancelPwd = () => {
    this.props.handleCancelPwd()
    this.props.form.resetFields()
  }
}

const SystemResetPwdForm = Form.create()(SystemResetPwd)
export default connect()(SystemResetPwdForm)
