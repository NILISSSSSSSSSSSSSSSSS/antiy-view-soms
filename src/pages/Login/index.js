import React, { Component } from 'react'
import { connect } from 'dva'
import { Form, Input, Button, Layout, Carousel } from 'antd'
import api from '@/services/api'
import { encrypt } from '@/utils/common'
import './style.less'

const { Item } = Form
const { Content } = Layout

const warnInfo = {
  noName: '请输入账号',
  noPassword: '请输入密码',
  noImageCode: '请输入验证码'
}
@Form.create()
@connect(({ system }) => {
  return {
    id: system.id,
    menus: system.system
  }
})
class Login extends Component {
  constructor (props) {
    super(props)
    this.state = {
      msg: '',
      imageCodeUrl: `api/v1/oauth/sys/code?time=${ Date.parse(new Date())}`
    }
  }
  getImageCodeUrl = () => {
    this.setState({
      imageCodeUrl: `api/v1/oauth/sys/code?time=${ Date.parse(new Date())}`
    })
  }
  render () {
    const { getFieldDecorator } = this.props.form
    const { msg, imageCodeUrl } = this.state
    const formItemLayout = {
      labelCol: {
        span: 0
      },
      wrapperCol: {
        span: 24
      },
      colon: false
    }
    const codeFormItemLayout = {
      wrapperCol: {
        span: 24,
        offset: 0
      }
    }
    return (
      <div className="login-content">
        {/* <Header className="header">
          <span className="header-icon">
            <img src={require('@/assets/header-logo.png')} alt="安天" />
          </span>
        </Header> */}
        <Content className="loginCss">
          {/* 轮播 */}
          <div className="content-swipper">
            <Carousel autoplay dots={true} effect='fade'>
              <div>
                <img src={require('@/assets/images/swipper1.png')} alt="轮播1" />
              </div>
              <div>
                <img src={require('@/assets/images/swipper2.png')} alt="轮播2" />
              </div>
              <div>
                <img src={require('@/assets/images/swipper3.png')} alt="轮播3" />
              </div>
              <div>
                <img src={require('@/assets/images/swipper4.png')} alt="轮播3" />
              </div>
            </Carousel>
          </div>
          {/* 登录框 */}
          <div className="content-login">
            <div className="form-wrap password-res-shows">
              <div className="login-icon">
                <img src={require('@/assets/images/login_logo.png')} alt="安天" />
              </div>
              <h1>安天资产安全运维平台</h1>
              {msg &&
                <div className="tips">
                  <img src={require('@/assets/login-warn.svg')} alt="warn" />
                  <span>{msg}</span>
                </div>
              }
              <Form onSubmit={this.handleSubmit} className="login-form">
                <Input   name="hideText" style={{ display: 'none' }}></Input>
                <Item {...formItemLayout} label='' className="input-item">
                  {getFieldDecorator('username')(
                    <Input type='text' autoComplete="off" id="name" placeholder='账号' />
                  )}
                </Item>
                <Item {...formItemLayout} label='' className="input-item">
                  {getFieldDecorator('password')(
                    <div>
                      {/* <Input type='password' className='input-password' style={{ display: 'none' }}/> */}
                      <Input type="password" placeholder='密码' autoComplete="new-password" />
                    </div>
                  )}
                </Item>
                <Item {...codeFormItemLayout} label='' className="input-code-item">
                  {getFieldDecorator('imageCode')(
                    <Input placeholder='验证码' maxLength={6}/>
                  )}
                  <span className="code-img">
                    <img src={imageCodeUrl} alt="图形验证码" onClick={this.getImageCodeUrl}/>
                  </span>
                </Item>
                <Button type='primary' htmlType='submit' id="login-btn">登录</Button>
              </Form>
            </div>
          </div>
        </Content>
        {/* <Footer className="footer">
          <p>{`© ${new Date().getFullYear()} 版权所有 Antiy | 哈尔滨安天科技集团股份有限公司`}</p>
        </Footer> */}
      </div>
    )
  }

  // 执行登录
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { username, password, imageCode  } = values
        if(!username) {
          this.setState({
            msg: warnInfo.noName
          })
          return false
        }
        if(!password) {
          this.setState({
            msg: warnInfo.noPassword
          })
          return false
        }
        if(!imageCode) {
          this.setState({
            msg: warnInfo.noImageCode
          })
          return false
        }
        values.password = encrypt(values.password)
        this.setState({
          msg: ''
        }, () => {
          api.login(values).then(res => {
            if (res) {
              let data = res.body
              if (res.head.code === '200') {
                sessionStorage.setItem('token', data.access_token)
                // 记录当前用户数据，个人中心使用
                this.props.dispatch({ type: 'personalCenter/save', payload: { currentUserInfo: data.user_info } })
                sessionStorage.setItem('currentUser', JSON.stringify(data.user_info))
                const menus = data.user_info.menus.map(item => item.tag)
                this.props.dispatch({ type: 'system/save', payload: { id: data.user_info.stringId } })
                this.props.dispatch({ type: 'system/save', payload: { menus } })
                sessionStorage.setItem('menus', JSON.stringify(menus))
                sessionStorage.setItem('id', data.user_info.stringId)
                sessionStorage.setItem('name', data.user_info.name)
                sessionStorage.setItem('licenseVersion', data.user_info.licenseVersion)
                sessionStorage.setItem('resetPwd', data.user_info.mustModifyPassword)
                this.props.history.push('/indexPage')
              } else {
                this.getImageCodeUrl()
              }
            } else {
              this.getImageCodeUrl()
            }
          }).catch(err => {
            this.getImageCodeUrl()
          })
        })
      }
    })
  }
}
export default Login
