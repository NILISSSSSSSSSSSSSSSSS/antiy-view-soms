import React, { Component } from 'react'
import BugList from '@c/BugManage/BugList'
import { bugPermission } from '@a/permission'

export class DisposetList extends Component {
  constructor (props) {
    super(props)
    this.state = {

    }
  }

  componentDidMount () {

  }

  render () {
    const config = {
      from: 'dispose',
      active: '1',
      dimension: 1,
      disposeUrl: '/bugpatch/bugmanage/dispose/disposebybug',
      listApi: 'queryVul',
      //获取人员需要的参数
      userParam: {
        flowId: 4,
        flowNodeTag: 'config_base'
      },
      isDispose: true,
      isSelection: true,
      isRepair: true,
      //查看权限
      checkTag: bugPermission.vulHandleView,
      disposeTag: bugPermission.vulHandleDeal
    }
    return (
      <BugList {...config} />
    )
  }
}

export default DisposetList
