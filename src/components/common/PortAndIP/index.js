import { Component } from 'react'
import Input from '@c/common/Input'
import './index.less'

export default class PortAndIp extends Component {
  // 输入ip
  onChange = (e) => {
    const ip = e.target.value
    const { onChange } = this.props
    onChange && onChange(ip)
  }
  render () {
    const { operation, value: ip, port, onChange, ...other } = this.props
    return (
      <div className="port-ip-relation">
        <Input value={ip} onChange={this.onChange} className="port-ip-relation-ip" operation={operation} placeholder="IP" {...other}/>
      </div>
    )
  }
}
