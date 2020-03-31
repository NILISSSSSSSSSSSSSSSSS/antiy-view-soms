
import { Component } from 'react'
import { connect } from 'dva'
import { Form, Table, Pagination } from 'antd'
import { analysisUrl, cacheSearchParameter, evalSearchParam, TooltipFn } from '@/utils/common'
import moment from 'moment'
import Api from '@/services/api'

class LogAuditDetails extends Component{
  constructor (props){
    super(props)
    this.state = {
      list: {},
      pagingParameter: {
        currentPage: 1,
        pageSize: 10
      },
      seekTerm: {},
      sortedInfo: null
    }
  }

  componentDidMount (){
    //解析保留的数据
    const { list } = evalSearchParam(this) || {}
    //判断是否存有数据
    if(sessionStorage.searchParameter && list ){
      const { page, parameter } = list[0]
      this.setState({
        pagingParameter: page,
        sortedInfo: parameter
      }, () => {
        this.getList({ ...page, ...parameter } )
      })
    }else{
      this.getList({ currentPage: 1, pageSize: 10 })
    }
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    this.setState({ list: nextProps.list })
  }

  render (){
    let { list, pagingParameter, sortedInfo } = this.state
    sortedInfo = sortedInfo || {}
    const columns = [
      {
        title: '记录时间',
        dataIndex: 'oprTime',
        key: 'oprTime',
        width: 200,
        sortOrder: sortedInfo.columnKey === 'oprTime' && sortedInfo.order,
        sorter: true,
        render: (text)=>{
          return(<span className="tabTimeCss">{ text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : ''}</span>)
        }
      }, {
        title: '操作用户',
        dataIndex: 'oprName',
        key: 'oprName',
        render: text => TooltipFn(text)
      }, {
        title: '操作人IP',
        dataIndex: 'oprIp',
        key: 'oprIp',
        width: 110
      }, {
        title: '操作对象',
        dataIndex: 'manageObjBusCode',
        key: 'manageObjBusCode',
        render: text => TooltipFn(text)
      }, {
        title: '安全事件',
        dataIndex: 'incident',
        key: 'incident',
        render: text => TooltipFn(text)
      }, {
        title: '业务流程',
        dataIndex: 'oprModule',
        key: 'oprModule',
        width: 140,
        render: text => TooltipFn(text)
      }, {
        title: '审计人',
        dataIndex: 'auditorName',
        key: 'auditorName',
        render: text => TooltipFn(text)
      }, {
        title: '审计时间',
        dataIndex: 'auditTime',
        key: 'auditTime',
        width: 180,
        sorter: true,
        sortOrder: sortedInfo.columnKey === 'auditTime' && sortedInfo.order,
        render: (text)=>{
          return(<span className="tabTimeCss">{ text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : ''}</span>)
        }
      }]
    return(
      <article>
        <div className="table-wrap">
          <Table rowKey="stringId"
            columns={columns}
            dataSource={list.items}
            pagination={false}
            onChange={this.tableChange}></Table>
          {
            list.totalRecords > 0 &&
          <Pagination
            current={pagingParameter.currentPage}
            pageSize={pagingParameter.pageSize}
            className="table-pagination"
            defaultPageSize={10}
            onChange={this.pageChange}
            showSizeChanger ={ list.totalRecords > 10}
            onShowSizeChange={ this.pageChange}
            total={list.totalRecords ? list.totalRecords : 0}  showTotal={(total) => `共 ${total} 条数据`} showQuickJumper={true} />
          }

        </div>
      </article>

    )
  }
  //返回上一级
  callback=()=>{
    this.props.history.goBack()
  }
  //获取数据
  getList = (params) => {
    // 深拷贝不会改变 params
    const values = JSON.parse(JSON.stringify(params))
    delete values.currentPage
    delete values.pageSize
    cacheSearchParameter([{
      page: {
        currentPage: params.currentPage,
        pageSize: params.pageSize
      },
      parameter: params.sortedInfo
    }], this.props.history, '0')
    // 深拷贝不会改变 params
    const param = JSON.parse(JSON.stringify(params))
    delete param.sortedInfo
    if(!param.sortName){
      param.sortName = this.state.sortName
    }
    param.primaryKey = analysisUrl(this.props.location.search).id
    Api.getAuditLogDetails(param).then(data=>{
      if(data.body.items.length){
        this.setState({
          list: data.body
        })
      }
    })
  }
  //翻页
  pageChange = (currentPage, pageSize)=>{
    this.setState({
      pagingParameter: {
        currentPage,
        pageSize
      }
    })
    let { sortName } = this.state
    this.getList({ currentPage, pageSize, sortName })
  }
  //排序
  tableChange= (pagination, filters, sorter) =>{
    let sortName
    switch (sorter.columnKey) {
      case 'oprTime':
        sortName = sorter.order === 'ascend' ? '1' : '0'
        break
      case 'auditTime':
        sortName = sorter.order === 'ascend' ? '3' : '2'
        break
      default:
        break
    }
    let { pagingParameter } = this.state
    this.setState({ sortedInfo: sorter, sortName })
    if (sortName) {
      this.getList({ sortName, currentPage: pagingParameter.currentPage, pageSize: pagingParameter.pageSize, sortedInfo: sorter })

    }  }
}
const mapStateToProps = ({ Logs }) => {
  return {
    list: Logs.logAuitDetails
  }
}

const LogAuditDetailss = Form.create()(LogAuditDetails)

export default connect(mapStateToProps)(LogAuditDetailss)
