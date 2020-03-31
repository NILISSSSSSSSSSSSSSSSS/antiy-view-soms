
import { Component } from 'react'
import { connect } from 'dva'
import { Tabs } from 'antd'
import TanHai from './TanHai'
import ZhiJia from './ZhiJia'
import { analysisUrl } from '@/utils/common'
import { safetyPermission } from '@a/permission'
import hasAuth from '@/utils/auth'

const TabPane = Tabs.TabPane
const zhiJiaTabKey = '0'
const tanHaiTabKey = '1'
class ThreatList extends Component {
  constructor (props) {
    super(props)
    this.zhijia = safetyPermission.SAFETY_WXSJ_ZJ //智甲威胁权限
    this.tanhai = safetyPermission.SAFETY_WXSJ_TH //探海威胁权限
    this.authList = [{ key: zhiJiaTabKey, auth: hasAuth(this.zhijia) }, { key: tanHaiTabKey, auth: hasAuth(this.tanhai) }]
    this.auth = this.authList.filter((e) => e.auth)
    this.keys = this.auth.map((e) => e.key)
    this.state = {
      tabActiveKey: (this.auth[0] || {}).key
    }
  }

  componentDidMount () {
    const { tabs } = analysisUrl(this.props.location.search)
    this.setState({
      tabActiveKey: tabs || '0'
    })
  }
  tabChange = (key) => {
    const { history: { push } } = this.props
    push(`/safe/threat?tabs=${key}`)
    this.setState({
      tabActiveKey: key
    })
  }

  render () {
    const { tabActiveKey } = this.state
    return (
      <div className="main-table-content">
        <Tabs activeKey={tabActiveKey} onChange={this.tabChange}>
          {
            this.keys.includes(zhiJiaTabKey) &&
            <TabPane tab="智甲威胁" key={zhiJiaTabKey} forceRender>
              <ZhiJia />
            </TabPane>
          }
          {
            this.keys.includes(tanHaiTabKey) &&
            <TabPane tab="探海威胁" key={tanHaiTabKey} forceRender>
              <TanHai />
            </TabPane>
          }
        </Tabs>
      </div>
    )
  }
}

export default connect()(ThreatList)
