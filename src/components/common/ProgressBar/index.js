import { Component } from  'react'
import { Icon } from 'antd'
import Tooltip from '@/components/common/CustomTooltip'

import './index.less'
export default class ProgressBar extends Component{
  constructor (props) {
    super(props)
    this.state = {
      isUpload: false
    }
  }
  generateText = () => {
    const { progress, fileName } = this.props
    if(typeof progress === 'number'){
      if(progress >= 100){
        return fileName
      }
      return progress + '%'
    }else {
      return ''
    }
  }
  setBarWidth = () => {
    const { progress } = this.props
    return typeof progress === 'number' ? progress : 0
  }

  renderName = () => {
    const { name, deleteFile, serverChecking, status } = this.props
    const fileName = (
      <div className="current-progress-name">
        <span className="current-progress-label">
          <Tooltip title={name}>{name}</Tooltip>
        </span>
        {
          (status === 'done' || !status) && (
            <span className="current-progress-close">
              <Icon onClick={deleteFile} type="close-circle" />
            </span>
          )
        }
      </div>
    )
    // 不进行服务器验证时，取消验证的文案
    if(typeof serverChecking === 'undefined'){
      return fileName
    }
    // 服务是否在校验中
    if(!serverChecking){
      return fileName
    }else {
      return <div className="current-progress-name"><div className="current-progress-check">处理中...</div></div>
    }
  }

  showName = () =>{
    const { isUpload, name } = this.props
    if(name && !isUpload){
      return true
    }
  }
  showProgress = () => {
    const { progress } = this.props
    if(progress > 0 && progress < 100){
      return true
    }
  }
  render () {
    const { progress } = this.props
    return (
      <div className="progress-Bar-box">
        {this.showProgress() && <span className={ progress >= 50 ? 'current-progress-text progress-color' : 'current-progress-text'}>{this.generateText()}</span>}
        {this.showName() ? this.renderName() : null}
        {this.showProgress() && <div className="current-progress" style={{ width: `${ this.setBarWidth()}%` }} />}
      </div>
    )
  }
}
