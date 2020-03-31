import React, { Component } from 'react'
import { Tabs } from 'antd'
import RepairByVul from './RepairByBug'
import RepairByAsset from './RepairByAssets'
import RepairByUnexpected from './RepairByUnexpected'
import { analysisUrl } from '@u/common'

const TabPane = Tabs.TabPane

class BugRepair extends Component {
  constructor (props) {
    super(props)
    this.state = {
      defaultActiveKey: '1',
      key: analysisUrl(props.location.search).status,
      id: analysisUrl(props.location.search).id
    }
  }

  componentDidMount () {

  }
  render () {
    const { defaultActiveKey, key } = this.state
    const currentKey = key || defaultActiveKey
    return (
      <div className="main-table-content">
        <Tabs defaultActiveKey={currentKey} onChange={this.tabChange}>
          <TabPane tab="资产维度" key="1" forceRender>
            <RepairByAsset />
          </TabPane>
          <TabPane tab="漏洞维度" key="2" forceRender>
            <RepairByVul />
          </TabPane>
          <TabPane tab="突发漏洞" key="3" forceRender>
            <RepairByUnexpected />
          </TabPane>
        </Tabs>
      </div>
    )
  }

  tabChange = (key) => {
    const { id } = this.state
    let url = `/bugpatch/bugmanage/dispose?status=${key}`
    if (id) {
      url += `&id=${id}`
    }
    this.props.history.push(url)
  }
}

export default BugRepair
