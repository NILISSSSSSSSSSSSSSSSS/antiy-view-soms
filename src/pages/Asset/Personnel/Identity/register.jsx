import { PureComponent } from 'react'
import { connect } from 'dva'
import { Button, Input, Row, Col, Form, TreeSelect, message } from 'antd'
import './style.less'
import api from '@/services/api'
import * as regExp from '@/utils/regExp'
import { throttle } from 'lodash'
import PropTypes from 'prop-types'

const FormItem = Form.Item
const TreeNode = TreeSelect.TreeNode

@Form.create()
class AssetPersonnelIdentitysRegister extends PureComponent{
  state = {
    infoFrom: {},
    // tree: this.props.list,
    initStatus: this.props.initStatus ?  this.props.initStatus : {},
    modelState: this.props.model,
    handleState: 1,
    maxLength: 30 //验证最大长度
  }

  static defaultProps ={
    PrefixCls: 'AssetPersonnelIdentity'
  }

  static propTypes={
    PrefixCls: PropTypes.string.isRequired,
    userAreaTree: PropTypes.object,
    tree: PropTypes.object
  }

  //登记表单提交
  infoSubmit = throttle((e)=>{
    e.preventDefault()
    let _t = this
    let { modelState } = this.state
    this.props.form.validateFields((err, values) => {
      let { name, qq, email, departmentId, mobile, weixin, position, address, detailAddress } = values
      if (!err) {
        values = {
          name,
          qq,
          email,
          departmentId,
          mobile,
          weixin,
          //职位
          position,
          //住址
          address,
          //详细地址
          detailAddress
        }
        if(_t.props.initStatus)
          values.id = _t.props.initStatus.stringId
        //this.props.dispatch({ type: 'workOrder/add', payload: values })  无返回值调用方式
        //需要根据返回值进行相应的操作
        api[ modelState === 2 ? 'updateUser' : 'userAdd'](values).then(response => {
          // todo 处理成功 弹窗 处理失败
          if(response && response.head && response.head.code === '200' ){
            this.props.form.resetFields()
            //todo  清除上传组件列表值
            message.success(`${ modelState === 2 ? '变更' : '登记'}成功`)
            this.props.onCancel()
            this.props.refresh()
          }else {
            message.error(`${ modelState === 2 ? '变更' : '登记'}失败` + response && response.body)
          }
        }).catch(err => {
        })
      }
    })
  }, 5000, { trailing: false })

  onCancel = () => {
    this.props.form.resetFields()
    this.props.onCancel()
  }

  initData=()=>{
    const { modelState } = this.state
    const that = this
    switch(modelState){
      case (1):
        that.props.form.resetFields()
        break
      case (modelState > 1 && modelState < 4 ? modelState : null):
        // _t.props.form.setFields({
        //   name: { value: initStatus.name },
        //   email: { value: initStatus.email },
        //   qq: { value: initStatus.qq },
        //   weixin: { value: initStatus.weixin },
        //   mobile: { value: initStatus.mobile },
        //   address: { value: initStatus.address },
        //   detailAddress: { value: initStatus.detailAddress },
        //   position: { value: initStatus.position }
        // })
        break
      default:
        break
    }
  }
  //加载树结构的下拉列表
  getTreeNode = data=>type => {
    let val = ''
    if(type === 'departmentId'){
      val = 'name'
    }else if(type === 'address'){
      val = 'fullName'
    }
    if(data)
      return (
        <TreeNode value={data.stringId} title={data[val]} key= {`${data.stringId}`}>
          {data.childrenNode && data.childrenNode.length ? (
            data.childrenNode.map(item =>
              this.getTreeNode(item)(type)
            )
          ) : null
          }
        </TreeNode>
      )
  }

  //**接口开始 */
  getUserAreaTree=()=>{
    this.props.dispatch({ type: 'asset/getUserAreaTree' }) // 区域树
  }

  render () {
    let { initStatus, modelState } = this.state
    const {
      form: { getFieldDecorator },
      userAreaTree,
      PrefixCls,
      tree
    } = this.props
    const alertLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      }
    }
    const View = (
      <div className="details-alert form-content">
        <Row>
          <Col span={6}><span className='detail-content-label'>姓名:</span></Col>
          <Col span={18}>{initStatus.name}</Col>
        </Row>
        <Row>
          <Col span={6}><span className='detail-content-label'>所属组织:</span></Col>
          <Col span={18}>{initStatus.departmentName}</Col>
        </Row>
        <Row>
          <Col span={6}><span className='detail-content-label'>电子邮箱:</span></Col>
          <Col span={18}>{initStatus.email}</Col>
        </Row>
        <Row>
          <Col span={6}><span className='detail-content-label'>qq号:</span></Col>
          <Col span={18}>{initStatus.qq}</Col>
        </Row>
        <Row>
          <Col span={6}><span className='detail-content-label'>微信号:</span></Col>
          <Col span={18}>{initStatus.weixin}</Col>
        </Row>
        <Row>
          <Col span={6}><span className='detail-content-label'>手机号:</span></Col>
          <Col span={18}>{initStatus.mobile}</Col>
        </Row>
        <Row>
          <Col span={6}><span className='detail-content-label'>住址:</span></Col>
          <Col span={18}>{initStatus.addressName}</Col>
        </Row>
        <Row>
          <Col span={6}><span className='detail-content-label'>详细地址:</span></Col>
          <Col span={18}>{initStatus.detailAddress}</Col>
        </Row>
        <Row>
          <Col span={6}><span className='detail-content-label'>职位:</span></Col>
          <Col span={18}>{initStatus.position}</Col>
        </Row>
      </div>
    )

    const FormView = (
      <Form layout="horizontal" className="form-content">
        <Row gutter={24}>
          <FormItem  {...alertLayout} label="姓名:">
            {getFieldDecorator('name', {
              rules: [
                { required: true, message: '请输入姓名！' },
                { message: '最多30个字符！', max: 30 }
              ],
              initialValue: this.props.initStatus ? initStatus.name : ''
            })(
              <Input autoComplete='off' placeholder="请输入姓名"/>
            )}
          </FormItem>
          <FormItem {...alertLayout} label="所属组织">
            {getFieldDecorator('departmentId', {
              rules: [{ required: true, message: '请选择所属组织！' }],
              initialValue: this.props.initStatus ? initStatus.departmentId : null
            })(<TreeSelect
              showSearch
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              placeholder="请选择对应的组织机构"
              allowClear
              getPopupContainer={triggerNode => triggerNode.parentNode}
              treeDefaultExpandAll
              onChange={this.onChange}
              treeNodeFilterProp='title'
            >
              { this.getTreeNode(tree)('departmentId') }
            </TreeSelect>
            )}
          </FormItem>
          <FormItem  {...alertLayout} label="电子邮箱:">
            {getFieldDecorator('email', {
              rules: [{ type: 'email', message: '无效邮箱格式！' },
                { max: 30, message: '最多30个字符！' }],
              initialValue: this.props.initStatus ? initStatus.email : ''
            })(
              <Input autoComplete='off' placeholder="请输入电子邮箱"/>
            )}
          </FormItem>
          <FormItem {...alertLayout} label="qq号:">
            {getFieldDecorator('qq', { rules: [{ pattern: regExp.QQPattern, message: '无效QQ号！' },
              { max: 30, min: 5, message: 'QQ号长度为5-30位的数字！' }],
            initialValue: this.props.initStatus ? initStatus.qq : '' })(
              <Input autoComplete='off' placeholder="请输入qq号"/>
            )}
          </FormItem>
          <FormItem {...alertLayout} label="微信号:">
            {getFieldDecorator('weixin', { rules: [{ pattern: regExp.WXPattern, message: '无效微信号！' },
              { max: 30, min: 1, message: '微信号长度为1-30位！' }],
            initialValue: this.props.initStatus ? initStatus.weixin : '' })(
              <Input autoComplete='off' placeholder="请输入微信号"/>
            )}
          </FormItem>
          <FormItem {...alertLayout} label="手机号:">
            {getFieldDecorator('mobile', { rules: [{ pattern: regExp.newPhonePattern, message: '无效手机号！' }],
              initialValue: this.props.initStatus ? initStatus.mobile : '' })(
              <Input autoComplete='off' maxLength={11} placeholder="请输入手机号"/>
            )}
          </FormItem>
          <FormItem {...alertLayout} label="住址:">
            {getFieldDecorator('address', { initialValue: this.props.initStatus ? initStatus.address : null })(
              <TreeSelect
                style={{ width: '100%' }}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                getPopupContainer={triggerNode => triggerNode.parentNode}
                placeholder="请选择"
                allowClear
                treeDefaultExpandAll
              >
                { this.getTreeNode(userAreaTree)('address')}
              </TreeSelect>
            )}
          </FormItem>
          <FormItem {...alertLayout} label="详细地址:">
            {getFieldDecorator('detailAddress', {
              rules: [
                { message: '最多100个字符！', max: 100 }
              ],
              initialValue: this.props.initStatus ? initStatus.detailAddress : ''
            })(
              <Input autoComplete='off' placeholder="请输入详细地址"/>
            )}
          </FormItem>
          <FormItem {...alertLayout} label="职位:">
            {getFieldDecorator('position', {
              rules: [
                { message: '最多30个字符！', max: 30 }
              ],
              initialValue: this.props.initStatus ? initStatus.position : ''
            })(
              <Input autoComplete='off'  placeholder="请输入职位"/>
            )}
          </FormItem>
        </Row>
      </Form>
    )

    return(
      <div className={PrefixCls}>
        {modelState === 3 ? View : FormView}
        <Row className='Button-center'>
          <Col span={24} style={{ textAlign: 'center' }}>
            { modelState === 1 ? <Button type="primary" onClick={this.infoSubmit}>提交</Button> : ''}
            { modelState === 2 ? <Button type="primary" onClick={this.infoSubmit}>变更</Button> : ''}
            <Button type="primary" ghost onClick={this.onCancel}>取消</Button>
          </Col>
        </Row>
      </div>
    )
  }

  componentDidMount () {
    this.getUserAreaTree()
    this.initData()
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    // 更新数据
    // if (JSON.stringify(this.props.tree) !== JSON.stringify(nextProps.tree)) {
    //   this.setState({
    //     tree: nextProps.tree
    //   })
    // }
    // if(JSON.stringify(nextProps.initStatus) !== 'null') console.log(nextProps.initStatus)
    //更新数据
    if(JSON.stringify(nextProps.initStatus) !== 'null')
      this.setState({
        initStatus: nextProps.initStatus
      }, ()=>{
        this.initData()
      })
      // }
      //更新数据
    if (JSON.stringify(this.props.model) !== JSON.stringify(nextProps.model)) {
      this.setState({
        modelState: nextProps.model
      })
    }
  }

}

export default connect(({ asset }) => ({
  userAreaTree: asset.userAreaTree,
  tree: asset.departmentNode
}))(AssetPersonnelIdentitysRegister)
