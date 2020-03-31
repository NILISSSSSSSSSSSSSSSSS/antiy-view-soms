import  React, { Component } from 'react'
import { connect } from 'dva'
import { Form, message, Divider, Button } from 'antd'
import AssetTable from '@/components/Alarm/AlarmRule/AssetTable'
import { generateRules, analysisUrl } from '@/utils/common'
import { CommonForm } from '@c/index'
import api from '@/services/api'
import './style.less'
const { Item } = Form

export class Create extends Component {
  constructor (props) {
    super(props)
    this.state = {
      OperatingSystemArr: [],
      basicsData: {},
      isEdit: this.props.location.pathname && this.props.location.pathname.split('/')[(this.props.location.pathname.split('/')).length - 1 ] === 'edit', //判断是编辑还是创建
      init: analysisUrl(this.props.location.search),
      isPage: this.props.location.pathname && this.props.location.pathname.split('/')[(this.props.location.pathname.split('/')).length - 1 ], //判断页面
      isAlertErr: false,
      areaId: '',
      flag: true
    }
  }
  componentDidMount () {
    let { isEdit, init } =  this.state
    if(isEdit){
      api.queryruleinfo({ uniqueId: init.uniqueId }).then( res => {
        this.setState({
          basicsData: res.body, areaId: res.body.areaId
        })
      })
    }
    this.getUserAreaTree()
  }
  UNSAFE_componentWillReceiveProps (nextProps) {

  }
  getUserAreaTree= (productName)=>{
    api.getUserAreaTree({ productName }).then((res)=>{
      this.setState({ userAreaTree: res.body ? [ res.body ] : [] })
    })
  }
  // 提交整个页面内容
  onSubmit = () => {
    const { noRepetName, isEdit, init } = this.state
    this.props.form.validateFields((err, values) => {
      // 阈值提示
      (values.cpuThreshold || values.memoryThreshold || values.diskThreshold || values.runtimeExceptionThreshold) ?
        this.setState({ isAlertErr: false }) : this.setState({ isAlertErr: true })
      if (!err && values.cpuThreshold || values.memoryThreshold || values.diskThreshold || values.runtimeExceptionThreshold) {
        values.alarmLevel === 5 && delete values.alarmLevel
        values.uniqueId = isEdit && init.uniqueId
        // 判断是编辑还是创建
        let port = isEdit ? 'editAssetMonitorRule' : 'addAssetMonitorRule'
        values.runtimeExceptionThreshold = { runtimeExceptionThreshold: values.runtimeExceptionThreshold, unit: values.unit }
        values.relatedAsset = this.AssetTable.state.list.map(item => { return item.assetId})
        api[port]({ ...values }).then(res => {
          this.props.history.goBack()
        })
      }
      if(noRepetName === 1){
        message.warn('规则名称不能重复')
      }
    })
  }
  // 取消
  handleCancel = () => [
    this.props.history.goBack()
  ]
  // 选择区域
  areaOnchange = (value) => {
    this.AssetTable.setState({ List: [] })
  }
  // 规则名称去重
  repetitionNumberCode = (e) => {
    let name = e.target.value
    api.monitorRuleNameNoRepeat({ name }).then( res => {
      res.body === true &&
      message.warn('规则名称不能重复') &&
      this.setState({
        noRepetName: 0
      })
    })
  }
  runOnchange = (e) =>{
    e && this.setState({ flag: false })
  }
  render () {
    let { isEdit, init, areaId, basicsData, userAreaTree, isPage, isAlertErr, flag } = this.state
    const formLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 }
    }
    const alarmGradeArray = [
      { value: '1', name: '紧急' },
      { value: '2', name: '重要' },
      { value: '3', name: '次要' },
      { value: '4', name: '提示' }
    ]
    const formFields1 = [
      { name: '规则名称', key: 'name', placeholder: '请输入', type: 'input', rules: [{ required: true,  message: '请输入规则名称' }, ...generateRules(50)], onBlur: this.repetitionNumberCode, defaultValue: basicsData.name, disabled: isPage !== 'create' && true },
      { name: '归属区域', key: 'areaId', type: 'selectTree', data: userAreaTree, config: { name: 'fullName', value: 'stringId', selectable: 'rootNode' }, rules: [ { required: true, message: '请选择！' } ], defaultValue: basicsData.areaId, onChange: this.areaOnchange }
    ]
    const formFields2 = [
      { name: '告警等级', key: 'alarmLevel', placeholder: '请选择', type: 'select', data: alarmGradeArray, rules: [{ required: true,  message: '请选择告警等级' }], defaultValue: basicsData.alarmLevel },
      { name: '状态', key: 'ruleStatus', placeholder: '请选择', type: 'select', data: [{ value: '0', name: '禁用' }, { value: '1', name: '启用' }], defaultValue: isPage === 'create' ? '0' : basicsData.ruleStatus }
    ]
    const formFields3 = [
      { name: 'CPU监控 阈值', placeholder: '请输入阈值', key: 'cpuThreshold', type: 'number', percent: true, max: 99, defaultValue: basicsData.cpuThreshold },
      { name: '内存监控 阈值', placeholder: '请输入阈值', key: 'memoryThreshold', type: 'number', percent: true, max: 99, defaultValue: basicsData.memoryThreshold },
      { name: '总磁盘监控 阈值', placeholder: '请输入阈值', key: 'diskThreshold', type: 'number', percent: true, max: 99, defaultValue: basicsData.diskThreshold },
      { name: '运行异常监控 阈值', placeholder: '请输入阈值', key: 'runtimeExceptionThreshold', type: 'number', max: 999, defaultValue: basicsData.runtimeExceptionThreshold, onChange: this.runOnchange },
      { name: '时间单位', placeholder: '请选择', key: 'unit', type: 'select', disabled: flag, data: [{ value: 'HOUR', name: '小时' }, { value: 'DAY', name: '天' }], defaultValue: isPage === 'create' ? 'HOUR' : basicsData.unit }
    ]
    return (
      <div className='asset-monitor-rule-create'>
        <div className="search-bar main-detail-content">
          <div className='form-box'>
            <CommonForm fields={ formFields1 } column={ 3 } form={ this.props.form } FormItem={ Item } formLayout={ formLayout } />
            <Divider dashed className='dashed-line'/>
            <div className='padding-add'></div>
            <CommonForm fields={ formFields2 } column={ 3 } form={ this.props.form } FormItem={ Item } formLayout={ formLayout } />
            <Divider dashed className='dashed-line'/>
            <div className='form-text-tabel padding-add'>
              <span className='form-text-tabel-icon'>*</span>监控类型
              {isAlertErr && <span className='err-alert'>请选择监控类型</span>}
            </div>
            <CommonForm fields={ formFields3 } column={ 3 } form={ this.props.form } FormItem={ Item } formLayout={ formLayout }/>
          </div>
          <p className="detail-title" id="PatchInformation-patch-info">已选中资产</p>
          <AssetTable children={(now) => this.AssetTable = now} isEdit={isEdit} init={init} areaId={areaId}/>
          <div className="Button-center">
            <div>
              <Button type="primary" htmlType='submit' onClick={this.onSubmit}>提交</Button>
              <Button type="primary" ghost onClick={this.handleCancel}>取消</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ Alarms }) => {
  return {
  }
}
const Creates = Form.create()(Create)

export default connect(mapStateToProps)(Creates)
