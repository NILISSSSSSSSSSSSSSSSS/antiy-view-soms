
import { Component } from 'react'
import { connect } from 'dva'
import { Tabs } from 'antd'
import CurrentContent from './content'
import ModelScan from './ModelScan/List/index'
import hasAuth from '@/utils/auth'
import { configPermission } from '@a/permission'
import { analysisUrl, evalSearchParam, updateTabsState } from '@/utils/common'
const TabPane = Tabs.TabPane
class alarmManage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      tabActiveKey: '1'
    }
  }

  componentDidMount () {
    if (sessionStorage.searchParameter) {
      let { active } = evalSearchParam(this, null, false)
      if (active)
        this.setState({ tabActiveKey: active })
    }
  }
  componentWillUnmount () {
    sessionStorage.removeItem('searchParameter')
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
  }
  render () {
    let { tabActiveKey } = this.state
    let isNew = analysisUrl(this.props.location.search).isNew
    if (isNew) {
      tabActiveKey = isNew
    } else {
      tabActiveKey = '1'
    }
    return (
      <article className="main-table-content">
        <Tabs activeKey={tabActiveKey} onChange={this.tabChange}>
          {hasAuth(configPermission.currentBasetemplate) ?
            <TabPane tab="当前模板" key='1'>
              <CurrentContent tabActiveKey={tabActiveKey} isNew={1}
                history={this.props.history}
              />
            </TabPane> : null
          }
          {hasAuth(configPermission.historyBasetemplate) ?
            <TabPane tab="历史模板" key='0'>
              <CurrentContent tabActiveKey={tabActiveKey} isNew={0}
                history={this.props.history}
              />
            </TabPane> : null
          }
          {hasAuth(configPermission.scanBasetemplate) ?
            <TabPane tab="模板扫描" key='2' >
              <ModelScan isNew={2} tabActiveKey={tabActiveKey} history={this.props.history} />
            </TabPane> : null
          }
        </Tabs>
      </article>
    )
  }
  //标签页切换
  tabChange = (key) => {
    this.setState({
      tabActiveKey: key
    }, () => {
      if (Number(key) === 1) {
        this.props.history.push('/basesetting/model')
        updateTabsState(key, this.props.history)
      } else if (Number(key) === 2) {
        this.props.history.push('/basesetting/model?isNew=' + key)
      }
      else {
        this.props.history.push('/basesetting/model?isNew=' + key)
        updateTabsState(key, this.props.history)
      }
    })
  }
}

export default connect()(alarmManage)
