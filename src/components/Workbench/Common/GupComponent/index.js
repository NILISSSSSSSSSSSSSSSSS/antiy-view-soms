import { Component } from 'react'
import { withRouter } from 'dva/router'
import { Badge } from 'antd'
import './index.less'
import hasAuth from '@/utils/auth'
@withRouter
export default class AssetMange extends Component {
  constructor (props) {
    super(props)
    this.state = {
      workList: []
    }
    this.components = []
  }
  componentDidMount () {
    this.components = this.generateData()
    this.setState({ key: Math.random() })
  }
  // 生成flow流程图
  generateData = () => {
    const { fields = [] } = this.props
    return fields
  }
  /**
   * 渲染操作组件
   * @param obj 操作对象数据
   * @param style
   * @return {*}
   */
  renderSquare = (obj = {}, style) => {
    const auth = hasAuth(obj.auth)
    // const auth = false
    let img = obj.disabledImg
    let onClick = obj.onClick
    let count = obj.value
    let className = 'workbench-asset-mange-item-disabled'
    // 有权限才能点击进入到相关页面
    if(auth){
      img = obj.img
      onClick = onClick || this.onClick
      className = ''
    }else {
      // 没有权限时， 不显示代办数量
      count = 0
    }
    return (
      <div className="workbench-asset-mange-item" style={{ ...obj.style, ...style }} onClick={()=>{onClick && onClick(obj)}}>
        <Badge count={count}>
          <img className={ className } src={img} alt=""/>
        </Badge>
      </div>
    )
  }
  /**
   * 点击图标事件
   */
  onClick = (data = {}) => {
    if(data.url){
      sessionStorage.setItem('works', 1)
      const { history } = this.props
      history.push(data.url)
    }
  }
  /**
   * 渲染操作组件
   * @param obj 操作对象数据
   * @param style
   * @return {*}
   */
  renderLine = (obj = {}, style) => {
    return (
      <div className="workbench-asset-mange-item-line-box" style={{ ...style }}>
        <img src={obj.img} alt="" style={{ ...obj.style }}/>
      </div>
    )
  }

  // 渲染空的站位
  renderEmptySquare = ()=>{
    return (
      <div className="workbench-asset-mange-item" />
    )
  }
  // 渲染空的站位
  renderEmptyLine = ()=>{
    return (
      <div className="workbench-asset-mange-item-line-box" />
    )
  }
  render () {
    const { workList = [], fields = [], footer } = this.props
    return (
      <div className="workbench-asset-mange">
        {
          fields.map((e, i) => {
            return (
              <div key={i} className="workbench-asset-mange-row">
                {
                  e.map((it, idx) => {
                    const even = idx % 2 === 0
                    let value = null
                    if(it.name){
                      value = (workList.find((e)=>e.name === it.name) || {}).value || 0
                    }
                    // 待办任务的数字
                    let item = { ...it, value }
                    let render = null
                    // 有模块显示时
                    // 渲染模块
                    if(item.type === 'square' && item.name){
                      render = this.renderSquare(item)
                    }else if(item.type === 'square' && !item.name){
                      // 渲染空模块
                      render = this.renderEmptySquare()
                    }else if(item.type === 'line'){
                      // 渲染线条
                      render = this.renderLine(item)
                    }else{
                      // 站位使用
                      render = this.renderEmptyLine()
                    }
                    return (
                      <div key={idx} className={!even ? 'even-column' : ''}>
                        {render}
                      </div>
                    )
                  })
                }
              </div>
            )
          })
        }
        {footer}
      </div>
    )
  }
}
