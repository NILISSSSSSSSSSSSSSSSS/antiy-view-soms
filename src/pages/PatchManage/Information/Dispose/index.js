import React, { Component } from 'react'
import Dispose from '@c/BugManage/Dispose'

class InformationDispose extends Component {
  constructor (props) {
    super(props)
    this.state = {

    }
  }
  componentDidMount () {

  }
  render () {
    const config = {
      from: 'patch',
      userParam: {
        flowId: 1,
        flowNodeTag: 'patch_install'
      },
      detailUrl: 'getPatchInfos',
      listUrl: 'getPatchDisposeList',
      neglectUrl: 'ignorePatchDisposeTask',
      submitUrl: 'postPatchDisposeTask'
    }
    return <Dispose {...config} />
  }
}

export default InformationDispose