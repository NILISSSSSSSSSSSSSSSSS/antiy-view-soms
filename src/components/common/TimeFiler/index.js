import { Component } from 'react'
import {  Radio, DatePicker, message } from 'antd'
import moment from 'moment'
// import MonthRange from '@/components/common/MonthRange'
import './style.less'

const { RangePicker } = DatePicker
const RadioGroup = Radio.Group
moment.locale('zh-cn')
class ReportFormAssetArea extends Component{
  constructor (props){
    super(props)
    // 是否初始化显示
    this.isDefault = true
    this.state = {
      dateType: 'week',
      value: [],
      QuarterEnd: '',
      QuarterStart: '',
      mode: ['month', 'month'],
      typeList: { '1': 'week', '2': 'month', '3': 'quarter', '4': 'year', '5': 'other' }
    }
    this.defaultValueList = []
  }
  componentDidMount () {
    this.defaultValueList = this.generateeDefalutTypes()
    const result = this.getDefaultValue(this.props)
    if(result){
      const { typeList } = this.state
      const { type, value } = result
      this.setState({ dateType: typeList[type], value })
    }
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    const result = this.getDefaultValue(this.props)
    if(result){
      const { typeList } = this.state
      const { type, value } = result
      this.setState({ dateType: typeList[type], value })
    }
  }

  /**
   * 生成默认的时间段
   * @return {*[]}
   */
  generateeDefalutTypes = () =>{
    // 获取季度时间
    const quarter = this.getQuarter()
    const list = [
      { 'name': 'week', value: '1', 'begintime': moment().week(moment().week()).startOf('week').valueOf(), 'endtime': moment().valueOf() },
      { 'name': 'month', value: '2', 'begintime': moment().month(moment().month()).startOf('month').valueOf(), 'endtime': moment().valueOf() },
      { 'name': 'quarter', value: '3', 'begintime': quarter[0], 'endtime': moment().valueOf() },
      { 'name': 'year', value: '4', 'begintime': moment().year(moment().year()).startOf('year').valueOf(), 'endtime': moment().valueOf() }
    ]
    return list
  }

  /**
   * 判断是否初始化值，是就返回值，不是返回false
   * @param props
   */
  getDefaultValue = (props = {}) => {
    const { defaultValue, type } = props
    if(!this.isDefault){
      return false
    }
    // 没有默认值
    if(typeof type === 'undefined' || !type){
      return false
    }else {
      this.isDefault = false
      // 只有初始类型，没有初始时间时，自动填充对应类型的时间
      if(!defaultValue || !defaultValue.length){
        const [typeObj] = this.defaultValueList.filter((e)=>e.name === type || e.value === type)
        const value = typeObj && typeObj.value === '5' ? [moment(typeObj.beginTime), moment(typeObj.endTime) ] : []
        return { type, value }
      }

      return { type, value: defaultValue }
    }
  }
  /**
   * 判断是否初始化值，是就返回值，不是返回false
   * @param props
   */
  getValue = (props = {}) => {
    const { value, type } = props
    // 没有默认值
    if(typeof type === 'undefined' || !type){
      return false
    }else {
      return { type, value }
    }
  }
  //改变时间
  changeTime=(v)=>{
    const dateType = v.target.value
    this.setState({ dateType })
    const { onChange } = this.props
    let list = this.defaultValueList
    let ob = list.find((item)=>item.name === v.target.value)
    if ( ob ) {
      const param = { dateType, startTime: ob.begintime, endTime: ob.endtime }
      onChange && onChange(param)
    }
  }
  //初始化季度时间
  getQuarter = () => {
    let currentQuarter = moment().quarter() // 当前是第几季度
    let currentYear = moment().year() // 当前年
    this.setState({
      QuarterStart: (moment(moment(currentYear + '-01-01').toDate()).quarter(currentQuarter)).unix() * 1000
    })
    let endMonth = 3 * parseInt(currentQuarter, 0) //当季度最后一个月
    /* 对月数进行格式化 */
    if(endMonth < 10)
      endMonth = '0' + endMonth
    else
      endMonth += ''
    let endMonthDays = moment(currentYear + '-' + endMonth).daysInMonth() // 末尾月天数
    let endDays = currentYear + '-' + endMonth + '-' + endMonthDays //完整年月日整合
    this.setState({
      QuarterEnd: (moment(endDays).toDate()).valueOf()
    })
    return [(moment(moment(currentYear + '-01-01').toDate()).quarter(currentQuarter)).unix() * 1000, (moment(endDays).toDate()).valueOf()]
  }
  // 指定日期改变事件
  // otherChange = (range) => {
  //   const { onChange } = this.props
  //   let { dateType } = this.state
  //   const param = { dateType, startTime: range[0].valueOf(), endTime: range[1].valueOf() }
  //   onChange && onChange(param)
  // }
  handlePanelChange = (value, mode) => {
    value[0] = moment(value[0]).startOf('month')
    value[1] = moment(value[1]).endOf('month')
    if (moment(value[0]).add(1, 'y').isBefore(moment(value[1]))) {
      message.info('月份不能超过12个月！')
      return false
    }
    const { onChange } = this.props
    let { dateType } = this.state
    const param = { dateType, startTime: value[0].valueOf(), endTime: value[1].valueOf() }
    onChange && onChange(param)
    this.setState({
      value,
      mode: [mode[0] === 'date' ? 'month' : mode[0], mode[1] === 'date' ? 'month' : mode[1]]
    })
  }
  handleChange = value => {
    this.setState({ value })
  }
  render (){
    let { dateType, value, mode } = this.state
    return(
      <div className="time-filter">
        <RadioGroup value={dateType} buttonStyle="solid" onChange={this.changeTime}>
          <Radio.Button value="week">本周</Radio.Button>
          <Radio.Button value="month">本月</Radio.Button>
          <Radio.Button value="quarter">本季度</Radio.Button>
          <Radio.Button value="year">本年</Radio.Button>
          <Radio.Button value="other">指定日期</Radio.Button>
        </RadioGroup>

        {
          dateType === 'other' ? (
            // <MonthRange onChange={this.otherChange} fullRequest={true}/>
            <RangePicker
              style={{ marginLeft: 16 }}
              placeholder ={[' 开始月份', '结束月份' ]}
              getCalendarContainer={triggerNode => triggerNode.parentNode}
              format="YYYY-MM" value={value}
              mode={mode}
              onChange={this.handleChange}
              onPanelChange={this.handlePanelChange}/>
          ) : null
        }
      </div>
    )
  }
}

export default ReportFormAssetArea
