import { Component } from 'react'
import { withRouter } from 'dva/router'
import EmergencyRegister from '../Register'

@withRouter
class EmergencyEdit extends Component{
  constructor (props){
    super(props)
    this.state = {
    }
  }
  componentDidMount (){
  }
  render (){
    return(
      <div>
        <EmergencyRegister />
      </div>
    )
  }
}

export default EmergencyEdit