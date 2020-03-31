
import React, { Component } from 'react'
import { Table, Pagination, message } from 'antd'
import { uniqBy } from 'lodash'
import { TooltipFn } from '@u/common'
import api from '@/services/api'
import { Search, CommonModal } from '@c/index'  //引入方式

export class SoftModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      body: {}, //列表
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      }, //分页
      values: {},
      selectedRowKeys: [],
      selectedAllRows: []
    }
  }
  componentDidMount () {
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    // 更新列表数据
    //根据操作系统查询基准项列表
    if (nextProps.visible && JSON.stringify(this.props.visible) !== JSON.stringify(nextProps.visible)) {
      this.setState({ visible: nextProps.visible }, this.initPageList)
    }
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
  //翻页
  pageChange = (page, pageSize) => {
    this.setState({
      pagingParameter: {
        currentPage: page,
        pageSize: pageSize
      }
    }, this.initPageList)
  }
  // 获取list
  initPageList = () => {
    let { values, pagingParameter } = this.state
    let { isTemplate } = this.props
    let param = { ...pagingParameter, ...values }
    param.os = this.props.os || ''
    // 装机模板传removeSoftIds，基准模板removeBusinessIds
    isTemplate === 'assetTemplate' ? param.removeSoftIds = this.props.removeBusinessIds : param.removeBusinessIds = this.props.removeBusinessIds
    //装机模板时传operationSystem
    if (isTemplate === 'assetTemplate') {
      param.operationSystem = param.os
      delete param.os
    }
    let port = isTemplate === 'assetTemplate' ? 'assetHardSoftLibList' : 'getListSoftware'
    api[port](param).then(res => {
      this.setState({
        body: res.body
      })
    })
  }
  //保存黑白名单
  save = () => {
    let { selectedAllRows, selectedRowKeys } = this.state
    let objectList = []
    if (selectedRowKeys.length === 0) {
      message.warn('没有选择要添加的软件')
      return
    }
    selectedAllRows.forEach(item => {
      if (selectedRowKeys.includes(item.stringId)) {
        item.softwareId = item.stringId
        objectList.push(item)
      }
    })
    this.setState({
      selectedRowKeys: [],
      values: {},
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      }
    }, () => this.props.saveAlerts(objectList))
  }
  //取消
  cancel = () => {
    this.setState({
      values: {},
      selectedRowKeys: [],
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      }
    }, this.props.closeAlerts)
  }
  //选择
  chooseSelect = (record)=>{
    this.props.saveAlerts(record)
  }
  render () {
    let { body, pagingParameter, selectedAllRows, selectedRowKeys } = this.state
    let list = [], total = 0
    if (body) {
      list = body.items
      total = Number(body.totalRecords)
    }
    let { visible, showSingle, isChange } = this.props
    let columns = [
      {
        title: '厂商',
        dataIndex: 'supplier',
        key: 'supplier',
        render: (text, record) => TooltipFn(record.manufacturer ? record.manufacturer : text)
      }, {
        title: '名称',
        dataIndex: 'productName',
        key: 'productName',
        render: (text, record) => TooltipFn(record.softwareName ? record.softwareName : text)
      }, {
        title: '版本',
        dataIndex: 'version',
        key: 'version',
        render: (text, record) => TooltipFn(record.edition ? record.edition : text)
      },
      {
        title: '系统版本',
        dataIndex: 'sysVersion',
        key: 'sysVersion',
        render: text => TooltipFn(text)
      },
      {
        title: '语言',
        dataIndex: 'language',
        key: 'language',
        render: text => TooltipFn(text)
      },
      {
        title: '软件版本',
        dataIndex: 'softVersion',
        key: 'softVersion',
        render: text => TooltipFn(text)
      },
      {
        title: '软件平台',
        dataIndex: 'softPlatform',
        key: 'softPlatform',
        render: text => TooltipFn(text)
      }, {
        title: '操作',
        dataIndex: 'operate',
        key: 'operate',
        width: '12%',
        isShow: true,
        render: (text, record) => (
          <div className="operate-wrap">
            {showSingle ? <a onClick={()=>this.chooseSelect(record)}>选择</a> : null}
          </div>)
      }
    ]
    if(showSingle){
      columns = columns.filter(item=>item.isShow || !item.isShow)
    }
    //勾选事件
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys,
          selectedAllRows: uniqBy([...selectedAllRows, ...selectedRows], 'stringId')
        })
      }
    }
    const defaultFields = [
      { type: 'input', label: '厂商', placeholder: '请输入厂商', key: 'manufacturer', allowClear: true, maxLength: 30 },
      { type: 'input', label: '名称', placeholder: '请输入名称', key: 'softwareName', allowClear: true, maxLength: 30 }
    ]
    return (
      <CommonModal
        title="添加软件"
        type="search"
        visible={visible}
        width={1200}
        oktext='保存'
        isOk={( isChange || showSingle) ? false : true}
        className="soft-modal"
        onConfirm={this.save}
        onClose={this.cancel}
      >
        <Search defaultFields={defaultFields} onSubmit={this.handleSubmit} />
        {/* 列表 */}
        <div className="table-wrap">
          {!showSingle ? <Table rowKey="stringId" rowSelection={rowSelection} columns={columns} dataSource={list} pagination={false} onChange={this.handleTableChange} /> :
            <Table rowKey="stringId" columns={columns} dataSource={list} pagination={false} onChange={this.handleTableChange} />}
          {/* 分页 */}
          {total > 0 && <Pagination
            current={pagingParameter.currentPage}
            pageSize={pagingParameter.pageSize}
            className="table-pagination"
            onChange={this.pageChange}
            onShowSizeChange={this.pageChange}
            total={total || 0}
            showTotal={(total) => `共 ${total || 0} 条数据`}
            showSizeChanger={false}
            showQuickJumper={true} />}
        </div>
      </CommonModal>
    )
  }
}
export default SoftModal
