import React, { Component, Fragment } from 'react'
import { Table, Checkbox } from 'antd'
import { Link } from 'dva/router'
import { debounce } from 'lodash'
import CommonModal from '../Modal'

/**
 * 自定义表格
 * @param onSelectRows {Function} 行选中事件，没有传递该函数时，不会出现行多选框
 * @param columns {Array} 表头数组，与antd的一致
 * @param dataSource {Array} 表格数据，与antd的一致
 * @param page {Object} { currentPage, pageSize}优先级低于pagination
 * @param pagination {Object} 与antd配置一样，pagination与page冲突，优先级高于page
 * @param actions {Array} 操作列
 *                 [
 *                   {
 *                      type: 'link | btn | checkbox'   操作按钮类型
 *                      label: 'String'   按钮文本
 *                      onclick: 'function(record)'   当type 为 btn时生效，点击事件
 *                      onChange: 'function(selectRowKeys[], selectRows[])'   当type 为 checkbox时生效，点击事件
 *                      to: ' String | function(record)=> String | Object'   当type 为 link时生效
 *                      confirm: 'Object' { onOk: Function(record, callback), onCancel: Function(), text: String | Function(record)=>Any }
 *                                  当type 为 btn时，确认事件，此处onOk覆盖onClick事件
 *                                  callback 为回调关闭确认弹窗，onOk中，不执行callback，也会关闭弹窗
 *                                  text 为函数，弹窗的提示语为text返回的值
 *                                  text 没有时，会自动生成提示语
 *                   }
 *                 ]
 *
 */
export default class CustomTable extends Component{
  constructor (props){
    super(props)
    this.state = {
      confirmModal: { visible: false, text: '' },
      selectedRowKeys: [],
      selectedRows: [],
      selectedAllRow: [],
      operateChecks: []  //操作列为多选类型时的选择集合，类似于行选中
    }
  }
  UNSAFE_componentWillReceiveProps (nextProps, nextContext) {
    const { selectedRowKeys, selectedRows } = nextProps
    if(selectedRowKeys && selectedRows){
      this.setState({ selectedRowKeys, selectedRows })
    }
  }
  /**
   * 渲染操作列
   * @param actions
   * @return {{dataIndex: string, title: string, render: (function(*=): *), key: string}|Array}
   */
  renderActions = (actions  = [], actionWidth) => {
    if(!actions.length){
      return []
    }
    return (
      {
        title: '操作',
        dataIndex: 'operate',
        key: 'operate',
        width: actionWidth,
        render: (text, record)=>{
          const { operateChecks } = this.state
          return (
            <div className="operate-wrap">
              {
                actions.filter(e=>{
                  // 审核是否显示该操作按钮
                  if(typeof e.check === 'function'){
                    return e.check(record)
                  }else if(typeof e.check === 'boolean'){
                    return e.check
                  }
                  return true
                }).map((el, i)=>{
                  const { type, to, label, onClick, onChange, confirm } = el
                  if(type === 'link'){
                    const _to = typeof to === 'function' ? to(record) : to
                    return <Link key={`${i}-${label}`} to={_to}>{label}</Link>
                  }else if(type === 'btn'){
                    let click = onClick
                    // 确认框时
                    if(confirm){
                      click = this.openConfirmModal
                    }
                    return <a key={`${i}-${label}`} onClick={()=>{ click && click(record, confirm, el)}}>{label}</a>
                  }else if(type === 'checkbox'){
                    const checked = !!operateChecks.find(e=>e.stringId === record.stringId)
                    return <Checkbox key={`${i}-${label}`} checked={checked} onChange={()=>{ this.operateCheckChange(record, onChange)}}>{label}</Checkbox>
                  }
                  return null
                })
              }
            </div>
          )
        }
      }
    )
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
      text = confirm.text ? confirm.text : `是否${action.label}${record[name]} ?`
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
  onConfirm = debounce(() => {
    const { confirmModal: { onOk, data } } = this.state
    onOk && onOk(data)
    this.setState({ confirmModal: { data: {}, visible: false, text: '' } })
  })
  /**
   * 操作列的多选事件
   * @param record 该条记录
   * @param onChange 操作的按钮的回调函数
   */
  operateCheckChange = (record, onChange) => {
    const { operateChecks } = this.state
    const [ has ] = operateChecks.filter(e=>e.stringId === record.stringId)
    let _operateChecks = [ ]
    // 当前已经被选中时, 去除选中
    if(has){
      _operateChecks = operateChecks.filter(e=>e.stringId !== record.stringId)
    }else { // 当前数据没有被选中时，加入选中效果
      _operateChecks = [ ...operateChecks, record ]
    }
    const selectRowKeys = _operateChecks.map(e=>e.stringId)
    this.setState({ operateChecks: _operateChecks })
    onChange && onChange(selectRowKeys, _operateChecks)
  }
  /**
   * 表格的翻页事件
   * @param pagination
   * @param filters
   * @param sorter
   * @param extra
   */
  onChange =  (pagination, filters, sorter, extra) => {
    const { onChange } = this.props
    onChange && onChange(pagination, filters, sorter, extra)
  }
  render () {
    const { selectedRowKeys, confirmModal: { visible, text } } = this.state
    const { dataSource = [], columns, pagination, onSelectRows, rowSelection, page = {}, onChange, ...other } = this.props
    //勾选事件
    let _rowSelection = rowSelection
    if(onSelectRows && !rowSelection){
      _rowSelection = {
        selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          const { selectedRows: _selectedRows } = this.state
          let tmpArr = [ ..._selectedRows, ...selectedRows ].map(e=>JSON.stringify(e))
          tmpArr = [ ...new Set(tmpArr)].map((e)=>JSON.parse(e)).filter(e=>selectedRowKeys.includes(e[other.rowKey || 'stringId']))// new set()数组去重再转数组，再过滤掉selectedRowKeys=businessId的
          this.setState({
            selectedRowKeys,
            selectedRows: tmpArr
          })
          onSelectRows && onSelectRows(selectedRowKeys, tmpArr)
        }
      }
    }
    const { actions = [], actionWidth } = this.props
    if(actions.length){
      this.actions = this.renderActions(actions, actionWidth) || []
    }
    return (
      <Fragment>
        <Table
          rowKey="stringId"
          rowSelection={_rowSelection}
          columns={columns.concat(this.actions || [])}
          dataSource={dataSource}
          onChange={this.onChange}
          pagination={ pagination || (typeof page === 'boolean' ? false : {
            showQuickJumper: true,
            showSizeChanger: page.total > 10,
            showTotal: (total) => `共 ${ total } 条数据`,
            pageSize: page.pageSize,
            current: page.currentPage,
            total: page.total,
            ...page
          } )} {...other}/>
        <CommonModal
          type="confirm"
          visible={visible}
          onConfirm={this.onConfirm}
          onClose={this.closeConfirmModal}
        >
          <p className="confirm-text">{text}</p>
        </CommonModal>
      </Fragment>
    )
  }

}
