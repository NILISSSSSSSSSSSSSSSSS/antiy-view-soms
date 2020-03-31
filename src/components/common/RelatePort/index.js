import React, { Component } from 'react'
import { Table, TableBtns, RelatePortModal } from '@c/index'
import PropTypes from 'prop-types'
import { chunk, debounce } from 'lodash'
import { Icon, message } from 'antd'
import './index.less'
import CommonModal from '../Modal'
import { getAfterDeletePage } from '@u/common'

//关联端口
/**
 * queryConfig: { Object } 操作按钮的请求配置， 注意：getList、addFunc、delFunc为定义的
 *                {
 *                  getList: Function()=>data,  // 获取已经关联的服务
 *                  addFunc: Function()=>data, // 添加服务请求
 *                  delFunc: Function()=>data, // 删除已经关联的服务
 *                  params: Object, // 以上三个函数的公共请求参数
 *                }
 */
export default class ServeDetailPort extends Component {
  static propTypes = {
    queryConfig: PropTypes.object
  }
  static defaultProps = {
    queryConfig: {}
  }
  constructor (props) {
    super(props)
    this.state = {
      list: [],
      dataSource: this.dataSource,
      total: 0,
      pageSize: 30,
      currentPage: 1,
      modalData: { visible: false, record: false },
      confirmModal: { visible: false, data: {} }

    }
    this.searchFields = [ { label: '端口号', key: 'port', type: 'select', data: [] }, { label: '描述', key: 'describe', type: 'input' } ]
    // 表格上部的右边按钮
    this.leftBtns = [ { label: '添加端口', onClick: this.openAddPortModal } ]
  }

  componentDidMount () {
    const { currentPage, pageSize } = this.state
    // const list = chunk(this.dataSource, 3)
    // this.setState({ list, total: this.dataSource.length })
    this.getList({ currentPage, pageSize })
  }
  /**
   * 删除部件关联的硬件
   * @param record
   */
  singledelPort = debounce((record) => {
    const { delFunc, params } = this.props.queryConfig
    delFunc && delFunc({ ...params, record }).then(response => {
      if(response && response.head && response.head.code === '200' ){
        let { pageSize, currentPage, total  } = this.state
        message.success('删除成功！')
        currentPage = getAfterDeletePage(total - 1, currentPage, pageSize)
        this.setState({
          pageSize,
          currentPage
        })
        this.getList({ pageSize, currentPage })
      }
    })
  }, 1000, { leading: true, trailing: false })
  /**
   * 打开添加硬件的弹窗
   * @param record {Object} 当前部件的数据信息
   */
  openAddPortModal = (record) => {
    this.setState({ modalData: { record, visible: true } })
  }
  /**
   * 获取列表数据
   * @param param
   */
  getList = (param = {}) => {
    const { getList, params } = this.props.queryConfig
    getList && getList({ ...param, params }).then((res)=>{
      const { items, totalRecords } = res.body || {}
      const list = chunk(items || [], 3).map((e, i)=>({ idx: i, childrenNode: e }))
      this.setState({ list, total: totalRecords })
      // this.isGetLastList({ ...res.body, currentPage: param.currentPage })
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
  // 此处必须站位3个，dataIndex的值无所谓
  columns = [
    { dataIndex: 'port', width: '33%', title: '端口号', render: (coloum, record)=>this.renderItem(record.childrenNode[0], record) },
    { dataIndex: 'memo', width: '33%', title: '描述', render: (coloum, record)=>this.renderItem(record.childrenNode[1]) },
    { dataIndex: 'idx', width: '33%', title: '描述', render: (coloum, record)=>this.renderItem(record.childrenNode[2]) }
  ]
  renderItem = (port, record) => {
    if(!port){
      return null
    }
    const { disabledOperation } = this.props
    return (
      <div className="port-item">
        {port.port}
        { !disabledOperation && <Icon type="close-circle" onClick={()=>{this.openConfirmModal(port, { onOk: this.singledelPort, text: '确认删除关联的端口？' }, { label: '端口', config: { name: 'port' } })}}/> }
      </div>
    )
  }
  pageChange = ({ current: currentPage, pageSize }) => {
    this.setState({ currentPage, pageSize })
    this.getList({ currentPage, pageSize })
  }
  /**
   * 添加设备提交事件
   * @param keys 添加的
   */
  addPort = debounce((keys, list) => {
    const { addFunc, params } = this.props.queryConfig
    addFunc && addFunc({ ...params, keys: keys }).then(response => {
      if(response && response.head && response.head.code === '200' ){
        this.setState({ modalData: { visible: false } })
        message.success('新增成功！')
        const { pageSize } = this.state
        this.setState({ currentPage: 1 })
        this.getList({ currentPage: 1, pageSize })
      }
    })
  }, 1000, { leading: true, trailing: false })
  /**
   * 关闭添加硬件的弹窗
   * @param record {Object} 当前部件的数据信息
   */
  closeAddPortModal = (record) => {
    this.setState({ modalData: { record, visible: false } })
  }
  /**
   * 操作列包含confirm时，打开确认框事件
   * @param record {Object} 操作当前数据
   * @param confirm {Object} {onOk: Function(record), onCancel: Function(), text: String } confirm 配置信息
   * @param action {Object} 当前操作列的配置对象
   */
  openConfirmModal = (record, confirm, action) => {
    const { name = 'name' } = action.config || {}
    // 提示语
    let text = ''
    // text 为函数时
    if(typeof confirm.text === 'function'){
      text = confirm.text(record)
    }else {
      text = confirm.text ? confirm.text : `是否删除${action.label}${record[name]} ?`
    }
    this.setState({ confirmModal: { ...confirm, text, data: record, visible: true } })
  }
  /**
   * 操作列包含confirm时，打开确认框事件
   */
  closeConfirmModal = () => {
    const { confirmModal: { onCancel } } = this.state
    this.setState({ confirmModal: { data: {}, visible: false, text: '' } })
    onCancel && onCancel()
  }
  // 确认弹窗的确认事件
  onConfirm = () => {
    const { confirmModal: { onOk, data } } = this.state
    onOk && onOk(data)
    this.setState({ confirmModal: { data: {}, visible: false, text: '' } })
  }
  render () {
    const { list, total, pageSize, currentPage, confirmModal: { visible: configVisible, text }, modalData: { visible } } = this.state
    const { disabledOperation } = this.props
    return (
      <div className="table-wrap relate-port">
        <CommonModal
          type="confirm"
          visible={configVisible}
          onConfirm={this.onConfirm}
          onClose={this.closeConfirmModal}
        >
          <p className="confirm-text">{text}</p>
        </CommonModal>
        { visible &&  <RelatePortModal title="添加端口" columns={ this.columns } searchFields={this.searchFields} visible={visible} onSubmit={this.addPort} onClose={this.closeAddPortModal}/> }
        { !disabledOperation && <TableBtns leftBtns={ this.leftBtns }/>}
        <Table rowKey="idx" columns={ this.columns } dataSource={ list } page={ { pageSize, currentPage, total, showSizeChanger: false } } onChange={ this.pageChange }/>
      </div>
    )
  }
}
