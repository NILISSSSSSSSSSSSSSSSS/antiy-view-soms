import { Component } from 'react'
import { withRouter } from 'react-router-dom'
import PatchDetail from '@c/PatchManage/PatchDetail'
import AppendixDetailAndChange from '@/components/PatchManage/AppendixDetailAndChange'
import PatchTabsDetailAndChange from '@/components/PatchManage/PatchTabsDetailAndChange'

import api from '@/services/api'
import { analysisUrl } from '@u/common'
import './style.less'

@withRouter
class InstallPatch extends Component {
  constructor (props) {
    super(props)
    this.state = {
      params: analysisUrl(this.props.location.search),
      detail: {}
    }
  }

  componentDidMount () {
    this.getDetail()
  }

  //获取详情信息
  getDetail = () => {
    const { params } = this.state
    api.getPatchInfos({ antiyPatchNumber: params.id }).then(data => {
      this.setState({ detail: data.body })
    })
  }
  render () {
    let { detail, params } = this.state
    return (
      <article className='patch-detail-info patch-exigency-edit'>
        <div className="patch-detail-box">
          <PatchDetail detail={detail} />
        </div>
        <div className='accessory-info' style={{ marginTop: '30px' }}>
          <AppendixDetailAndChange type='detail' adjunct={(now) => this.adjunct = now} />
        </div>
        <PatchTabsDetailAndChange
          props={{
            type: 'detail',
            from: 'patch',
            id: params.id
          }} />
      </article>)
  }
}

export default InstallPatch