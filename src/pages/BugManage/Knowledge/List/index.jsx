import React, { Component } from 'react'
import BugList from '@c/BugManage/BugList'
import { bugPermission } from '@a/permission'

class KnowledgeList extends Component {
  constructor (props) {
    super(props)
    this.state = {

    }
  }

  componentDidMount () {

  }

  render () {
    const config = {
      from: 'knowledge',
      dimension: 1,
      disposeUrl: '/bugpatch/bugmanage/information/dispose',
      listApi: 'queryVulninfoList',
      //查看权限
      checkTag: bugPermission.vulKnowView,
      isSolved: true,
      diffItems: {
        id: 'id',
        name: 'vulnName',
        number: 'vulNo',
        level: 'warnLevel',
        levelStr: 'warnLevelStr'
      },
      //查询接口中不一致的参数
      searchItems: {
        id: 'id',
        name: 'vulnName',
        number: 'antiyVulnId',
        level: 'warnLevel',
        levelStr: 'warnLevelStr'
      }
    }
    return (
      <BugList {...config} className="bug-test" />
    )
  }
}

export default KnowledgeList
