import { Component } from 'react'
import { connect } from 'dva'
import api from '@/services/api'
import {  analysisUrl, flowSwitch, timeStampToTime } from '@/utils/common'
import DetailFiedls from '@/components/common/DetailFiedls'

class TanHaiDetail extends Component {
  constructor (props) {
    super(props)
    this.state = {
      info: {},
      equipInfo: {}
    }
  }
  componentDidMount () {
    this.getDetail()
  }
  render () {
    let { info, equipInfo } = this.state
    const equBaseInfo = [{ name: '设备名称', key: 'name' }, { name: '设备编号', key: 'number' }, { name: '设备IP', key: 'ip' }, { name: '设备所属区域', key: 'area' }, { name: '分组', key: 'assetGroup', overFlow: 'visible' }, { name: '使用者', key: 'responsibleUserName' } ]
    const theartBaseInfo = [
      { name: '最后活跃时间', key: 'lastActiveTime', render: (lastActiveTime)=>timeStampToTime(lastActiveTime) },
      { name: '源IP', key: 'sourceIp' },
      { name: '原归属地', key: 'sourceLocation' },
      { name: '目的IP', key: 'distinationIp' },
      { name: '目的归属地', key: 'distinationLocaltion' },
      { name: '源端口', key: 'sourcePort' },
      { name: '目的端口', key: 'distinationPort' },
      { name: '源流量', key: 'sourceFlow', render: (val) => { return flowSwitch(Number.parseFloat(val) * 1024, 'GB')}  },
      { name: '目标流量', key: 'distinationFlow', render: (val) => { return flowSwitch(Number.parseFloat(val) * 1024, 'GB')} },
      { name: '源包数', key: 'sourcePackage' },
      { name: '目的包数', key: 'distinationPackage' } ]
    return (
      <div className="main-detail-content" >
        <p className="detail-title">安全设备信息</p>
        <div className="detail-content">
          <DetailFiedls fields={equBaseInfo} data={equipInfo}/>
        </div>
        <p className="detail-title">威胁信息</p>
        <div className="detail-content">
          <DetailFiedls fields={theartBaseInfo} data={info}/>
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
  getDetail = () => {
    let id = analysisUrl(this.props.location.search).id
    let primaryKey = analysisUrl(this.props.location.search).primaryKey
    //
    api.getsafetythreattanhaiByid({ primaryKey: primaryKey }).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          info: response.body
        })
      }
    })
    //获取威胁关联的安全设备信息
    api.getThreatEquipmentQueryById({ primaryKey: id }).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          equipInfo: response.body
        })
      }
    })
  }
}

export default connect()(TanHaiDetail)
