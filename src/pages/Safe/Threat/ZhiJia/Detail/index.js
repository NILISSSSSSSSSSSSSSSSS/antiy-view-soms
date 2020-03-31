import { Component } from 'react'
import { connect } from 'dva'
import api from '@/services/api'
import {  analysisUrl, flowSwitch, timeStampToTime } from '@/utils/common'
import DetailFiedls from '@/components/common/DetailFiedls'

class ZhiJiaDetail extends Component {
  constructor (props) {
    super(props)
    this.state = {
      info: {},
      equipInfo: {},
      fileinfo: {}
    }
  }
  componentDidMount () {
    this.getDetail()
  }
  render () {
    let { info, equipInfo, fileinfo } = this.state
    const equBaseInfo = [
      { name: '名称', key: 'name' },
      { name: '编号', key: 'number' },
      { name: 'IP地址', key: 'ip' },
      { name: 'MAC地址', key: 'mac' },
      { name: '所属区域', key: 'area' },
      { name: '分组', key: 'assetGroup', overFlow: 'visible' },
      { name: '使用者', key: 'responsibleUserName' } ]
    const terminalBaseInfo = [
      { name: '名称', key: 'name' },
      { name: '编号', key: 'number' },
      { name: 'IP地址', key: 'ip' },
      { name: 'MAC地址', key: 'mac' },
      { name: '操作系统', key: 'os' },
      { name: '所属区域', key: 'area' },
      { name: '分组', key: 'assetGroup', overFlow: 'visible' },
      { name: '使用者', key: 'responsibleUserName' } ]
    const theartBaseInfo = [
      { name: '病毒名', key: 'virusName' },
      { name: '文件名', key: 'fileName' },
      { name: '文件路径', key: 'fileUrl' },
      { name: '中毒时间', key: 'threatEventTime', render: (threatEventTime)=> timeStampToTime(threatEventTime), showTips: false },
      { name: '文件大小', key: 'fileSize', render: (fileSize)=> flowSwitch(fileSize, 'GB'), showTips: false }]
    return (
      <div className="main-detail-content">
        <p className="detail-title">安全设备信息</p>
        <div className="detail-content">
          <DetailFiedls fields={equBaseInfo} data={equipInfo}/>
        </div>
        <p className="detail-title">终端信息</p>
        <div className="detail-content">
          <DetailFiedls fields={terminalBaseInfo} data={info}/>
        </div>
        <p className="detail-title">威胁文件</p>
        <div className="detail-content">
          <DetailFiedls fields={theartBaseInfo} data={fileinfo}/>
        </div>
        {/* <div className="Button-center back-btn">
          <Button type="primary" ghost onClick={this.goBack} >返回</Button>
        </div> */}
      </div>
    )
  }
  goBack = ()=>{
    this.props.history.goBack()
  }
  getDetail = ()=>{
    let primaryKey = analysisUrl(this.props.location.search).primaryKey
    // 获取威胁文件信息
    api.getsafetythreatFile({ primaryKey }).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          fileinfo: response.body || {}
        })
      }
    })
    //获取威胁终端信息
    api.getsafetyterminalInfo({ primaryKey }).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          info: response.body || {}
        })
      }
    })
    //获取威胁关联的安全设备信息
    api.getThreatEquipmentQueryById({ primaryKey }).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          equipInfo: response.body || {}
        })
      }
    })
  }
}

export default connect()(ZhiJiaDetail)
