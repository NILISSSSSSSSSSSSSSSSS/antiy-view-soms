
import { Component } from 'react'
import { Form, Radio } from 'antd'
import './style.less'
const RadioGroup = Radio.Group
class PigeonholeTab extends Component{
  constructor (props){
    super(props)
    this.state = {
      value: '1'
    }
  }

  componentDidMount (){
  }
  onChange = (e) => {
    const value = e.target.value
    this.setState({ value })
    this.props.onChange(value)
  }
  render (){
    let { value } = this.state
    return(
      <div className='pigeonhole-tab'>
        <RadioGroup value={value} buttonStyle="solid" onChange={this.onChange}>
          <Radio.Button value={'1'}>未归档</Radio.Button>
          <Radio.Button value={'2'}>已归档</Radio.Button>
        </RadioGroup>
      </div>
    )
  }
}
const PigeonholeTabs = Form.create()(PigeonholeTab)
export default PigeonholeTabs