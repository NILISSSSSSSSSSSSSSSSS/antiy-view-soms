import { Component } from 'react'
import { Button, message } from 'antd'

import './style.less'

export default class PhotoChange extends Component{
  constructor (props){
    super(props)
    this.state = {}
  }
  click = () => {
    message.info('暂时没有开通此项功能')
  }
  render (){
    const { user = { } } = this.props
    return(
      <div>
        {/*<img src={photo} className="photo-img" alt=""/>*/}
        <div className="photo-img" ><img src={user.img || require('@/assets/头像2.png')} alt=""/></div>
        <div  className="Button-center">
          <Button className="photo-upload" type="primary" ghost onClick={this.click}>更换头像</Button>
        </div>
        {/*<Upload >
          <Button className="photo-upload">更换头像</Button>
        </Upload>*/}
      </div>
    )
  }
}
