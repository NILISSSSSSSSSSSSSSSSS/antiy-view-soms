import React, { Component, Fragment } from 'react'
import { Link } from 'dva/router'
import moment from 'moment'
import { Form, Button, Table, Pagination, message } from 'antd'
import { transliteration, TooltipFn, cacheSearchParameter, evalSearchParam } from '@/utils/common'
import api from '@/services/api'
import hasAuth from '@/utils/auth'
import CommonModal from '@/components/common/Modal'
import { Search } from '@c/index'  //引入方式
import { spPermission } from '@a/permission'
import { EXAMINE_TYPE, EXAMINE_STATUS } from '@a/js/enume'

const { Item } = Form
const formLayout = {
  labelCol: {
    span: 8
  },
  wrapperCol: {
    span: 12
  }
}
export class ExamineList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      selectedRowKeys: [],
      body: null,
      values: {},
      sorter: { sortOrder: '' },
      showAlert: false,
      dateFormat: 'YYYY-MM-DD HH:mm:ss',
      type: '',
      checkItem: ''
    }
  }
  componentDidMount () {
    let { list } = evalSearchParam(this, {}, false) || {}
    if (list) {
      if (list[0].parameter.time && list[0].parameter.time.length) {
        list[0].parameter.time.forEach((ele, idx) => {
          ele && (list[0].parameter.time[idx] = moment(moment(ele).format('YYYY-MM-DD')))
        })
      }
      this.searchForm.setFieldsValue({ ...list[0].parameter })
      this.setState({ pagingParameter: list[0].page, values: list[0].parameter }, () => this.initPageList())
    } else {
      this.initPageList(false)
    }
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    //使用同一页面
    if (this.props.match.params.page !== nextProps.match.params.page) {
      sessionStorage.removeItem('searchParameter')
      this.searchForm.resetFields()
      this.setState({
        values: {},
        pagingParameter: {
          pageSize: 10,
          currentPage: 1
        }
      }, this.initPageList)
    }
  }
  render () {
    let { pagingParameter, body, sorter, showAlert, type, selectedRowKeys, dateFormat } = this.state
    let page = this.props.match.params.page
    let list = [{ ruleId: 'fsdgdg', id: 11, type: 4 }, { ruleId: 'etwtw', id: 131, type: 6 }, { ruleId: 'etwtw', id: 131, type: 2 }, { ruleId: 'etwtw', id: 131, type: 1 }], total = 0
    if (body) {
      list = body.items
      total = Number(body.totalRecords)
    }
    const columns = [
      {
        title: '申请时间',
        key: 'createTime',
        dataIndex: 'createTime',
        sorter: true,
        width: '14%',
        sortOrder: sorter.sortOrder,
        sortDirections: ['descend', 'ascend'],
        render: text => {
          return (<span className="tabTimeCss">{text ? moment(text).format(dateFormat) : '--'}</span>)
        }
      },
      {
        title: '申请人',
        key: 'applyUser',
        dataIndex: 'applyUser',
        width: '14%',
        render: text => TooltipFn(text)
      },
      {
        title: '申请类型',
        key: 'applyType',
        width: '10%',
        dataIndex: 'applyType'
      },
      {
        title: '申请状态',
        key: 'finished',
        dataIndex: 'finished',
        width: '10%',
        render: (text) => {
          return (text ? '已审批' : '待审批')
        }
      },
      {
        title: '操作',
        key: 'operate',
        width: '16%',
        render: (record) => {
          return (
            <div className="operate-wrap">
              {
                this.getWorkOrderBtn(record)
              }
            </div>
          )
        }
      }]
    const defaultFields = [
      { type: 'dateRange', label: '申请时间', placeholder: ['开始时间', '结束时间'], key: 'time', allowClear: true },
      { type: 'select', multiple: false, label: '申请类型', placeholder: '全部', key: 'applyType', data: EXAMINE_TYPE },
      { type: 'select', multiple: false, label: '状态', placeholder: '全部', key: 'finished', data: EXAMINE_STATUS }
    ]
    const modalFormFields = [
      {
        type: 'radioGroup', key: 'agree', name: '审批结论',
        defaultValue: '1',
        rules: [{ required: true }],
        onChange: this.agreeChange,
        data: [{ label: '同意', value: '1' }, { label: '拒绝', value: '0' }]
      },
      {
        type: 'textArea',
        key: 'note',
        rows: 4,
        name: '审批建议',
        placeholder: '1-500字符',
        rules: [
          { required: type === '0' ? true : false, message: '请输入审批建议' },
          { whitespace: true, message: '不能为空字符' },
          { message: '最多500个字符', max: 500 }
        ]
      }
    ]
    //勾选事件
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys
        })
      }
    }
    return (
      <div className="main-table-content">
        <div className="search-bar">
          <Search defaultFields={defaultFields} onSubmit={this.handleSubmit} onReset={this.cancel} wrappedComponentRef={search => { search && (this.searchForm = search.props.form) }}/>
        </div>
        <div className="table-wrap">
          {page === 'todo' && <div className="table-btn">
            <div className="left-btn"></div>
            <div className="right-btn">
              {
                hasAuth(spPermission.spDspsp) && <Button type="primary" onClick={()=>this.examineCheck(0)}>审批</Button>
              }
            </div>
          </div>}
          {page === 'todo' ? <Table
            rowKey="templateNo"
            columns={columns}
            dataSource={list}
            rowSelection={rowSelection}
            onChange={this.handleTableChange}
            pagination={false}
          /> : <Table
            rowKey="templateNo"
            columns={columns}
            onChange={this.handleTableChange}
            dataSource={list}
            pagination={false}
          />}
          {total > 0 && <Pagination
            className="table-pagination"
            total={total} showTotal={(total) => `共 ${total || 0} 条数据`}
            showSizeChanger={total > 10 ? true : false}
            showQuickJumper={true}
            onChange={this.changeShowSize}
            onShowSizeChange={this.changeShowSize}
            pageSize={pagingParameter.pageSize}
            current={pagingParameter.currentPage} />}
          <CommonModal
            type="form"
            className="download-modal"
            visible={showAlert}
            title="审批"
            width={650}
            value={this.onOk}
            onClose={() => {
              this.setState({
                showAlert: false
              })
            }}
            fields={modalFormFields}
            column={1}
            FormItem={Item}
            formLayout={formLayout}
          >
          </CommonModal>
        </div>
      </div>
    )
  }
  initPageList = (isCache = true) => {
    let { values, pagingParameter, sorter } = this.state
    isCache && cacheSearchParameter([{ page: pagingParameter, parameter: { ...values } }], this.props.history)
    if (values.time && values.time.length > 0) {
      values.createTimeStart = values.time[0] ? values.time[0].valueOf() + '' : ''
      values.createTimeEnd = values.time[1] ? values.time[1].valueOf() + '' : ''
      delete values.time
    }
    let param = { ...pagingParameter, ...sorter, ...values }
    if (param.sortOrder === 'ascend') {
      param.sortOrder = 'asc'
    } else if (param.sortOrder === 'descend') {
      param.sortOrder = 'desc'
    }
    api.findWaitingApprove(param).then(response => {
      if (param.currentPage !== 1 && response.body.items === null) {
        this.setState({
          pagingParameter: {
            currentPage: param.currentPage - 1,
            pageSize: param.pageSize
          }
        })
        this.initPageList(false)
      } else {
        this.setState({
          body: response.body
        })
      }
    })
  }
  //根据你权限显示操作按钮
  getWorkOrderBtn = (record) => {
    let page = this.props.match.params.page
    let type = record && record.processDefinitionId &&  record.processDefinitionId.split(':')[0]
    return (
      <Fragment>
        {hasAuth(spPermission.spDspsp) && page === 'todo' && !record.finished && <a onClick={() => this.examineCheck(record)}>审批</a>}
        {
          hasAuth(spPermission.spDspView) && <Link target="_blank" to={{
            pathname: '/examine/check',
            search: `stringId=${transliteration(record.stringId)}&type=${type}`
          }}>查看</Link>
        }
      </Fragment>
    )
  }
  agreeChange = e => {
    this.setState({
      type: e.target.value
    })
  }
  onOk = (values) => {
    let param = { ...values }
    if(values.agree === '0'){
      param.formData =  '{"leaderApproveResult":0}'
    }else{
      param.formData =  '{"leaderApproveResult":1}'
    }
    param.taskId = this.state.checkItem.taskId
    console.log(param)
    api.examineApprove(param).then(res => {
      this.setState({
        showAlert: false
      }, this.initPageList)
    })
  }
  // 提交表单，执行查询
  handleSubmit = (values) => {
    this.setState({
      values: values,
      selectedRowKeys: [],
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      }
    }, this.initPageList)
  }
  examineCheck = (record) => {
    let { selectedRowKeys } = this.state
    if (!selectedRowKeys.length && !record.businessId)
      message.warn('请先选择要审批的项！')
    else
      this.setState({
        checkItem: record,
        showAlert: true
      })
    console.log(this.state.selectedRowKeys)
  }
  //翻页
  pageChange = (page, pageSize) => {
    this.setState({
      pagingParameter: {
        pageSize: 10,
        currentPage: page
      }
    }, this.initPageList)
  }
  //排序
  handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      sorter: {
        sortOrder: sorter.order
      }
    }, this.initPageList)
  }
  //取消
  cancel = () => {
    sessionStorage.removeItem('searchParameter')
    this.setState({
      selectedRowKeys: [],
      sorter: { sortName: '', sortOrder: '' },
      values: {},
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      }
    }, this.initPageList)
  }
}
export default ExamineList
