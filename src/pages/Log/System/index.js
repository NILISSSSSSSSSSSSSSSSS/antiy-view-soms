
import { Component } from 'react'
import { connect } from 'dva'
import {  Tabs } from 'antd'
import Equipment from './Equipment'
import Plat from './Plat'
import { analysisUrl, removeCriteria } from '@/utils/common'

const TabPane = Tabs.TabPane
class System extends Component{
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

          <TabPane tab="平台系统日志" key='1' forceRender>
            <Plat history={this.props.history} children={(now) => this.CurrentAlarm = now} stringId={analysisUrl(this.props.location.search).stringId}/>
          </TabPane>
          <TabPane tab="设备运行日志" key='2' forceRender>
            <Equipment history={this.props.history} children={(now) => this.HistoryAlarm = now} />
          </TabPane>

        </Tabs>
      </article>
    )
  }
  //标签页切换
  tabChange=(key)=>{
    removeCriteria()
    if( key === '1' ){
      // this.CurrentAlarm.handleReset()
      this.props.history.push('/logalarm/log/system?status=1')
    } else if( key === '2' ){
      // this.HistoryAlarm.handleReset()
      this.props.history.push('/logalarm/log/system?status=2')
    }
    this.setState({
      tabActiveKey: key
    })
  }
}

export default connect()(System)
