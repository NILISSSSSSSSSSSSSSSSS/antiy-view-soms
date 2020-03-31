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
      <div className="ErrorPage">
        <Card>
          <div><img src={require('@/assets/error.png')} alt=""/></div>
          <p>抱歉， 页面出现异常，</p>
          <p>您可以尝试：刷新页面、联系管理员</p>
        </Card>
      </div>
    )
  }
}

export default Page404
