import  React, { Component } from 'react'
import { connect } from 'dva'
import { Form, message } from 'antd'
import SoftTable from '@/components/Asset/InstallTemplate/SoftTable'
import PatchTable from '@/components/Asset/InstallTemplate/PatchTable'
import { generateRules, analysisUrl } from '@/utils/common'
import Operation from '@c/common/Operation'
import { CommonForm } from '@c/index'
import api from '@/services/api'
import * as regExp from '@/utils/regExp'
import './style.less'
// import hasAuth from '@/utils/auth'
const { Item } = Form

export class Create extends Component {
  constructor (props) {
    super(props)
    this.state = {
      OperatingSystemArr: [],
      basicsData: {},
      isEdit: this.props.location.pathname && this.props.location.pathname.split('/')[(this.props.location.pathname.split('/')).length - 1 ] === 'edit', //判断是编辑还是创建
      init: analysisUrl(this.props.location.search),
      isSysem: ''//判断选择适用系统
    }
  }
  componentDidMount () {
    let { isEdit, init } =  this.state
    if(isEdit){
      api.installTemplateById({ primaryKey: init.stringId }).then( res => {
        this.setState({
          basicsData: res.body,
          data: { nextExecutor: res.body.executor.length > 0 ?  res.body.executor[0].stringId  : 'all' },
          isSysem: String(res.body.operationSystem),
          initSysem: String(res.body.operationSystem)
        })
      })
    }
    this.getInstallTemplateOs()
  }
  UNSAFE_componentWillReceiveProps (nextProps) {

  }
  render () {
    let { isEdit, init, isSysem, OperatingSystemArr, basicsData } = this.state
    const formLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 }
    }
    const describFormLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 22 }
    }
    let formFields = [
      { name: '模板编号', key: 'numberCode', placeholder: '请输入', type: 'input', rules: [{ required: true,  message: '请输入模板编号' },  ...generateRules(30)], onBlur: this.repetitionNumberCode, defaultValue: basicsData.numberCode, disabled: isEdit && true },
      { name: '模板名称', key: 'name', placeholder: '请输入', type: 'input', rules: [{ required: true,  message: '请输入模板名称' }, ...generateRules(80), { pattern: regExp.errString, message: '模板名称不能包含特殊字符:\/:*?<>|"' }], defaultValue: basicsData.name },
      { name: '适用操作系统', key: 'operationSystem', placeholder: '请选择', type: 'select', data: OperatingSystemArr, rules: [{ required: true,  message: '请选择适用操作系统' }], onChange: this.onIsSysem, defaultValue: basicsData.operationSystem }
    ]
    let describformFields = [
      { name: '描述', placeholder: '请输入描述', rows: 3, key: 'description', type: 'textArea', rules: [ ...generateRules(500)], defaultValue: basicsData.description }
    ]
    return (
      <div>
        <div className="search-bar main-detail-content">
          <div className='form-box'>
            <CommonForm fields={ formFields } column={ 3 } form={ this.props.form } FormItem={ Item } formLayout={ formLayout } />
            <CommonForm fields={ describformFields } column={ 1 } form={ this.props.form } FormItem={ Item } formLayout={ describFormLayout }/>
          </div>
          <p className="detail-title" id="PatchInformation-patch-info">模板包含软件列表</p>
          <SoftTable children={(now) => this.SoftTable = now} isEdit={isEdit} init={init} isSysem={isSysem}/>
          <p className="detail-title" id="PatchInformation-patch-info">模板包含补丁列表</p>
          <PatchTable children={(now) => this.PatchTable = now} isEdit={isEdit} init={init} isSysem={isSysem}/>
          <Operation
            nextStep={[ { name: '配置装机模板审核', value: 'InstallTemplateCheck' } ]}
            defaultValue={ 'InstallTemplateCheck' }
            source={ 'appear' }
            type='installTemplate'
            onSubmit={ this.onSubmit }
            // data={data}
            form={ this.props.form }
            Item={ Item }
          />
        </div>
      </div>
    )
  }
  // 提交整个页面内容
  onSubmit = (value) => {
    const { noRepetitionNumberCode, isEdit, init } = this.state
    // 登记时软件和补丁列表提交给后端
    value && delete value.nextStep
    this.props.form.validateFields((err, values) => {
      if (!err && noRepetitionNumberCode !== 1) {
        let softBussinessIds = this.SoftTable.state.softList.map( item => { return item.businessId })
        let patchIds = this.PatchTable.state.patchList.map( item => { return item.stringId })
        values && delete values.nextStep
        // 判断是编辑还是创建
        let port = isEdit ? 'installTemplateUpDate' : 'installTemplateSubmit'
        let param = isEdit ? { ...values, ...value, softBussinessIds, patchIds, isUpdateStatus: 1, stringId: init.stringId, taskId: init.taskId  } : { ...values, ...value, softBussinessIds, patchIds }
        api[port](param).then(res => {
          this.props.history.goBack()
        })
      }
      if(noRepetitionNumberCode === 1){
        message.warn('编号不能重复')
      }
    })
  }
  // 选择系统
  onIsSysem = (value) => {
    let { initSysem } = this.state
    if(initSysem && value !== initSysem){
      this.SoftTable.setState({ softList: [] })
      this.PatchTable.setState({ patchList: [] })
    }
    this.setState({
      isSysem: value,
      initSysem: value
    })
  }
  // 模板编号去重
  repetitionNumberCode = (e) => {
    let numberCode = e.target.value
    api.noRepetitionNumberCode({ numberCode }).then( res => {
      res.body === 1 &&
      message.warn('编号不能重复') &&
      this.setState({
        noRepetitionNumberCode: 0
      })
    })
  }
  //操作系统
  getInstallTemplateOs = () => {
    api.createInstallTemplateOs().then(res=>{
      this.setState({
        OperatingSystemArr: res.body
      })
    })
  }

}

const mapStateToProps = ({ Alarms }) => {
  return {
  }
}
const Creates = Form.create()(Create)

export default connect(mapStateToProps)(Creates)
