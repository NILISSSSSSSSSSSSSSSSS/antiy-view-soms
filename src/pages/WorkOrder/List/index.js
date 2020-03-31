
import { Component } from 'react'
import { connect } from 'dva'
import { Tabs } from 'antd'
import CurrentContent from './content'
import hasAuth from '@/utils/auth'
import { routinePermission } from '@a/permission'
import { analysisUrl, removeCriteria } from '@/utils/common'
const TabPane = Tabs.TabPane
const workOrderType = {
  '1': 'todo',
  '2': 'create',
  '3': 'finish'
}
class alarmManage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      tabActiveKey: '1'
    }
  }

  componentDidMount () {
    let status = analysisUrl(this.props.location.search).status || '1'
    this.CurrentContent.initData(workOrderType[status])
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
  }
  render () {
    let { tabActiveKey } = this.state
    let status = analysisUrl(this.props.location.search).status
    if (status) {
      tabActiveKey = status
    } else {
      tabActiveKey = '1'
    }
    return (
      <article className="main-table-content">
        <Tabs activeKey={tabActiveKey} onChange={this.tabChange}>
          {hasAuth(routinePermission.workorderMyundo) ?
            <TabPane tab="我的待办" key='1'>
              <CurrentContent history={this.props.history} keys='1' tabActiveKey={tabActiveKey} menuType={'todo'} children={(now) => this.CurrentContent = now} id={analysisUrl(this.props.location.search).id} />
            </TabPane> : null
          }
          {hasAuth(routinePermission.workorderMycreate) ?
            <TabPane tab="我的发起" key='2'>
              <CurrentContent history={this.props.history} keys='2' tabActiveKey={tabActiveKey} menuType={'create'} children={(now) => this.CurrentContent = now} id={analysisUrl(this.props.location.search).id} />
            </TabPane> : null
          }
          {hasAuth(routinePermission.workorderMydone) ?
            <TabPane tab="我的已办" key='3'>
              <CurrentContent history={this.props.history} keys='3' tabActiveKey={tabActiveKey} menuType={'finish'} children={(now) => this.CurrentContent = now} id={analysisUrl(this.props.location.search).id} />
            </TabPane> : null
          }
        </Tabs>
      </article>
    )
  }
  //标签页切换
  tabChange = (key) => {
    removeCriteria()
    if (key === '1') {
      this.props.history.push('/routine/workorder/todo')
    } else {
      this.props.history.push('/routine/workorder/todo?status=' + key)
    }
    this.setState({
      tabActiveKey: key
    }, () => this.CurrentContent.initData(workOrderType[key]))
  }
}

export default connect()(alarmManage)
