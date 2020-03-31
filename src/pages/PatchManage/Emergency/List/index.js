
import React, { Component } from 'react'
import { Link } from 'dva/router'
import { Button, Table, Pagination, Modal, Icon, message } from 'antd'
import { cache, TooltipFn, getAfterDeletePage } from '@/utils/common'
import { patchPermission } from '@a/permission'
import Search  from '@c/common/Search'
import hasAuth from '@u/auth'
import api from '@/services/api'
import { PATCH_LEVEL } from '@a/js/enume'

export class Emergency extends Component {
  constructor (props) {
    super(props)
    this.state = {
      body: null,
      values: {},
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
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
    let { body, pagingParameter } = this.state
    const  columns = [{
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
      dataIndex: 'patchLevelStr',
      render: (text)=>{
        return TooltipFn(text)
      }
    }, {
      title: '操作',
      render: (record) => {
        return (
          <div className="operate-wrap">
            {
              hasAuth(patchPermission.patchEmergencyManageEdit) && <Link to={`/bugpatch/patchmanage/emergency/edit?from=edit&id=${record.antiyPatchNumber}`}>编辑</Link>
            }
            {
              hasAuth(patchPermission.patchEmergencyManageDetail) && <Link to={`/bugpatch/patchmanage/emergency/detail?id=${record.antiyPatchNumber}`}>查看</Link>
            }
            {
              hasAuth(patchPermission.patchEmergencyManageDetele) && <a onClick={() => this.deletePatch(record.antiyPatchNumber)}>删除</a>
            }
          </div>
        )
      }
    }]
    let list  = []
    let total =  0
    if (body){
      list = body.items
      total =  body.totalRecords
    }
    const searchFields = [
      { type: 'select', label: '补丁等级', placeholder: '请选择', key: 'patchLevel', data: PATCH_LEVEL },
      { type: 'input', label: '补丁名称', placeholder: '请输入', key: 'patchName', allowClear: true, maxLength: 180 },
      { type: 'input', label: '补丁编号', placeholder: '请输入', key: 'patchNo', allowClear: true, maxLength: 64 }
    ]
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
          <div className="table-btn">
            <div className="left-btn">
              {
                hasAuth(patchPermission.patchEmergencyManageReg) ? (
                  <Button type="primary"
                    onClick={() => this.props.history.push('/bugpatch/patchmanage/emergency/register?from=regsiter')}>登记</Button>
                ) : null
              }
            </div>
          </div>
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

  //删除补丁
  deletePatch = (number) => {
    Modal.confirm({
      icon: <Icon type="close" onClick={() => { Modal.destroyAll() }} />,
      content: '确认删除该补丁吗？',
      onOk: () => {
        api.deleteEmergencyPatch({ antiyPatchNumbers: [number] }).then(data => {
          this.handleSuccess()
        })
      }
    })
  }

  handleSuccess = () => {
    const { values, pagingParameter, body } = this.state
    let { currentPage, pageSize } = pagingParameter
    message.success('操作成功！')
    currentPage = getAfterDeletePage(body.totalRecords - 1, currentPage, pageSize)
    this.setState({
      pagingParameter: {
        currentPage,
        pageSize
      }
    }, () => {
      this.getList({
        pageSize,
        currentPage,
        ...values
      })
    })
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
    param.patchSource = 1
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

export default Emergency
