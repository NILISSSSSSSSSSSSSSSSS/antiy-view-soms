import { Component } from 'react'
import { connect } from 'dva'
import { Popover, Steps, Row, Col, Form, Table, Pagination, Tooltip, Button } from 'antd'
import { Link } from 'dva/router'
import './style.less'
import moment from 'moment'
import { analysisUrl, transliteration, emptyFilter, evalSearchParam, cacheSearchParameter, download } from '@/utils/common'
import hasAuth from '@/utils/auth'
import api from '@/services/api'
const { Step } = Steps

const auditRankArray = ['紧急', '重要', '次要', '提示']
const auditUserArray = ['漏洞告警', '补丁告警', '配置告警', '威胁事件告警', '安全设备性能告警', '安全运维服务性能告警', '异常资产告警']
const span = { xxl: 6, xl: 8 }

class WorkOrderDetail extends Component {
  constructor (props) {
    super(props)
    this.state = {
      workOrderDetail: {
        workNumber: '',
        name: '',
        workLevel: '',
        orderType: '',
        orderSource: '',
        content: '',
        orderStatus: '',
        orderStatusName: '',
        relatedSourceId: '',
        createUser: '',
        executeUserId: '',
        executeUserName: '',
        startTime: '',
        endTime: '',
        actualStartTime: null,
        actualEndTime: null,
        gmtCreate: ''
      },
      workOrderScheduleVOList: [],
      workOrderStatusLogList: [],
      workOrderAttachmentDetailList: [],
      alarmList: [],
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      columns: [
        {
          title: '告警名称',
          key: 'alarmName',
          dataIndex: 'alarmName',
          render: text => {
            return (
              emptyFilter(text)
            )
          }
        },
        {
          title: '告警级别',
          dataIndex: 'alarmLevel',
          key: 'alarmLevel',
          render: (text, scope) => {
            return (<span>{auditRankArray[Number(text) - 1]}</span>)
          }
        },
        {
          title: '告警类型',
          dataIndex: 'alarmType',
          key: 'alarmType',
          render: (text, scope) => {
            return (<span>{auditUserArray[Number(text) - 1]}</span>)
          }
        },
        {
          title: '告警状态',
          dataIndex: 'currentStatus',
          key: 'currentStatus',
          render: (text, scope) => {
            if (scope.history) // 历史告警
              return (<span>{
                ['', '未确认已清除', '已确认已清除', '已恢复'][text]
              }</span>)
            else // 当前告警
              return (<span>{
                ['', '未确认未清除', '已确认未清除'][text]
              }</span>)
          }
        },
        {
          title: '告警来源',
          dataIndex: 'alarmSource',
          key: 'alarmSource',
          render: (text, scope) => {
            switch (scope.alarmType) {
              case (1):
              case (2):
              case (3):
                return (<Link to={`/asset/manage/detail?id=${transliteration(scope.assetId)}`}>{text}</Link>)
              case (5):
                return (<Link to={`/safe/equipment/detail?id=${transliteration(scope.assetId)}`}>{text}</Link>)
              default:
                return (
                  <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
                    <span>{text}</span>
                  </Tooltip>
                )
            }
          }
        },
        {
          title: '操作',
          render: (text, scope) => {
            return (
              <div className="operate-wrap" >
                {
                  hasAuth('logalarm:alarm:alarm:dq:ckxq') ? <Link to={`/logalarm/alarm/manage/details?id=${transliteration(scope.assetId)}&key=${scope.history ? '2' : '1'}&asset=${transliteration(scope.stringId)}`}>查看</Link> : null
                }
              </div>
            )
          }
        }
      ]
    }
  }
  componentDidMount () {
    let workOrderId = analysisUrl(this.props.location.search).workOrderId
    let payload = {
      primaryKey: workOrderId
    }
    this.props.dispatch({ type: 'workOrderDetailInfo/query', payload })
    //判断是否存有数据
    if (sessionStorage.searchParameter) {
      //解析保留的数据
      const { list } = evalSearchParam(this, null, false) || {}
      if (list) {
        this.setState({
          pagingParameter: list[0].page
        }, () => {
          this.getAlarmList()
        })
      } else {
        this.getAlarmList()
      }
    } else {
      this.getAlarmList()
    }
  }
  UNSAFE_componentWillReceiveProps (nextData) {
    this.setState({
      workOrderDetail: nextData.workOrderDetail,
      workOrderScheduleVOList: nextData.workOrderScheduleVOList,
      workOrderStatusLogList: nextData.workOrderStatusLogList,
      workOrderAttachmentDetailList: nextData.workOrderAttachmentDetailList
    })
  }

  render () {
    let current = 0
    const list = this.state.workOrderScheduleVOList
    list.forEach((item, index) => {
      if (item.workOrderScheduleStatus === 'process') {
        current = index
        return
      }
    })
    const { workOrderDetail, alarmList, columns, pagingParameter } = this.state
    const progressDot = (dot, { status, index }) => {
      const dotInfo = list[index]
      let continued = ''
      let last = ''
      if (index >= 1) {
        const previousTime = list[index - 1].gmtCreate
        const thisTime = list[index].gmtCreate
        continued = thisTime - previousTime
        let days = Math.floor(continued / (24 * 3600 * 1000))
        //计算出小时数
        let leave1 = continued % (24 * 3600 * 1000)    //计算天数后剩余的毫秒数
        let hours = Math.floor(leave1 / (3600 * 1000))
        //计算相差分钟数
        let leave2 = leave1 % (3600 * 1000)        //计算小时数后剩余的毫秒数
        let minutes = Math.floor(leave2 / (60 * 1000))
        last = `${days}天${hours}小时${minutes}分钟`
      }
      const content = (
        <div className="popover-content">
          <p className="modified-username">{dotInfo.modifiedUserName}</p>
          {continued && <p className="time">耗时：{last}</p>}
        </div>
      )
      return (
        dotInfo.workOrderScheduleStatus !== 'wait'
          ?
          <Popover trigger="hover" content={content} >
            {dot}
          </Popover>
          : dot
      )
    }
    return (
      <div className="main-detail-content main-table-content">
        {/* <h2 className="page-title">工单详情</h2> */}
        <p className="detail-title">处理进度</p>
        <div className="step-wrap schedule-steps">
          <Steps className="detail-step-horizontal" progressDot={progressDot} current={current}>
            {this.state.workOrderScheduleVOList.map(item => (
              <Step
                title={item.historyStatusName}
                key={item.historyStatus}
                description={<div className="work-order-detail-step-horizontal">{item.modifiedUserName}<br />{item.gmtCreate === undefined ? '' : moment(item.gmtCreate).format('YYYY-MM-DD HH:mm:ss')}</div>}
              />))
            }
          </Steps>
        </div>
        <p className="detail-title">工单信息</p>
        {workOrderDetail && <div className="detail-content" style={{ padding: '50px 40px 30px' }}>
          <p className="detail-content-title">
            <b>{workOrderDetail.name}</b>
            <label>{workOrderDetail.orderStatusName}</label>
          </p>
          <Row>
            <Col {...span}><span className="detail-content-label">创建人：</span>{workOrderDetail.createUser}</Col>
            <Col {...span}><span className="detail-content-label">创建时间：</span>{moment(workOrderDetail.gmtCreate).format('YYYY-MM-DD HH:mm:ss')}</Col>
            <Col {...span}><span className="detail-content-label">工单编号：</span>{workOrderDetail.workNumber}</Col>
            <Col {...span}><span className="detail-content-label">工单类型：</span>{workOrderDetail.orderType}</Col>
            <Col {...span}><span className="detail-content-label">工单级别：</span>{workOrderDetail.workLevel}</Col>
            <Col {...span}><span className="detail-content-label">预计开始时间：</span>{moment(workOrderDetail.startTime).format('YYYY-MM-DD HH:mm:ss')}</Col>
            <Col {...span}><span className="detail-content-label">预计结束时间：</span>{moment(workOrderDetail.endTime).format('YYYY-MM-DD HH:mm:ss')}</Col>
            <Col {...span}><span className="detail-content-label">开始时间：</span>{workOrderDetail.actualStartTime ? moment(workOrderDetail.actualStartTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</Col>
            <Col {...span}><span className="detail-content-label">结束时间：</span>{workOrderDetail.actualEndTime ? moment(workOrderDetail.actualEndTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</Col>
          </Row>
          <Row>
            <Col><span className="detail-content-label">工单内容：</span>{workOrderDetail.content}</Col>
          </Row>
          {/* 相关附件下载 */}
          {this.state.workOrderAttachmentDetailList.length ?
            <div className="attachment-download">
              <p className="detail-content-title"><b>相关附件下载</b></p>
              <div className="detail-attachment">
                {
                  this.state.workOrderAttachmentDetailList.map(item => (
                    <a onClick={() => { download('/api/v1/routine/workOrderAttachment/download/id', { primaryKey: item.stringId }) }}>
                      <div className="detail-attachment-item" title="" key={item.id}>
                        <img src={require('@/assets/download.svg')} className="download-icon" alt="" />
                        <p className="detail-attachment-item-title">{item.fileName}</p>
                        <div className="detail-attachment-item-info">
                          {/* <p className="detail-attachment-item-info-size">{(item.fileSize / 1024).toFixed(0)} KB</p> */}
                        </div>
                      </div>
                    </a>
                  ))
                }
              </div>
            </div> : null
          }
        </div>}
        {alarmList.totalRecords ? <p className="detail-title">关联告警</p> : null}
        {alarmList.totalRecords ?
          <div className="table-wrap">
            <Table rowKey="stringId" columns={columns} dataSource={alarmList.items} pagination={false} />
            <Pagination
              current={pagingParameter.currentPage}
              pageSize={pagingParameter.pageSize}
              className="table-pagination"
              total={alarmList.totalRecords}
              showTotal={(total) => `共 ${total || 0} 条数据`}
              showSizeChanger={false} showQuickJumper={true}
              onChange={this.changePage}
              onShowSizeChange={this.changePageSize} />
          </div>
          : null
        }
        <p className="detail-title">历史记录</p>
        <div className="step-wrap">
          <Steps className="work-order-detail-step-vertical" progressDot direction="vertical" current={this.state.workOrderStatusLogList.length}>
            {
              this.state.workOrderStatusLogList.map(item => (
                <Step title={item.modifiedUserName + ' ' + item.historyOperation + ' ' + moment(item.gmtCreate).format('YYYY-MM-DD HH:mm:ss')} key={item.historyStatus}
                  description={<div className="work-order-detail-step-horizontal"><br />
                    {item.historyStatus === 1 && item.closedReason ? '不同意关闭，原因：' + item.closedReason : ''}
                    {item.historyStatus === 3 || item.historyStatus === 4 ? '反馈结果：' + item.feedback : ''}
                    {item.historyStatus === 5 ? '拒绝接收，原因：' + item.rejectReason : ''}
                    {item.historyStatus === 6 ? '关闭，原因：' + item.closedReason : ''}
                  </div>} />))
            }
          </Steps>
        </div>
        <div className='Button-center back-btn'>
          {/* <Button type='primary' ghost onClick={this.props.history.goBack}> 返回 </Button> */}
        </div>
      </div>
    )
  }

  getAlarmList = () => {
    const values = {
      ...this.state.pagingParameter,
      primaryKey: analysisUrl(this.props.location.search).workOrderId
    }
    api.getWorkOrderDetailAlarmList(values).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          alarmList: response.body
        })
      }
    })
  }
  //分页
  pageModify = (pageSize, currentPage) => {
    this.setState({
      pagingParameter: {
        pageSize,
        currentPage
      }
    }, () => {
      const { pagingParameter } = this.state
      cacheSearchParameter([{
        page: pagingParameter,
        parameter: {}
      }], this.props.history, 0)
      this.getAlarmList()
    })
  }
  changePageSize = (currentPage, pageSize) => {
    this.pageModify(pageSize, currentPage)
  }
  changePage = (currentPage) => {
    const pageSize = this.state.pagingParameter.pageSize
    this.pageModify(pageSize, currentPage)
  }
}

const mapStateToProps = ({ workOrderDetailInfo }) => {
  let ret = { workOrderDetail: workOrderDetailInfo.workOrderDetail, workOrderScheduleVOList: workOrderDetailInfo.workOrderScheduleVOList, workOrderStatusLogList: workOrderDetailInfo.workOrderStatusLogList, workOrderAttachmentDetailList: workOrderDetailInfo.workOrderAttachmentDetailList }
  //this.setState(ret)
  return ret
}

const WorkOrderDetailInfoForm = Form.create()(WorkOrderDetail)

export default connect(mapStateToProps)(WorkOrderDetailInfoForm)
