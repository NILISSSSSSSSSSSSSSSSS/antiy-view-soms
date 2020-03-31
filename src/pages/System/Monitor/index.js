import { Component } from 'react'
import { connect } from 'dva'
import { Tabs  } from 'antd'
import Overview from './Overview'
import Rule from './Rule'
import './style.less'
import hasAuth from '@/utils/auth'
import { evalSearchParam, updateTabsState } from '@/utils/common'
import { systemPermission } from '@a/permission'

const TabPane = Tabs.TabPane

class Monitor extends Component{
  constructor (props){
    super(props)
    this.state = {
      tabActiveKey: '1',
      status: null
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
  tabChange = (key) => {
    this.setState({
      tabActiveKey: key
    }, ()=>{
      this.saveItemKey()
      if(Number(key)){
        this.Overview.getList(1, 10)
      }else{
        this.Rule.getList(1, 10)
      }
    })
  }
  //保留当前选项
  saveItemKey = ()=>{
    let { tabActiveKey } = this.state
    updateTabsState(tabActiveKey, this.props.history)
  }

  render (){
    let { tabActiveKey } = this.state
    return(
      <div className="main-table-content system-monitor">
        <Tabs activeKey={ tabActiveKey } onChange={this.tabChange}>
          {hasAuth( systemPermission.sysMonitorOverview ) ? <TabPane tab="系统运行监测概览" key="1">
            <Overview children={(now) => this.Overview = now} parent= {this} saveItemKey={this.saveItemKey} />
          </TabPane> : null
          }
          {hasAuth( systemPermission.sysMonitorRule ) ? <TabPane tab="系统运行监测规则" key="0">
            <Rule children={(now) => this.Rule = now} parent= {this} saveItemKey={this.saveItemKey}/>
          </TabPane> : null
          }
        </Tabs>
      </div>
    )
  }
}

export default connect()(Monitor)
