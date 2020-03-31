import React, { Component } from 'react'
import { Tabs } from 'antd'
import Assets from '../Asset'
import Patch from '../Patch'
import { analysisUrl } from '@/utils/common'

const { TabPane } = Tabs

export class InstallList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      defaultActiveKey: '1',
      key: analysisUrl(props.location.search).status
    }
  }
  componentDidMount () {
    const init = analysisUrl(this.props.location.search)
    if (init.status) this.setState({ active: init.status })
  }

  render () {
    const { defaultActiveKey, key } = this.state
    const currentKey = key || defaultActiveKey
    return (
      <article className='patch-install-container'>
        <section>
          <Tabs defaultActiveKey={currentKey} onChange={this.tabChange}>
            <TabPane tab="资产维度" key="1" forceRender>
              <Assets />
            </TabPane>
            <TabPane tab="补丁维度" key="2" forceRender>
              <Patch />
            </TabPane>
          </Tabs>
        </section>
      </article>
    )
  }

  //标签页切换
  activeChange = (active) => {
    this.setState({ active })
  }

  tabChange = (key) => {
    let url = `/bugpatch/patchmanage/install?status=${key}`
    this.props.history.push(url)
  }
}

export default InstallList