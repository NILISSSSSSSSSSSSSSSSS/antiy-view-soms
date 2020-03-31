import { Component } from 'react'
// import { connect } from 'dva'
import { Input, Form, Modal, Message, Button } from 'antd'
import { systemPermission, assetsPermission } from '@a/permission'
import hasAuth from '@/utils/auth'
import api from '@/services/api'
const { Item } = Form
// const { TextArea } = Input

class  ModelForm extends Component {
  constructor (props){
    super(props)
    this.state = {
      modelShow: false,
      title: '',
      authList: this.props.authList,
      formData: this.props.formData,
      fun: this.props.handle,
      handle: 0
    }
  }
  componentDidMount (){
    this.props.ShowForm(this)
  }
  UNSAFE_componentWillReceiveProps (nextProps){
    if(JSON.stringify(this.props.formData) !== JSON.stringify(nextProps.formData)){
      this.setState({ formData: nextProps.formData })
    }
  }
  render (){
    const {  modelShow, title, formData, handle, authList } = this.state
    const { getFieldDecorator } = this.props.form
    const formItemLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 18
      }
    }
    let { fullName, parentId, stringId, name } = formData
    if(handle === 2){
      fullName = ''
      parentId = stringId ? stringId : parentId
      // demo = ''
    }else{
      fullName = name ? name : fullName
      // demo = demo ? demo : memo
    }
    const shows =  hasAuth(systemPermission.sysAreaSave) || hasAuth(assetsPermission.ASSET_ZZJG_SAVE)
    return(
      <div>
        <Modal visible={modelShow} title={title} onCancel={this.handleCancel} width={600} footer={null}>
          <Form onSubmit={this.handleSubmit} className="form-single">
            <Item style={{ display: 'none' }}>
              {
                getFieldDecorator('parentId', {
                  initialValue: parentId
                })(
                  <Input autoComplete="off" />
                )
              }
            </Item>
            <Item style={{ display: 'none' }}>
              {
                getFieldDecorator('id', {
                  initialValue: stringId
                })(
                  <Input autoComplete="off" />
                )
              }
            </Item>
            <Item label='名称' {...formItemLayout} >
              {getFieldDecorator('fullName', {
                rules: [{ required: true,  message: '名称不能为空！' }, {
                  message: `输入字符长度，1-${title.includes('基准项类别') ? 300 : 30}个字符！`, max: ( title.includes('基准项类别') ? 300 : 30 ), min: 1
                }, {
                  whitespace: true, message: '不能输入空格！'
                }],
                initialValue: fullName
              })(
                <Input autoComplete="off" placeholder={ `请输入${title.slice( 0, title.length - 2)}名称` }/>
              )}
            </Item>
          </Form>
          <div className="Button-center">
            <div>
              {
                authList.includes('save') && <Button type='primary' onClick={this.handleSubmit}>保存</Button>
              }
              <Button className="back-btn" type='primary' ghost onClick={this.handleCancel}>取消</Button>
            </div>
          </div>
        </Modal>
      </div>
    )
  }

  //提交
  handleSubmit= (e)=>{
    e.preventDefault()
    let { handle, title, fun } = this.state
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if(!title.includes('区域')){
          values.name = values.fullName
          values.memo = values.demo
          if(!title.includes('组织机构')){
            values.stringId = values.id
            delete values.id
          }
          delete values.fullName
          delete values.demo
        }
        api[fun[handle === 1 ? 0 : 1 ]](values).then(response => {
          if(response && response.head && response.head.code === '200' ){
            Message.success(`${title}成功`)
            this.handleCancel()
            if(!(values.stringId ||  values.id)){
              this.props.handles({
                id: values.parentId,
                nowId: response.body
              })
            }else{
              this.props.handles({
                id: title.includes('组织机构') || title.includes('区域') ?   values.id : values.stringId,
                nowId: response.body
              })
            }
          }
        })
      }
    })
  }
  //取消
  handleCancel= ()=>{
    this.setState({ modelShow: false })
    this.props.form.resetFields()
  }
  //显示弹窗
  show = (title, handle)=>{
    this.setState({
      title: title,
      modelShow: true,
      handle
    })
  }
}
export default Form.create()(ModelForm)