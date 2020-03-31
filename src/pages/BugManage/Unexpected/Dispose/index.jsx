import React, { Component } from 'react'
import Dispose from '@c/BugManage/Dispose'

class UnexpectedDispose extends Component {
  constructor (props) {
    super(props)
    this.state = {

    }
  }
  componentDidMount () {

  }
  render () {
    const config = {
      from: 'bug',
      userParam: {
        flowId: 2,
        flowNodeTag: 'vul_repair'
      },
      //漏洞模块类型:1突发漏洞管理，2漏洞信息管理
      vulModuleType: '1',
      detailUrl: 'vulnDetail',
      listUrl: 'listAssetByVulId',
      neglectUrl: 'innerUpdateStatus',
      submitUrl: 'vulRepaireSubmit'
    }
    return <Dispose {...config} />
  }
}

export default UnexpectedDispose