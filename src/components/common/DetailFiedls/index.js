import { Col, Row, Tooltip } from 'antd'
import _ from 'lodash'
import React, { Component } from 'react'
import './index.less'

// 值为 Number | auto
const columnInit = 'auto'
const overFlowObj = {
  hidden: 'hidden',
  ellipsis: 'text-ellipsis',
  visible: 'text-visible'
}
const alignObj = {
  left: '',
  right: 'text-right'
}
const initValueShow = 'visible'
const tips = true
/**
 * 此组件为详情字段显示
 * @props fields{ Araay } 展示字段列表
 *        [{
 *            key: 'String' 字段属性要取data数据的key值
 *            name: 'String' 字段显示的中文名
 *            showTips: Boolean 是否显示antd 的Tooltip提示 默认true
 *            render: Function 自定义渲染字段的值
 *            overFlow: String 文件过长时处理 hidden 多余文字丢掉| ellipsis 多余文件以...显示 | visible 换行显示
 *        }]
 * @props align { String } left | right label的对其方式 默认是left
 * @props column { Number } 展示位几列 默认为 4列
 * @props data { Object } 详情数据信息
 * @props gutter { Number } 每个字段的间隔  单位为px
 */
export default class  DetailFiedls extends Component {
  static defaultProps = {
    gutter: 0
  }
  renderItem = (filed, i) => {
    const { data = {}, column = columnInit, align = 'left' } = this.props
    const { key, name, overFlow,  showTips = tips, value: customValue } = filed || {}
    if(filed.component){
      const Component = filed.component
      return Component
    }
    const className = `detail-content-value ${overFlowObj[overFlow || initValueShow]}`
    const labelClassName = `detail-content-label custom-detail-content-label ${alignObj[align]}`
    let value = customValue || data[key]
    if(filed.render){
      value = filed.render(data[key], data)
    }
    // 自适应时
    let obj = { xl: 8, xxl: 6 }
    // 一列占整行时
    if(column === 1){
      obj = {}
    }else if(typeof column === 'number'){
      // 多列时
      obj = { span: 24 / column }
    }
    let rowClassName = `detail-from-content-col ${filed.breakLine ? 'break-line' : ''}`
    return (
      <Col
        // span={ 24 / column}
        key={i} className={rowClassName} { ...obj }>
        <div className={labelClassName}>{name}</div>
        <div className={className}>
          {
            showTips ? (
              <Tooltip title={ tips ? value : ''}>
                <div className={className}>
                  { value }
                </div>
              </Tooltip>
            ) : value
          }

        </div>
      </Col>
    )
  }
  /**
   * 渲染子自适应
   * @return {*}
   */
  renderAuto = () => {
    const { fields = [], gutter } = this.props
    return (
      <Row className="detail-from-content-row" gutter={gutter}>
        {
          fields.map((it, i)=>{
            return this.renderItem(it, i)
          })
        }
      </Row>
    )
  }
  /**
   * 渲染多列
   * @return {*[]}
   */
  renderMultipleCol = () => {
    const { fields = [], column = columnInit, gutter } = this.props
    let row = column
    if(column === 'auto'){
      row = 1
    }
    return _.chunk(fields, row).map((el, idx)=>{
      const className = column === 1 ? 'detail-from-content-row detail-from-content-one-row' : 'detail-from-content-row'
      return (
        <Row className={className} key={idx} gutter={gutter}>
          {
            el.map((it, i)=>{
              return this.renderItem(it, i)
            })
          }
        </Row>
      )
    })
  }
  render (){
    const { column = columnInit } = this.props
    let dom = ''
    if(column === 'auto'){
      dom = this.renderAuto()
    }else if(typeof column === 'number'){
      dom = this.renderMultipleCol()
    }
    return (
      <div className="detail-from-content">
        {dom}
      </div>
    )
  }

}
