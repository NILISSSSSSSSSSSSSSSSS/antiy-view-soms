import { Component } from 'react'
import { chunk } from 'lodash'
import { Col, Form, Input } from 'antd'
import './index.less'

let key = 0
//此页面不要了
export default class IPAndMac extends Component {
  static defaultProps = {
    includesType: ['ip', 'mac']
  }
  constructor (props){
    super(props)
    this.state = { ipAndMacs: [{ ip: '', mac: '', key: key }] }
  }
  /**
   * 根据表单项的类型，渲染表单项
   * @param filed 表单项
   * @param rowIndex 表单项索引
   * @param colIndex 表单项索引
   * @param ipAndMac{Object} 一行的ip和mac对象数据
   */
  renderFormItem = (filed, rowIndex, colIndex, ipAndMac) => {
    const { form, FormItem, formLayout = {} } = this.props
    const { ipAndMacs } = this.state
    const { getFieldDecorator } = form || {}
    const { type, name, key, rules, placeholder = '请输入', data, config, defaultValue: initialValue, popover, ...other } = filed || {}
    const { allowClear, disabled } = other
    // 默认允许删除
    const _allowClear = { allowClear: true }
    //设置不允许被删除或者禁用时，不允许被删除
    if(typeof allowClear === 'boolean' && !allowClear || disabled) {
      _allowClear.allowClear = false
    }
    if(type === 'operation'){
      return (
        <div className="ip-mac-operation">
          { ipAndMacs.length > 1 ? <span onClick={()=>{this.del(rowIndex)}}>删除</span> : null }
          <span onClick={()=>{this.add(rowIndex)}}>添加</span>
        </div>
      )
    }

    return (
      <FormItem label={ name } { ...formLayout }>
        { getFieldDecorator(`iaAndMac${ipAndMac.key}${colIndex}`, {
          rules,
          initialValue
        })(
          <Input { ..._allowClear } placeholder={ placeholder } onChange={(e)=>{this.onChnage(rowIndex, colIndex, e.target.value)}} { ...other }/>
        ) }
      </FormItem>
    )
  }
  /**
   * ip和mac变更
   * @param rowIndex
   * @param colIndex
   * @param value
   */
  onChnage = (rowIndex, colIndex, value) => {
    const { onChange } = this.props
    const { ipAndMacs } = this.state
    const _ipAndMacs = ipAndMacs.map((e, i)=>{
      if(i === rowIndex){
        return { ...e, [!colIndex ? 'ip' : 'mac']: value }
      }
      return e
    })
    this.setState({ ipAndMacs: _ipAndMacs })
    onChange && onChange(_ipAndMacs)
  }
  /**
   * 删除ip和mac
   * @param rowIndex
   */
  del = (rowIndex) => {
    const { onChange } = this.props
    const { ipAndMacs } = this.state
    const _ipAndMacs = [].concat(ipAndMacs)
    _ipAndMacs.splice(rowIndex, 1, )
    onChange && onChange(_ipAndMacs)
    this.setState({ ipAndMacs: _ipAndMacs })
  }
  /**
   * 添加ipmac
   * @param rowIndex
   */
  add = (rowIndex) => {
    const { onChange } = this.props
    const { ipAndMacs } = this.state
    const _ipAndMacs = [].concat(ipAndMacs)
    _ipAndMacs.splice(rowIndex + 1, 0, { key: ++key })
    onChange && onChange(_ipAndMacs)
    this.setState({ ipAndMacs: _ipAndMacs })
  }
  renderDom = (ipAndMacs, fields2, column) => {
    return ipAndMacs.map((ipAndMac, i)=>{
      return (
        <Form key={ipAndMac.key}>
          <div className="form-wrap">
            {
              chunk(fields2, column).map((el) => {
                return (
                  el.map((it, idx) => {
                    return (
                      <Col key={ `${it.key}${i}` } span={ 24 / column }>
                        { this.renderFormItem(it, i, idx, ipAndMac) }
                      </Col>
                    )
                  })
                )
              })
            }
          </div>
        </Form>
      )
    })
  }
  render () {
    const { column } = this.props
    const { ipAndMacs } = this.state
    const fields2 = [
      { name: 'IP', key: 'ip', type: 'input', rules: [ { required: true, message: '请输入IP！' } ] },
      { name: 'MAC', key: 'mac', type: 'input', rules: [ { required: true, message: '请输入MAC！' } ] },
      { name: '', key: '', type: 'operation' }
    ]
    return (
      <div className="form-content">
        { this.renderDom(ipAndMacs, fields2, column)}
      </div>
    )
  }
}
