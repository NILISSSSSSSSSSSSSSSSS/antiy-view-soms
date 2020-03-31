import { Tabs } from 'antd'
import { Component } from 'react'
import {  replaceURLParam } from '@/utils/common'
import { withRouter } from 'dva/router'
const { TabPane } = Tabs

class CustomTabs extends Component{
  constructor (props){
    super(props)
    this.state = {
      activeKey: props.defaultActiveKey
    }
    this.isDefault = true
  }
  onChange = (activeKey) => {
    const { onChange, activeKey: propsActiveKey } = this.props
    this.setState({ activeKey })
    const { history: { location: { pathname, search }, replace } } = this.props
    //替换tabs值
    const url = pathname + replaceURLParam(search, { tabs: activeKey })
    // 使用替换，返回时，不会再当前tabs之间返回，直接返回上一个页面
    replace(url)
    onChange && onChange(activeKey)
    // 完全受控时，组件内部不在设置activeKey
    if(typeof propsActiveKey === 'undefined'){
      this.setState({ activeKey })
    }
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    const activeKey = this.getActiveKey(nextProps)
    this.setState({ activeKey })
  }

  //判断是否完全受控，如果完全受控，activeKey则有props的activeKey控制
  getActiveKey = (props) => {
    const { activeKey: propsActiveKey, defaultActiveKey, children } = props
    if(typeof propsActiveKey !== 'undefined'){ // 完全受控
      return propsActiveKey
    }else if(typeof defaultActiveKey !== 'undefined' && this.isDefault){ // 传入defaultActiveKey时初始赋值
      this.isDefault = false
      return defaultActiveKey
    }else if(!this.isDefault) { //初始过后
      const { activeKey } = this.state
      return activeKey
    }else { // 默认为第一个可见的tabPane 为选中状态
      const childrenChecedkList = children.filter(e=>e.props.check ? e.props.check() : true )
      const [ first ] = childrenChecedkList
      if(first.type === TabPane){
        return first.key
      }
      return ''
    }
  }
  render (){
    const { children, onChange, defaultActiveKey, ...other } = this.props
    const { activeKey } = this.state
    return (<Tabs onChange={this.onChange} activeKey={activeKey} { ...other}>
      {children.filter(e=>e.props.check ? e.props.check() : true )}
    </Tabs>)
  }
}
CustomTabs.TabPane = TabPane
export default withRouter(CustomTabs)
