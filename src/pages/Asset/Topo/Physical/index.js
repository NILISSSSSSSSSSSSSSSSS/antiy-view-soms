import { Component } from 'react'
import { connect } from 'dva'
import './style.less'

class PhysicalTopo extends Component{
  constructor (props) {
    super(props)
    this.state = {}
  }
  render () {
    return (
      <div style={{ height: '100%' }}>
        <iframe src="/topo/" className='topo-wrap' title="topo" />
      </div>
    )
  }
}

export default connect()(PhysicalTopo)