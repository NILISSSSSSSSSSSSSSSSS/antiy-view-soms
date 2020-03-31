import React, { Component } from 'react'
import { Message } from 'antd'
import BugChangeForm from '@c/BugManage/BugChangeForm'
import BugTabsDetailAndChange from '@c/BugManage/BugTabsDetailAndChange'
import { analysisUrl, transliteration } from '@u/common'
import { Scan } from '@c'
import '../Register/index.less'
import './index.less'

class Change extends Component {
  constructor (props) {
    super(props)
    this.state = {
      id: analysisUrl(this.props.location.search).id,
      number: analysisUrl(this.props.location.search).number,
      scanVisible: false
    }
  }
  componentDidMount () {

  }
  render () {
    const { scanVisible, id, number } = this.state
    //漏洞扫描
    const scanConfig = {
      scanUrl: 'scannerBugprogress',
      params: {
        scanBusinessId: number
      },
      title: '突发漏洞扫描',
      visible: scanVisible,
      onClose: () => {
        this.setState({
          scanVisible: false
        })
      },
      //后台扫描
      onBackstage: () => {
        this.setState({
          scanVisible: false
        })
        Message.success('操作成功')
        this.props.history.push('/bugpatch/bugmanage/unexpected')
      },
      goTo: () => {
        this.props.history.push(`/bugpatch/bugmanage/unexpected/dispose?number=${transliteration(number)}&id=${transliteration(id)}`)
      }
    }
    return (
      <section>
        <div className="main-detail-content" style={{ paddingBottom: 40 }}>
          <BugChangeForm from={'bug'} />
          <div className="information-register">
            <BugTabsDetailAndChange props={{ type: 'change', from: 'bug', id, number }} />
          </div>
          <div className="scan-fixed">
            <span onClick={this.scaning}></span>
          </div>
        </div>
        {
          scanVisible && <Scan {...scanConfig} />
        }
      </section>
    )
  }

  //扫描
  scaning = () => {
    this.setState({
      scanVisible: true
    })
  }
}

export default Change