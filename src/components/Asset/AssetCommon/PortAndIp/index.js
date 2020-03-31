import { Component, Fragment } from 'react'
import CustomForm from '@c/common/Form'
import { message } from 'antd'
import * as regExp from '@/utils/regExp'

const ACTION_REGISTER = 'REGISTER' // 登记操作类型
export default class PortIpRelation extends Component{
  static defaultProps = {
    maxCount: 100
  }
  constructor (props){
    super(props)
    this.portCount = 1
    this.portItem = { value: null }
    this.isInit = true
    this.state = {
      originalIPList: [],
      port: void 0,
      portSize: void 0, // 原始的网口数目
      hasPort: [{ ...this.portItem, keyCount: this.portCount }]
    }
  }
  UNSAFE_componentWillReceiveProps (nextProps, nextContext) {
    if(this.props.resetKey !== nextProps.resetKey){
      this.isInit = true
    }
    this.setFieldsValue(nextProps.data)
  }

  setFieldsValue = (data) => {
    if(!this.isInit){
      return false
    }
    this.portCount = 1
    let { ip = [], portSize } = data
    if(!portSize){
      portSize = ip.length
    }
    const { ip: frontIp } = this.props.data
    const { form } = this.props
    const values = {}
    if(portSize){
      form.setFieldsValue({ portSize })
      const _ip = []
      for(let i = 0; i < portSize; ++i){
        const e = ip.find(it=> (it.net || 1) === (i + 1)) || {}
        const net = e.net || i + 1
        values[`portAndIp${net}`] = e.ip
        this.portCount = i + 1
        _ip.push({ value: e.ip, keyCount: this.portCount, net: net })
      }
      this.setState({ hasPort: _ip, port: portSize, portSize })
    }
    if(Object.keys(values).length){
      this.isInit = false
      setTimeout(()=>{
        form.setFieldsValue(values)
        // 保存原始的网口数据
        this.setState({ portSize })
      }, 0)
    }
  }
  add = () => {
    const { hasPort, port } = this.state
    if(port <= hasPort.length){
      return
    }
    let keyCount = 2
    for(let i = 1; i <= port; ++i){
      // 找到中断的网口
      const cur = hasPort.find(e=>e.keyCount === i)
      if(!cur){
        keyCount = i
        break
      }
    }
    const newList = [].concat(hasPort)
    newList.splice(keyCount - 1,  0, { value: null, keyCount })
    this.setState({ hasPort: newList })
  }
  remove = ({ keyCount }) => {
    const { hasPort } = this.state
    const { onChange } = this.props
    const portAndIpList = hasPort.filter(e=>e.keyCount !== keyCount)
    onChange && onChange(portAndIpList)
    this.setState({ hasPort: portAndIpList })
  }
  onChange = (portValue) => {
    const { portSize } = this.state
    if(portValue && portValue >= portSize){
      this.port = portValue
    }
    this.port = portValue
    // this.setState({ port: portValue })
  }
  setPortAndIp = (portValue) => {
    const { hasPort } = this.state
    const { maxCount } = this.props
    if(!portValue || portValue > maxCount){
      return
    }
    let _hasPort = [ ...hasPort ]
    for(let i = 1; i <= portValue; ++i){
      this.portCount = i
      if(i === 1){
        _hasPort = []
      }
      const cur = hasPort.find(e=>e.keyCount === i)
      _hasPort.push({ ...this.portItem, ...cur, keyCount: i })
    }
    this.setState({ port: portValue, hasPort: _hasPort })
  }
  onBlur = () => {
    const { portSize, port } = this.state
    // 是变更时，网口数据只能增加不能减少
    if(typeof portSize !== 'undefined' && this.port < portSize){
      const { form } = this.props
      message.error(`只能比原始网口数目${portSize}增加，不能减少`)
      this.port = port
      form && form.setFieldsValue({ portSize: port })
      return
    }
    this.setPortAndIp(this.port)
  }
  // IP改变是否已经提示过了
  hasSendMessage = false
  /**
   *如果改变IP，这进行提示
   */
  sendMessage = () => {
    const { action } = this.props
    if(this.hasSendMessage || action === ACTION_REGISTER){
      return
    }
    const { originalIPList, hasPort } = this.state
    const newIPList  = hasPort.map(e=>e.ip)
    if(originalIPList.length !== newIPList.length){
      this.hasSendMessage = true
    }else {
      for(let i = 0, len = originalIPList.length; i < len; ++i){
        const isFind = newIPList.includes(originalIPList[i])
        if(!isFind){
          this.hasSendMessage = true
          break
        }
      }
    }
    if(this.hasSendMessage){
      message.info('请注意改变IP会直接影响通联关系')
    }
  }
  generateFields = () => {
    const { hasPort, port } = this.state
    const netDeviceFields = []
    const pattern = { pattern: regExp.ipRegex, message: '请输入正确格式的IP' }
    if(hasPort.length <= 1){
      const operation = port > 1 ? [{ key: 'add', onClick: () => this.add() }] : []
      const item = {
        name: '网口1',
        key: 'portAndIp1',
        type: 'PortAndIP',
        // operation: operation,
        onBlur: ()=>this.sendMessage(),
        validateTrigger: 'onBlur',
        rules: [ pattern, { validator: (rule, value, callback)=>this.onBlurValidator(rule, value, callback, 1) } ],
        onChange: (value)=>this.ipChange(1, value),
        port: 1
      }
      netDeviceFields.push(item)
      return netDeviceFields
    }
    const writePortArr = hasPort.map((e, i)=>{
      const operation = i === 0 ? [{ key: 'add', onClick: () => this.add() }] : [{ key: 'remove', onClick: () => this.remove(e) }]
      return {
        name: `网口${e.keyCount}`,
        key: `portAndIp${e.keyCount}`,
        type: 'PortAndIP',
        // operation: operation,
        onBlur: ()=>this.sendMessage(),
        port: i + 1,
        validateTrigger: 'onBlur',
        rules: [ pattern, { validator: (rule, value, callback)=>this.onBlurValidator(rule, value, callback, e.keyCount) } ],
        onChange: (value)=>this.ipChange(i + 1, value),
        i: e.keyCount
      }
    })
    return [].concat(netDeviceFields).concat(writePortArr)
  }
  /**
   * 失焦时对ip的验证是否重复
   * @param rule
   * @param value
   * @param callback
   * @param keyCount
   */
  onBlurValidator = (rule, value, callback, keyCount) => {
    const { hasPort } = this.state
    if(value){
      const cur = hasPort.find(e=>(e.value === value && e.keyCount !== keyCount))
      // 本地有重复的ip，进行本地提示
      if(cur){
        callback('已经输入了该IP')
        return
      }
      callback()
    }else {
      const has = hasPort.find(e=>(e.value && e.keyCount !== keyCount))
      if(!has){
        callback('网口与IP绑定关系至少填写一个')
        return
      }

    }
    callback()
  }
  /**
   * ip变更时
   * @param port
   * @param ip
   */
  ipChange = (port, ip) => {
    const { hasPort } = this.state
    const { onChange } = this.props
    const portAndIpList = hasPort.map((e, i)=>{
      if(port === e.keyCount){
        return { ...e, value: ip }
      }else {
        return e
      }
    })
    this.setState({ hasPort: portAndIpList })
    onChange && onChange(portAndIpList)
  }
  render () {
    const { column, formLayout, FormItem, form } = this.props
    const fields = this.generateFields()
    const netDeviceFields = [
      { name: '网口数目', key: 'portSize', type: 'number', precision: 0, onBlur: this.onBlur, onChange: this.onChange, max: 100, step: 1, min: 1, rules: [ { required: true, message: '请输入！' } ] }
    ]
    return(
      <Fragment>
        <CustomForm fields={ netDeviceFields } column={ column } form={ form } FormItem={ FormItem } formLayout={ formLayout }/>
        <CustomForm fields={ fields } column={ column } form={ form } FormItem={ FormItem } formLayout={ formLayout }/>
      </Fragment>)
  }
}
