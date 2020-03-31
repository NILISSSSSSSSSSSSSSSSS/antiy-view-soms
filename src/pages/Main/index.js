import { Component } from 'react'
import { connect } from 'dva'
import { withRouter, NavLink, Link } from 'dva/router'
import { Layout, Button, Menu, LocaleProvider, Modal, Form, Input, message, Badge, Popover } from 'antd'
import api from '@/services/api'
import hasAuth from '@/utils/auth'
import * as regExp from '@/utils/regExp'
import { encrypt } from '@/utils/common'
import 'moment/locale/zh-cn'
import './style.less'
import menuTree from '@/menuTree'
import Breadcrumbs from '@/components/Breadcrumbs'
import zhCN from 'antd/lib/locale-provider/zh_CN'
// import LoginUser from '@/components/LoginUser'
import WorkOrderAdd from '@/pages/WorkOrder/Add'
import { removeCriteria } from '@/utils/common'

const { Header, Sider, Content } = Layout
const { SubMenu, Item } = Menu

const formItemLayout = {
  labelCol: {
    span: 0
  },
  wrapperCol: {
    span: 24
  }
}

class Main extends Component {
  constructor (props) {
    super(props)
    this.state = {
      collapsed: false,
      resetModal: false,
      WorkOrder: false,
      changeSrc: false,
      changeSrc1: false,
      collapsed2: false,
      isNewMsg: this.props.getMsgcount
      // pathOpen: '' //展开的页面
    }

  }
  componentDidMount () {
    if (sessionStorage.resetPwd === 'true') {
      this.setState({
        resetModal: true
      })
    }

    const id = sessionStorage.getItem('id')
    const menus = JSON.parse(sessionStorage.getItem('menus') || '[]')
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'))

    if (id) {
      // this.menuDefaultOpenKeys = this.generateMenuDefaultOpenKeys()
      this.props.dispatch({ type: 'system/save', payload: { id: id } })
      this.props.dispatch({ type: 'system/save', payload: { menus } })
      this.props.dispatch({ type: 'personalCenter/save', payload: { currentUserInfo: currentUser } })
      // 获取未读消息接口
      this.props.dispatch({ type: 'system/getMsgcount',  payload: { id: sessionStorage.id  } })
    } else {
      this.props.history.push('/login')
    }
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    // 更新列表数据
    if (JSON.stringify(this.props.getMsgcount) !== JSON.stringify(nextProps.getMsgcount)) {
      this.setState({
        isNewMsg: nextProps.getMsgcount
      })
    }
  }

  /**
   * 菜单点击事件
   * 把打开的折叠菜单记录下来，以便刷新界面时，快速展开之前的菜单
   * */
  onOpenChange = (keyPath) => {
    const { dispatch } = this.props
    const newKeyPath = keyPath
    sessionStorage.setItem('openKeys', newKeyPath.join(','))
    dispatch({ type: 'system/setMenuOpenKeys', payload: keyPath })
  }
  /**
   * 生成菜单的选中项，在刷新页面时，提供刷新之前选中的菜单项
   **/
  generateMenuSelectKeys () {
    const { urlArr = [] } = this.props
    return [urlArr.map((path) => `/${path}`).join('')]
  }
  render () {
    const { currentUserInfo, openKeys } = this.props
    const { resetModal, WorkOrder, collapsed2, isNewMsg } = this.state
    const { getFieldDecorator } = this.props.form
    const content = (
      <div className="menu-dropDown">
        <p
          onMouseMove={() => { this.setState({ changeSrc1: true }) }}
          onMouseLeave={() => { this.setState({ changeSrc1: false }) }}>
          <Link to='/personalcenter' onClick={() => removeCriteria()}>
            <img
              className="drop-icon"
              src={!this.state.changeSrc1 ? require('@/assets/user.svg') : require('@/assets/user_s.svg')}
              alt="" />
            个人中心
          </Link>
        </p>
        <p className="divider"></p>
        <p
          onMouseMove={() => { this.setState({ changeSrc: true }) }}
          onMouseLeave={() => { this.setState({ changeSrc: false }) }}>
          <a onClick={this.logout}>
            <img
              className="drop-icon"
              src={!this.state.changeSrc ? require('@/assets/logout.svg') : require('@/assets/logout_s.svg')}
              alt="" />
            退出
          </a>
        </p>
      </div>
    )
    // const { pathOpen } = this.state
    // const { history } = this.props
    // const pathname = history.location.pathname
    // 禁止出现面包屑的路径地址
    const disabledBreadcrumbs = ['/personalcenter', '/indexPage', '/']
    return (
      <LocaleProvider locale={zhCN}>
        <Layout className="wrap">
          <Layout className="main">
            <Header className="header">
              <div className="logo"><img src={require('@/assets/logo.svg')} alt="安天资产安全运维管理系统" />
                {/* <span className="logoText">安天资产安全运维管理系统</span> */}
              </div>
              <div className='handle-icon'>
                { /** 工作台*/}
                <NavLink to='/workbench' id="work-bench-ico" style={{ paddingRight: '24px' }} onClick={() => removeCriteria()}>
                  <img className="loginUser-icon" src={require('@/assets/workbance.svg')} alt="" />
                  <span className="orderText">工作台</span>
                </NavLink>
                <a onClick={() => this.setState({ WorkOrder: true })} style={{ paddingRight: '24px' }}>
                  {/* <Icon type="file-add" style={{ fontSize: '20px', verticalAlign: 'middle', marginRight: '20px' }}/> */}
                  <img src={require('@/assets/addOrder.svg')} className="loginUser-icon" alt="" /><span className="orderText">创建工单</span>
                </a>
                <NavLink to='/system/messagemanage' style={{ paddingRight: '45px' }} onClick={() => removeCriteria()}>
                  <Badge dot= {isNewMsg > 0 ? true : false}><img src={require('@/assets/bell_normal.svg')} className="loginUser-icon" alt="" /></Badge><span className="orderText">消息提示</span>
                </NavLink>
                {/* <LoginUser user={currentUserInfo}/>
                <a onClick={this.logout}><Tooltip title={'退出'} overlayClassName="menuTooltip"><img src={!this.state.changeSrc ? require('@/assets/logout_normal.svg') : require('@/assets/logout_hover.svg')} className="loginUser-icon" alt="" onMouseMove={()=>{this.setState({ changeSrc: true })}} onMouseLeave={()=>{this.setState({ changeSrc: false })}}/></Tooltip><span className="orderText"></span></a> */}
                <span className="loginUser"><Popover placement="bottom" content={content} trigger="hover"><img src={require('@/assets/头像2.png')} className="loginUser-icon" alt="" /></Popover>{currentUserInfo.name}</span>
              </div>
            </Header>
            <Layout>
              <Sider className={collapsed2 ? 'least' : 'sider'} theme="light" collapsible trigger={null} collapsed={this.state.collapsed}>
                <Menu mode="inline" inlineCollapsed={collapsed2} className='menu' onClick={() => {
                  ['searchParameter', 'nowRouter', 'works', 'columnsList'].forEach((i) => sessionStorage.removeItem(i))
                  sessionStorage.works = 1
                }}
                selectedKeys={this.generateMenuSelectKeys()} openKeys={openKeys} onOpenChange={this.onOpenChange}>
                  {
                    this.getMenu(menuTree)
                  }
                </Menu>
                {/* <div className='unfold-icon'>
                  <Icon type={collapsed2 ? 'menu-unfold' : 'menu-fold'} onClick={ ()=>{
                    this.setState({ collapsed2: !collapsed2 })
                  }}/>
                </div> */}
              </Sider>
              <Content className="content">
                <div className="content-breadcrumbs">
                  {!disabledBreadcrumbs.includes(this.props.location.pathname) ? <Breadcrumbs /> : null}
                </div>
                {this.props.children}
              </Content>
            </Layout>
          </Layout>
          <Modal
            title={null}
            footer={null}
            visible={resetModal}
            closable={false}
            className="reset-modal"
            width="400px"
          >
            <div className="title">修改密码<span className="tips">（为确保账号安全首次登录需要修改密码）</span></div>
            <div className="form-wrap password-res-shows">
              <Form onSubmit={this.handleSubmit}>
                <Input type='text' name="hideText" style={{ display: 'none' }}></Input>
                <Form.Item {...formItemLayout} label='' className="input-item input-passwords" autoComplete="off">
                  {getFieldDecorator('oldPassword', {
                    rules: [{ required: true, message: '请输入原密码' }]
                  })(
                    <div>
                      <Input type='password' className='input-password' />
                      <Input placeholder='请输入原密码' type='password' autoComplete='new-password' />
                    </div>
                  )}
                </Form.Item>
                <Form.Item {...formItemLayout} label='' className="input-item input-passwords">
                  {getFieldDecorator('newPassword', {
                    rules: [{ required: true, message: '请输入新密码' }, { pattern: regExp.pwdPattern, message: '长度8-16位，必须包含大小写字母、特殊字符、数字' }]
                  })(
                    // <Input autoComplete="off" type="password" placeholder='请输入新密码' />
                    <div>
                      <Input type='password' className='input-password' />
                      <Input placeholder='请输入新密码' type='password' autoComplete='new-password' />
                    </div>
                  )}
                </Form.Item>
                <Form.Item {...formItemLayout} label='' className="input-item input-passwords">
                  {getFieldDecorator('repeatPassword', {
                    rules: [{ required: true, message: '请再次输入新密码' }]
                  })(
                    // <Input autoComplete="off" type="password" placeholder='再次输入新密码' />
                    <div>
                      <Input type='password' className='input-password' />
                      <Input placeholder='再次输入新密码' type='password' autoComplete='new-password' />
                    </div>
                  )}
                </Form.Item>
                <Button type='primary' htmlType='submit' className="reset-btn">保存新密码</Button>
              </Form>
            </div>
          </Modal>
          <Modal
            className="over-scroll-modal"
            visible={WorkOrder}
            onCancel={this.workOrderCancel}
            title='创建工单' footer={null} width='650px'>
            <WorkOrderAdd children={(now) => this.WorkOrder = now} cancel={this.cancelWorkOrder}></WorkOrderAdd>
          </Modal>
        </Layout>
      </LocaleProvider>
    )
  }

  //获取菜单权限
  getMenu = menuTree => menuTree.map(item => {
    // console.log(item)
    // 判断是否显示改菜单项
    const isDetail = typeof item.show === 'boolean' ? !item.show : false
    if (!hasAuth(item.tag) || isDetail) {
      return null
    }
    // <img src={item.icon} className="menu-icon" alt=""/>
    // console.log(item)
    // 显示的子菜单的数量
    const showMenuItemLength = (item.children || []).filter((e) => typeof e.show === 'undefined' ? true : e.show).length
    // 有子菜单项，并且子菜单必须有一个时显示
    if (item.children && showMenuItemLength) {
      return (
        <SubMenu key={item.path} title={
          <span>
            {item.icon ? (<svg xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 1070 1024" version="1.1" p-id="3883" width="22" height="22"><defs><style type="text/css" /></defs>
              <path d={item.icon} p-id="3884"></path>
            </svg>) : null}
            <span>{item.name}</span>
          </span>
        }>
          {this.getMenu(item.children)}
        </SubMenu>
      )
    }
    return <Item key={item.path}><NavLink to={item.path}>{item.icon ? (<svg xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 1070 1024" version="1.1" p-id="3883" width="22" height="22"><defs><style type="text/css" /></defs>
      <path d={item.icon} p-id="3884"></path>
    </svg>) : null}{item.name}</NavLink></Item>
  })

  logout = () => {
    api.logout({ access_token: sessionStorage.getItem('token') }).then(res => {
      sessionStorage.clear()
      this.props.history.push('/login')
    }).catch(err => { })
  }
  workOrderCancel = () => {
    this.WorkOrder.handleCancel()
  }
  //快速创建工单
  cancelWorkOrder = () => {
    this.setState({ WorkOrder: false })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (values.oldPassword === values.newPassword) {
          message.error('新密码与原密码不能一致')
          return
        } else if (values.repeatPassword !== values.newPassword) {
          message.error('确认新密码不正确，请检查确认密码')
          return
        }
        values.id = sessionStorage.id
        values.oldPassword = encrypt(values.oldPassword)
        values.newPassword = encrypt(values.newPassword)
        delete values.repeatPassword
        api.resetPwd(values).then(res => {
          if (res) {
            if (res.head.code === '200') {
              sessionStorage.setItem('resetPwd', false)
              message.success('重置密码成功！')
              this.setState({
                resetModal: false
              })
            }
          }
        })
      }
    })
  }
}

const mapStateToProps = ({ system, personalCenter }) => {
  return {
    id: system.id,
    menus: system.menus,
    urlArr: system.urlArr,
    openKeys: system.openKeys,
    getMsgcount: system.getMsgcount,
    currentUserInfo: personalCenter.currentUserInfo
  }
}
const resetForm = Form.create()(Main)
export default withRouter(connect(mapStateToProps)(resetForm))
