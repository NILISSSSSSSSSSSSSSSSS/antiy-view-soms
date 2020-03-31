import React, { Component, Fragment } from 'react'
import { TooltipFn, analysisUrl, cacheSearchParameter, evalSearchParam } from '@u/common'
import hasAuth from '@/utils/auth'
import { Table, Pagination, Button, Modal } from 'antd'
import api from '@/services/api'
import { Search } from '@c/index'  //引入方式
import ModalConfirm from '@/components/common/ModalConfirm'
import PortModal from './portModal/index.js'
import { systemPermission } from '@a/permission'

export class PortManage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      body: null,
      modalData: null,
      values: {},
      showEdit: false,
      showDel: false,
      detailVisible: false,
      removeId: '',
      result: null,
      columns: [
        {
          title: '端口组名称',
          key: 'portGroupName',
          dataIndex: 'portGroupName',
          width: '20%',
          render: text => TooltipFn(text)
        },
        {
          title: '端口组详情',
          key: 'portDetail',
          dataIndex: 'portDetail',
          width: '68%',
          render: (text) => {
            return (<a onClick={() => this.showDetail(text)}>{text}</a>)
          }
        },
        {
          title: '操作',
          key: 'operate',
          width: '12%',
          render: (record) => {
            return (
              <div className="operate-wrap">
                <Fragment>
                  {
                    hasAuth(systemPermission.sysSetPortEdit) && record.defaultPort !== 1 &&
                    <a onClick={() => this.showEdit(1, record)}>编辑</a>
                  }
                  {
                    hasAuth(systemPermission.sysSetPortDelete) && record.defaultPort !== 1 &&
                    <a onClick={() => this.showDel(record.primaryKey)}>删除</a>
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
      // this.setState({ pagingParameter: list[0].page, values: list[0].parameter }, () => this.getList())
    } else {
      this.getList(false, false)
    }
  }
  render () {
    let { pagingParameter, body, columns, showDel, showEdit, modalData, detailVisible, result } = this.state
    let list = [], total = 0
    if (body) {
      list = body.items
      total = Number(body.totalRecords)
    }
    const defaultFields = [
      { type: 'input', label: '综合查询', placeholder: '请输入端口组名称/端口', key: 'information', allowClear: true, maxLength: 30 }
    ]
    const AlertInfo = {
      visible: showDel,
      onOk: this.sureDel,
      onCancel: this.handleCancel,
      children: (<p className="model-text">确认删除该端口组吗？</p>)
    }
    const portInfo = {
      title: modalData && modalData.portGroupName ? '编辑端口组' : '新建端口组',
      visible: showEdit,
      onOk: this.sureAdd,
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
                hasAuth(systemPermission.sysSetPortNew) && <Button type="primary" onClick={this.showEdit}>新建端口组</Button>
              }
            </div>
          </div>
          <Table rowKey="stringId" columns={columns} dataSource={list} pagination={false}
          />
          {total > 0 && <Pagination
            className="table-pagination"
            total={total}
            showTotal={(total) => `共 ${total || 0} 条数据`}
            showSizeChanger={total > 10 ? true : false}
            showQuickJumper
            onChange={this.changePage}
            onShowSizeChange={this.changePage}
            pageSize={pagingParameter.pageSize}
            current={pagingParameter.currentPage} />
          }
        </div>
        <ModalConfirm props={AlertInfo} />
        <PortModal props={portInfo} />
        <Modal
          className="over-scroll-modal"
          title="端口组详情"
          width={650}
          visible={detailVisible}
          footer={null}
          maskClosable={false}
          onCancel={() => { this.setState({ detailVisible: false }) }}>
          <div style={{ padding: 40 }}>{result}</div>
        </Modal>
      </div>
    )
  }
  //详情展示
  showDetail = (text) => {
    this.setState({
      detailVisible: true,
      result: text
    })
  }
  //编辑弹框
  showEdit = (index = 0, record = {}) => {
    if (index) {
      this.setState({
        modalData: record
      })
    } else {
      this.setState({
        modalData: null
      })
    }
    this.setState({
      showEdit: true
    })
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
    api.delPortGroup({ primaryKey: removeId }).then(res => {
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
    let id = analysisUrl(this.props.location.search).id
    if (isCache) {
      cacheSearchParameter([{
        page: pagingParameter,
        parameter: { ...values, ...sorter }
      }], this.props.history)
    }
    if (!values.information)
      delete values.information
    let port = 'getParamPortList'
    let param = { ...values, ...pagingParameter }
    if (id) param.primaryKey = id
    api[port](param).then(res => {
      if (param.currentPage !== 1 && !res.body.items.length) {
        this.setState({
          pagingParameter: {
            currentPage: param.currentPage - 1,
            pageSize: param.pageSize
          }
        }, this.getList)
      } else {
        this.setState({
          body: res.body
        })
      }
    })
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
export default PortManage