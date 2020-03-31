import { Component } from  'react'
import { Select, Input } from 'antd'
import './index.less'

const Option = Select.Option
export default class CheckTypeAndCode extends Component{
  /**
   * 下拉框的选择事件，或者输入框的change事件
   * @param type
   * @param code
   */
  change = (type, code) => {
    const { onChange } = this.props
    onChange && onChange({ type, code })
  }
  render (){
    const { types = [], disabled, value = {}, typeStyle, codeStyle } = this.props
    const { type, code } = value
    return (
      <div className="checkTypeAndCode">
        <Select
          disabled={disabled}
          value={type}
          placeholder="请选择"
          onSelect={(value)=>{ this.change(value, code)}}
          style={{ width: 80, ...typeStyle }} >
          { types.map((el)=>{
            return <Option value={el} key={el}>{el}</Option>
          })}
        </Select>
        <Input autoComplete='off' style={{ width: 300, ...codeStyle }} placeholder='请输入' disabled={disabled} value={code}  onChange={(e)=>{ this.change(type, e.target.value)}}/>
      </div>
    )
  }
}
