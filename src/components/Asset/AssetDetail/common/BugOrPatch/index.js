import React, { Component } from 'react'
import { TableBtns, Table } from '@c/index'
import { transliteration } from '@/utils/common'
import Tooltip from '@/components/common/CustomTooltip'
import Search from '@/components/common/Search'
import { Radio, message, Modal } from 'antd'
import { debounce } from 'lodash'
import { THREAT_GRADE, PATCH_LEVEL, WAIT_DISPOSE, BEGIN_PROCESSED, BEEN_RETURNED, VAL_DISPOSE_STATUS, IGNORE, PROCESSED } from '@a/js/enume'
import api from '@/services/api'
import AssetBugModal from '../../AssetBugModal'
import './index.less'

const RadioGroup = Radio.Group
const pageSize = 10
const current = 'current'
const history = 'history'
const rowKey = 'id'
const val_dispose_status = [ WAIT_DISPOSE, BEGIN_PROCESSED, BEEN_RETURNED ] // 漏洞状态
const val_dispose_history_status = [ IGNORE, PROCESSED ] // 漏洞历史状态

export default class BugOrPatch extends Component {
  static defaultProps ={
    componentType: 'bug'  // 组件类型只能为  bug、patch，其他
  }
  constructor (props){
    super(props)
    const cacheType = sessionStorage.getItem(props.componentType)
    this.state = {
      type: cacheType || current,
      backVisible: false, // 退回原因弹窗显示控制
      result: '',
      visible: false,
      isBatch: false, // 是否是批量提交
      selectedRowKeys: [],
      selectedRows: [],
      record: {}, // 单个操作的数据
      history: {
        filter: {},
        total: 0,
        currentPage: 1,
        pageSize,
        list: []
      },
      current: {
        filter: {},
        total: 0,
        currentPage: 1,
        pageSize,
        list: []
      }
    }
    const { data: { areaId } } = props
    const componentObject = {
      bug: {
        name: '漏洞',
        userParam: { 'flowId': 2, 'flowNodeTag': 'vul_repair', areaId: [areaId] },
        BEGIN_PROCESSED: BEGIN_PROCESSED,
        statusKey: 'status',
        ignoreFunc: api.vulUpdateStatus,
        getListFunc: api.getAssetValList,
        submitFunc: api.vulRepaireSubmit,
        columns: [
          {
            title: '漏洞编号',
            key: 'vulNo',
            dataIndex: 'vulNo',
            render: text=><Tooltip title={text}>{text}</Tooltip>
          }, {
            title: '漏洞名称',
            key: 'vulName',
            dataIndex: 'vulName',
            render: text=><Tooltip title={text}>{text}</Tooltip>
          }, {
            title: '危害等级',
            key: 'threatLevel',
            dataIndex: 'threatLevel',
            render: text=><Tooltip title={text}>{text}</Tooltip>
          },
          {
            title: '漏洞状态',
            key: 'status',
            dataIndex: 'status',
            render: (text, record)=> {
              if(text === BEEN_RETURNED.value){
                return (
                  <span className="back-btn" onClick={() => this.getResult(record.processInstanceId)}>{BEEN_RETURNED.name}<img className="back-result-icon" src={require('@a/images/bubble.png')} alt=""/></span>
                )
              }
              return (VAL_DISPOSE_STATUS.find(e=>e.value === text) || {}).name
            }
          }
        ],
        statusConfig: {
          history: val_dispose_history_status,
          current: val_dispose_status
        },
        // /bugpatch/bugmanage/information/detail?id=he_id
        // toDetail: (scope)=>`/bugpatch/bugmanage/information/detail?number=${transliteration(scope.antiyVulId)}&id=${transliteration(scope.id)}`,
        toDetail: (scope)=>{
          window.open(`/#/bugpatch/bugmanage/information/detail?number=${transliteration(scope.antiyVulId)}&id=${transliteration(scope.id)}`)
        },
        fieldList: [
          { label: '危害等级', key: 'threatLevel', type: 'select', data: THREAT_GRADE },
          { label: '漏洞编号', key: 'vulNo', type: 'input' },
          { label: '漏洞名称', key: 'vulName', type: 'input' },
          { label: '状态', key: 'status', type: 'select', data: val_dispose_status }
        ]
      },
      patch: {
        name: '补丁',
        userParam: { 'flowId': 1, 'flowNodeTag': 'patch_install', areaId: [areaId] },
        BEGIN_PROCESSED: BEGIN_PROCESSED,
        statusKey: 'status',
        ignoreFunc: api.ignorePatchDisposeTask,
        getListFunc: api.getAssetPatchList,
        submitFunc: api.postPatchDisposeTask,
        columns: [
          {
            title: '补丁编号',
            key: 'patchNo',
            dataIndex: 'patchNo',
            render: text=><Tooltip title={text}>{text}</Tooltip>
          },
          {
            title: '补丁名称',
            key: 'patchName',
            dataIndex: 'patchName',
            render: text=><Tooltip title={text}>{text}</Tooltip>
          },
          {
            title: '补丁等级',
            key: 'level',
            dataIndex: 'level',
            defaultSortOrder: 'descend',
            render: text=><Tooltip title={text}>{text}</Tooltip>
          },
          {
            title: '补丁来源',
            key: 'source',
            dataIndex: 'source',
            render: text=><Tooltip title={text}>{text}</Tooltip>
          },
          {
            title: '状态',
            key: 'status',
            dataIndex: 'status',
            render: (text, record)=> {
              if(text === BEEN_RETURNED.value){
                return (
                  <span className="back-btn" onClick={() => this.getResult(record.processInstanceId)}>{BEEN_RETURNED.name}<img className="back-result-icon" src={require('@a/images/bubble.png')} alt=""/></span>
                )
              }
              return (VAL_DISPOSE_STATUS.find(e=>e.value === text) || {}).name
            }
          }
        ],
        statusConfig: {
          history: val_dispose_history_status,
          current: val_dispose_status
        },
        // /bugpatch/patchmanage/install/detail?id=9&number=APL-2019-0005
        // toDetail: (scope)=>`/bugpatch/patchmanage/install/detail?id=${transliteration(scope.antiyPatchNo)}&number=${scope.antiyPatchNo}`,
        toDetail: (scope)=>window.open(`/#/bugpatch/patchmanage/install/detail?id=${transliteration(scope.antiyPatchNo)}&number=${scope.antiyPatchNo}`),
        fieldList: [
          { label: '补丁等级', key: 'level', type: 'select', data: PATCH_LEVEL },
          { label: '补丁编号', key: 'patchNo', type: 'input' },
          { label: '补丁名称', key: 'patchName', type: 'input' },
          { label: '状态', key: 'status', type: 'select', data: val_dispose_status }
        ]
      }
    }
    this.config = componentObject[props.componentType === 'patch' ? 'patch' : 'bug']
  }
  componentDidMount () {
    const { type } = this.state
    const { filter, currentPage, pageSize } = this.state[type]
    this[`${type}List`](filter, currentPage, pageSize)
  }
  //退回原因
  getResult = (processInstanceId) => {
    api.findHisFormDataByTaskDefKey({
      taskDefinitionKey: this.props.componentType === 'patch' ? 'patchHandle' : 'vulHandle',
      processInstanceId
    }).then(response => {
      if(response && response.head && response.head.code === '200' ){
        const result = response.body.filter(item => item.propertyId === 'reason')
        this.setState({
          backVisible: true,
          result: result.length ? result[0].propertyValue : ''
        })
      }
    })

  }
  pageChange = (currentPage, pageSize) => {
    const { type } = this.state
    const newData = { ...this.state[type], currentPage, pageSize }
    this.setState({ [type]: newData, selectedRowKeys: [], selectedRows: [] })
    // 按照类型查询数据
    this[`${type}List`](newData.filter, newData.currentPage, newData.pageSize)
  }
  // todo 关键处理地方
  /**
   * 获取历史漏洞数据列表
   * */
  historyList = (filter, currentPage, pageSize) => {
    const { assetId } = this.props
    this.getList(history, { ...filter, history: true, assetId, currentPage, pageSize })
  }
  /** // todo 关键处理地方
   * 获取当前漏洞数据列表
   * */
  currentList = (filter, currentPage, pageSize) => {
    const { assetId } = this.props
    this.getList(current, { ...filter, history: false, assetId, currentPage, pageSize })
  }
  getList = (type, params) => {
    const { assetId } = this.props
    assetId && this.config.getListFunc(params).then(res=>{
      const { items = [], totalRecords } = res.body || {}
      this.setState({ [type]: { ...this.state[type], list: items, total: totalRecords } })
    })
  }
  onSearch = (values) => {
    const { type } = this.state
    const newData = { ...this.state[type], currentPage: 1, filter: values }
    const { filter, pageSize } = newData
    this.setState({ [type]: newData })
    // 按照类型查询数据
    this[`${type}List`](filter, 1, pageSize)
  }
  changeType = (e) => {
    const type = e.target.value
    const { componentType } = this.props
    const data = { currentPage: 1, pageSize, list: [], total: 0, filter: {} }
    this.setState({ [type]: data, type, selectedRowKeys: [], selectedRows: [] })
    const list = (this.config.fieldList.find(e=>e.key === this.config.statusKey) || {})
    list.data = this.config.statusConfig[type]
    sessionStorage.setItem(componentType, type)
    // 按照类型查询数据
    this[`${type}List`](data.filter, data.currentPage, data.pageSize)
  }
  // 批量提交
  submitBatch = () => {
    this.setState({ visible: true, isBatch: true })
  }
  // 提交单个
  submitSingle = (record) => {
    this.setState({ visible: true, isBatch: false, record })
  }
  // 批量忽略
  ignoreBatch = () => {
    const { selectedRows } = this.state
    const ids = []
    let taskId = []
    selectedRows.forEach(e=>{
      ids.push(e.id)
      e.taskId && taskId.push(e.taskId)
    })
    taskId = taskId.length ? taskId : null
    this.config.ignoreFunc({ ids, taskId }).then(()=>{
      message.success(`已经忽略${this.config.name}成功`)
      const { type } = this.state
      this.setRowSelectedKeys(ids)
      const { filter, currentPage, pageSize } = this.state[type]
      this[`${type}List`](filter, currentPage, pageSize)
    })
  }
  // 忽略单个
  ignoreSingle = (record) => {
    this.config.ignoreFunc({ ids: [record.id], taskId: record.taskId ? [record.taskId] : null }).then(()=>{
      message.success(`忽略${this.config.name}成功`)
      const { type } = this.state
      this.setRowSelectedKeys([record.id])
      const { filter, currentPage, pageSize } = this.state[type]
      this[`${type}List`](filter, currentPage, pageSize)
    })
  }
  /**
   * 设置选中的keys
   * */
  setRowSelectedKeys = (ids = []) => {
    const { selectedRowKeys, selectedRows } = this.state
    this.setState({ selectedRowKeys: selectedRowKeys.filter(e=>!ids.includes(e)), selectedRows: selectedRows.filter(e=>!ids.includes(e[rowKey])) })
  }
  // 关闭提交弹窗
  onClose = () => {
    this.setState({ visible: false })
  }
  // 提交弹窗确认事件
  onConfirm = debounce((values) => {
    const { isBatch, record, selectedRows } = this.state
    const { componentType, assetId } = this.props
    const key = componentType === 'patch' ? 'patchId' : 'vulId'
    const params = { ...values, type: componentType === 'patch' ? 2 : 1, suggestionType: 1, assetIds: [assetId] }
    if(isBatch){
      params.ids = selectedRows.map(e=>e.id)
      params.taskId  = selectedRows.map(e=>e.taskId)
      params.relId = selectedRows.map(e=>e[key])
      !params.taskId.length && (params.taskId = null)
    }else {
      params.ids = [record.id]
      params.relId = [record[key]]
      params.taskId  = record.taskId ? [record.taskId] : null
    }
    this.config.submitFunc(params).then(()=>{
      this.setState({ visible: false })
      message.success('提交成功')
      const { type } = this.state
      this.setRowSelectedKeys(params.ids)
      const { filter, currentPage, pageSize } = this.state[type]
      this[`${type}List`](filter, currentPage, pageSize)
    })
  })
  // 检测忽略按钮、提交按钮的显示
  check = (record)=> {
    const { type } = this.state
    return record[this.config.statusKey] !== this.config.BEGIN_PROCESSED.value && type === current
  }
  render () {
    const { type, selectedRowKeys, visible, backVisible, result } = this.state
    const { list, total, pageSize, currentPage } = this.state[type]
    // 数据操作按钮列表
    const actions = [
      {
        type: 'btn',
        label: '忽略',
        confirm: { onOk: this.ignoreSingle, text: `忽略该${ this.config.name }吗?` },
        check: this.check
      },
      {
        type: 'btn',
        label: '提交',
        onClick: this.submitSingle,
        check: this.check
      },
      {
        type: 'btn',
        label: '查看',
        onClick: (record)=>{ return this.config.toDetail(record)}
      }
    ]
    const { columns, fieldList } = this.config
    // const historyFields = [].concat(fieldList, { label: '选择时间', key: 'time', type: 'dateRange' })
    const historyFields = [].concat(fieldList)
    const rowSelection = {
      selectedRowKeys,
      getCheckboxProps: (record)=>({ disabled: record[this.config.statusKey] === BEGIN_PROCESSED.value }),
      onChange: (selectedRowKeys, selectedRows)=>{
        this.setState({ selectedRowKeys, selectedRows })
      }
    }
    return (
      <div className="main-table-content asset-detail-val">
        <div className="search-bar">
          <div className="radio-group-filter">
            <RadioGroup value={type} buttonStyle="solid" onChange={this.changeType}>
              <Radio.Button value={current}>当前</Radio.Button>
              <Radio.Button value={history}>历史</Radio.Button>
            </RadioGroup>
          </div>
          <Search key={type} defaultFields={type === history ? historyFields : fieldList} onSubmit={this.onSearch} />
        </div>
        <div className="table-wrap">
          {
            type === current && <TableBtns
              rightBtns={
                [
                  { label: '忽略', confirm: { onOk: this.ignoreBatch, text: `是否忽略选择的${this.config.name}?` }, checkUsable: ()=>selectedRowKeys.length ? '' : `请选择${this.config.name}？` },
                  { label: '提交', onClick: this.submitBatch, checkUsable: ()=>selectedRowKeys.length ? '' : `请选择${this.config.name}?`  }
                ] }/>
          }
          <Table
            rowSelection={ type === current ? rowSelection : void 0 }
            checkBox={false}
            rowKey={rowKey}
            actions={actions}
            dataSource={list}
            columns={ columns }
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              showSizeChanger: true,
              onShowSizeChange: this.pageChange,
              showQuickJumper: true,
              showTotal: () => `共 ${total ? total : 0} 条数据`,
              total: total || 0,
              onChange: this.pageChange
            }}/>
        </div>
        {/*提交弹窗*/}
        { visible && <AssetBugModal config={this.config} visible={visible} onConfirm={this.onConfirm} onClose={this.onClose}/> }
        { backVisible &&
            <Modal
              className="over-scroll-modal"
              title="退回原因"
              width={ 650 }
              visible={ backVisible }
              footer={ null }
              maskClosable={ false }
              onCancel={ () => {
                this.setState({ backVisible: false })
              } }>
              <div style={ { padding: 40 } }>{ result }</div>
            </Modal>
        }
      </div>
    )
  }
}
