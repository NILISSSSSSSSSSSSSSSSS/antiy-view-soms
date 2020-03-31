import React, { Component } from 'react'
import BugList from '@c/BugManage/BugList'
import { analysisUrl } from '@u/common'
import { bugPermission } from '@a/permission'

class InformationList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      id: analysisUrl(this.props.location.search).id
    }
  }

  componentDidMount () {

  }

  render () {
    const { id } = this.state
    const config = {
      from: 'information',
      urlParam: id,
      disposeUrl: '/bugpatch/bugmanage/information/dispose',
      listApi: 'vulHandleInfoList',
      //获取人员需要的参数
      userParam: {
        flowId: 2,
        flowNodeTag: 'vul_repair'
      },
      isDispose: true,
      isNoHandleAssets: true,
      isSelection: true,
      isSubmit: true,
      //查看权限
      checkTag: bugPermission.vulView,
      disposeTag: bugPermission.vulHandle
    }
    return (
      <BugList {...config} />
    )
  }
}

export default InformationList
