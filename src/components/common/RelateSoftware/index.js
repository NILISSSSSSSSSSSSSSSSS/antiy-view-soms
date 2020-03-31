import React, { Component } from 'react'
import { Table, TableBtns, RelateModal, Tooltip } from '@c/index'
import PropTypes from 'prop-types'
import api from '@/services/api'
import moment from 'moment'
import { emptyFilter } from '../../../utils/common'
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
const OPERATE_TYPE_ADD = 'ADD' // 添加组件
const OPERATE_TYPE_DEL = 'DEL' // 移除组件
const OPERATE_TYPE_UPDATE = 'UPDATE' // 更新某一组件的数量
const rowKey = 'softwareId'
export default class RelateSoftware extends Component {
  static propTypes = {
    queryConfig: PropTypes.object,
    needPage: PropTypes.bool
  }
  static defaultProps = {
    queryConfig: {},
    needPage: false  // 是否需要分页（服务器分页）
  }
  constructor (props) {
    super(props)
    const { disabledOperation } = props
    this.state = {
      list: [],
      currentPage: 1,
      pageSize: 10,
      originalList: [],
      modalData: { visible: false }
    }
    this.searchFields = [
      // { key: 'type', label: '类型', type: 'select', data: ASSET_TYPE },
      { key: 'supplier', label: '厂商', type: 'input', placeholder: '请输入厂商' }, { label: '名称', placeholder: '请输入名称', key: 'productName', type: 'input' } ]
    // 表格上部的右边按钮
    this.leftBtns = [ { label: '添加软件', onClick: this.openAddSoftModal } ]
    this.actions = disabledOperation ? [] : [{ label: '移除', check: true, type: 'btn', confirm: { onOk: this.singledelSoft, text: '是否移除该软件' }, config: { name: 'productName' }, onClick: this.singledelSoft }]
  }

  componentDidMount () {
    const { currentPage, pageSize } = this.state
    this.getList(currentPage, pageSize)
  }
  /**
   * 操作软件，更改软件列表信息
   * @param operateType
   * @param softObj{ Object | Array }软件对象 或者 软件对象列表
   * @param idx {Number} 更新、删除对象时的下标
   */
  changeList = (operateType, softObj, idx) => {
    const { list, originalList } = this.state
    const { onChange } = this.props
    let _list = [...list]
    switch(operateType) {
      case OPERATE_TYPE_ADD:{
        _list = [].concat(softObj, _list)
        break
      }
      case OPERATE_TYPE_DEL:{
        _list = _list.filter((e)=>e[rowKey] !== softObj[rowKey])
        break
      }
      case OPERATE_TYPE_UPDATE:{
        _list = _list.map((e, i)=>({ ...e, count: i === idx ? softObj.count : e.count }))
        break
      }
      default:
    }
    onChange && onChange(_list, originalList)
    this.setState({ list: _list })
  }
  /**
   * 获取列表数据
   */
  getList = (currentPage, pageSize) => {
    const { getList, params } = this.props.queryConfig
    const { needPage } = this.props
    const _params = { ...params }
    if(needPage){
      _params.pageSize = pageSize
      _params.currentPage = currentPage
    }
    getList && getList({ ..._params }).then((res)=>{
      let list = []
      let totalRecords = void 0
      if(needPage){
        list = (res.body || {}).items
        totalRecords = (res.body || {}).totalRecords
      }else {
        list = res.body || []
      }
      this.setState({ list: list, totalRecords, currentPage, pageSize,  originalList: list })
    })
  }
  /**
   * 打开添加硬件的弹窗
   * @param record {Object} 当前部件的数据信息
   */
  openAddSoftModal = (record) => {
    this.setState({ modalData: { record, visible: true } })
  }
  /**
   * 删除部件关联的硬件
   * @param record
   */
  singledelSoft = (record) => {
    this.changeList(OPERATE_TYPE_DEL, record, null)
  }
  /**
   * 关闭添加硬件的弹窗
   * @param record {Object} 当前部件的数据信息
   */
  closeAddSoftModal = (record) => {
    this.setState({ modalData: { record, visible: false } })
  }
  /**
   * 添加设备提交事件
   * @param keys 添加的
   * @param list 添加的
   */
  addSoftware = (keys, list) => {
    this.changeList(OPERATE_TYPE_ADD, list, null)
    this.closeAddSoftModal()
  }
  columns = [
    // { dataIndex: 'type', title: '类型', render: (text)=>(ASSET_TYPE.find(e=>e.value === text) || {}).name },
    { dataIndex: 'supplier', title: '厂商', render: (text)=><Tooltip  placement="topLeft" title={text}>{text}</Tooltip> },
    { dataIndex: 'productName', title: '名称', render: (text)=><Tooltip title={text}>{text}</Tooltip> },
    { dataIndex: 'version', title: '版本', render: (text)=><Tooltip title={text}>{text}</Tooltip> }
    // { dataIndex: 'softPlatform', title: '软件平台', render: (text)=><Tooltip title={text}>{text}</Tooltip> }
  ]
  /**
   * 分页
   * @param currentPage
   * @param pageSize
   */
  pageChange = (currentPage, pageSize) => {
    this.getList(currentPage, pageSize)
  }
  /**
   * 获取已入库软件列表
   * @param params
   * @return {void|*|IterableIterator<*|*>}
   */
  requestSoftList = (params) => {
    const { params: configParams  = {} } = this.props.queryConfig || {}
    const { list } = this.state
    return api.installableList({ ...configParams, ...params, exceptIds: list.map(e=>e.softwareId) })
  }
  render () {
    const { list, modalData: { visible }, totalRecords, currentPage, pageSize } = this.state
    const { disabledOperation, needPage } = this.props
    let page = false
    if(needPage){
      page = {
        current: currentPage,
        pageSize: pageSize,
        showQuickJumper: true,
        showSizeChanger: true,
        pageSizeOptions: [ '10', '20', '30', '40' ],
        onShowSizeChange: this.pageChange,
        showTotal: () => `共 ${ totalRecords } 条数据`,
        defaultCurrent: 1,
        defaultPageSize: 10,
        total: totalRecords,
        onChange: this.pageChange
      }
    }
    let columns = []
    if(needPage){
      columns = [].concat(this.columns).concat({ dataIndex: 'gmtCreate', title: '关联时间', render: (text)=>( text ? <span className="tabTimeCss">{moment(parseInt(text, 10)).format('YYYY-MM-DD HH:mm:ss')}</span> : emptyFilter()) })
    }else {
      columns = [].concat(this.columns).concat({ dataIndex: 'gmtCreate', title: '品类型号', render: (text)=>( text ) })

      // columns = this.columns
    }
    return (
      <div className="table-wrap">
        { visible &&  <RelateModal rowKey={rowKey} title="添加软件" request={this.requestSoftList} columns={ this.columns } searchFields={this.searchFields} visible={visible} onSubmit={this.addSoftware} onClose={this.closeAddSoftModal}/> }
        { !disabledOperation && <TableBtns leftBtns={ this.leftBtns }/>}
        <Table rowKey={rowKey} columns={ columns } actions={this.actions} dataSource={ list } page={ page } />
      </div>
    )
  }
}
