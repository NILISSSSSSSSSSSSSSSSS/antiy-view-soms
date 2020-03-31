import { Component } from 'react'
import { connect } from 'dva'
import { Form, Button, Input, Message, Tree, Modal } from 'antd'
import api from '@/services/api'
import './style.less'
import { map, uniqBy } from 'lodash'
import * as regExp from '@/utils/regExp'

const { Item } = Form
const { TreeNode } = Tree
const { TextArea } = Input
let initChecked = []
let keyArray = []
let tagArray = []

class SystemRoleRegister extends Component {
  constructor (props) {
    super(props)
    this.state = {
      treeData: [],
      //默认选中的节点
      menuIds: [],
      initKey: '',
      parents: [],
      init: 1,
      nowNode: [],
      saveParentKey: [],
      allKey: [],
      checked: false,
      show: false,
      Obs: {},
      parentNode: props.parent
    }
  }
  componentDidMount () {
    this.props.children(this)
  }
  componentWillUnmount (){
    this.resetValue()
  }

  render () {
    const { getFieldDecorator } = this.props.form
    const { treeData, nowNode, show, Obs } = this.state
    //详情禁止编辑
    const disabled = Obs.type === 'detail' ? true : false
    return (
      <Modal
        title = {`角色${Obs.text || ''}`}
        className="over-scroll-modal"
        width = {650}
        footer={null}
        visible={show}
        onCancel={this.handleReset}>
        <div className="system-role-register">
          <Form className="detail-content form-single" onSubmit={this.handleSubmit}>
            <div className="form-content">
              <Item label='角色名称'>
                {getFieldDecorator('name', {
                  rules: [
                    { min: 1, max: 30, message: '字符输入长度 1 - 30' },
                    { required: true,  message: '请输入角色名称' },
                    { pattern: regExp.userNamePatterns, message: '不能有特殊符号！' }
                  ]
                })(
                  <Input autoComplete="off" disabled={disabled} placeholder='请输入角色名称' />
                )}
              </Item>
              <Item label='备注'>
                {getFieldDecorator('description', {
                  rules: [{ min: 1, max: 300, message: '字符输入长度 1 - 300 ' }]
                })(
                  <TextArea  disabled={disabled} rows={4} placeholder='请输入备注' />
                )}
              </Item>
              <Item label='权限设置'>
                {getFieldDecorator('menuIds', {
                  rules: [{ required: true,  message: '请选择权限' }]
                })(
                  <Tree
                    showLine={true}
                    disabled={disabled}
                    checkable
                    expandedKeys={nowNode}
                    checkStrictly={false}
                    onCheck={this.onCheck}
                    checkedKeys={this.state.menuIds}
                    onExpand={this.expands}
                  >
                    {this.renderTreeNodes(treeData)}
                  </Tree>
                )}
              </Item>
              <div className="Button-center">
                <div>
                  {
                    disabled ? null : <Button type='primary' htmlType='submit'>提交</Button>
                  }
                  <Button className="back-btn" type='primary' ghost onClick={this.handleReset} >取消</Button>
                </div>
              </div>
            </div>
          </Form>
        </div>
      </Modal>
    )
  }
  //树形菜单展开事件
  expands=(k, opntion)=>{
    let { nowNode } = this.state
    let _nowNode = [ ...nowNode ]
    let v = opntion.node.props.eventKey
    if(!nowNode.includes(v)){
      _nowNode.push(v)
    }else{
      _nowNode = nowNode.filter(now=>now !== v )
    }
    this.setState({ nowNode: _nowNode })
  }
  //还原初始值
  resetValue = ()=>{
    keyArray = []
    tagArray = []
    initChecked = []
  }
  //显示弹窗
  showAlert=(obs)=>{
    this.resetValue()
    this.setState({
      Obs: obs
    }, ()=>{
      if(obs.type !== 'register')
        this.getRoleById()
      else
        this.getMenuTree()
      let _t = this
      setTimeout(()=>{
        _t.setState({ show: true })
      }, 200)
    })
  }
  //取消弹窗
  handleReset = ()=>{
    this.props.form.resetFields()
    this.setState({
      show: false,
      menuIds: []
    }, ()=> {
      this.resetValue()
      this.setState({  Obs: {} })
    })
  }

  //提交表单
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, valuess) => {
      if (!err) {
        let { parents, menuIds, saveParentKey, Obs } = this.state
        let text, url
        const { type, id } = Obs
        let values = valuess
        console.log('开始', values.menuIds, menuIds)
        if(parents.length)
          values.menuIds = values.menuIds.concat(parents)
        // console.log('顶部', parents.length, JSON.stringify(menuIds) === JSON.stringify(values.menuIds))
        console.log(JSON.stringify(menuIds) === JSON.stringify(values.menuIds))
        if(JSON.stringify(menuIds) === JSON.stringify(values.menuIds))
          values.menuIds = saveParentKey.concat(initChecked.map(item=>String(item.id)))
        values.menuIds = Array.from(new Set(values.menuIds))
        if (type === 'register') {
          text = '登记'
          url = 'saveRole'
        } else if (type === 'change') {
          text = '变更'
          url = 'updateRole'
          values.id = id
        }
        if (!this.state.checked && this.props.form.getFieldValue('name') === '超级管理员') {
          let arr = uniqBy(this.state.allKey, 'stringId')
          let list = map(arr, 'stringId')
          values.menuIds = list
        }
        // if(values.menuIds.size <= 3){
        let initArr = []
        let inits = ['shouye', 'routine', 'sys']
        let is = ['routine:workorder', 'sys:msg' ]
        for(let n = 0; n < tagArray.length; n++ ){
          if(inits.includes(tagArray[n].tag )){
            initArr.push(String(tagArray[n].id))
          }else if(is.includes(tagArray[n].tag )){
            initArr = initArr.concat(this.eachData(tagArray[n]))
          }
        }
        values.menuIds = Array.from(new Set(values.menuIds.concat(initArr)))
        console.log('结尾', values.menuIds)
        // }
        api[url](JSON.parse(JSON.stringify(values))).then(response => {
          if (response && response.head && response.head.code === '200') {
            Message.success(`${text}成功`)
            this.state.parentNode.updatedIdata()
            this.handleReset()
          }
        })
      }
    })
  }

  //递归获取数据
  eachData=(iData)=>{
    let init = []
    let each = (item)=>{
      item.forEach(n=>{
        if(n.childrenNode && n.childrenNode.length){
          init.push(n.id || n.stringId)
          each(n.childrenNode)
        }else{
          init.push(n.id || n.stringId)
        }
      })
    }
    each([iData])
    return init
  }

  //获取角色详情
  getRoleById = () => {
    let { Obs } = this.state
    api.getRoleById({
      id: Obs.id
    }).then(response => {
      if(response && response.head && response.head.code === '200' ){
        const { name, description, menuIds } = response.body
        this.props.form.setFieldsValue({
          description,
          name,
          menuIds
        })
        console.log('初始得到', menuIds)
        this.getMenuTree(menuIds)
      }
    })
  }
  //遍历KEY
  getIdsMap=(item)=>{
    item.forEach(el => {
      if(el.childrenNode && el.childrenNode.length){
        keyArray.push(el.stringId)
        tagArray.push({ tag: el.tag, id: el.stringId, childrenNode: el.childrenNode })
        this.getIdsMap(el.childrenNode)
      }else{
        tagArray.push({ tag: el.tag, id: el.stringId, childrenNode: el.childrenNode })
      }
    })
  }

  //查询菜单权限树
  getMenuTree = (menuIds = []) => {
    api.getMenuTree({}).then(response => {
      if(response && response.head && response.head.code === '200' ){
        this.getIdsMap(response.body.childrenNode)
        tagArray.forEach(el=>{
          if(['shouye', 'routine:workorder', 'sys:msg'].includes(el.tag)){
            initChecked.push({ id: el.id, tag: el.tag })
          }
        })
        let { saveParentKey } = this.state

        this.setState({
          treeData: [response.body],
          menuIds: menuIds.concat(initChecked.map(item=>String(item.id))),
          initKey: String(response.body.stringId),
          init: 0,
          nowNode: response.body ? [`${response.body.stringId}`] : []
        }, ()=>{
          let init = []
          let { type } = this.state.Obs
          if(type !== 'register') {
            let { menuIds } = this.state
            menuIds.forEach(item=>{
              saveParentKey.push(item) 
              if(!keyArray.includes(item)){
                init.push(item)
              }
            })
          }
          this.setState({ menuIds: Array.from(new Set(init.concat(initChecked.map(item=>String(item.id))))), saveParentKey }, ()=>{
            this.props.form.setFieldsValue({ menuIds: this.state.menuIds })
          })
        })
      }
    })
  }

  onCheck = (menuIds, obs) => {
    let { initKey } = this.state
    this.setState({ checked: true, menuIds: menuIds.concat(initChecked.map((item)=>String(item.id))),
      parents: obs.halfCheckedKeys.filter((item)=>item !== initKey) })
    if(!menuIds.length){
      for(let n = 0; n < tagArray.length; n++ ){
        if(['shouye'].includes(tagArray[n].tag )){
          menuIds.push(String(tagArray[n].id))
        }
      }
    }
    this.props.form.setFieldsValue({
      menuIds: menuIds
    })
  }

  //渲染树
  renderTreeNodes = data => data.map(item => {
    this.state.allKey.push(item)
    if (!item) {
      return []
    }
    if (item.childrenNode) {
      return (
        <TreeNode title={item.name}
          key={item.stringId}
          dataRef={item}
          data-cls = {item.tag}
        >
          {this.renderTreeNodes(item.childrenNode)}
        </TreeNode>
      )
    }
    return <TreeNode title={item.name} key={item.stringId} data-cls = {item.tag}/>
  })
}

const SystemRoleRegisterForm = Form.create()(SystemRoleRegister)

export default connect()(SystemRoleRegisterForm)
