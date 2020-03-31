import React, { Component } from 'react'
import { Button, message } from 'antd'
import { Table, CommonModal, Search } from '@c/index'
import PropTypes from 'prop-types'

/**
 * props
 * @param searchFields{Array} 查询条件，与Search组件的fields一致
 * @param columns {Array} 表格的表头字段列表，与antd 的Table 组件 columns 一致
 * @param request {Function} 请求的方法，传递进来，内部进行请求，不予外部交互
 * @param visible {Boolean} 弹窗是否显示
 * @param title {String} 弹窗标题
 * @param onSubmit {Function} Function(keys|[], list|[])=> void 点击保存按钮回调函数，参数1为选择的stringId， 参数第2位为选中的列表数据
 */
export default class SoftwareModal extends Component {
  static propTypes = {
    request: PropTypes.func
  }
  constructor (props) {
    super(props)
    this.state = {
      list: [],
      total: 0,
      pageSize: 10,
      currentPage: 1,
      values: {}
    }
    this.actions = [{ label: '添加', check: true, type: 'checkbox', onChange: this.addHardware }]
  }

  componentDidMount () {
    const { currentPage, pageSize } = this.state
    this.getList({ currentPage, pageSize })
  }

  /**
   * 获取列表数据
   * @param param
   */
  getList = (param = {}) => {
    const { request } = this.props
    request && request({ ...param }).then((res)=>{
      const { items, totalRecords } = res.body || {}
      this.setState({ list: items || [], total: totalRecords })
    })
  }
  /**
   * 翻页事件、改变每页显示数量事件
   * @param currentPage
   * @param pageSize
   */
  pageChange = ({ current: currentPage, pageSize }) => {
    this.setState({ currentPage, pageSize })
    const { values } = this.state
    this.getList({ currentPage, pageSize, ...values })
  }

  /**
   * 关闭添加软件的弹窗
   */
  closeAddHardModal = () => {
    const { onClose } = this.props
    onClose && onClose()
  }
  addHardware = (keys, list) => {
    // console.log('选中的软件===》', keys, list)
    this.addKeys = keys
    this.list = list
  }
  /**
   * 提交数据
   */
  onSubmit = () =>{
    const { onSubmit } = this.props
    // console.log('添加信息集合===》', this.addKeys || [], this.list || [])
    if(this.addKeys && this.addKeys.length){
      onSubmit && onSubmit(this.addKeys || [], this.list || [])
    }else {
      message.info('请先选择数据')
    }
  }
  /**
   * 查询事件
   * @param values
   */
  onSearch = (values) => {
    const { pageSize } = this.state
    this.setState({ values, currentPage: 1 })
    this.getList({ ...values, currentPage: 1, pageSize })
  }
  render () {
    const { list, total, pageSize, currentPage } = this.state
    const { visible, title, searchFields = [], columns = [], rowKey } = this.props
    return (
      <CommonModal
        type="normal"
        visible={visible}
        title={title}
        width={1200}
        onClose={this.closeAddHardModal}
      >
        <Search defaultFields={searchFields} onSubmit={this.onSearch} okText="搜索"/>
        <div className="table-wrap">
          <Table columns={columns} rowKey={rowKey} onSelectRows={this.addHardware} onChange={this.pageChange} dataSource={list} page={{ total, pageSize, currentPage, showSizeChanger: false }}/>
        </div>
        <div className="button-center">
          <div>
            <Button type="primary" onClick={this.onSubmit}>保存</Button>
            <Button type="primary" ghost onClick={this.closeAddHardModal}>取消</Button>
          </div>
        </div>
      </CommonModal>
    )
  }
}
