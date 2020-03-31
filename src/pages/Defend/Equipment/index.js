import { Component } from 'react'
import { connect } from 'dva'
import './style.less'

class Equipment extends Component{
  constructor (props) {
    super(props)
    this.state = {}
  }
  render () {
    return (
      <div style={{ height: '100%' }}>
        <iframe src="http://localhost:4200/luna/" className='equipment-list-wrap' title="topo" />
      </div>
    )
  }
}

export default connect()(Equipment)