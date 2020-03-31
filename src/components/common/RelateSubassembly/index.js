import React, { Component } from 'react'
import { Table, TableBtns, RelateModal, Tooltip } from '@c/index'
import PropTypes from 'prop-types'
import { InputNumber, message } from 'antd'
import { SUBASSEMBLY_TYPE } from '@a/js/enume'
import api from '@/services/api'
//关联软件
/**
 * queryConfig: { Object } 操作按钮的请求配置， 注意：getList、addFunc、delFunc为定义的
 *                {
 *                  getList: Function()=>data,  // 获取已经关联的服务
 *                  addFunc: Function()=>data, // 添加服务请求
 *                  delFunc: Function()=>data, // 删除已经关联的服务
 *                  params: Object, // 以上三个函数的公共请求参数
 *                }
 */
const rowKey = 'businessId'
const OPERATE_TYPE_ADD = 'ADD' // 添加组件
const OPERATE_TYPE_DEL = 'DEL' // 移除组件
const OPERATE_TYPE_UPDATE = 'UPDATE' // 更新某一组件的数量
const DEFAULT_AMOUNT = 1 // 新增加的组件默认数量
export default class RelateSubassembly extends Component {
  static propTypes = {
    queryConfig: PropTypes.object,
    defaultList: PropTypes.array
  }
  static defaultProps = {
    queryConfig: {},
    defaultList: [],
    maxCount: 100
  }
  constructor (props) {
    super(props)
    const { disabledOperation, defaultList, onChange } = props
    const list = defaultList.map(e=>({ ...e, amount: e.amount || DEFAULT_AMOUNT, originalAmount: e.amount || DEFAULT_AMOUNT, isCPE: true }))
    this.isInitData = true // 是否可以初始化，只会执行一次，一次之后不再执行初始化
    this.state = {
      originalList: [], // 原始的数据列表
      list, // 最新的数据列表
      modalData: { visible: false }
    }
    if(defaultList.length){
      onChange && onChange([].concat(list), [], void 0, void 0, [].concat(list))
    }
    this.searchFields = [
      { key: 'supplier', label: '厂商', type: 'input', placeholder: '请输入厂商' }, { label: '名称', key: 'productName', placeholder: '请输入名称', type: 'input' } ]
    // 表格上部的右边按钮
    this.leftBtns = [ { label: '添加组件', onClick: this.openAddSubassemblyModal } ]
    this.actions = disabledOperation ? [] : [{ label: '移除', check: true, type: 'btn', confirm: { onOk: this.singledelSubassembly, text: '是否移除该组件' }, config: { name: 'productName' }, onClick: this.singledelSubassembly }]
  }

  componentDidMount () {
    const { params } = this.props
    this.initGetList(params)
  }
  // 获取初始数据
  initGetList = (param = {}) => {
    if(this.isInitData && param.assetId){
      this.getList()
      this.isInitData = false
    }
  }
  UNSAFE_componentWillReceiveProps (nextProps, nextContext) {
    const { resetKey: thisResetKey, defaultList, onChange } = this.props
    const { resetKey: nextResetKey, defaultList: nextDefaultList, queryConfig } = nextProps
    const { params } = queryConfig || {}
    this.initGetList(params || {})
    if(thisResetKey !== nextResetKey && nextResetKey){
      this.setState({ list: [] })
    }
    if(JSON.stringify(defaultList) !== JSON.stringify(nextDefaultList)){
      const { list, originalList } = this.state
      // 去除默认的数据列表/*注意更换了版本时，则替换版本带出的组件**/
      const _list  = list.filter(e=>!e.isCPE).concat(nextDefaultList.map(e=>({ ...e, amount: e.amount || DEFAULT_AMOUNT, originalAmount: e.amount || DEFAULT_AMOUNT, isCPE: true })))
      this.setState({ list: _list })
      onChange && onChange([].concat(_list), [], void 0, void 0, [].concat(originalList))
    }
  }

  /**
   * 操作组件，更改组件列表信息
   * @param operateType
   * @param subassemblyObj{ Object | Array }组件对象 或者 组件对象列表
   * @param idx {Number} 更新、删除对象时的下标
   */
  changeList = (operateType, subassemblyObj, idx) => {
    const { list, originalList } = this.state
    const { onChange } = this.props
    let _list = [...list]
    let addList = []
    let removeObj = void 0
    let changeObj = void 0
    switch(operateType) {
      case OPERATE_TYPE_ADD:{ // 添加
        const newAddList = subassemblyObj.map(e=>({ ...e, originalAmount: DEFAULT_AMOUNT, amount: DEFAULT_AMOUNT }))
        _list = [].concat(newAddList).concat(list)
        addList = newAddList
        break
      }
      case OPERATE_TYPE_DEL:{ // 移除
        _list = _list.filter((e)=>e[rowKey] !== subassemblyObj[rowKey])
        removeObj = subassemblyObj
        break
      }
      case OPERATE_TYPE_UPDATE:{ // 更新
        _list = _list.map((e, i)=>({ ...e, amount: i === idx ? subassemblyObj.amount : e.amount }))
        changeObj = subassemblyObj
        break
      }
      default:
    }
    this.setState({ list: _list })
    onChange && onChange([].concat(_list), addList, removeObj, changeObj, [].concat(originalList))
  }
  /**
   * 获取列表数据
   * @param param
   */
  getList = (param = {}) => {
    const { getList, params } = this.props.queryConfig
    getList && getList({ ...param, ...params }).then((res)=>{
      // initialize 代表是否是已经被绑定关系的组件
      const list = (res.body || []).map(e=>({ ...e, originalAmount: e.amount || DEFAULT_AMOUNT, amount: e.amount || DEFAULT_AMOUNT, initialize: true }))
      this.setState({ originalList: list, list })
    })
  }
  /**
   * 是否请求最后一页数据
   */
  isGetLastList = ({ currentPage, pageSize, totalRecords: total = 0, items } = {}) => {
    const { values } = this.state
    // 第一或者当前有数据时
    if(currentPage === 1 || currentPage === 0 || (items || []).length) {
      return
    }
    // 找到最优一页
    const _currentPage = Math.ceil(total / pageSize)
    this.setState({ page: { currentPage: _currentPage, pageSize } })
    this.getList({ ...values, currentPage: _currentPage, pageSize })
  }
  pageChange = ({ current: currentPage, pageSize }) => {
    this.setState({ currentPage, pageSize })
    this.getList({ currentPage, pageSize })
  }
  /**
   * 打开添加硬件的弹窗
   * @param record {Object} 当前部件的数据信息
   */
  openAddSubassemblyModal = (record) => {
    this.setState({ modalData: { record, visible: true } })
  }
  /**
   * 删除部件关联的硬件
   * @param record
   * @param callback
   */
  singledelSubassembly = (record, callback) => {
    this.changeList(OPERATE_TYPE_DEL, record, null)
    callback && callback()
  }
  /**
   * 关闭添加硬件的弹窗
   * @param record {Object} 当前部件的数据信息
   */
  closeAddSubassemblyModal = (record) => {
    this.setState({ modalData: { record, visible: false } })
  }
  /**
   * 添加设备提交事件
   * @param keys 添加的
   * @param list 添加的列表数据
   */
  addSubassemblyware = (keys, list) => {
    const { maxCount } = this.props
    const { list: oldList } = this.state
    const _list = list.concat(oldList)
    if(_list.length > maxCount){
      message.error(`超过最大数量${maxCount}，请重新选择`)
      return
    }
    this.changeList(OPERATE_TYPE_ADD, list, null)
    this.closeAddSubassemblyModal()
  }
  columns = [
    // { dataIndex: 'type', title: '类型', render: (text)=>(ASSET_TYPE.find(e=>e.value === text) || {}).name },
    { dataIndex: 'type', title: '组件类型', width: 150, render: (text)=>(SUBASSEMBLY_TYPE.find(type => type.value === text) || {}).name },
    { dataIndex: 'supplier',  title: '厂商', render: (text)=><Tooltip title={text}>{text}</Tooltip> },
    { dataIndex: 'productName', ellipsis: true, title: '名称', render: (text)=><Tooltip title={text}>{text + text + text}</Tooltip> },
    { dataIndex: 'amount',  title: '数量', render: (text, record, index)=> !this.props.disabledOperation ? <InputNumber step={1} min={1} max={999} style={{ width: 100 }} value={text} onChange={(v)=>{this.changeNum(v, record, index)}}/> : text }
  ]
  /**
   * 改变组件数量
   * @param v
   * @param record
   * @param i
   */
  changeNum = (v, record, i) => {
    this.changeList(OPERATE_TYPE_UPDATE, { ...record, amount: Math.ceil(v) }, i)
  }
  /**
   * 获取已入库软件列表
   * @param params
   * @return {void|*|IterableIterator<*|*>}
   */
  requestSubassemblyList = (params) => {
    const { params: configParams  = {} } = this.props.queryConfig || {}
    const { list } = this.state
    const { excludeId: exceptIds } = configParams
    return api.getSubassemblyList({ ...params, ...configParams, businessId: exceptIds, excludeAssemblyIds: list.map(e=>e[rowKey]) })
  }
  render () {
    const { list, modalData: { visible } } = this.state
    const { disabledOperation, page = true } = this.props
    return (
      <div className="table-wrap">
        { visible &&  <RelateModal rowKey={rowKey} title="添加组件" request={this.requestSubassemblyList} columns={ this.columns.filter(e=>e.dataIndex !== 'amount') } searchFields={this.searchFields} visible={visible} onSubmit={this.addSubassemblyware} onClose={this.closeAddSubassemblyModal}/> }
        { !disabledOperation && <TableBtns leftBtns={ this.leftBtns }/>}
        <Table scroll={{ y: 480, x: 800 }} className='not-x-scroll' actionWidth={150} rowKey={rowKey} columns={ this.columns } actions={this.actions} dataSource={ list } page={ page } onChange={ this.pageChange }/>
      </div>
    )
  }
}
