import { Component } from 'react'
import {  Form, message, Button, Row, Col, Input, Modal, Tooltip, Icon } from 'antd'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import api from '@/services/api'
import PwdInput from '@/components/common/PwdInput'
import * as regExp from '@/utils/regExp'
import './style.less'
const FormItem = Form.Item
class PersonalPwdChange extends Component {
  constructor (props) {
    super(props)
    const _this = this
    this.state = {
      modalVisible: false,
      msg: '',
      showPwdsIndex: []
    }
    this.columns = [
      { label: '原密码', name: 'oldPwd', type: 'password', style: { width: 400 }, rules: [{ required: true, message: '请输入' }] },
      { label: '新密码', name: 'newPwd', type: 'password', style: { width: 400 },
        placeholder: '密码长度8-16位，必须包含大小写字母、特殊字符、数字',
        rules: [
          { validator: _this.validatorNewPwd.bind(_this) },
          { required: true, message: '请输入' },
          { pattern: regExp.pwdPattern, message: '长度8-16位，必须包含大小写字母、特殊字符、数字' }
        ]
      },
      { label: '再次输入新密码',
        style: { width: 400 },
        name: 'repeatNewPwd',
        type: 'password',
        placeholder: '密码长度8-16位，必须包含大小写字母、特殊字符、数字',
        rules: [
          { required: true, message: '请输入' },
          { validator: _this.validatorRepatePwd.bind(_this) }
        ] },
      { label: '', name: 'btn', type: 'btn' }
    ]
  }

  /**
   * 验证新密码是否一致
   * @param rules
   * @param value
   * @param callback
   */
  validatorRepatePwd = (rules, value, callback) => {
    const newPwd = this.props.form.getFieldValue('newPwd')
    if(newPwd !== value){
      callback('两次新密码输入的不一致')
    }else {
      callback()
    }
  }
  /**
   * 密码的验证
   * 数字、大写字母、小写字母、特殊字符
   */
  regexPwd = (str = '')=>{
    // 密码小于8位或者大于16位时，验证不通过
    if (str.length < 8 || str.length > 16){
      return false
    }
    const reg = ['[0-9]', '[A-Z]', '[a-z]', '[~!#$%@^&*()*/|:;"]']
    let count = 0
    for (let i = 0, len = reg.length; i < len; i++){
      const regex = new RegExp(reg[i])
      if(regex.test(str)){
        count ++
      }else {
        break
      }
    }
    // 符合 含有数字、大写字母、小写字母、特殊字符时，验证通过，否则验证不通过
    return count === reg.length
  }
  /**
   * 验证新密码是否与旧密码一样
   * @param rules
   * @param value
   * @param callback
   */
  validatorNewPwd = (rules, value, callback) => {
    const newPwd = this.props.form.getFieldValue('oldPwd') || ''
    if(newPwd !== value){
      callback()
    }else {
      if(newPwd.trim() === ''){
        callback()
      }else {
        callback('新密码不能是旧密码')
      }

    }
  }
  formItemLayout = {
    labelCol: {
      span: 4
    },
    wrapperCol: {
      span: 20
    }
  }
  //退出登录
  logout = () => {
    Modal.destroyAll()
    api.logout({ access_token: sessionStorage.getItem('token') }).then(res => {
      sessionStorage.clear()
      this.props.history.push('/login')
    }).catch(err => {})
  }

  /**
   * 提交修改密码
   * @param e
   */
  onSubmit = (e) => {
    e.preventDefault()
    const { form, currentUserInfo = {} } = this.props
    form.validateFields((err, values) => {
      if (!err) {
        if(values.oldPwd === values.newPwd){
          message.error('新密码与原密码不能一致')
          return
        }else if(values.repeatNewPwd !== values.newPwd){
          message.error('确认新密码不正确，请检查确认密码')
          return
        }
        // 提交修改密码请求
        api.updatePwdServer({ id: currentUserInfo.stringId, newPassword: values.newPwd, oldPassword: values.oldPwd })
          .then((data)=> {
            // 修改成功后3秒后退出登录
            if(data.head && data.head.code === '200'){
              const timer = setTimeout(()=>{
                this.logout()
              }, 3000)
              // 手动退出登录
              Modal.warning({
                title: '更新密码成功,将在3秒后退出登录！',
                content: '',
                cancelText: '取消',
                okText: '退出',
                onOk: ()=>{
                  clearTimeout(timer)
                  this.logout()
                },
                onCancel: ()=>{}
              })
            }
          })
      }
    })
  }

  /**
   * 显示、隐藏密码
   * @param i{Number} 密码框所在的位置
   */
  showPwd (i){
    const showPwdsIndex = this.state.showPwdsIndex
    // 如果已经显示密码，就隐藏密码
    let newShowPwdsIndex = showPwdsIndex.filter((e)=>e !== i)
    // 如果之前是隐藏密码，就显示密码
    if(!showPwdsIndex.includes(i)) {
      newShowPwdsIndex.push(i)
    }
    this.setState({ showPwdsIndex: newShowPwdsIndex })
  }

  // 清空所有输入框的值
  clearInput = () => {
    this.props.form.resetFields()
  }
  render (){
    const { getFieldDecorator } = this.props.form
    const { showPwdsIndex } = this.state
    return(
      <div className="personalCenter">
        <Form layout="horizontal" onSubmit={this.onSubmit} autoComplete="off">
          <Input autoComplete="off" type='text' name="hideText" style={{ display: 'none' }}></Input>
          {this.columns.map((el, i)=>{
            if(el.type === 'passwords'){
              return <FormItem { ...this.formItemLayout} label={el.label} key={ el.name }>
                {
                  getFieldDecorator(el.name, {
                    initialValue: el.value,
                    rules: el.rules || []
                  })(
                    <PwdInput
                      type={showPwdsIndex.includes(i) ? 'text' : 'password'}
                      style={ el.style }
                      placeholder={ el.placeholder }
                      suffix={
                        <Tooltip title={ showPwdsIndex.includes(i) ? '显示密码' : '隐藏密码' }>
                          <Icon className="ico-style" type={ showPwdsIndex.includes(i) ? 'eye' : 'eye-invisible'} onClick={()=>{ this.showPwd(i) }} />
                        </Tooltip>
                      }
                    />
                  )
                }
              </FormItem>
            }else if(el.type === 'password'){
              return <FormItem { ...this.formItemLayout} label={el.label} key={ el.name }>
                {
                  getFieldDecorator(el.name, {
                    initialValue: el.value,
                    rules: el.rules || []
                  })(
                    <div className="pwd-input-box">
                      <Input type='password' className='input-password'/>
                      <Input
                        type={showPwdsIndex.includes(i) ? 'text' : 'password'}
                        style={ el.style }
                        autoComplete='new-password'
                        placeholder={ el.placeholder }
                        suffix={
                          <Tooltip title={ showPwdsIndex.includes(i) ? '显示密码' : '隐藏密码' }>
                            <Icon className="ico-style"  type={ showPwdsIndex.includes(i) ? 'eye' : 'eye-invisible'} onClick={()=>{ this.showPwd(i) }} />
                          </Tooltip>
                        }
                      />
                    </div>
                  )
                }
              </FormItem>
            }if(el.type === 'btn'){
              return(
                <Row key={el.name}>
                  <Col {...this.formItemLayout.labelCol}></Col>
                  <Col {...this.formItemLayout.wrapperCol}>
                    <div className="personalPwdChange-btns Button-center">
                      <Button type="primary" htmlType="submit" className="submit">保存</Button>
                    </div>
                  </Col>
                </Row>
              )
            }else {
              return  null
            }
          })}
        </Form>
      </div>
    )
  }
}
const mapStateToProps = ({ personalCenter, system }) => {
  return {
    currentUserInfo: personalCenter.currentUserInfo
  }
}
const PersonalPwdChangeForm = Form.create()(PersonalPwdChange)
export default withRouter(connect(mapStateToProps)(PersonalPwdChangeForm))
