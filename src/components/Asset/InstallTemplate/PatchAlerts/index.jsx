import React, { Component } from 'react'
import { connect } from 'dva'
import {  Form, Input, Button, Table, Pagination, Modal, message } from 'antd'
import api from '@/services/api'
import { TooltipFn } from '@/utils/common'
const { Item } = Form

export class PatchAlert extends Component {
  constructor (props){
    super(props)
    this.state = {
      patchColumns: [
        {
          title: '补丁编号',
          dataIndex: 'patchNumber',
          key: 'patchNumber',
          render: text => TooltipFn(text)
        }, {
          title: '补丁名称',
          dataIndex: 'patchName',
          key: 'patchName',
          render: text => TooltipFn(text)
        }, {
          title: '补丁等级',
          dataIndex: 'patchLevel',
          key: 'patchLevel',
          render: text => TooltipFn(text)
        }, {
          title: '补丁来源',
          dataIndex: 'pathSource',
          key: 'pathSource',
          render: text => TooltipFn(text)
        }, {
          title: '补丁热支持',
          dataIndex: 'hotfix',
          key: 'hotfix',
          render: text => TooltipFn(text)
        }, {
          title: '用户交互',
          dataIndex: 'userInteraction',
          key: 'userInteraction',
          render: text => TooltipFn(text)
        }, {
          title: '独占方式安装',
          dataIndex: 'exclusiveInstall',
          key: 'exclusiveInstall',
          render: text => TooltipFn(text)
        }, {
          title: '联网状态',
          dataIndex: 'networkStatus',
          key: 'networkStatus',
          render: text => TooltipFn(text)
        }
      ],
      patchModal: false,
      pagingParameter: {
        currentPage: 1,
        pageSize: 10
      },
      body: {},
      search: {},
      selectedRowKeys: [],
      rowsSelectedList: []
    }
  }
  componentDidMount (){
    this.props.children(this)
  }
  render (){
    let { patchColumns, selectedRowKeys,  pagingParameter, body, rowsSelectedList } = this.state
    let { getFieldDecorator } = this.props.form
    let { visible } = this.props
    let list = [], total = 0
    if(body){
      list = body.items
      total = body.totalRecords
    }
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        //分页批量操作
        let _rowsSelectedList = [...rowsSelectedList,  ...selectedRows]//把之前选中的和当前选中的列表放一起
        const tmpArr = _rowsSelectedList.map(e=>JSON.stringify(e))//把列表每项转成字符串
        _rowsSelectedList = [ ...new Set(tmpArr) ].map(e=>JSON.parse(e)).filter(e=>selectedRowKeys.includes(e.stringId))// new set()数组去重再转数组，再过滤掉selectedRowKeys=stringId的
        this.setState({
          selectedRowKeys,
          rowsSelectedList: _rowsSelectedList
        })
      }
    }
    return(
      <Modal
        className="table-modal over-scroll-modal"
        width={1200}
        visible={visible}
        onOk={ this.saveModal }
        onCancel={ this.closeModal }
      >
        <Form className="filter-form new-flex-layout" layout="inline" onSubmit={this.onSubmitPatch}>
          <Item label="补丁编号">
            {getFieldDecorator('patchNo')(
              <Input autoComplete="off" className="filter-form-item" placeholder="请输入补丁编号" maxLength={30}/>
            )}
          </Item>
          <Item label="补丁名称">
            {getFieldDecorator('patchName')(
              <Input autoComplete="off" className="filter-form-item" placeholder="请输入补丁名称" maxLength={180}/>
            )}
          </Item>
          <Item className="search-item item-separation">
            <Button type="primary" htmlType="submit">查询</Button>
            <Button type="primary" ghost onClick={this.handleReset}>重置</Button>
          </Item>
        </Form>
        <div className="table-wrap">
          <Table rowKey="stringId" rowSelection={rowSelection} columns={patchColumns} dataSource={ list }  pagination={false}></Table>
          {/* 分页 */}
          {
            total > 0 &&
            <Pagination
              current={pagingParameter.currentPage}
              pageSize={pagingParameter.pageSize}
              className="table-pagination"
              onChange={this.pageChange}
              onShowSizeChange={this.pageChange}
              total={total || 0}
              showTotal={(total) => `共 ${total || 0} 条数据`}
              showSizeChanger={false}
              showQuickJumper={true} />
          }

        </div>
      </Modal>
    )
  }
  //补丁列表数据
  getList = () => {
    let { operationSystem, patchs } = this.props
    const { pagingParameter, search } = this.state
    api.templateAddPatch({ ...pagingParameter, operationSystem, patchs, ...search }).then(res =>{
      this.setState({
        body: res.body
      })
    })
  }
  //分页
  pageChange = (currentPage, pageSize) => {
    this.setState({
      pagingParameter: {
        currentPage,
        pageSize
      }
    }, this.getList)
  }
  closeModal = () => {
    this.props.form.resetFields()
    this.setState({
      pagingParameter: {
        currentPage: 1,
        pageSize: 10
      },
      search: {},
      selectedRowKeys: []
    }, this.props.closeModal)
  }
  saveModal = () => {
    this.props.form.resetFields()
    let { rowsSelectedList } = this.state
    if(rowsSelectedList.length > 0){
      this.setState({
        pagingParameter: {
          currentPage: 1,
          pageSize: 10
        },
        search: {},
        selectedRowKeys: [],
        rowsSelectedList: []
      }, () => this.props.saveModal(rowsSelectedList))
    } else {
      message.warn('没有选择要添加的补丁')
    }

  }
  onSubmitPatch = (e) => {
    e.preventDefault()
    this.props.form.validateFields( (err, values) => {
      if(!err){
        !values.patchNo && delete values.patchNo
        !values.patchName && delete values.patchName
        this.setState({
          search: values,
          pagingParameter: {
            currentPage: 1,
            pageSize: 10
          }
        }, this.getList)
      }
    })
  }

  //重置表单信息
  handleReset = ()=>{
    this.props.form.resetFields()
    this.setState({
      search: {},
      selectedRowKeys: [],
      rowsSelectedList: [],
      pagingParameter: {
        currentPage: 1,
        pageSize: 10
      }
    }, () => this.getList())
  }
}

const mapStateToProps = ({ Alarms }) => {
  return {
  }
}
const PatchAlerts = Form.create()(PatchAlert)
export default connect(mapStateToProps)(PatchAlerts)
