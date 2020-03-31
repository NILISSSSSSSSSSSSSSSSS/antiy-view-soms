
import { Component } from 'react'
import { Table, Pagination } from 'antd'
import { cacheSearchParameter, removeCriteria } from '@/utils/common'
import api from '@/services/api'
import moment from 'moment'
import { Search } from '@c/index'

import { onRow, filterType } from '../common'

const flowType = [{
  name: '资产管理',
  value: 1
}, {
  name: '配置管理',
  value: 2
}, {
  name: '漏洞管理',
  value: 3
}, {
  name: '补丁管理',
  value: 4
}]

class Backlog extends Component {
  constructor (props) {
    super(props)
    this.state = {
      body: {},
      values: {},
      page: {
        pageSize: 10,
        currentPage: 1
      },
      columns: [{
        title: '流程类型',
        key: 'typeName',
        dataIndex: 'typeName'
      }, {
        title: '流程节点',
        key: 'name',
        dataIndex: 'name'
      }, {
        title: '流程时间',
        key: 'createTime',
        dataIndex: 'createTime',
        render: (text) => (<span>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>)
      }, {
        title: '操作',
        render: (scope) => {
          return (
            <a onClick={() => onRow(this.props.history, scope)}>查看</a>
          )
        }
      }]
    }
  }
  componentDidMount () {
    this.getList(false)
  }
  handleSubmit = (values) => {
    this.setState({
      page: {
        pageSize: 10,
        currentPage: 1
      },
      values }, this.getList)
  }
  //重置表单
  handleReset = () => {
    this.props.form.resetFields()
    removeCriteria()
    this.setState({
      values: {},
      page: {
        pageSize: 10,
        currentPage: 1
      }
    }, () => this.getList(false))
  }
  //获取列表数据
  getList = (state = true) => {
    let { values, page } = this.state
    if (state)
      cacheSearchParameter([{
        page,
        parameter: { ...values }
      }], this.props.history)
    const beginTimeArr = values.time ? [...values.time] : undefined
    if (beginTimeArr) {
      values.createTimeStart = beginTimeArr[0] ? beginTimeArr[0].valueOf() : undefined
      values.createTimeEnd = beginTimeArr[1] ? beginTimeArr[1].valueOf() : undefined
    }
    values.time = undefined
    values.user = window.app._store.getState().system.id
    api.getBacklogWork({ ...page, ...values }).then(data => {
      if (data.body.items.length) {
        data.body.items = filterType(data.body.items)
      }
      this.setState({ body: data.body })
    })
  }
  //列表翻页
  changePage = (currentPage, pageSize) => {
    this.setState({
      page: { currentPage, pageSize }
    }, this.getList)
  }
  //代办工作 行点击事件
  onRow = (record) => {
    onRow(this.props.history, record)
  }
  render () {
    const { columns } = this.state
    let { body, page } = this.state
    const defaultFields = [
      { type: 'dateRange', label: '流程时间', placeholder: ['开始时间', '结束时间'], key: 'time', allowClear: true },
      { type: 'select', multiple: false, label: '流程类型', placeholder: '全部', key: 'type', data: flowType, config: { name: 'name', value: 'value' } }
    ]
    return (
      <article className="main-table-content">
        <div className="search-bar">
          <Search defaultFields={defaultFields} onSubmit={this.handleSubmit} />
        </div>
        <section className="table-wrap">
          <Table rowKey="stringId"
            columns={columns}
            dataSource={body.items || []}
            pagination={false}
            onChange={this.handleTableChange} />
          {
            body.totalRecords && body.totalRecords > 0 ? (
              <Pagination className="table-pagination"
                total={body.totalRecords || 0}
                showTotal={(total) => `共 ${total} 条数据`}
                showSizeChanger={body.totalRecords < 10 ? false : true}
                showQuickJumper
                onChange={this.changePage}
                onShowSizeChange={this.changePage}
                pageSize={page.pageSize}
                current={page.currentPage} />
            ) : null
          }
        </section>
      </article>
    )
  }
}

export default Backlog