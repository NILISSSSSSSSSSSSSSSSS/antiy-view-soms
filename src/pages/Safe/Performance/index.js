import { Component } from 'react'
import { Tabs } from 'antd'
import PerformanceList from './List'
import ThresholdConfig from './ThresholdConfig'
import { replaceURLParam, analysisUrl } from '@/utils/common'
import { safetyPermission } from '@a/permission'
import hasAuth from '@/utils/auth'
import './styles.less'

const TabPane = Tabs.TabPane

export default class Performance extends Component {
  constructor (props) {
    super(props)
    this.xngl = safetyPermission.SAFETY_XN_PER //性能管理
    this.mxzsz = safetyPermission.SAFETY_XN_THRESHOLD //门阀值管理
    this.authList = [{ key: '1', auth: hasAuth(this.xngl) }, { key: '2', auth: hasAuth(this.mxzsz) }]
    this.auth = this.authList.filter((e) => e.auth)
    this.keys = this.auth.map((e) => e.key)
    this.urlParams = analysisUrl(this.props.location.search) || {}
    this.state = {
      // 权限范围内，匹配tabs，如果匹配成功，这显示该tabs，没有匹配成功，这显示当前用户权限内的第一个tabs
      activeKey: (this.auth.filter((e) => e.key === this.urlParams.tabs)[0] || this.auth[0] || {}).key
    }
  }
  tabChange = (activeKey) => {
    this.setState({ activeKey })
    const { history: { location: { pathname, search }, replace } } = this.props
    //替换tabs值
    const url = pathname + replaceURLParam(search, { tabs: activeKey })
    // 使用替换，返回时，不会再当前tabs之间返回，直接返回上一个页面
    replace(url)
  }
  renderTabPaneTitle = (text) => {
    return (
      <div className="performance-manage-pane-title">{text}</div>
    )
  }
  render () {
    const { activeKey } = this.state
    return (
      <div className="main-table-content">
        <Tabs defaultActiveKey={activeKey} onChange={this.tabChange} className="performance-manage" tabBarStyle={{ margin: 0 }}>
          {
            this.keys.includes('1') ?
              <TabPane key="1" tab={this.renderTabPaneTitle('性能管理')} forceRender>
                <div className="performance-manage-content">
                  <PerformanceList />
                </div>
              </TabPane>
              : null
          }
          {
            this.keys.includes('2') ?
              <TabPane key="2" tab={this.renderTabPaneTitle('门限值设置')} forceRender>
                <div className="performance-manage-content performance-manage-config">
                  <ThresholdConfig />
                </div>
              </TabPane>
              : null
          }
        </Tabs>
      </div>
    )
  }
}
