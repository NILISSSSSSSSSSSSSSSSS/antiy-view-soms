import { Component } from 'react'
import { Input } from 'antd'
import './index.less'
export default class CustomInput extends Component {
  static defaultProps = {
    operation: []
  }
  operations = {
    remove: { src: require('@/assets/biaodanshanchu.svg') },
    add: { src: require('@/assets/biaodanxinzeng.svg') }
  }
  render () {
    const { operation, onChange, value, placeholder, ...other } = this.props
    return (
      <div className="custom-input">
        <Input onChange={onChange} value={value} placeholder={placeholder} { ...other}/>
        {
          operation.map((e)=>{
            return <img key={e.key} src={this.operations[e.key].src} onClick={e.onClick} alt=""/>
          })
        }
      </div>
    )
  }
}
