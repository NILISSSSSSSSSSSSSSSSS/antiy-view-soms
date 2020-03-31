import { Component } from 'react'
import { Col, message } from 'antd'
import Input from '@c/common/Input'
import api from '@/services/api'
import * as regExp from '@/utils/regExp'
import { SAFETY_DEVICE, OTHER_DEVICE } from '@a/js/enume'
import './index.less'
const ACTION_REGISTER = 'REGISTER' // 登记操作类型
const TIPS_DEVICE_ARRAY =  [SAFETY_DEVICE.value, OTHER_DEVICE.value ] // 修改IP之后不需要提示的资产类型
/**
 * @param resetKey{*} 传入与上次不同的值时，会重置ip和mac数据
 */
export default class IPAndMac extends Component {
  static defaultProps = {
    includesType: [ 'ip', 'mac' ],
    data: {},
    disabled: false,
    layout: 'inline', // inline | vertical
    required: true // ip和mac是否必填
  }

  constructor (props) {
    super(props)
    this.ipKey = 0
    this.macKey = 0
    this.isInit = true
    this.keys = []
    this.state = {
      originalIPList: [],
      ips: [ { label: 'IP', value: '', key: this.ipKey } ],
      macs: [ { label: 'MAC', value: '', key: this.macKey } ]
    }
  }
  componentDidMount () {
  }

  UNSAFE_componentWillReceiveProps (nextProps, nextContext) {
    // 切换资产类型，恢复初始状态
    if(this.props.resetKey !== nextProps.resetKey){
      this.isInit = true
      this.ipKey = 0
      this.macKey = 0
    }
    this.setFieldsValue(nextProps.data)
  }

  setFieldsValue = (data) => {
    if(!this.isInit){
      return false
    }
    const { ip = [], mac = [] } = data
    const values = {}
    const originalIPList = []
    this.keys = []
    if(ip.length){
      const _ip = ip.map(e=>{
        values[`IP${this.ipKey}`] = e.ip
        values.net = e.net
        originalIPList.push(e.ip)
        return { label: 'IP', value: e.ip, key: this.ipKey++, net: e.net }
      })
      this.setState({ ips: _ip, originalIPList })
    }else {
      // 没有数据时，保留一行，并且重置数据
      this.props.form.resetFields(['IP0'])
      this.setState({ ips: [ { label: 'IP', value: '', key: this.ipKey } ], originalIPList })
    }
    if(mac.length){
      const _mac = mac.map(e=>{
        values[`MAC${this.macKey}`] = e.mac
        return { label: 'MAC', value: e.mac, key: this.macKey++ }
      })
      this.setState({ macs: _mac })
    }else {
      // 没有数据时，保留一行，并且重置数据
      this.props.form.resetFields(['MAC0'])
      this.setState({ macs: [ { label: 'MAC', value: '', key: this.macKey } ] })
    }
    this.keys = Object.keys(values)
    if(Object.keys(values).length){
      const { form } = this.props
      setTimeout(()=>{
        form.setFieldsValue(values)
      }, 0)
      this.isInit = false
    }
  }
  remove = (rowIndex, key) => {
    const state = { [ `${ key }s` ]: this.state[ `${ key }s` ].filter(e=>e.key !== rowIndex) }
    const { ips: _ips, macs: _macs } = this.state
    const { onChange } = this.props
    let ips = _ips
    let macs = _macs
    if(key === 'ip'){
      ips = state.ips
    }else if(key === 'mac'){
      macs = state.macs
    }
    onChange && onChange(ips, macs)
    this.setState(state)
  }
  /**
   * 添加
   * @param rowIndex
   * @param key
   */
  addRow = (rowIndex, key) => {
    const item = { label: key.toLocaleUpperCase(), value: '', key: key === 'ip' ? ++this.ipKey : ++this.macKey }
    const state = { [ `${ key }s` ]: [].concat(this.state[ `${ key }s` ]).concat([ item ]) }
    this.setState(state)
  }
  /**
   * 渲染每个IP或者MAC输入组件
   * @param type {String} ip | mac
   * @param it
   * @param index
   * @return {*}
   */
  renderItem = (type, it, index) => {
    if(!it) {
      return (
        <Col/>
      )
    }
    const hasRemove = index > 0
    const { form, formLayout = {}, FormItem, required, disabled, assetData = {} } = this.props
    const { getFieldDecorator } = form || {}
    const operation = []
    const _disabled = disabled && ((assetData[type] || [])[index] || {})[type]
    !hasRemove && operation.push({ key: 'add', onClick: () => this.addRow(index, type) })
    !_disabled && hasRemove && (operation.push({ key: 'remove', onClick: () => this.remove(it.key, type) }))
    const pattern = type === 'ip' ? { pattern: regExp.ipRegex, message: '请输入正确格式的IP' } : { pattern: regExp.macRegex, message: '请输入正确格式的MAC' }
    return (
      <Col>
        <FormItem label={ it.label } { ...formLayout }>
          {
            getFieldDecorator(`${ it.label }${ it.key }`, {
              rules: [ { required, message: `请输入${ it.label }!` }, pattern, { validator: (rule, value, callback)=>this.onBlurValidator(type, rule, value, callback, it.key) } ],
              validateTrigger: [ 'onBlur' ]
            })(
              <Input operation={ operation } placeholder={ `请输入${ it.label }`}  disabled={_disabled} onChange={(e)=>this.onChange(type, index, e.target.value)} onBlur={()=>this.onBlurTips(type, index)} />
            )
          }
        </FormItem>
      </Col>
    )
  }
  /**
   * 向服务发送mac验证重复请求
   * @param mac {{mac: *}} 需要验证的mac
   * @constructor
   */
  CheckRepeatMAC = (mac) => {
    const { stringId } = this.props.data || {}
    // 向服务器验证mac是否重复, 返回 true为重复
    return api.CheckRepeatMAC({ mac, stringId })
  }
  onBlurTips = (type, index) => {
    const { data } = this.props
    // 不需要提示的，则直接退出
    if(TIPS_DEVICE_ARRAY.includes(data.categoryModel)){
      return
    }
    this.sendMessage()
  }
  onBlurValidator = async (type, rule, value, callback, key) => {
    if(!value){
      callback()
      return
    }
    if(type === 'ip'){
      const { ips } = this.state
      const cur = ips.find(e=>e.value === value)
      // 本地有重复的ip，进行本地提示
      if(cur && cur.key !== key){
        callback('已经输入了该IP')
        return
      }
      callback()
      return
    }
    if(type === 'mac'){
      // 本地是否验证通过
      this.maValidationPass = true
      const { macs } = this.state
      const cur = macs.find(e=>e.value === value)
      // 本地有重复的mac，不在向服务器发送验证请求
      if(cur && cur.key !== key){
        this.maValidationPass = false
        callback('已经输入了该MAC')
        return
      }
      if(this.maValidationPass){
        // 向服务器发送验证请求
        await this.CheckRepeatMAC(value).then((res)=>{
          if(res.body){
            callback('该MAC已经被其他设备占用')
          }else {
            callback()
          }
        }).catch(()=>{
          callback('服务器异常')
        })
      }
    }
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
    const { originalIPList, ips } = this.state
    const newIPList  = ips.filter(e=>e.value).map(e=>e.value)
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
  onChange = (type, index, value) => {
    const { onChange } = this.props
    const key = `${ type }s`
    this.isInit = false
    this.setState({
      [ key ]: this.state[ key ].map((e, i) => {
        if(i === index){
          return { ...e, value }
        }
        return e
      })
    }, ()=>{
      const { ips, macs } = this.state
      onChange && onChange(ips, macs)
    })
  }

  render () {
    const { ips, macs } = this.state
    const { includesType } = this.props
    const { column } = this.props
    const className = `ip-and-mac-item column-${column}`
    return (
      <div className="ip-and-mac-container">
        {
          includesType.includes('ip') &&  <div className={className}>
            {
              ips.map((el, i)=>{
                return (
                  <div key={el.key}>
                    {this.renderItem('ip', el, i)}
                  </div>
                )
              })
            }
          </div>
        }
        {
          includesType.includes('mac') && <div className={className}>
            {
              macs.map((el, i)=>{
                return (
                  <div key={el.key}>
                    {this.renderItem('mac', el, i)}
                  </div>
                )
              })
            }
          </div>
        }

      </div>
    )
  }
}
