import { Component } from 'react'
import { connect } from 'dva'
import { Row, Col, Table, LocaleProvider, Pagination, Tooltip } from 'antd'
import zhCN from 'antd/lib/locale-provider/zh_CN'
import { Link } from 'dva/router'
import api from '@/services/api'
import { analysisUrl, transliteration, emptyFilter, cacheSearchParameter, evalSearchParam } from '@/utils/common'
import moment from 'moment'
import './style.less'
const span = { xxl: 6, xl: 8 }

class InspectionReport extends Component {
  constructor (props) {
    super(props)
    this.state = {
      tabActiveKey: '1',
      columns: [
        {
          title: '工单名称',
          key: 'name',
          dataIndex: 'name',
          render: (text) => {
            return (
              <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
                <span>{emptyFilter(text)}</span>
              </Tooltip>
            )
          }
        },
        {
          title: '工单编号',
          key: 'workNumber',
          dataIndex: 'workNumber',
          width: 220,
          render: text => {
            return (
              <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
                <span>{emptyFilter(text)}</span>
              </Tooltip>
            )
          }
        },
        {
          title: '创建时间',
          key: 'gmtCreate',
          dataIndex: 'gmtCreate',
          width: 190,
          render: gmtCreate => {
            return (
              <span className="tabTimeCss">
                {gmtCreate <= 0 ? '--' : moment(gmtCreate).format('YYYY-MM-DD HH:mm:ss')}
              </span>
            )
          }
        },
        {
          title: '结束时间',
          key: 'statusUpdateTime',
          dataIndex: 'statusUpdateTime',
          width: 190,
          // 工单状态为6（关闭）时，显示结束时间
          render: (text, record) => {
            return (
              <span className="tabTimeCss">
                {(text <= 0 || (record.orderStatus !== '6')) ? '--' : moment(text).format('YYYY-MM-DD HH:mm:ss')}
              </span>
            )
          }
        },
        {
          title: '工单状态',
          key: 'orderStatus',
          dataIndex: 'orderStatus',
          render: (orderStatus) => {
            switch (orderStatus) {
              case '1':
                return '待执行'
              case '2':
                return '执行中'
              case '3':
                return '已完成'
              case '4':
                return '未完成'
              case '5':
                return '拒绝接收'
              case '6':
                return '已关闭'
              case '7':
                return '启用'
              default:
                break
            }
          }
        },
        {
          title: '操作',
          key: 'operate',
          render: (record) => {
            return (
              <div className="operate-wrap">
                <Link to={`/routine/workorder/create/detail?workOrderId=${transliteration(record.workOrderId)}`}>查看</Link>
              </div>
            )
          }
        }
      ],
      list: [
        {
          id: 1
        }
      ],
      body: {},
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      }
    }
  }
  componentDidMount () {
    const stringId = analysisUrl(this.props.location.search).id
    api.inspectPlanQueryById({
      primaryKey: stringId
    }).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          body: response.body
        })
      }
    })
    //判断是否存有数据
    if (sessionStorage.searchParameter) {
      //解析保留的数据
      const { list } = evalSearchParam(this, null, false) || {}
      if (list) {
        this.setState({
          pagingParameter: list[0].page
        }, () => {
          this.getlist()
        })
      } else {
        this.getlist()
      }
    } else {
      this.getlist()
    }
  }
  getlist = () => {
    const { pagingParameter } = this.state
    const stringId = analysisUrl(this.props.location.search).id
    api.inspectplanworkQueryList({
      planId: stringId,
      ...pagingParameter
    }).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          list: response.body.items,
          totalRecords: response.body.totalRecords
        })
      }
    })
  }
  render () {
    const { columns, list, body, totalRecords, pagingParameter } = this.state
    return (
      <div className="inspection-report-detail">
        <div className="main-detail-content main-table-content">
          <p className="detail-title">巡检信息</p>
          <div className="detail-content inspection-report-detail-content">
            <Row>
              <Col {...span}><span className="detail-content-label">巡检名称：</span>{body.name}</Col>
              <Col {...span}><span className="detail-content-label">巡检状态：</span>
                {
                  (() => {
                    switch (body.planStatus) {
                      case 'WAITING':
                        return '待执行'
                      case 'RUNNING':
                        return '执行中'
                      case 'COMPLETE':
                        return '已完成'
                      case 'CLOSED':
                        return '已终止'
                      default:
                        break
                    }
                  })()
                }
              </Col>
              <Col {...span}><span className="detail-content-label">巡检周期：</span>
                {
                  (() => {
                    switch (body.orderCycle) {
                      case 'ONCE':
                        return '单次'
                      case 'DAILY':
                        return '每天'
                      case 'WEEKLY':
                        return '每周'
                      case 'MONTH':
                        return '每月'
                      default:
                        break
                    }
                  })()
                }
              </Col>
              <Col {...span}><span className="detail-content-label">巡检开始时间：</span>{moment(body.startTime).format('YYYY-MM-DD HH:mm:ss')}</Col>
              <Col {...span}><span className="detail-content-label">巡检完成时间：</span>{moment(body.endTime).format('YYYY-MM-DD HH:mm:ss')}</Col>
              <Col {...span}><span className="detail-content-label">巡检级别：</span>
                {
                  (() => {
                    switch (body.planLevel) {
                      case 'IMPORTANT':
                        return '重要'
                      case 'URGENT':
                        return '紧急'
                      case 'SECONDARY':
                        return '次要'
                      case 'PROMPT':
                        return '提示'
                      default:
                        break
                    }
                  })()
                }
              </Col>
              <Col {...span}><span className="detail-content-label">巡检执行人员：</span>{body.executeUsername}</Col>
              <Col {...span}><span className="detail-content-label">巡检类型：</span>
                {
                  (() => {
                    switch (body.planType) {
                      case 'ASSETS_INSPECT':
                        return '资产管理'
                      case 'BASELINE_INSPECT':
                        return '配置管理'
                      case 'VUL_PATCH_INSPECT':
                        return '漏洞与补丁管理'
                      case 'LOG_WARN_INSPECT':
                        return '日志与告警管理'
                      case 'DAILY_SAFETY_INSPECT':
                        return '日常安全管理'
                      case 'SAFETY_EQUIPMENT_INSPECT':
                        return '安全设备管理'
                      case 'SYSTEM_MANGER_INSPECT':
                        return '系统管理'
                      case 'OTHER_INSPECT':
                        return '其他'
                      default:
                        break
                    }
                  })()
                }
              </Col>
              <Col {...span}><span className="detail-content-label">预计工单接单天数：</span>{body.expectStartTime && Number(body.expectStartTime) / (24 * 60 * 60 * 1000)}</Col>
              <Col {...span}><span className="detail-content-label">预计工单完成天数：</span>{body.expectRequiredTime && Number(body.expectRequiredTime) / (24 * 60 * 60 * 1000)}</Col>
            </Row>
            <Row>
              <Col><span className="detail-content-label">巡检内容：</span>{body.content}</Col>
            </Row>
            {body.planStatus === 'CLOSED' &&
              <Row>
                <Col {...span}><span className="detail-content-label">终止原因：</span>{body.closedReason}</Col>
              </Row>
            }
          </div>
          <p className="detail-title">巡检报告</p>
          <div className="table-wrap">
            <Table rowKey="id" columns={columns} dataSource={list} pagination={false} />
            <LocaleProvider locale={zhCN}>
              <Pagination
                current={pagingParameter.currentPage}
                pageSize={pagingParameter.pageSize}
                className="table-pagination"
                total={totalRecords}
                showTotal={(total) => `共 ${totalRecords || 0} 条数据`}
                showSizeChanger={totalRecords > 10}
                showQuickJumper={true}
                onChange={this.changePage}
                onShowSizeChange={this.changePageSize}
              />
            </LocaleProvider>
          </div>
        </div>
      </div>
    )
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
      this.getlist()
    })
  }
  changePageSize = (currentPage, pageSize) => {
    this.pageModify(pageSize, 1)
  }
  changePage = (currentPage) => {
    const pageSize = this.state.pagingParameter.pageSize
    this.pageModify(pageSize, currentPage)
  }
}

export default connect()(InspectionReport)
