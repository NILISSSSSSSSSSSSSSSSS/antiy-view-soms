
import { Component } from 'react'
import { connect } from 'dva'
import {  Tabs } from 'antd'
import CurrentAlarm from './CurrentAlarm'
import HistoryAlarm from './HistoryAlarm'
import hasAuth from '@/utils/auth'
import { analysisUrl, removeCriteria } from '@/utils/common'
import { logAlarmPermission } from '@a/permission'

const TabPane = Tabs.TabPane
class alarmManage extends Component{
  constructor (props){
    super(props)
    this.state = {
      tabActiveKey: '1'
    }
  }

  componentDidMount (){
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
  }
  render (){
    let {   tabActiveKey } = this.state
    let status = analysisUrl(this.props.location.search).status
    if(status === '2'){
      tabActiveKey =  '2'
    }else if(status === '1'){
      tabActiveKey =  '1'
    }
    return(
      <article className="main-table-content log-manager-list">
        <Tabs activeKey={tabActiveKey} onChange={this.tabChange}>
          {hasAuth(logAlarmPermission.alarmMManageCurrent) ?
            <TabPane tab="当前告警" key='1' forceRender>
              <CurrentAlarm history={this.props.history} children={(now) => this.CurrentAlarm = now} stringId={analysisUrl(this.props.location.search).stringId}/>
            </TabPane> : null
          }
          {hasAuth(logAlarmPermission.alarmMManageHistory) ?
            <TabPane tab="历史告警" key='2' forceRender>
              <HistoryAlarm history={this.props.history} children={(now) => this.HistoryAlarm = now} />
            </TabPane> : null
          }
        </Tabs>
      </article>
    )
  }
  //标签页切换
  tabChange=(key)=>{
    removeCriteria()
    if( key === '1' ){
      this.props.history.push('/logalarm/alarm/manage?status=1')
    } if( key === '2' ){
      this.props.history.push('/logalarm/alarm/manage?status=2')
    }
    this.setState({
      tabActiveKey: key
    })
  }
}

export default connect()(alarmManage)
