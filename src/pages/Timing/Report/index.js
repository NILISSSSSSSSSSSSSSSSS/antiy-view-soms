import { Component } from 'react'
import { connect } from 'dva'
import { Table, Pagination, Modal } from 'antd'
import moment from 'moment'
import { analysisUrl, emptyFilter, cacheSearchParameter, evalSearchParam  } from '@/utils/common'
import api from '@/services/api'
import './style.less'

class TimingReport extends Component {
  constructor (props) {
    super(props)
    this.state = {
      modalVisible: false,
      detail: {
        feedback: ''
      },
      totalRecords: 0,
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      values: {},
      sorts: {
        sortName: undefined,
        sortOrder: undefined
      }
    }
  }
  componentDidMount (){
    //判断是否存有数据
    if(sessionStorage.searchParameter){
      //解析保留的数据
      const { list } = evalSearchParam(this, null, false) || {}
      if(list) {
        this.setState({
          pagingParameter: list[0].page,
          sorts: {
            ...list[0].parameter.sorts
          }
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
  getlist = ()=>{
    const planId = analysisUrl(this.props.location.search).planId
    const { values, pagingParameter } = this.state
    const postParams = {
      ...values
    }
    if (!postParams.orderByField) {
      delete postParams.orderByField
      delete postParams.asc
    }
    if(postParams.sorts) delete postParams.sorts
    api.queryTaskAutomaticWorkList({
      planId,
      ...postParams,
      ...pagingParameter
    }).then(response => {
      if(response && response.head && response.head.code === '200' ){
        this.setState({
          list: response.body.items,
          totalRecords: response.body.totalRecords
        })
      }
    })
  }
  handleTableChange = (pagination, filters, sorter) => {
    const orderByField = sorter.columnKey ? sorter.columnKey : ''
    const asc = orderByField && sorter.order === 'ascend' ? true : false
    const sorterMode = {
      orderByField,
      asc
    }
    this.setState({
      values: {
        ...this.state.values,
        ...sorterMode
      },
      sorts: {
        sortName: sorter.columnKey,
        sortOrder: sorter.order
      }
    }, () => {
      const { pagingParameter, sorts } = this.state
      cacheSearchParameter([{
        page: pagingParameter,
        parameter: { ...this.state.values, sorts }
      }], this.props.history )
      this.getlist()
    })
  }
  //分页
  pageModify = ( pageSize, currentPage) => {
    this.setState({
      pagingParameter: {
        pageSize,
        currentPage
      }
    }, () => {
      const { pagingParameter, sorts } = this.state
      cacheSearchParameter([{
        page: pagingParameter,
        parameter: { sorts }
      }], this.props.history, 0)
      this.getlist()
    })
  }
 changePageSize=( currentPage, pageSize)=>{
   this.pageModify(pageSize, 1)
 }
 changePage=(currentPage)=>{
   const pageSize = this.state.pagingParameter.pageSize
   this.pageModify( pageSize, currentPage)
 }
  // 打开详情弹窗
  modalOpen = (record) => {
    console.log(record)
    this.setState({
      modalVisible: true,
      detail: { ...record }
    })
  }

  // 关闭详情弹窗
  modalClose = () => {
    this.setState({
      modalVisible: false
    })
  }
  render () {
    const { modalVisible, detail, list, totalRecords, pagingParameter, sorts } = this.state
    const columns = [
      {
        title: '执行时间',
        key: 'startTime',
        dataIndex: 'startTime',
        // width: 210,
        sorter: true,
        sortOrder: sorts && sorts.sortName === 'startTime' ? sorts.sortOrder : false,
        render: timestamp => timestamp <= 0 ? '--' : moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: `${this.props.scanNumMapping[analysisUrl(this.props.location.search).executeCommand]}（个）`,
        key: 'scanNum',
        dataIndex: 'scanNum',
        render: text => {
          return (
            emptyFilter(text)
          )
        }
      },
      {
        title: `${this.props.matchNumMapping[analysisUrl(this.props.location.search).executeCommand]}（个）`,
        key: 'matchNum',
        dataIndex: 'matchNum',
        render: text => {
          return (
            emptyFilter(text)
          )
        }
      },
      {
        title: `${this.props.noMatchNumMapping[analysisUrl(this.props.location.search).executeCommand]}（个）`,
        key: 'noMatchNum',
        dataIndex: 'noMatchNum',
        render: text => {
          return (
            emptyFilter(text)
          )
        }
      },
      {
        title: '反馈时间',
        key: 'endTime',
        dataIndex: 'endTime',
        // width: 210,
        sorter: true,
        render: timestamp => timestamp <= 0 ? '--' : moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
      }
    ]
    //如果是资产定时资产探测
    if ( analysisUrl(this.props.location.search).executeCommand === 'ASSET_DISCOVERY' ) {
      columns.splice( 3, 1 )
    }
    return (
      <div className="main-table-content">
        {/* <h2 className="page-title">定时任务报告</h2> */}
        <div className="table-wrap">
          <Table rowKey="id" columns={columns} dataSource={list} pagination={false} onChange={this.handleTableChange}/>
          {
            totalRecords > 0 &&
              <Pagination
                current={pagingParameter.currentPage}
                pageSize={pagingParameter.pageSize}
                className="table-pagination"
                total={totalRecords}
                showTotal={(totalRecords) => `共 ${totalRecords || 0} 条数据`}
                showSizeChanger ={totalRecords > 10}
                showQuickJumper={true}
                onChange={this.changePage}
                onShowSizeChange={this.changePageSize}
              />
          }
        </div>
        <Modal visible={modalVisible} title="报告详情" footer={false} onCancel={this.modalClose}>
          <div>
            <p className="report-detail-result"><span>反馈结果：</span>{detail.feedback}</p>
            <p className="report-detail-title">相关附件：</p>
            <div className="detail-attachment" title="相关附件标题">
              <div className="detail-attachment-item">
                <img src={require('@/assets/download.svg')} className="download-icon" alt=""/>
                <p className="detail-attachment-item-title">相关附件标题</p>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}

export default connect(({ taskPlan }) => ({
  scanNumMapping: taskPlan.scanNumMapping,
  matchNumMapping: taskPlan.matchNumMapping,
  noMatchNumMapping: taskPlan.noMatchNumMapping
}))(TimingReport)