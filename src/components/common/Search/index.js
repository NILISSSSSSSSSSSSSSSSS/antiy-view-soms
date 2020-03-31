import React, { Component, Fragment } from 'react'
import { Form, Button, Input, TreeSelect, Select, Icon } from 'antd'
import { subNodeQuery } from '@/utils/common'
import _ from 'lodash'
import PropTypes from 'prop-types'
import './index.less'
import DateRange from '../DateRange'
import BaseLineOs from '../BaseLineOs'
import SupplierAndNameAndVersion from '../SupplierAndNameAndVersion'

const { Item } = Form
const { SHOW_ALL, SHOW_PARENT, SHOW_CHILD, TreeNode } = TreeSelect
const Option = Select.Option
const TREE_SHOW = {
  'all': SHOW_ALL,
  'parent': SHOW_PARENT,
  'child': SHOW_CHILD
}

// 指定的2列宽的查询字段
// const spans = ['multipleQuery', 'categoryModel', 'dateRange']
const spans = []

const defaultFieldsInit = [
  { label: '综合查询', maxLength: 30, className: '', key: 'multipleQuery', span: 12, style: { width: 638 }, type: 'input', placeholder: '名称/编号/IP' }
]
const effectsEvent = ['reset']
// const fieldListInit = [
//   { label: '单选', key: 'select', type: 'select', placeholder: '请选择', data: [ { label: 'a', value: 'a' } ] },
//   { label: '单选', key: 'select1', type: 'select', placeholder: '请选择', data: [ { label: 'a', value: 'a' } ] },
//   { label: '单选', key: 'select2', type: 'select', placeholder: '请选择', data: [ { label: 'a', value: 'a' } ] },
//   { label: '查询时间', key: 'dateRange', type: 'dateRange', placeholder: ['开始日期', '结束日期'], data: [ ] },
//   { label: '资产类型', key: 'categoryModel', multiple: false, getChildrenKeys: true, config: { name: 'fullName', value: 'stringId' }, type: 'treeSelect', placeholder: '请选择', data: initData.selectTreeData }
// ]

/**
 * 注意：
 * props defaultFields { Array } 默认查询条件， 参考fieldList
 * props fieldList {Array} 查询条件的列表
 *        [
 *          {
 *            label: '', // 查询条件的显示名称
 *            key: '', // 查询条件的字段名
 *            type: 'select | dateRange | input',  // 查询条件的表单类型
 *            placeholder: String | [ String, String ] // 普通类型的是字符串，range类型为数组
 *            data: Array | Object 为选择类型表单的 下拉值，  Array: 是select 类型的 options， Object：是treeSelect的下拉选项
 *            multiple: Boolean, // 是否是对选，正对与下拉框选项有效
 *            getChildrenKeys: Boolean, // 是否获取下级及其后代节点的value，
 *            config: { name: String, value: String }, // name为下拉框类型表单的属性字段名，默认为name， value为下拉框类型表单的id属性字段名，默认为value
 *          }
 *        ]
 * props  onSubmit { Function } 查询提交时的回调函数
 * props  column { Number } 分多少列渲染
 * props  setDefaultExpandedStatus { Boolean } 查询栏的默认展开状态
 * props  onChange { Function } 任意查询条件改变时的回调函数  注意，此函数不能设置props，否则将进入死循环
 * props  onExpand { Function } 查询栏展开事件
 */
export class Search2 extends Component {
  constructor (props) {
    super(props)
    this.state = {
      conditionShow: false
    }
    // 点击重置按钮时，需要手动重置状态的
    this.manualResetFiled = ['dateRange']
    this.randomKey = Math.random()
    this.isDefault = true
    this.eventFunction = {
      reset: (arr = []) => {
        const { resetFields } = this.props.form
        resetFields(arr)
      }
    }
  }

  static defaultProps = {
    fieldList: [],
    column: 3, // 分多少列渲染
    defaultFields: defaultFieldsInit
  }
  static propTypes = {
    fieldList: PropTypes.array,
    defaultFields: PropTypes.array
  }

  componentDidMount () {
    const { setDefaultExpandedStatus } = this.props
    this.setDefaultExpandedStatus(setDefaultExpandedStatus)
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    const { setDefaultExpandedStatus } = nextProps
    this.setDefaultExpandedStatus(setDefaultExpandedStatus)
  }
  //展开搜索条件
  onExpand = () => {
    const { onExpand } = this.props
    let { conditionShow } = this.state
    this.setState({ conditionShow: !conditionShow })
    onExpand && onExpand(!conditionShow)
    //展开查询条件时，加载下拉框数据
    if (!conditionShow) {

    } else {
      // this.handleReset()
    }
  }
  /**
   * 设置查询栏的默认展开状态
   */
  setDefaultExpandedStatus = (defaultExpanded) => {
    // 初始化时，并且状态为布尔时
    if (this.isDefault && typeof defaultExpanded === 'boolean') {
      this.isDefault = false
      this.setState({ conditionShow: defaultExpanded })
    }
  }
  /**
   * 任意查询条件改变时，触发此函数
   * 注意：此函数不能改变props，此处提供给导出时，改变查询条件，但未点击查询按钮时，传递最新的查询条件
   */
  onChange = () => {
    this.getFieldsValues().then((values) => {
      const { onChange } = this.props
      onChange && onChange(values)
    })
  }
  /**
   * 获取查询参数，并且进行查询
   */Search
  onSubmit = () => {
    this.getFieldsValues().then((values) => {
      const { onSubmit } = this.props
      onSubmit && onSubmit(values)
    })
  }
  getFieldsValues = () => {
    return new Promise((resolve) => {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          const { fieldList } = this.props
          const params = { ...values }
          // 找出那些是要遍历子节点的ID的
          const _fieldList = fieldList.filter((e) => e.getChildrenKeys)
          // 需要遍历子节点的
          if (_fieldList.length) {
            _fieldList.forEach((e) => {
              // Set 去重
              params[e.key] = [...new Set(values[e.key] ? subNodeQuery(e.data)(Array.isArray(values[e.key]) ? values[e.key] : [values[e.key]]) : values[e.key])]
            })
          }
          resolve(params)
        }
      })
    })

  }
  /**
   * 点击查询按钮事件
   * @param e
   */
  handleSubmit = (e) => {
    e.preventDefault()
    this.onSubmit()
  }
  /**
   * 渲染formItem
   * @param fieldList
   * @return {any[]}
   * @private
   */
  _renderFormItem = (fieldList = [], column,  isDefaultFields) => {
    return _.chunk(fieldList.filter((e) => e.check ? e.check(e) : true), column).map((row, i, ) => {
      return row.map((el, idx) => {
        // 查询和重置按钮是否有marginLeft
        if(isDefaultFields){
          this.searcBtnMarginleft = false
        }
        let ItemClassName = ''
        // 真正的fileds，排除supplierLine2、supplierLine1
        if (el.key && fieldList.find(e => (e.type !== 'supplierLine1' && e.type !== 'supplierLine2'))) {
          const filterFields = _.chunk(fieldList.filter((e) => e.check ? e.check(e) : true).filter(e => (e.type !== 'supplierLine1' && e.type !== 'supplierLine2')), column)
          if (Array.isArray(filterFields[0])) {
            for (let i = 0, Ilen = filterFields.length; i < Ilen; ++i) {
              for (let j = 0, Jlen = filterFields[i].length; j < Jlen; ++j) {
                if (filterFields[i][j].key === el.key) {
                  if (Jlen === 2 && j === 1 || j !== 0 && j !== (Jlen - 1)) {
                    ItemClassName = ' search-item-separation '
                    if(i === Ilen - 1 && column > 1 && isDefaultFields){
                      this.searcBtnMarginleft = true
                    }
                  }
                }
              }
            }
          }
        }
        return this.renderComponent(el, idx, fieldList, row.length, ItemClassName)
      })
    })
  }
  /**
   * 渲染form的组件
   * @param el
   * @param idx
   * @param fieldList
   * @param len
   * @param ItemClassName
   * @return {null|*}
   */
  renderComponent = (el = {}, idx, fieldList, len, ItemClassName) => {
    const { getFieldDecorator } = this.props.form
    const { type, label = '', initialValue, span, key, placeholder, style, data, config, multiple = false, effects = [], treeCheckable = 1, showCheckedStrategy = 'parent', showSearch = true, treeDefaultExpandAll = true, onSearch, ...other } = el
    const { name, value } = config || {}
    let component = null
    // 当前列占用几列
    const _span = spans.includes(type) ? 12 : (span || 6)
    let formLayout = {}
    if (_span === 12) {
      // formLayout = { ...formLayout1 }
    } else {
      // formLayout = { ...formLayout2 }
    }
    const formItemClass = 'search-from-item ' + ItemClassName
    switch (type) {
      case 'input': {
        // const _style = { width: key === 'multipleQuery' ? 638 : 240 }
        const _style = {}
        component = (
          <Item label={label ? `${label}:` : ''} {...other} {...formLayout} key={label} className={formItemClass}>
            {getFieldDecorator(key, { initialValue })(
              <Input autoComplete="off" placeholder={placeholder || '请输入'} style={{ ...style, ..._style }} className={el.className} {...other} />
            )}
          </Item>
        )
        break
      }
      case 'select': {
        const mode = multiple ? { mode: 'multiple' } : {}
        let _data = data
        let option = { initialValue }
        const v = null
        // 多选没有全部选项
        if (!multiple) {
          _data = (data || []).filter((e) => e[name || 'name'] === '全部').length ? data : [{ [name || 'name']: '全部', [value || 'value']: v }, ...data]
          if(!initialValue){
            option = { initialValue: v }
          }
        }
        component = (
          <Item label={label ? `${label}:` : ''} {...formLayout} key={label} className={formItemClass} style={{ ...style }}>
            {getFieldDecorator(key, option)(
              <Select getPopupContainer={triggerNode => triggerNode.parentNode} placeholder={placeholder || '请选择'} optionFilterProp="label" showSearch={showSearch} onSearch={onSearch} {...style} {...other} {...mode}>
                {
                  _data.map((e, i) => {
                    return (
                      <Option key={i} value={e[value || 'value']} label={e[name || 'name']}>{e[name || 'name']}</Option>
                    )
                  })
                }
              </Select>
            )}
          </Item>
        )
        break
      }
      case 'treeSelect': {
        const { onChange, ..._other } = other
        const className = 'filter-form-item ' + el.className
        component = (
          <Item label={label ? `${label}:` : ''} {...formLayout} key={label} className={formItemClass}>
            {
              getFieldDecorator(key, { initialValue })(
                <TreeSelect
                  allowClear
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  // style={{ width: 174 }}
                  style={{ ...style }}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  placeholder={placeholder || '请选择'}
                  // style={{ width: '100%' }}
                  multiple={multiple}
                  initialValue = {initialValue}
                  onChange={(val, lab, extra) => {
                    // 特殊影响事件，在特征库、版本库影响到了版本的选择
                    if (effects.length) {
                      effects.forEach((effect) => {
                        if (effect.key) {
                          const hasEvent = _.intersection((effect.event || []), effectsEvent) || []
                          if (hasEvent.length) {
                            hasEvent.forEach((event) => {
                              this.eventFunction[event](effect.key)
                            })
                          }
                        }
                      })
                    }
                    onChange && onChange(val, lab, extra)
                  }}
                  treeDefaultExpandAll={treeDefaultExpandAll}
                  showCheckedStrategy={TREE_SHOW[showCheckedStrategy]}
                  treeCheckable={treeCheckable === 1 ? multiple : treeCheckable}
                  treeNodeFilterProp='title'
                  showSearch={showSearch}
                  onSearch={onSearch}
                  {...style}
                  {..._other}
                  className={className}
                >
                  {
                    this.renderCategoryModelNodeTree(data, { name, value })
                  }
                </TreeSelect>
              )
            }
          </Item>
        )
        break
      }
      case 'dateRange': {
        component = (
          <Item label={label ? `${label}:` : ''} {...formLayout} key={label} className={formItemClass}>
            {
              getFieldDecorator(key)(
                <DateRange placeholder={placeholder} style={{ width: 638, ...style }} resetKey={this.randomKey} className="filter-form-item" {...other} />
              )
            }
          </Item>
        )
        break
      }
      case 'supplierLine1': {
        const{ subfieldTitle = true, showLine = true } = other
        component = (
          <Fragment>
            <div className='line' style={{ visibility: showLine ? 'visible' : 'hidden' }} />
            { subfieldTitle && <p style={{ ...style }}>关联设备</p> }
          </Fragment >
        )
        break
      }
      case 'supplierLine2': {
        component = (
          <Fragment>
            <div className='line2'></div>
          </Fragment>
        )
        break
      }
      case 'os': {
        component = (
          <Fragment>
            <BaseLineOs showOs={this.props.showOs} showType={this.props.showType}/>
          </Fragment>
        )
        break
      }
      case 'supplierAndNameAndVersion': {
        component = (
          <Item label={label ? `${label}:` : ''} {...formLayout} key={label} className={formItemClass}>
            {
              getFieldDecorator(key)(
                <SupplierAndNameAndVersion key={key} form={this.props.form} placeholder={placeholder} style={{ ...style }} resetKey={this.randomKey} className="filter-form-item" {...other} />
              )
            }
          </Item>
        )
        break
      }
      default:
        return null
    }
    return component
  }
  /**
   * 重置数据
   */
  handleReset = (keys = []) => {
    const { fieldList = [], defaultFields, form, onReset } = this.props
    const fieldKeys = fieldList.concat(defaultFields).filter((e) => e.check ? e.check(e) : true).map((e) => e.key)
    const resetKeys = keys.concat(fieldKeys)
    resetKeys.length && form.resetFields(resetKeys)
    // 重置时，需要手动重置
    if (this.manualResetFiled.includes('dateRange')) {
      this.randomKey = Math.random()
    }
    if (onReset) {
      onReset()
    } else {
      this.onSubmit()
    }
  }
  //渲染关联设备型号
  renderCategoryModelNodeTree = (data = {}, config = {}) => {
    return (
      data && <TreeNode value={data[config.value || 'stringId']} title={data[config.name || 'name']} key={`${data[config.value || 'value']}`}>
        {
          data.childrenNode && data.childrenNode.length ? (
            data.childrenNode.map(item => {
              return this.renderCategoryModelNodeTree(item, config)
            })
          ) : null
        }
      </TreeNode>
    )
  }

  /**
   * 抽离指定的fileds
   */
  pullAway = (fields, list = []) => {
    const arr = []
    const last = []
    fields.forEach((el) => {
      if (!list.includes(el.key)) {
        arr.push(el)
      } else {
        last.push(el)
      }
    })
    return arr.concat(last)
  }
  /**
   * 是否给按钮设置margin-left值
   * @param defaultFields { Array }
   * @param column { Number }
   * */
  setBtnsMarginleft = (defaultFields = [], column) => {
    // 获取行列数据
    const list = _.chunk(defaultFields.filter(e => e.check ? e.check(e) : true), column)
    // 只有一行时
    if (list.length === 1) {
      // 只有一列时,按钮设置margin-left值
      if (list[0].length === 1) {
        return true
      } else {
        return false
      }
    } else if (list.length > 1) { // 多行时
      // 最后一行只有一列时,按钮设置margin-left值
      if (list[list.length - 1].length === 1) {
        return true
      } else {
        return false
      }
    }
  }
  render () {
    let { fieldList, defaultFields, column, showExpand = true } = this.props
    const { conditionShow } = this.state
    // const column = 4
    const fields = this.pullAway(fieldList, ['dateRange'])
    // const _fieldList = _.chunk(fields, column)
    const _fieldList = fields
    this.onChange()
    // const isMarginLeft = this.setBtnsMarginleft(defaultFields, column) ? '' : 'search-from-no-margin-left'
    return (
      <div className="custom-form">
        <Form className='filter-form' layout="inline" onSubmit={this.handleSubmit}>
          <div className="default-filter-item">
            {this._renderFormItem(defaultFields, column, true)}
            {/*{ this.renderFormItem(defaultFields) }*/}
            <Item className={`search-item search-more-item search-from-btn ${this.searcBtnMarginleft ? 'search-from-no-margin-left' : ''}`}>
              <div className="search-from-btn-content">
                <Button type='primary' htmlType='submit' >查询</Button>
                <Button onClick={() => this.handleReset()}>重置</Button>
                {
                  fields.length && showExpand ? (
                    <span className='show-ondition' onClick={this.onExpand}>
                      <Icon type={conditionShow ? 'up' : 'down'} />
                      {conditionShow ? '收起' : '高级查询'}
                    </span>
                  ) : null
                }
              </div>
            </Item>
          </div>
          <div className={'hide-form ' + ((conditionShow || !showExpand ) ? 'flex' : 'none')} >
            {this._renderFormItem(_fieldList, column)}
            {/*{*/}
            {/*  this.renderFormItem(_fieldList)*/}
            {/*}*/}
          </div>
        </Form>
      </div>
    )
  }
}
const Search = Form.create()(Search2)
export default Search
