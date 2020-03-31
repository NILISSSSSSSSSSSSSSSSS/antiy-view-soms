
import { Component, Fragment } from 'react'
import { connect } from 'dva'
import { Row, Col, Form, Steps, Table, Tooltip } from 'antd'
import moment from 'moment'
// import { Link } from 'dva/router'
import api from '@/services/api'
import { analysisUrl } from '@/utils/common'
import './style.less'
const { Step } = Steps
const auditRankArray = ['紧急', '重要', '次要', '提示']
const auditUserArray = ['', '漏洞告警', '补丁告警', '配置告警', '威胁事件告警', '安全设备性能告警', '安全运维服务性能告警', '异常资产告警']//2实际已被取消（现在是占位）
//需要包含assetNumber的
const alarmTypeArrNum = [ 6, 7]
//不需要包含assetNumber的
const alarmTypeArr = [1, 3, 5]

class AlarmManageDetails extends Component{
  constructor (props){
    super(props)
    this.state = {
      list: this.props.list,
      reasonMore: 0, //原因更多判断条件
      threatEventList: {}, //智甲探海数据
      assetData: {}, //影响资产数据
      columns: [{
        title: '操作人员',
        dataIndex: 'operaterName',
        key: 'operaterName',
        render: (text)=>{
          return(
            <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
              <span>{text}</span>
            </Tooltip>
          )
        }
      }, {
        title: '操作时间',
        dataIndex: 'operatrTime',
        key: 'operatrTime',
        width: 200,
        render: (text) => { return (<span className="tabTimeCss">{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>)}
      }, {
        title: '变更项',
        dataIndex: 'changeType',
        key: 'changeType',
        render: (text)=>{
          return (<span>{['', '告警级别', '告警名称'][text]}</span>)
        }
      }, {
        title: '更新内容',
        dataIndex: 'changeContent',
        key: 'changeContent',
        render: (text, scope)=>{
          if(scope.changeType === 1)
            return( <span>{auditRankArray[Number(text) - 1]}</span> )
          else
            return( <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}> <span>{text}</span> </Tooltip>)
        }
      }]
    }
  }
  componentDidMount () {
    let init = analysisUrl(this.props.location.search)
    if(init.key === '1'){
      this.props.dispatch({ type: 'Alarms/getNowAlarmDetails', payload: { assetId: init.id, stringId: init.asset }  })
    }  else {
      this.props.dispatch({ type: 'Alarms/getHistoryAlarmDetails', payload: {  assetId: init.id, stringId: init.asset }  })
    }
  }
  componentWillUnmount () {
    this.props.dispatch({ type: 'Alarms/save', payload: { alarmDetailsList: {} } })
  }
  //更新状态
  UNSAFE_componentWillReceiveProps (nextProps) {
    if(JSON.stringify(this.props.list) !== JSON.stringify(nextProps.list)) {
      this.setState({ list: nextProps.list }, () => {
        //智甲、探海
        this.getThreatEventData()
        if((alarmTypeArrNum.includes(this.props.list.alarmType) && this.props.list.assetNumber !== '') || alarmTypeArr.includes(this.props.list.alarmType)){
          this.getAssetList()
        }
      })
    }
  }
  //资产详情
  getAssetList = () =>{
    api.getAssetHardWareById({ primaryKey: this.props.list.assetId }).then(response => {
      this.setState({
        assetData: response.body.asset
      })

    })
  }
  getThreatEventData = () =>{
    //探海
    if(this.state.list.deviceType === 'PTD'){
      api.getsafetythreattanhaiByid({ primaryKey: this.state.list.threatEventId }).then(response => {
        this.setState({
          threatEventList: response.body
        })
      })
    }
    //智甲
    if(this.state.list.deviceType === 'IEP'){
      if(this.state.list.alarmCode === 1010010){
        api.getsafetythreataptByid({ primaryKey: this.state.list.threatEventId }).then(response => {
          if (response && response.head && response.head.code === '200') {
            this.setState({
              threatEventList: response.body
            })
          }
        })
      }else{
        api.getsafetythreatFile({ primaryKey: this.state.list.threatEventId }).then(response => {
          if (response && response.head && response.head.code === '200') {
            this.setState({
              threatEventList: response.body
            })
          }
        })
      }
    }
  }

  render () {
    let { columns, list, threatEventList, assetData, reasonMore } = this.state
    let { workOrderScheduleVOList } = list
    let current = 0
    if(workOrderScheduleVOList){
      workOrderScheduleVOList.forEach((item, index)=>{
        if(item.workOrderScheduleStatus === 'process'){
          current = index
        }
      })
    }
    let init = analysisUrl(this.props.location.search)
    const span = { xxl: 6, xl: 8 }
    const blockSpan = { xxl: 24, xl: 24 }
    return(
      <div className="main-detail-content alarm-manage-details">
        <p className="detail-title">告警信息</p>
        <div className="detail-content detail-content-layout">
          <Row>
            <Col {...span}><span className="detail-content-label">告警名称：</span>{list.alarmName}</Col>
            <Col {...span}><span className="detail-content-label">告警来源：</span>{list.alarmSource}</Col>
            <Col {...span}><span className="detail-content-label">告警类型：</span>{auditUserArray[list.alarmType]}</Col>
            <Col {...span}><span className="detail-content-label">告警级别：</span>{auditRankArray[list.alarmLevel - 1]}</Col>
            <Col {...span}><span className="detail-content-label">告警次数：</span>{list.alarmCount}</Col>
            <Col {...span}><span className="detail-content-label">当前状态：</span>{
              init.key === '1' ? (
                ['', '未确认未清除', '已确认未清除'][list.currentStatus]) : (
                ['', '未确认已清除', '已确认已清除'][list.currentStatus])}</Col>
            <Col {...span}><span className="detail-content-label">告警创建时间：</span>{moment(list.createTime).format('YYYY-MM-DD HH:mm:ss')}</Col>
            <Col {...span} style={{ display: init.key === '1' ? 'none' : 'inline-block' }}>
              <span className="detail-content-label">告警清除时间：</span>
              { init.key === '1' ? '' : moment(list.clearTime).format('YYYY-MM-DD HH:mm:ss') }</Col>
            {
              analysisUrl(this.props.location.search).key !== '1' ? (
                <Col {...span}><span className="detail-content-label">清除人员：</span>{list.clearUserName}</Col>
              ) : null
            }
            <Col><span className="detail-content-label">告警编号：</span>{list.alarmNumber}</Col>
            <Col {...blockSpan}>
              <span className="detail-content-label">告警原因：</span>
              {list.reason && list.reason.length >= 200 && reasonMore === 0 ?
                <span style={{ flexShrink: 1 }}>{list.reason.substring(0, 200)}<span style={{ marginLeft: '5px' }}><a onClick={() =>this.setState({ reasonMore: 1 })}>更多</a></span></span>
                : list.reason && list.reason.length >= 200 && reasonMore === 1 ?
                  <span style={{ flexShrink: 1 }}>{list.reason}<span><a style={{ marginLeft: '5px' }} onClick={() =>this.setState({ reasonMore: 0 })}>收起</a></span></span>
                  : <Fragment>{list.reason}</Fragment>}</Col>
            <Col {...blockSpan}><span className="detail-content-label">对系统的影响：</span>{list.influence}</Col>
            <Col {...blockSpan}><span className="detail-content-label">告警处理建议：</span>{list.suggestion}</Col>
          </Row>
        </div>
        {
          // 威胁事件告警显示
          //(威胁事件告警&&设备类型为智甲)||(威胁事件告警时&&设备类型为探海)
          (auditUserArray[list.alarmType] === auditUserArray[4] && list.deviceType === 'IEP') || (auditUserArray[list.alarmType] === auditUserArray[4] && list.deviceType === 'PTD') ? <div> <p className="detail-title">威胁事件信息</p>
            {
              //告警码为 1010010 是 APT威胁 （其实是属于智甲）
              list.alarmCode === 1010010 ?
                <div className="detail-content">
                  <Row>
                    <Col {...span}><span className="detail-content-label">追溯时间：</span>{ threatEventList.threatEventTime ? moment(threatEventList.threatEventTime).format('YYYY-MM-DD HH:mm:ss') : ''}</Col>
                    <Col {...span}><span className="detail-content-label">APT名称：</span>{threatEventList.aptName}</Col>
                    <Col {...span}><span className="detail-content-label">APT版本：</span>{threatEventList.aptVersion}</Col>
                    <Col {...span}><span className="detail-content-label">所属安全设备：</span>{threatEventList.assetName}</Col>
                  </Row>
                </div>
                //智甲
                : list.deviceType === 'IEP' ?
                  <div className="detail-content detail-content-layout">
                    <Row>
                      <Col {...span}><span className="detail-content-label">病毒名：</span>{threatEventList.virusName}</Col>
                      <Col {...span}><span className="detail-content-label">文件名：</span>{threatEventList.fileName}</Col>
                      <Col {...span}><span className="detail-content-label">文件路径：</span>{threatEventList.fileUrl}</Col>
                      <Col {...span}><span className="detail-content-label">文件大小：</span>{threatEventList.fileSize }</Col>
                      <Col {...span}><span className="detail-content-label">中毒时间：</span>{threatEventList.threatEventTime ? moment(threatEventList.threatEventTime).format('YYYY-MM-DD HH:mm:ss') : ''}</Col>
                    </Row>
                  </div>
                  //探海
                  : list.deviceType === 'PTD' ?
                    <div className="detail-content detail-content-layout" >
                      <Row>
                        <Col {...span}><span className="detail-content-label">最后活跃时间：</span>{threatEventList.lastActiveTime ? moment(threatEventList.lastActiveTime).format('YYYY-MM-DD HH:mm:ss') : ''}</Col>
                        <Col {...span}><span className="detail-content-label">源IP：</span>{threatEventList.sourceIp}</Col>
                        <Col {...span}><span className="detail-content-label">原归属地：</span>{threatEventList.sourceLocation}</Col>
                        <Col {...span}><span className="detail-content-label">目的IP：</span>{threatEventList.distinationIp}</Col>
                        <Col {...span}><span className="detail-content-label">目的地归属地：</span>{threatEventList.distinationLocaltion}</Col>
                        <Col {...span}><span className="detail-content-label">源端口：</span>{threatEventList.sourcePort}</Col>
                        <Col {...span}><span className="detail-content-label">目的地端口：</span>{threatEventList.distinationPort}</Col>
                        <Col {...span}><span className="detail-content-label">源流量：</span>{threatEventList.sourceFlow}</Col>
                        <Col {...span}><span className="detail-content-label">目标流量：</span>{threatEventList.distinationFlow}</Col>
                        <Col {...span}><span className="detail-content-label">源包数：</span>{threatEventList.sourcePackage}</Col>
                        <Col {...span}><span className="detail-content-label">目的包数：</span>{threatEventList.distinationPackage}</Col>
                      </Row>
                    </div> : ''
            }</div> : ''
        }
        {
          //影响资产（当告警类型为 (安全运维||异常资产)&&assetNumber || 告警类型为（1,3,5）显示
          ((alarmTypeArrNum.includes(this.props.list.alarmType) && this.props.list.assetNumber !== '') || (alarmTypeArr.includes(this.props.list.alarmType))) &&
            <div>
              <p className="detail-title">影响资产</p>
              <div className="detail-content detail-content-layout">
                <Row>
                  <Col {...span}><span className="detail-content-label">名称：</span>{ assetData ? assetData.name : ''}</Col>
                  <Col {...span}><span className="detail-content-label">ip：</span>{ assetData && assetData.ip ? assetData.ip.map( item => { return item.ip }).join(',') : ''}</Col>
                  <Col {...span}><span className="detail-content-label">MAC：</span>{  assetData && assetData.mac ? assetData.mac.map( item => {return item.mac}).join(',') : ''}</Col>
                  <Col {...span}><span className="detail-content-label">型号：</span>{ assetData ? assetData.categoryModelName : ''}</Col>
                </Row>
              </div>
            </div>
        }
        <p className="detail-title">变更记录</p>
        <div className="table-wrap">
          {/* 列表 */}
          <Table rowKey="operatrTime" columns={columns} dataSource={list.changeList} pagination={false}/>
        </div>
        <p className="detail-title">关联工单</p>
        {
          list.workOrderCode !== '' ?
            <div className="detail-content">
              {/* <Link to={`/workOrder/detail?workOrderId=${transliteration(list.workOrderId)}`}> */}
              <Steps className="detail-step-horizontal" progressDot current={ current }>
                {
                  workOrderScheduleVOList ? workOrderScheduleVOList.map(item => (
                    <Step title={item.historyStatusName} key={item.historyStatus}  description={<div className="work-order-detail-step-horizontal">{item.modifiedUserName}<br />{item.gmtCreate === undefined ? '' : moment(item.gmtCreate).format('YYYY-MM-DD HH:mm:ss')}</div>}/>))
                    : ''
                }
              </Steps>
              {/* </Link> */}
            </div> : <div className="detail-content">此告警无关联工单</div>//没有关联工单的时候
        }
        {
          list.record ? (
            <div>
              <p className="detail-title">操作记录</p>
              <div className="step-wrap">
                <Steps className="detail-step-vertical" progressDot current={list.record.length - 1}   direction="vertical" style={{ padding: '20px 0 0 20px' }}>
                  {
                    list.record.map((item, index) => {
                      return (
                        <Step title={item.status} key={index} description={<div className="detail-step-vertical-desc">
                          <div>
                            <p>
                              {item.changeContent}&nbsp;&nbsp;{moment(item.operatrTime).format('YYYY-MM-DD HH:mm:ss')}<br/>
                              <span>操作人:&nbsp;&nbsp; {item.operaterName}</span>
                            </p>
                          </div>
                        </div>} />
                      )
                    })
                  }
                </Steps>
              </div>
            </div>
          ) : null
        }
        {/* <footer className="Button-center back-btn">
          <Button type="primary" ghost onClick={this.callback }>返回</Button>
        </footer> */}
      </div>
    )
  }

  //取消
  handleCancel = ()=>{
    this.props.form.resetFields()
  }
  //返回上一级
  callback=()=>{
    this.props.history.goBack()
  }
}

const mapStateToProps = ({ Alarms }) => {
  return{
    list: Alarms.alarmDetailsList
  }
}
const AlarmManageDetailss = Form.create()(AlarmManageDetails)
export default connect(mapStateToProps)(AlarmManageDetailss)
