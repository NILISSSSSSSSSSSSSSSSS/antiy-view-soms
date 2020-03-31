import { Component } from 'react'
import './style.less'
import { Card } from 'antd'
class Page404 extends Component {
  constructor (props) {
    super(props)
    this.state = {
    }
  }
  render () {
    return (
      <div className="permissionPage">
        <Card>
          <div><img src={require('@/assets/permission.png')} alt=""/></div>
          <p>抱歉， 您无权限操作，</p>
          <p>请联系管理员开通此功能</p>
        </Card>
      </div>
    )
  }
}

export default Page404
