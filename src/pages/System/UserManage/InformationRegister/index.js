import { Component } from 'react'
import { Form, Input, Radio, Button, Message, Transfer, TreeSelect } from 'antd'
import api from '@/services/api'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import { encrypt, analysisUrl } from '@/utils/common'
import './style.less'
import * as regExp from '@/utils/regExp'

const { Item } = Form
const { Group } = Radio
const TreeNode = TreeSelect.TreeNode

class systemUserRegister extends Component {
  constructor (props) {
    super(props)
    this.state = {
      //管理区域树
      treeData: [],
      //角色穿梭列表
      transferData: [],
      //右侧穿梭框数据
      targetKeys: [],
      //右侧穿梭框选中的数据
      selectedKeys: [],
      disableds: false
    }
  }

  async componentDidMount () {
    //获取管理区域树数据
    await api.getLoginUserTree().then(iData=>{
      if(iData && iData.head && iData.head.code === '200'){
        this.setState({
          treeData: iData.body ? [iData.body] : []
        })
      }
    })
    //用户变更(需注意接口调用的先后顺序，否则穿梭框会出现延迟显示)
    if (analysisUrl(window.location.href).from === 'regsiter') {
      this.getAllRoles()
    } else {
      this.setState({ disabled: true })
      this.getUserInfo()
    }
  }
  render () {
    const { getFieldDecorator } = this.props.form
    const { transferData, targetKeys, selectedKeys, treeData, disabled } = this.state
    return (
      <div className="system-user-register">
        {/* <h2 className="page-title">用户详情信息</h2> */}
        <Form className="detail-content form-multi" onSubmit={this.handleSubmit}  autoComplete="off">
          <div className='form-layout'>
            <Item label='用户名'>
              {getFieldDecorator('username', {
                rules: [
                  { required: true,  message: '请输入用户名' },
                  { min: 1, max: 30, message: '字符输入长度为 1-30' },
                  { pattern: regExp.userNamePatterns, message: '不能有特殊符号！' }
                ]
              })(
                <Input autoComplete="off" disabled={disabled} placeholder='请输入用户名' type='text' />
              )}
            </Item>
            <Item label='姓名'>
              {getFieldDecorator('name', {
                rules: [{ required: true,  message: '请输入姓名' },
                  { min: 1, max: 30, message: '字符输入长度为 1-30' }]
              })(
                <Input autoComplete="off"  placeholder='请输入姓名'/>
              )}
            </Item>
          </div>
          <div className='form-layout'>
            <Item label='部门'>
              {getFieldDecorator('department', {
                rules: [
                  { min: 1, max: 30, message: '字符输入长度为 1-30' }
                ]
              })(
                <Input autoComplete="off"  placeholder='请输入部门' />
              )}
            </Item>
            <Item label='电子邮箱'>
              {getFieldDecorator('email', {
                rules: [
                  { min: 1, max: 30, message: '字符输入长度为 1-30' },
                  { pattern: regExp.emailPattern, message: '请输入正确的电子邮箱' }
                ]
              })(
                <Input autoComplete="off"  placeholder='请输入电子邮箱' />
              )}
            </Item>
          </div>
          <div className='form-layout'>
            <Item label='职能'>
              {getFieldDecorator('duty', {
                rules: [{ min: 1, max: 30, message: '字符输入长度为 1-30' }]
              })(
                <Input autoComplete="off"  placeholder='请输入职能' />
              )}
            </Item>
            <Item label='管理区域'>
              {getFieldDecorator('areaIds', {
                rules: [{ required: true,  message: '请输入管理区域' }]
              })(
                <TreeSelect
                  style={{ width: 174 }}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  placeholder="请选择管理区域"
                  allowClear
                  treeCheckStrictly={true}
                  treeDefaultExpandAll
                  onChange={this.onChange}
                >
                  {
                    this.renderTreeNodes(treeData)
                  }
                </TreeSelect>
              )}
            </Item>
          </div>
          <div className='form-layout'>
            <Item label='手机号'>
              {getFieldDecorator('phone', {
                rules: [
                  { pattern: regExp.newPhonePattern, message: '请输入11位手机号！' }
                ]
              })(
                <Input autoComplete="off"  placeholder='请输入手机号' />
              )}
            </Item>
            {
              !analysisUrl(window.location.href).id ?
                <Item label='状态'>
                  {getFieldDecorator('status', {
                    rules: [{ required: true, message: '请选择状态' }],
                    initialValue: 1
                  })(
                    <Group>
                      <Radio value={0} key={0}>禁用</Radio>
                      <Radio value={1} key={1}>启用</Radio>
                      <Radio value={2} key={2}>锁定</Radio>
                    </Group>
                  )}
                </Item> : <Item label=' ' style={{ opacity: '0' }}></Item>}
          </div>
          <div className='form-layout'>
            {
              analysisUrl(window.location.href).from === 'regsiter' ? (
                <Item label='用户密码' className='input-passwords' style={{ marginLeft: '-30px' }}>
                  {getFieldDecorator('password', {
                    rules: [
                      { required: true,  message: '请输入用户密码' },
                      { pattern: regExp.pwdPattern, message: '长度8-16位，必须大小写、特殊字符、数字结合' }
                    ]
                  })(
                    <div>
                      <Input type='password' className='input-password' />
                      <Input placeholder='请输入用户密码'  type='password' autoComplete='new-password'/>
                    </div>
                  )}
                </Item>
              ) : null
            }
            <Item></Item>
          </div>
          <div className='form-layout'>
            <Item label='设置角色' className="transfer" style={{  marginLeft: '-10px' }}>
              {getFieldDecorator('roleIds', {
                rules: [{ required: true, message: '请设置角色' }]
              })(
                <Transfer
                  locale={{ itemUnit: '项', itemsUnit: '项', notFoundContent: '列表为空' }}
                  dataSource={transferData}
                  titles={['未选', '已选']}
                  targetKeys={targetKeys}
                  selectedKeys={selectedKeys}
                  onChange={this.handleChange}
                  onSelectChange={this.handleSelectChange}
                  render={item => item.name}
                  listStyle={{
                    width: 300,
                    height: 300
                  }}
                />
              )}
            </Item>
            <div style={{ width: '10px' }}></div>
          </div>
          <div className="Button-center">
            <div>
              <Button type='primary' htmlType='submit'>提交</Button>
              {/* <Button className="back-btn" type='primary' ghost onClick={this.props.history.goBack}>返回</Button> */}
            </div>
          </div>
        </Form>
      </div>
    )
  }
  //角色改变
  handleChange = (nextTargetKeys, direction, moveKeys) => {
    this.setState({
      targetKeys: nextTargetKeys
    })
    this.props.form.setFieldsValue({
      roleIds: nextTargetKeys
    })
  }
  //选中角色
  handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    this.setState({ selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys] })
  }

  //提交表单
  handleSubmit = (e) => {
    e.preventDefault()
    let _t = this
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.areaIds = Array.isArray(values.areaIds) ? values.areaIds : [values.areaIds]
        values.roleIds = [...values.roleIds]
        values.password = encrypt(values.password)
        let text, url
        let { id, from } = analysisUrl(window.location.href)
        if (from === 'regsiter') {
          text = '登记'
          url = 'userRegister'
        } else {
          text = '变更'
          url = 'updateUsers'
          values.id = id
        }
        api[url](values).then(response => {
          if(response && response.head && response.head.code === '200' ){
            this.props.form.resetFields()
            Message.success(`${text}成功`)
            _t.props.history.goBack()
          }
        }).catch(err => {})
      }
    })
  }

  //生成管理区域树
  renderTreeNodes = data => data.map(item => {
    if (!item) {
      return []
    }
    if (item.childrenNode) {
      return (
        <TreeNode value={item.stringId} title={item.fullName} key={item.stringId} dataRef={item}>
          {this.renderTreeNodes(item.childrenNode)}
        </TreeNode>
      )
    }
    return <TreeNode value={item.stringId} title={item.fullName} key={item.stringId} dataRef={item} />
  })

  //查询所有角色信息
  getAllRoles = (arr) => {
    api.getAllRoles().then(response => {
      if(response && response.head && response.head.code === '200' ){
        response.body.map(item => {
          item.key = item.stringId
          return item
        })
        this.setState({
          transferData: response.body,
          targetKeys: arr || []
        })
      }
    }).catch(err => {})
  }

  //获取用户信息
  getUserInfo = () => {
    api.getUserInfo({
      id: analysisUrl(window.location.href).id
    }).then(response => {
      if(response && response.head && response.head.code === '200' ){
        const { name, username, department, duty, email, password, status, phone, roleIds, manageAreaIds } = response.body
        this.props.form.setFieldsValue({
          name,
          username,
          department,
          duty,
          email,
          password,
          status,
          phone,
          areaIds: manageAreaIds,
          roleIds
        })
        this.getAllRoles(roleIds)
      }
    }).catch(err => {})
  }

}
const systemUserRegisterForm = Form.create()(systemUserRegister)
export default withRouter(connect()(systemUserRegisterForm))
