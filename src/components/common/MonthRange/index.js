import { Component } from 'react'
import { DatePicker, message } from 'antd'
import moment from 'moment'
import PropTypes from 'prop-types'

import './index.less'

const { MonthPicker } = DatePicker

export default class MonthRange extends Component{
  static propTypes={
    limit: PropTypes.number,
    fullRequest: PropTypes.bool
  }
  static defaultProps ={
    fullRequest: true, // 是否必须两个选择完成才会发生请求
    limit: 12 // 限制起始之间的间隔月份
  }
  constructor (props){
    super(props)
    this.state = {
      values: [null, null]
    }
  }
  // 禁止选择的月份
  disabledDate = (type, current) => {
    const { values } = this.state
    // 禁用未来时间
    const isAfter = current.valueOf()  > moment().valueOf()
    if(isAfter){
      return isAfter
    }
    if(type === 'start'){ // 不能选择比结束日期还晚的时间
      return values[1] ? (current.isSame(values[1], 'month') ? false : current.isAfter(values[1])) : false
    }else { // 不能选择比开始日期还早的时间
      return values[0] ? (current.isSame(values[0], 'month') ? false : current.isBefore(values[0])) : false
    }
    // return isAfter
  }
  /**
   * 选择事件
   * @param type 选择的是起始类型  start:开始  end: 结束
   * @param date 选择的时间，moment对象
   */
  onChange = (type, date) => {
    //fullRequest 两个都必须选择才会发生change事件
    const { fullRequest, onChange } = this.props
    // 设置为全部选择完在触发时
    const { values } = this.state
    const { limit } = this.props
    date = date ? moment(date.valueOf()) : date
    const range = [...values]
    if (type === 'start'){
      if(date){
        range[0] = moment(date.format('YYYY-MM') + '-01 00:00:00')
      }else {
        range[0] = date
      }
    }else {
      if(date){
        // 未来时间时，则给出当前时间
        // 当天
        const now = moment(moment().format('YYYY-MM-DD'))
        // 选择的日期
        const _date = moment(date.format('YYYY-MM-DD'))
        // 选择过去的日期
        if(_date.valueOf() < now.valueOf()){
          const yearAndMonth = date.format('YYYY-MM')
          // date 日期的月份的最后一天
          const lastDay = date.endOf('month').format('DD')
          range[1] = moment(yearAndMonth + '-' + lastDay + ' 23:59:59' )
        }else{
          range[1] = moment()
        }
      }else {
        range[1] = date
      }
    }
    this.setState({ values: range })
    // 判断结束时间不能早于开始时间
    if (range.filter(e=>e).length === 2){
      const startIsAfterEnd = range[0].isAfter(range[1])
      if (startIsAfterEnd){
        message.info('结束日期不能早于开始日期')
        return
      }
      // 结束日期与开始日期间隔不能大于 limit 个月
      const end = moment(range[1].valueOf()).subtract(limit, 'month')
      if (end > (range[0])){
        message.info(`起止日期不能超过${limit}个月`)
        return
      }
    }

    // 设置必须都选都选择时，才会触发change事件
    if (fullRequest){
      const hasEmpty = range.filter((e)=>!e).length
      if(!hasEmpty){
        onChange && onChange(range)
      }else {
        // message.info('请选择完整的查询日期')
      }
    }else { // 只要选择任意一个都会触发change事件
      onChange && onChange(range)
    }
  }
  render () {
    const { format = 'YYYY-MM', placeholder = [ '开始月份', '结束月份' ],  style } = this.props
    return (
      <div className="month-range-custom">
        <MonthPicker placeholder={placeholder[0]} getCalendarContainer={triggerNode => triggerNode.parentNode} format={format} style={{ ...style }} disabledDate={(date) => {return  this.disabledDate('start', date)}} onChange={(date)=>{ this.onChange('start', date)}}/>
        <span className="split">-</span>
        <MonthPicker placeholder={placeholder[1]} getCalendarContainer={triggerNode => triggerNode.parentNode} format={format} style={{ ...style }} disabledDate={(date) => {return  this.disabledDate('end', date)}} onChange={(date)=>{ this.onChange('end', date)}}/>
      </div>
    )
  }
}
