
import React, { Component } from 'react'
import { Table, Pagination, message, Tooltip, Input } from 'antd'
import { uniqBy, find } from 'lodash'
import { connect } from 'dva'
import { TooltipFn, transliteration } from '@/utils/common'
import api from '@/services/api'
import { Search, CommonModal } from '@c/index'  //引入方式
import { SOURCE_LIST, SOURCE_LEVEL } from '@a/js/enume'
import { Link } from 'dva/router'
const changeRows = []
export class RelationAlert extends Component {
  constructor (props) {
    super(props)
    this.state = {
      body: null,
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      }, //分页
      sorter: { sortName: '', sortOrder: '' },
      selectedRowKeys: [],
      selectedAllRows: [],
      values: {},
      typeList: this.props.typeList || []
    }
  }
  componentDidMount () {
    this.props.dispatch({ type: 'baseSetting/getBaseLineType' })
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    // 更新列表数据
    if (nextProps.visible && JSON.stringify(this.props.visible) !== JSON.stringify(nextProps.visible)) {
      this.setState({ visible: nextProps.visible }, this.initPageList)
    }
    if (nextProps.typeList && JSON.stringify(this.props.typeList) !== JSON.stringify(nextProps.typeList)) {
      this.setState({
        typeList: nextProps.typeList
      })
    }
  }
  //获取列表
  initPageList = () => {
    let { values, pagingParameter, sorter } = this.state
    let param = { ...pagingParameter, ...values, ...sorter }
    param.os = this.props.os || ''
    param.isConfig = 1
    param.removeBusinessIds = this.props.removeBusinessIds
    if (param.sortOrder === 'ascend') {
      param.sortOrder = 'asc'
    } else if (param.sortOrder === 'descend') {
      param.sortOrder = 'desc'
    }
    if (!param.sortOrder) {
      delete param.sortOrder
    }
    if (!param.sortName) {
      delete param.sortName
    }
    api.baselineItemQuery(param).then(res => {
      let body = res.body
      //初始化数据
      body.items.forEach((item, i) => {
        const selectedRow = changeRows.filter(subItem => subItem.stringId === item.stringId)
        if (selectedRow.length) {
          body.items[i] = selectedRow[0]
        }
      })
      this.setState({
        body: JSON.parse(JSON.stringify(body))
      })
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
  //翻页
  pageChange = (page, pageSize) => {
    this.setState({
      pagingParameter: {
        pageSize: 10,
        currentPage: page
      }
    }, this.initPageList)
  }
  //保存基准项
  save = () => {
    let { selectedAllRows, selectedRowKeys } = this.state
    let objectList = []
    if (selectedRowKeys.length === 0) {
      message.warn('没有选择要关联的基准项')
      return
    }
    selectedAllRows.forEach(item => {
      if (selectedRowKeys.includes(item.stringId)) {
        objectList.push(item)
      }
    })
    this.setState({
      selectedRowKeys: [],
      values: {},
      sorter: { sortName: '', sortOrder: '' },
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      }
    }, () => this.props.saveAlerts(objectList))
  }
  //取消
  cancel = (index = 0) => {
    this.setState({
      selectedRowKeys: [],
      sorter: { sortName: '', sortOrder: '' },
      values: {},
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      }
    }, index === 1 ? this.props.closeAlerts : this.initPageList)
  }

  //排序
  handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      sorter: {
        sortName: sorter.columnKey === 'gmtCreate' ? 'gmt_create' : sorter.columnKey,
        sortOrder: sorter.columnKey === 'level' ? sorter.order : ''
      }
    }, this.initPageList)
  }
  //
  chooseSelect = (record)=>{
    this.props.saveAlerts(record)
  }
  //修复方式修改
  changeRepair = (value, record) => {
    let { body } = this.state
    body = JSON.parse(JSON.stringify(body))
    let currentRow = body.items.filter(item => item.stringId === record.stringId)[0]
    currentRow.defineValue = value.target.value
    let obj = find(changeRows, { stringId: record.stringId })
    if(!obj)
      changeRows.push(record)
    else{
      obj.defineValue = value.target.value
    }
    this.setState({
      body: JSON.parse(JSON.stringify(body))
    })
  }
  render () {
    let { body, pagingParameter, selectedAllRows, selectedRowKeys, sorter, typeList } = this.state
    let { visible, showSingle, isChange } = this.props
    const defaultFields = [
      { type: 'input', label: '名称', placeholder: '请输入基准项名称', key: 'name', allowClear: true },
      { type: 'input', label: '编号', placeholder: '请输入基准项编号', key: 'ruleId', allowClear: true },
      { type: 'select', multiple: false, label: '安全级别', placeholder: '请输入', key: 'level', data: SOURCE_LEVEL },
      { type: 'select', multiple: false, label: '检测规范', placeholder: '请输入', key: 'source', data: SOURCE_LIST },
      { type: 'treeSelect', multiple: true, placeholder: '全部', label: '基准类型', key: 'typeList', data: typeList, config: { name: 'name', value: 'node' }, treeDefaultExpandAll: false }
    ]
    let list = [], total = 0
    if (body) {
      list = body.items
      total = Number(body.totalRecords)
    }
    let columns = [{
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      isShow: true,
      render: text => TooltipFn(text)
    }, {
      title: '检测规范',
      dataIndex: 'sourceName',
      key: 'sourceName',
      isShow: false,
      render: (text) => {
        return text
      }
    }, {
      title: '编号',
      dataIndex: 'ruleId',
      key: 'ruleId',
      isShow: true,
      render: text => TooltipFn(text)
    }, {
      title: '安全级别',
      dataIndex: 'level',
      key: 'level',
      sorter: true,
      isShow: true,
      sortOrder: sorter.sortOrder,
      sortDirections: ['descend', 'ascend'],
      render: (text) => {
        return (text && text !== 4 ? SOURCE_LEVEL[text - 1].name : '--')
      }
    }, {
      title: '值',
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      isShow: true,
      render: (text, scope, index) => {
        if(!isChange)
          return TooltipFn(text)
        else return (
          (scope.valueStatus || scope.defineValue) &&
          < span >
            <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
              <span>
                <Input autoComplete="off"
                  style={{ width: '100%' }}
                  maxLength={30}
                  value={scope.defineValue}
                  onChange={(value) => { this.changeRepair(value, scope, index) }}
                />
              </span></Tooltip>
          </span >
        )
      }
    }, {
      title: '基准类型',
      dataIndex: 'typeName',
      key: 'typeName',
      width: '12%',
      isShow: true,
      render: text => TooltipFn(text)
    }, {
      title: '适用系统',
      dataIndex: 'osName',
      key: 'osName',
      width: '12%',
      isShow: true,
      render: text => TooltipFn(text)
    },
    {
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      width: '12%',
      isShow: true,
      render: (text, record) => (
        <div className="operate-wrap">
          {showSingle ? <a onClick={()=>this.chooseSelect(record)}>选择</a> : null}
          <Link to={`/basesetting/storage/detail?stringId=${transliteration(record.stringId)}&caches=1&nextRouter=1`} target="_blank">查看</Link>
        </div>
      )
    }]
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
    if(showSingle){
      columns = columns.filter(item=>item.isShow)
    }
    return (
      <CommonModal
        title="添加基准项"
        type="search"
        visible={visible}
        width={1200}
        oktext='保存'
        isOk={(isChange || showSingle) ? false : true}
        className="config-modal"
        onConfirm={this.save}
        onClose={() => this.cancel(1)}
      >
        <Search defaultFields={defaultFields} onSubmit={this.handleSubmit} onReset={this.cancel} />
        {/* 列表 */}
        {/* <h2> 配置基准项信息</h2> */}
        <div className="table-wrap">
          {showSingle ? <Table rowKey="stringId" columns={columns} dataSource={list} pagination={false} onChange={this.handleTableChange} /> :
            <Table rowKey="stringId" rowSelection={rowSelection} columns={columns} dataSource={list} pagination={false} onChange={this.handleTableChange} />
          }
          {/* 分页 */}
          {total > 0 && <Pagination
            current={pagingParameter.currentPage}
            pageSize={pagingParameter.pageSize} className="table-pagination"
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
//映射model内的数据操作系统
const mapStateToProps = ({ baseSetting }) => {
  return {
    typeList: baseSetting.typeList
  }
}
export default connect(mapStateToProps)(RelationAlert)