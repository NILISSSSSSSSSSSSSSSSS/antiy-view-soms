import React, { Component } from 'react'
import { connect } from 'dva'
import { Tabs } from 'antd'
import hasAuth from '@/utils/auth'
import { defendPermission } from '@a/permission'
import { analysisUrl, evalSearchParam, updateTabsState } from '@u/common'
import LoginLog from './LoginLog'
import OperateLog from './OperateLog'

const TabPane = Tabs.TabPane

class AuditLog extends Component {
  constructor (props) {
    super(props)
    this.state = {
      tabActiveKey: '1',
      defaultActiveKey: '1',
      id: analysisUrl(props.location.search).id
    }
  }

  componentDidMount () {
    if(sessionStorage.searchParameter){
      let { active } = evalSearchParam(this, null, false)
      if(active)
        this.setState({ tabActiveKey: active })
    }
  }
  componentWillUnmount (){
    sessionStorage.removeItem('searchParameter')
  }
  //保留当前选项
  saveItemKey = ()=>{
    let { tabActiveKey } = this.state
    updateTabsState(tabActiveKey, this.props.history)
  }
  tabChange = (key) => {
    this.setState({
      tabActiveKey: key
    }, ()=>{
      if(Number(key)){
        this.LoginLog.getList(1, 10)
      }else{
        this.OperateLog.getList(1, 10)
      }
    })
  }
  render () {
    const { tabActiveKey } = this.state
    return (
      <div className="main-table-content">
        <Tabs activeKey={ tabActiveKey } onChange={this.tabChange}>
          {hasAuth(defendPermission.PORTAL_LOGIN_LOG) ?
            <TabPane tab="登录日志" key="1" >
              <LoginLog children={(now) => this.LoginLog = now} parent= {this} saveItemKey={this.saveItemKey}/>
            </TabPane> : null
          }
          {hasAuth(defendPermission.PORTAL_OPERATE_LOG) ?
            <TabPane tab="操作日志" key="0" >
              <OperateLog children={(now) => this.OperateLog = now} parent= {this} saveItemKey={this.saveItemKey}/>
            </TabPane> : null
          }
        </Tabs>
      </div>
    )
  }

  // tabChange = (key) => {
  //   const { id } = this.state
  //   let url = `/defend/audit/logList?status=${key}`
  //   if (id) {
  //     url += `&id=${id}`
  //   }
  //   this.props.history.push(url)
  // }
}

// export default AuditLog
export default connect()(AuditLog)
