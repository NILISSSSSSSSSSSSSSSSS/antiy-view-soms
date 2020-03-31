import { Input } from 'antd'
import { Component } from 'react'

/**
 * 自定义密码输入框，防止密码自动填充问题
 */
export default class PwdInput extends Component{
  constructor (props){
    super(props)
    this.state = {
      value: props.value || '', // 输入的字符
      encryptionText: '*' // 加密显示符号
    }
  }
  onChange = (e) => {
    const { onChange } = this.props
    this.setState({ value: e.target.value })
    onChange && onChange(e)
  }
  /**
   * 通过是否有值判断input的type类型
   * @return {string}
   */
  getInputType = () => {
    const { type } = this.props
    const { value = '' } = this.state
    if(type === 'text'){
      return 'text'
    }else if(type === 'password'){
      if(!value.trim()){
        return 'text'
      }else {
        return 'password'
      }
    }
  }
  render () {
    const { onChange, ...other } = this.props
    const { value } = this.state
    const type = this.getInputType()
    return (
      <div>
        <Input autoComplete='off' { ...other} type={type} style={{ display: 'none' }} />
        <Input autoComplete="off" { ...other} type={type} onChange={this.onChange} value={value} />
      </div>
    )
  }
}
