import React, { Component, Fragment } from 'react'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import { Form, Table, Pagination } from 'antd'
import moment from 'moment'
import { TooltipFn, timeStampToTime, download, cacheSearchParameter, evalSearchParam, removeCriteria, emptyFilter } from '@/utils/common'
import api from '@/services/api'
import hasAuth from '@/utils/auth'
import { defendPermission } from '@a/permission'
import Search from '@/components/common/Search'
import SessionDetailModal from '@/components/Defend/SessionDetailModal'
import './style.less'

const maxLength = 30
export class AuditOperation extends Component {
  constructor (props) {
    super(props)
    this.state = {
      list: {},
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      seekTerm: {},                    // 筛选条件
      sortedInfo: null,                // 列表排序
      detailModalVisible: false,       // 会话详情modal
      thisId: '',                      // 当前操作的设备id
      userList: []                     // 筛选条件中的用户列表
    }
  }
  componentDidMount () {
    // 获取厂商、名称、版本
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
    }
    const postParms = {
      ...seekTerm,
      ...pagingParameter
    }
    api.auditQueryList(postParms).then(response => {
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
    }, () => {
      this.getList(false)
    })
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
  // 查看会话详情, 注：操作后需更新审计状态为已审计
  handleSessionDetail = (id, index) => {
    this.setState({
      detailModalVisible: true,
      thisId: id
    }, () => {
      this.updateAuditStatus(id, index)
    })
  }
  // 下载会话详情, 注：操作后需更新审计状态为已审计
  downloadSessionDetail = (id, index) => {
    download('/api/v1/ops/session/downloadSession', { primaryKey: id })
    this.updateAuditStatus(id, index)
  }
  // 视频回放, 注：操作后需更新审计状态为已审计
  replay = (id, index) => {
    window.open(`/luna/replay/${id}`, '_blank')
    this.updateAuditStatus(id, index)
  }
  // 更新审计状态
  updateAuditStatus = (id, index) => {
    api.updateAuditStatus({
      stringId: id
    }).then(response => {
      if (response && response.head && response.head.code === '200') {
        const { list } = this.state
        list.items[index].isAuditName = '已审计'
        this.setState({
          list
        })
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
        case 'startTime':
          seekTerm.sortName = 'start_time'
          break
        case 'opsTimeFormat':
          seekTerm.sortName = 'ops_time'
          break
        case 'isAuditName':
          seekTerm.sortName = 'is_audit'
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
  getWorkOrderBtn = (record, index) => {
    const { hasReplay, id, protocol } = record
    return (
      // 注：协议为ssh类型才显示会话详情和会话下载
      <Fragment>
        {(hasAuth(defendPermission.PORTAL_SESSION_DETAIL) && protocol === 'ssh') ? <span onClick={() => this.handleSessionDetail(id, index)}>会话详情</span> : null}
        {(hasAuth(defendPermission.PORTAL_SESSION_DOWNLOAD) && protocol === 'ssh') ? <span onClick={() => this.downloadSessionDetail(id, index)}>会话下载</span> : null}
        {(hasAuth(defendPermission.PORTAL_REPLAY) && hasReplay) ? <span className="replay" onClick={() => this.replay(id, index)}>视频回放</span> : null}
      </Fragment>
    )
  }
  render () {
    const {
      list,
      pagingParameter,
      detailModalVisible,
      thisId,
      userList,
      searchExpand
    } = this.state
    let { sortedInfo } = this.state
    const { defendSupplierList, defendVersionList, defendNameList } = this.props
    sortedInfo = sortedInfo || {}
    const columns = [{
      title: '编号',
      dataIndex: 'assetNumber',
      key: 'assetNumber',
      isShow: true,
      render: text => TooltipFn(text)
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
      title: '账号',
      dataIndex: 'accountOps',
      key: 'accountOps',
      isShow: true,
      render: val => {
        return emptyFilter(val)
      }
    }, {
      title: '协议',
      dataIndex: 'protocol',
      key: 'protocol',
      isShow: true,
      render: val => {
        return emptyFilter(val)
      }
    }, {
      title: '用户',
      dataIndex: 'userName',
      key: 'userName',
      isShow: true,
      render: val => {
        return emptyFilter(val)
      }
    }, {
      title: '用户IP',
      dataIndex: 'userIp',
      key: 'userIp',
      isShow: true,
      render: val => {
        return TooltipFn(val)
      }
    }, {
      title: '运维开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 160,
      isShow: true,
      sorter: true,
      sortOrder: sortedInfo && sortedInfo.columnKey === 'startTime' ? sortedInfo.order : false,
      ellipsis: true,
      render: (text) => {
        return (<span className="tabTimeCss">{timeStampToTime(text)}</span>)
      }
    }, {
      title: '运维时长',
      dataIndex: 'opsTimeFormat',
      key: 'opsTimeFormat',
      isShow: true,
      sorter: true,
      sortOrder: sortedInfo && sortedInfo.columnKey === 'opsTimeFormat' ? sortedInfo.order : false,
      ellipsis: true,
      render: val => {
        return emptyFilter(val)
      }
    }, {
      title: '状态',
      dataIndex: 'isAuditName',
      key: 'isAuditName',
      isShow: true,
      sorter: true,
      sortOrder: sortedInfo && sortedInfo.columnKey === 'isAuditName' ? sortedInfo.order : false,
      ellipsis: true,
      render: val => {
        return emptyFilter(val)
      }
    }, {
      title: '操作',
      width: 270,
      render: (text, record, index) => {
        return (
          <div className="operate-wrap">
            {
              this.getWorkOrderBtn(record, index)
            }
          </div>
        )
      }
    }]
    this.defaultFields = [
      { type: 'select', multiple: true, label: '用户', maxLength, placeholder: '全部', showSearch: true, key: 'userName', data: userList },
      { label: '运维开始时间', key: 'time', type: 'dateRange', placeholder: ['开始日期', '结束日期'], data: [] }
    ]
    this.filterFields = [
      { type: 'select', multiple: true, label: '厂商', maxLength, placeholder: '全部', showSearch: true, key: 'manufacturer', data: defendSupplierList, onChange: (val) => this.resetSearch(val, 1, 'name', 'version') },
      { type: 'select', multiple: true, label: '名称', maxLength, placeholder: '全部', showSearch: true, key: 'name', data: defendNameList, onChange: (val) => this.resetSearch(val, 2, 'version') },
      { type: 'select', multiple: true, label: '版本', maxLength, placeholder: '全部', showSearch: true, key: 'version', data: defendVersionList },
      { label: '用户IP', maxLength: 30, key: 'ipAddress', type: 'input', placeholder: '请输入IP地址' },
      { label: '编号', maxLength: 30, key: 'number', type: 'input', placeholder: '请输入安全设备编号' }
    ]
    const fields = this.filterFields
    return (
      <article className="main-table-content audit-list">
        <div className="search-bar">
          <Search fieldList={fields} setDefaultExpandedStatus={searchExpand} ref={(search) => { search && (this.searchForm = search) }} onChange={this.searchChange} onSubmit={this.handleSubmit} onReset={this.handleReset} defaultFields={this.defaultFields} />
        </div>
        <section className="table-wrap table-style">
          <Table rowKey="id" onChange={this.handleChange} columns={columns} dataSource={list ? list.items : []} pagination={false} />
          {
            list.totalRecords > 0 &&
            <Pagination current={pagingParameter.currentPage} pageSize={pagingParameter.pageSize} className="table-pagination" onChange={this.pageChange}
              onShowSizeChange={this.pageChange} defaultPageSize={10}
              total={list ? list.totalRecords : 0} showTotal={(total) => `共 ${total} 条数据`}
              showSizeChanger={true} showQuickJumper={true} />
          }
        </section>
        {/* 会话详情 */}
        <SessionDetailModal visible={detailModalVisible}
          id={thisId}
          onClose={() => {this.setState({ detailModalVisible: false })}} />
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
const AuditOperationForm = Form.create()(AuditOperation)
export default withRouter(connect(mapStateToProps)(AuditOperationForm))
