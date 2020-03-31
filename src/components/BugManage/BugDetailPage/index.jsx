import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { analysisUrl } from '@u/common'
import BugDetail from '@c/BugManage/BugDetail'
import BugTabsDetailAndChange from '@c/BugManage/BugTabsDetailAndChange'
import CatgoryList from '@c/BugManage/CatgoryList'
import api from '@/services/api'
import '@/pages/BugManage/index.less'

@withRouter
class BugDetailPage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      number: analysisUrl(props.location.search).number,
      id: analysisUrl(this.props.location.search).id,
      detailData: {}
    }
  }

  componentDidMount () {
    this.getDetail()
  }

  render () {
    const { detailData, id, number } = this.state
    return (
      <div className="main-detail-content bug-detail">
        <div className="bug-detail-box">
          <p className="bug-title">漏洞信息</p>
          <BugDetail detailData={detailData} />
        </div>
        <div className="detail-catgory-list">
          <CatgoryList  type="detail" showSizeChanger={false} listData={detailData.vulnCpeResponseList || []} />
        </div>
        <BugTabsDetailAndChange props={{ type: 'detail', from: 'bug', id, number }} />
      </div>
    )
  }

  //获取详情和修复建议
  getDetail = () => {
    api.vulnDetail({
      antiyVulnId: this.state.number
    }).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          detailData: response.body || {}
        })
      }
    })
  }
}

export default BugDetailPage
