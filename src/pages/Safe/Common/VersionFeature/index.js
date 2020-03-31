import { Component } from 'react'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import Manage from '../Manage'

//版本管理和特征库
class VersionFeature extends Component{
  constructor (props){
    super(props)
    this.state = {
      tabActiveKey: '0',
      status: null
    }
  }
  render (){
    return(
      <div className="main-table-content system-monitor">
        <Manage from={this.props.from} />
      </div>
    )
  }
}

export default connect()(withRouter(VersionFeature))
