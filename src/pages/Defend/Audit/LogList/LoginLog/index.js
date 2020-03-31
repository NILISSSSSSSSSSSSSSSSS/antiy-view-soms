import React, { Component } from 'react'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import moment from 'moment'
import { Form, Table, Pagination, Button, message } from 'antd'
import { TooltipFn, timeStampToTime, cacheSearchParameter, evalSearchParam, removeCriteria, emptyFilter } from '@/utils/common'
import api from '@/services/api'
import hasAuth from '@/utils/auth'
import { defendPermission } from '@a/permission'
import Search from '@/components/common/Search'
import ExportModal from '@/components/common/ExportModal'

const maxLength = 30
export class LoginLog extends Component {
  constructor (props) {
    super(props)
    this.state = {
      list: {},
      sortedInfo: null,
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      seekTerm: {},         // 筛选条件
      exportVisible: false, // 导出
      userList: []          // 筛选条件中的用户列表
    }
  }
  componentDidMount () {
    this.props.children(this)
    //获取厂商、名称、版本
    this.props.dispatch({ type: 'defend/getDefendSupplier' })
    // 获取用户列表
    this.getUserList()
    // 获取列表
    let { pageSize, currentPage } = this.state
    //解析保留的数据
    let { list } = evalSearchParam(this) || {}
    if(list && list[0]){
      const init = list[0].parameter
      if (init.beginTime || init.endTime)
        init.time = [init.beginTime ? moment(init.beginTime) : '', init.endTime ? moment(init.endTime) : '']
      this.setState({
        searchExpand: true,
        pageSize: list[0].page.pageSize,
        currentPage: list[0].page.currentPage,
        seekTerm: init }, ()=>{
        let { pageSize, currentPage } = list[0].page
        // 设置查询表单
        this.searchForm.setFieldsValue({ ...init })
        this.getList(currentPage, pageSize)
      })
    }else{
      this.getList(currentPage, pageSize)
    }
  }
  getUserList = () => {
    api.userList().then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          userList: (response.body || []).map(e => ({ name: e, value: e }))
        })
      }
    })
  }
  getList = (page, size, is = false) => {
    const { seekTerm, pagingParameter } = this.state
    if(is){
      cacheSearchParameter([{
        page: { pageSize: size, currentPage: page },
        parameter: seekTerm
      }], this.props.history, 0, '1')
      this.props.saveItemKey()
    }
    const postParms = {
      ...seekTerm,
      ...pagingParameter
    }
    api.loginlogList(postParms).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          list: response.body
        })
      }
    })
  }
  // 提交表单，执行查询
  handleSubmit = values => {
    if (values.time) values.beginTime = moment(values.time[0]).startOf('day').valueOf()
    if (values.time) values.endTime = moment(values.time[1]).endOf('day').valueOf()
    delete values.time
    this.setState({
      pagingParameter: {
        pageSize: this.state.pagingParameter.pageSize,
        currentPage: 1
      },
      seekTerm: values
    }, () => this.getList(1, 10, true))
  }
  //查询条件重置
  handleReset = () => {
    this.props.form.resetFields()
    removeCriteria('1', this.props.history)
    //重置查询条件后，重新查询页面数据
    this.setState({
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      seekTerm: {}
    }, () => this.getList(1, 10))
  }
  //翻页
  pageChange = (page, pageSize) => {
    this.setState({
      pagingParameter: {
        currentPage: page,
        pageSize: pageSize
      }
    }, ()=>this.getList(page, pageSize))
  }
  /**
   * 查询条件变更时
   * @param values
   */
  searchChange = (values) => {
    this.exportDownParam = values
  }
  //导出
  exportAdmittance = () => {
    api.loginlogList({
      currentPage: 1,
      pageSize: 10
    }).then(res=>{
      if(res && res.head && res.head.code === '200'){
        //总数为0 ，测试要求前端判断
        if(res.body && res.body.totalRecords && res.body.totalRecords !== 0){
          this.setState({
            exportVisible: true
          })
        }else{
          message.error('暂无数据可导出!')
        }
      }
    })
  }
  handleChange = (pagination, filters, sorter) => {
    const { seekTerm } = this.state
    if(sorter.columnKey){
      const { order } = sorter
      if(order === 'ascend'){
        seekTerm.sortOrder = 'asc'
      }else if (order === 'descend'){
        seekTerm.sortOrder = 'desc'
      }
      switch(sorter.columnKey){
        case 'time':
          seekTerm.sortName = 'time'
          break
        case 'loginTypeName':
          seekTerm.sortName = 'loginType'
          break
        case 'isSuccessName':
          seekTerm.sortName = 'isSuccess'
          break
        default:
          break
      }
    }else{
      delete seekTerm.sortName
      delete seekTerm.sortOrder
    }
    this.setState({
      // filteredInfo: filters,
      sortedInfo: sorter,
      seekTerm
    }, () => this.getList(1, 10))
  }
  /**
   * 联动选择厂商/名称/版本
   * @param fields
   */
  resetSearch = (val, index, keys1, keys2) => {
    const { dispatch } = this.props
    this.searchForm.setFieldsValue({
      [keys1]: undefined,
      [keys2]: undefined
    }, () => {
      let supplier = this.searchForm.getFieldValue('manufacturer')
      if (index === 1) {
        dispatch({ type: 'defend/clearDefendName' })
        if (val && val.length) dispatch({ type: 'defend/getDefendName', payload: { manufacturerList: val } })
      } else {
        dispatch({ type: 'defend/cleaDefendVersion' })
        if (supplier && supplier.length && val && val.length) dispatch({ type: 'defend/getDefendVersion', payload: { manufacturerList: supplier, nameList: val } })
      }
    })
  }
  /**
   * 查询栏的展开回调事件
   * @param searchExpand {Boolean} 查询栏的展开状态
   */
  onExpandSearch = (searchExpand) => {
    this.setState({ searchExpand })
  }
  render () {
    const {
      list,
      pagingParameter,
      exportVisible,
      seekTerm,
      searchExpand,
      userList
    } = this.state
    let { sortedInfo } = this.state
    const { defendSupplierList, defendVersionList, defendNameList } = this.props
    sortedInfo = sortedInfo || {}
    const columns = [{
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      width: 190,
      isShow: true,
      sorter: true,
      sortOrder: sortedInfo && sortedInfo.columnKey === 'time' ? sortedInfo.order : false,
      ellipsis: true,
      render: (text) => {
        return (<span className="tabTimeCss">{timeStampToTime(text)}</span>)
      }
    }, {
      title: '厂商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      isShow: true,
      render: text => emptyFilter(text)
    }, {
      title: '名称',
      dataIndex: 'assetName',
      key: 'assetName',
      isShow: true,
      render: text => emptyFilter(text)
    }, {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      isShow: true,
      render: text => emptyFilter(text)
    }, {
      title: '编号',
      dataIndex: 'assetNumber',
      key: 'assetNumber',
      isShow: true,
      render: text => TooltipFn(text)
    }, {
      title: '协议',
      dataIndex: 'protocol',
      key: 'protocol',
      isShow: true,
      render: text => emptyFilter(text)
    }, {
      title: '设备IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      isShow: true,
      render: text => TooltipFn(text)
    }, {
      title: '内容',
      dataIndex: 'loginTypeName',
      key: 'loginTypeName',
      isShow: true,
      sorter: true,
      sortOrder: sortedInfo && sortedInfo.columnKey === 'loginTypeName' ? sortedInfo.order : false,
      ellipsis: true,
      render: (text) => { return emptyFilter(text) }
    }, {
      title: '结果',
      dataIndex: 'isSuccessName',
      key: 'isSuccessName',
      isShow: true,
      sorter: true,
      sortOrder: sortedInfo && sortedInfo.columnKey === 'isSuccessName' ? sortedInfo.order : false,
      ellipsis: true,
      render: (text) => { return emptyFilter(text) }
    }, {
      title: '用户',
      dataIndex: 'accuntOps',
      key: 'accuntOps',
      isShow: true,
      render: text => emptyFilter(text)
    }, {
      title: '用户IP',
      dataIndex: 'userIp',
      key: 'userIp',
      isShow: true,
      render: text => TooltipFn(text)
    }]
    this.defaultFields = [
      { label: '综合查询', maxLength: 30, key: 'blurQueryField', span: 12, type: 'input', placeholder: '设备IP/编号' },
      { label: '时间', key: 'time', type: 'dateRange', placeholder: ['开始日期', '结束日期'], data: [] }
    ]
    this.filterFields = [
      { type: 'select', multiple: true, label: '厂商', maxLength, placeholder: '全部', showSearch: true, key: 'manufacturerList', data: defendSupplierList, onChange: (val) => this.resetSearch(val, 1, 'name', 'version') },
      { type: 'select', multiple: true, label: '名称', maxLength, placeholder: '全部', showSearch: true, key: 'nameList', data: defendNameList, onChange: (val) => this.resetSearch(val, 2, 'version') },
      { type: 'select', multiple: true, label: '版本', maxLength, placeholder: '全部', showSearch: true, key: 'versionList', data: defendVersionList },
      { type: 'select', multiple: true, label: '用户', maxLength, placeholder: '全部', showSearch: true, key: 'userList', data: userList }
    ]
    const fields = this.filterFields
    return (
      <article className="main-table-content">
        <div className="search-bar">
          <Search fieldList={fields} setDefaultExpandedStatus={searchExpand} ref={(search) => { search && (this.searchForm = search) }} onChange={this.searchChange} onSubmit={this.handleSubmit} onReset={this.handleReset} defaultFields={this.defaultFields} />
        </div>
        <section className="table-wrap table-style">
          <div className="table-btn">
            <div className="left-btn">
              {hasAuth(defendPermission.PORTAL_LOGIN_LOG_EXPORT) ? <Button type="primary" onClick={this.exportAdmittance}>导出</Button> : null}
            </div>
          </div>
          <Table rowKey="loginlogId" onChange={this.handleChange} columns={columns} dataSource={list ? list.items : []} pagination={false} />
          {
            list.totalRecords > 0 &&
            <Pagination current={pagingParameter.currentPage} pageSize={pagingParameter.pageSize} className="table-pagination" onChange={this.pageChange}
              onShowSizeChange={this.pageChange} defaultPageSize={10}
              total={list ? list.totalRecords : 0} showTotal={(total) => `共 ${total} 条数据`}
              showSizeChanger={true} showQuickJumper={true} />
          }
        </section>
        {exportVisible && <ExportModal
          exportModal={{
            //弹框显示
            exportVisible,
            //搜索条件
            searchValues: { ...seekTerm },
            //数据总数
            total: (list || {}).totalRecords || 0,
            //阈值
            threshold: 5000,
            //下载地址
            url: '/api/v1/ops/loginlog/export/'
          }}
          handleCancelExport={() => this.setState({ exportVisible: false })} />
        }
      </article>
    )
  }
}
const mapStateToProps = ({ defend }) => {
  return {
    defendSupplierList: defend.defendSupplierList,
    defendVersionList: defend.defendVersionList,
    defendNameList: defend.defendNameList
  }
}
const LoginLogForm = Form.create()(LoginLog)
export default withRouter(connect(mapStateToProps)(LoginLogForm))
