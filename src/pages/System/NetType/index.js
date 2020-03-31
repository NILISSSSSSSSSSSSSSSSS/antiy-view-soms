import React, { Component, Fragment } from 'react'
import { TooltipFn, analysisUrl, cacheSearchParameter, evalSearchParam } from '@u/common'
import hasAuth from '@/utils/auth'
import { Table, Pagination, Button } from 'antd'
import api from '@/services/api'
import { Search } from '@c/index'  //引入方式
import ModalConfirm from '@/components/common/ModalConfirm'
import NetWorkModal from './networkModal'
import { systemPermission } from '@a/permission'

export class NetTypeManage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      body: {},
      modalData: {},
      columns: [
        {
          title: '网络类型名称',
          key: 'name',
          dataIndex: 'name',
          render: text => TooltipFn(text)
        },
        {
          title: '描述',
          key: 'describe',
          dataIndex: 'describe',
          render: text => TooltipFn(text)
        },
        {
          title: '操作',
          key: 'operate',
          width: '100px',
          render: (record) => {
            return (
              <div className="operate-wrap">
                <Fragment>
                  {
                    hasAuth(systemPermission.sysSetNetsegmentEdit) &&
                    <a onClick={() => this.showEdit(1, record)}>编辑</a>
                  }
                  {
                    hasAuth(systemPermission.sysSetNetsegmentDelete) &&
                    <a onClick={() => this.showDel(record.stringId)}>删除</a>
                  }
                </Fragment>
              </div>
            )
          }
        }
      ]
    }
  }
  componentDidMount () {
    let { list } = evalSearchParam(this) || {}
    if (list) {
      this.setState({ pagingParameter: list[0].page, values: list[0].parameter }, () => this.getList())
    } else {
      this.getList(false)
    }
  }
  render () {
    let { pagingParameter, body, columns, showDel, showEdit, modalData } = this.state
    const defaultFields = [
      { type: 'input', label: '网络类型查询', placeholder: '请输入网络类型名称', key: 'name', allowClear: true, maxLength: 30 }
    ]
    const AlertInfo = {
      visible: showDel,
      onOk: this.sureDel,
      onCancel: this.handleCancel,
      children: (<p className="model-text">确认删除该网络类型吗？</p>)
    }
    const netInfo = {
      title: modalData && modalData.name ? '编辑网络类型' : '新建网络类型',
      onOk: this.sureAdd,
      visible: showEdit,
      onCancel: this.handleCancel,
      modalData: modalData
    }
    return (
      <div className="main-table-content">
        <div className="search-bar">
          <Search defaultFields={defaultFields} onSubmit={this.handleSubmit} />
        </div>
        {/* 列表+分页 */}
        <div className="table-wrap">
          <div className="table-btn">
            <div className="left-btn">
              {
                hasAuth(systemPermission.sysSetNetsegmentNew) && <Button type="primary" onClick={this.showEdit}>新建网络类型</Button>
              }
            </div>
          </div>
          <Table rowKey="stringId" columns={columns} dataSource={body.list || []} pagination={false}
          />
          {body.total && body.total > 0 && <Pagination
            className="table-pagination"
            total={body.total}
            showTotal={(total) => `共 ${total || 0} 条数据`}
            showSizeChanger={body.total > 10 ? true : false}
            showQuickJumper
            onChange={this.changePage}
            onShowSizeChange={this.changePage}
            pageSize={pagingParameter.pageSize}
            current={pagingParameter.currentPage} />
          }
        </div>
        <ModalConfirm props={AlertInfo} />
        <NetWorkModal props={netInfo} />
      </div>
    )
  }
  //编辑弹框
  showEdit = (index = 0, record = {}) => {
    this.setState({
      showEdit: true
    })
    if (index) {
      this.setState({
        modalData: record
      })
    } else {
      this.setState({
        modalData: null
      })
    }
  }
  //删除弹框
  showDel = (id) => {
    this.setState({
      removeId: id,
      showDel: true
    })
  }
  //确认删除
  sureDel = () => {
    let { removeId } = this.state
    api.delNetsegment({ stringId: removeId }).then(res => {
      this.setState({
        showDel: false
      })
      this.getList()
    })
  }
  //确认编辑
  sureAdd = () => {
    this.setState({
      showEdit: false,
      modalData: null
    })
    this.getList()
  }
  //取消删除
  handleCancel = () => {
    this.setState({
      showDel: false,
      showEdit: false
    })
  }
  //表单查询
  handleSubmit = (values) => {
    const { pagingParameter } = this.state
    this.setState({
      pagingParameter: {
        pageSize: pagingParameter.pageSize,
        currentPage: 1
      },
      values
    }, () => {
      this.getList()
    })
  }
  //获取列表,isCache:是否缓存分页数据
  getList = (isCache = true) => {
    let { values, pagingParameter, sorter } = this.state
    // let id = analysisUrl(this.props.location.search).id
    if (isCache) {
      cacheSearchParameter([{
        page: pagingParameter,
        parameter: { ...values, ...sorter }
      }], this.props.history)
    }
    let param = { ...values, ...pagingParameter }
    // if (id) param.stringId = id
    // api.getNetsegment(param).then(res => {
    //   if (param.currentPage !== 1 && !res.body.items.length) {
    //     this.setState({
    //       pagingParameter: {
    //         currentPage: param.currentPage - 1,
    //         pageSize: param.pageSize
    //       }
    //     }, this.getList)
    //   } else {
    //     this.setState({
    //       body: res.body
    //     })
    //   }
    // })
  }
  //分页
  changePage = (currentPage, pageSize) => {
    this.setState({
      pagingParameter: {
        pageSize,
        currentPage
      }
    }, () => {
      this.getList()
    })
  }
}
export default NetTypeManage