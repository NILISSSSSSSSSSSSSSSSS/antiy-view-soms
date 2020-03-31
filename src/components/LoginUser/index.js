import { Component } from 'react'
import { Link } from 'dva/router'
import { Tooltip } from 'antd'
import './index.less'

export default class LoginUser extends Component {
  constructor (props) {
    super(props)
    this.state = {
      changeSrc: false
    }
  }
  render (){
    // const { user = { username: '' } } = this.props
    // const originalName = user.username || ''
    // const nameLength = 8
    // const name = originalName.length > nameLength ? user.username.slice(0, nameLength) + '...' : originalName
    return(
      <div>
        <Link to='/personalcenter'>
          <Tooltip title={'个人中心'} overlayClassName="menuTooltip">
            <img src={!this.state.changeSrc ? require('@/assets/user_normal.svg') : require('@/assets/user_hover.svg')} className="loginUser-icon" alt="" onMouseMove={()=>{this.setState({ changeSrc: true })}} onMouseLeave={()=>{this.setState({ changeSrc: false })}}/>
          </Tooltip>
        </Link>
      </div>
    )
  }
}
