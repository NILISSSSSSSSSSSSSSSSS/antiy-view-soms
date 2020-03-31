import React, { Component } from 'react'
import { Select, Input } from 'antd'
import './index.less'

const { Option } = Select
export default class SelectInput extends Component{
  constructor (props){
    super(props)
    this.state = {
      select: '',
      input: ''
    }
  }
  UNSAFE_componentWillReceiveProps (nextProps){
    if(this.props.resetKey !== nextProps.resetKey){
      this.setState({ resetKey: nextProps.resetKey, select: null, input: null })
    }
  }
  onChange = (select, input) => {
    const { onChange } = this.props
    this.setState({ select, input })
    onChange([select, input])
  }
  onReset = () => {
    this.props.form.resetFields()
  }
  render (){
    const { selectOptions = [], placeholder, value } = this.props
    if(value && value[0] === null){value[0] = undefined}
    const { select, input, resetKey } = this.state
    const { input: inputPlaceholder, select: selectPlaceholder } = placeholder || {}
    return (
      <div className="select-input-box" key={resetKey}>
        <Select className="select-select" placeholder={selectPlaceholder} onChange={(v)=>this.onChange(v, input)} onReset={this.onReset} value={value && value[0]}>
          { selectOptions.map(item => {return <Option key={item.value} value={item.value}>{item.name}</Option> }) }
        </Select>
        <Input
          className="select-input"
          autoComplete="off"
          placeholder={inputPlaceholder}
          type='number' min='1'
          onChange={(e)=>this.onChange(select, e.target.value)}
          onReset={this.onReset}
          value={value && value[1]}
        />
      </div>
    )
  }
}

