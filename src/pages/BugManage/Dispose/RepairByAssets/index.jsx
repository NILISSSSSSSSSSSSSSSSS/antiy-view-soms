import React, { Component } from 'react'
import { RepairByAssets } from '@c'
import hasAuth from '@u/auth'
import { bugPermission, assetsPermission } from '@a/permission'

export class UnexpectedDispose extends Component {
  constructor (props) {
    super(props)
    this.state = {

    }
  }
  componentDidMount () {

  }
  render () {
    const config = {
      listUrl: 'queryAsset',
      // assetStringId:  analysisUrl(props.location.search).stringId,
      isCheckShow: hasAuth(assetsPermission.ASSET_INFO_VIEW),
      isDisposeShow: hasAuth(bugPermission.vulHandleView)
    }
    return <RepairByAssets {...config} className="bug-test" />
  }
}

export default UnexpectedDispose