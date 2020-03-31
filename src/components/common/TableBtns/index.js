import React, { Component, Fragment } from 'react'
import { Button, message, Select, Form } from 'antd'
import Modal from '@c/common/Modal'
import PropTypes from 'prop-types'

const FormItem = Form.Item
const { Option } = Select

/**
 * 表格上部的功能按钮
 * @param leftBtns { Array} 左边的按钮
 *                  格式：[
 *                          {
 *                            check: Function, // 是否显示该按钮
 *                            label:String, // 按钮文字
 *                            onClick: Function, // 按钮点击事件
 *                            checkUsable: Function()=> * , // 点击按钮全的检查，返回为非空字符串时，进行提示，为空时，触发点击事件
 *                            confirm: {
 *                              text: String, // 确认提示文字
 *                              onOk: Function, // 确认
 *                              onCancel: Function, // 取消
 *                            }, // 按钮点击事件
 *                          }
 *                        ]
 * @param rightBtns { Array} 右边的按钮  数据格式同 leftBtns
 *
 * @param rightSelec { obj} 右边的按钮  数据格式同 leftBtns data和onChange
 *
 */

@Form.create()
export default class TableBtns extends Component {
  constructor (props) {
    super(props)
    this.state = {
      confirmModal: {  // 确认弹窗的显示
        confirmVisible: false,
        text: ''
      }
    }
  }

  static defaultProps ={
    leftBtns: [],
    rightBtns: [],
    rightSelec: {}

  }
  static propTypes={
    leftBtns: PropTypes.array,
    rightBtns: PropTypes.array,
    rightSelec: PropTypes.object
  }
  /**
   * 控制确认弹框
   * @param confirm { Object } 确认按钮的确认信息
   */
  controlConfirm = (confirm) => {
    const { confirmModal: { confirmVisible } } = this.state
    // 提示语
    let text = ''
    // text 为函数时
    if(typeof confirm.text === 'function'){
      text = confirm.text()
    }else {
      text = confirm.text
    }
    this.setState({ confirmModal: { confirmVisible: !confirmVisible, ...confirm, text } })
  }
  /**
   * 确认弹窗的确认事件
   */
  onOk = () => {
    const { confirmModal: { onOk } } = this.state
    onOk && onOk()
    this.controlConfirm({ confirmVisible: false })
  }
  /**
   * 确认弹窗的取消事件
   */
  onCancel = () =>{
    const { confirmModal: { onCancel } } = this.state
    onCancel && onCancel()
    this.controlConfirm({ confirmVisible: false })
  }
  /**
   * 按钮点击事件
   * @param text { * } 任意值，进行点击前的检查回调结果，为 空时，进行点击事件下一步，否则进行提示或者 点击事件无效
   * @param callback
   * @return {*}
   */
  checkUsable = (text, callback) => {
    if(!text){// text 值为为false时，进行点击事件回调
      return callback()
    }else if(typeof text === 'string' && text) { // 有文字时，进行文字提示，不在进行点击回调
      message.info(text)
    }
  }

  //同下
  renderSelec=({ label, onChange, data, check }, className)=>{
    if(!this.check({ check }) || !label) return void(0)
    const { form: { getFieldDecorator, resetFields, setFieldsValue } } = this.props

    const change = (value)=>{
      setTimeout(()=>{
        this.props.form.resetFields()
      }, 500)
      onChange(value)
    }

    return(
      <Form layout="inline">
        <FormItem label={label}>
          {getFieldDecorator('selectDelet')(
            <Select onChange={change} placeholder='请选择' className={className} style={{ width: 150 }}>
              {data && data.map((item, i)=>{
                return(
                  <Option value={item.value} key={i} disabled={item.disabled}>
                    {item.text}
                  </Option>
                )
              })}
            </Select>
          )}
        </FormItem>
      </Form>
    )
  }
  /**
   * 渲染按钮
   * @param btn { Object } 按钮配置
   * @param i { Number} 下标
   * @param className
   * @return {*}
   */
  renderBtn = (btn, i, className) => {
    const disabled = btn.disabled || false
    let text = btn.checkUsable
    // 更具返回的值，判断是否给出点击按钮之前的提示
    if(typeof btn.checkUsable === 'function'){
      text = btn.checkUsable()
    }
    const callback = ()=>btn.confirm ? this.controlConfirm(btn.confirm) : btn.onClick()
    return (
      <Button type="primary" className={className} key={`${btn.label}${i}`} onClick={()=>this.checkUsable(text, callback)} disabled={disabled}>{btn.label}</Button>
    )
  }
  // 验证是否显示该按钮
  check = ({ check }) => {
    if(typeof check === 'undefined'){
      return true
    }else if(typeof check === 'boolean'){
      return check
    }else if(typeof check === 'function'){
      return check()
    }
    return true
  }
  render () {
    const { leftBtns, rightBtns, rightSelec } = this.props
    const { confirmModal: { confirmVisible, text } } = this.state
    //todo 此处Modal待公共confirm组件完成之后替换该Modal 组件
    return (
      <div className="table-btn">
        <Modal
          type="confirm"
          // title=" "
          visible={confirmVisible}
          oktext="确认"
          onConfirm={this.onOk}
          onClose={this.onCancel}
        >
          <p className="confirm-text">{text}</p>
        </Modal>
        <div className="left-btn" >
          {
            leftBtns.filter(this.check).map((btn, i)=>{
              return this.renderBtn(btn, i, 'btn-left')
            })
          }
        </div>
        <div className="right-btn">
          {
            rightBtns.filter(this.check).map((btn, i)=>{
              return  this.renderBtn(btn, i, 'btn-right')
            })
          }
          {
            this.renderSelec(rightSelec, 'btn-right')
          }
        </div>
      </div>
    )
  }
}

