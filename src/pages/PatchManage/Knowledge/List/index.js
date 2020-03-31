import React, { Component } from 'react'
import { Link } from 'dva/router'
import { Table, Pagination } from 'antd'
import { cache, TooltipFn } from '@/utils/common'
import Search  from '@c/common/Search'
import api from '@/services/api'
import { patchPermission } from '@a/permission'
import hasAuth from '@u/auth'
import { PATCH_LEVEL } from '@a/js/enume'

export class Knowledge extends Component {
  constructor (props) {
    super(props)
    this.state = {
      body: null,
      values: {},
      pagingParameter: {
        currentPage: 1,
        pageSize: 10
      }
    }
  }

  componentDidMount () {
    let { list } = cache.evalSearchParam(this, {}, false) || {}
    if (list) {
      const { parameter, page } = list[0]
      this.searchForm.setFieldsValue(parameter)
      this.setState({
        pagingParameter: page,
        values: parameter
      }, () => {
        this.getList({
          ...page,
          ...parameter
        })
      })
    } else {
      this.getList(this.state.pagingParameter, false)
    }
  }

  render () {
    let { pagingParameter, body } = this.state
    const searchFields = [
      { type: 'select', label: '补丁等级', placeholder: '请选择', key: 'patchLevel', data: PATCH_LEVEL },
      { type: 'input', label: '补丁名称', placeholder: '请输入', key: 'patchName', allowClear: true, maxLength: 180 },
      { type: 'input', label: '补丁编号', placeholder: '请输入', key: 'patchNo', allowClear: true, maxLength: 64 }
    ]
    const columns = [{
      title: '补丁编号',
      key: 'patchNumber',
      dataIndex: 'patchNumber',
      render: (text)=>{
        return TooltipFn(text)
      }
    }, {
      title: '补丁名称',
      key: 'patchName',
      dataIndex: 'patchName',
      render: (text)=>{
        return TooltipFn(text)
      }
    }, {
      title: '补丁等级',
      key: 'patchLevelStr',
      dataIndex: 'patchLevelStr'
    }, {
      title: '补丁热支持',
      key: 'hotfixStr',
      dataIndex: 'hotfixStr'
    }, {
      title: '操作',
      key: 'operate',
      render: (record) => (
        <div className="operate-wrap">
          {
            hasAuth(patchPermission.PatchKnowManageDetail) && <Link to={`/bugpatch/patchmanage/repository/detail?id=${record.antiyPatchNumber}`}>查看</Link>
          }
        </div>
      )
    }]
    let list  = []
    let total =  0
    if (body){
      list = body.items
      total =  body.totalRecords
    }
    return (
      <article className="main-table-content">
        <div className="search-bar">
          <Search
            defaultFields={searchFields}
            onSubmit={this.onSubmit}
            onReset={this.onReset}
            wrappedComponentRef={search => { search && (this.searchForm = search.props.form) }}
          />
        </div>
        <section className="table-wrap">
          <Table
            rowKey="antiyPatchNumber"
            columns={columns}
            dataSource={list}
            pagination={false} />
          {
            total > 0 && <Pagination
              className="table-pagination"
              total={total} showTotal={(total) => `共 ${total || 0} 条数据`}
              showSizeChanger={total > 10}
              showQuickJumper
              onChange={this.changePage}
              onShowSizeChange={this.changePage}
              pageSize={pagingParameter.pageSize}
              current={pagingParameter.currentPage} />
          }
        </section>
      </article>
    )
  }

  //表单查询
  onSubmit = (values) => {
    const { pagingParameter } = this.state
    this.setState({
      pagingParameter: {
        pageSize: pagingParameter.pageSize,
        currentPage: 1
      },
      values
    }, () => {
      this.getList({
        ...this.state.pagingParameter,
        ...values
      })
    })
  }

  //表单重置
  onReset = () => {
    cache.removeCriteria()
    const pagingParameter = {
      pageSize: 10,
      currentPage: 1
    }
    this.setState({
      values: {},
      pagingParameter
    }, () => {
      this.getList(pagingParameter, false)
    })
  }

  //获取列表数据
  getList = (param, isCach = true) => {
    const { history } = this.props
    let { values, pagingParameter } = this.state
    if (isCach) {
      cache.cacheSearchParameter([{
        page: pagingParameter,
        parameter: values
      }], history)
    }
    param.patchSource = 2
    api.getPatchKnowledgeLists(param).then(response => {
      this.setState({
        body: response.body
      })
    })
  }

  //改变当前页显示数量
  changePage = (currentPage, pageSize) => {
    this.setState({
      pagingParameter: {
        pageSize,
        currentPage
      }
    }, () => {
      const { values } = this.state
      const param = {
        currentPage,
        pageSize,
        ...values
      }
      this.getList(param, 1)
    })
  }

}

export default Knowledge
