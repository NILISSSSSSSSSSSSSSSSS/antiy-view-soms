import { Component } from 'react'
import { connect } from 'dva'
import { Tabs } from 'antd'
import Basic from './Basic'
import HistoryVersion from './HistoryVersion'
import Warn from './Warn'
import Menace from './Menace'
import { analysisUrl, replaceURLParam } from '@/utils/common'
const TabPane = Tabs.TabPane

class EquipmentDetail extends Component {
  constructor (props) {
    super(props)
    this.urlParams = analysisUrl(this.props.location.search) || {}
    this.activeKey = this.urlParams.tabs
    this.state = {
      body: {},
      activeKey: this.urlParams.tabs || '1',
      categoryModel: this.urlParams.categoryModel
    }
  }

  goBack = () => {
    this.props.history.goBack()
  }
  onChange = (activeKey) => {
    this.setState({ activeKey })
    const { history: { location: { pathname, search }, replace } } = this.props
    //替换tabs值
    const url = pathname + replaceURLParam(search, { tabs: activeKey })
    // 使用替换，返回时，不会再当前tabs之间返回，直接返回上一个页面
    replace(url)
    // replace({
    //   pathname,
    //   search: replaceURLParam(search, { tabs: activeKey }),
    //   state: { rCaches: 1 }
    // })
  }
  render () {
    const { categoryModel, activeKey } = this.state
    const Threat = ['1', '3'] //是否显示威胁
    return (
      <div>
        <Tabs activeKey={activeKey} onChange={this.onChange}>
          <TabPane tab="基本信息" key="1">
            <Basic id={this.urlParams.id} />
          </TabPane>
          <TabPane tab="历史版本信息" key="2">
            <HistoryVersion />
          </TabPane>
          <TabPane tab="告警信息" key="3">
            <Warn />
          </TabPane>
          {Threat.includes(categoryModel) && (
            <TabPane tab="威胁事件" key="4">
              <Menace />
            </TabPane>
          )}
        </Tabs>
      </div>
    )
  }
}
export default connect()(EquipmentDetail)
