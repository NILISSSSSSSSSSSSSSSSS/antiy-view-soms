
import { Component } from 'react'
import { connect } from 'dva'
import moment from 'moment'
import { DatePicker, Form, Button } from 'antd'

import './style.less'

const { MonthPicker } = DatePicker

class AssetAdmitout2 extends Component{
  constructor (props){
    super(props)
    this.state = {
      startValue: null,
      endValue: null,
      endOpen: false
    }
  }

  disabledStartDate = (startValue) => {
    const endValue = this.state.endValue
    if (!startValue || !endValue) {
      // console.log('hh')
      return startValue > moment().subtract(3, 'month') && !(startValue < moment().endOf('day'))
    }
    const dateEndSubtract = moment(endValue).subtract(12, 'months')
    return startValue.valueOf() < dateEndSubtract.valueOf() || startValue.valueOf() > endValue.valueOf()
  }

  disabledEndDate = (endValue) => {
    const startValue = this.state.startValue
    if (!endValue || !startValue) {
      return endValue < moment().add(13, 'month') && !(endValue > moment().startOf('day'))
    }
    const dateStartAdd = moment(startValue).add(13, 'months')
    return endValue.valueOf() > dateStartAdd.valueOf() || endValue.valueOf() <= startValue.valueOf()
  }

  onChange = (field, value) => {
    this.setState({
      [field]: value
    })
  }

  onStartChange = (value) => {
    console.log(value)
    this.onChange('startValue', value)
  }

  onEndChange = (value) => {
    console.log(value)
    this.onChange('endValue', value)
  }

  handleStartOpenChange = (open) => {
    if (!open) {
      this.setState({ endOpen: true })
    }
  }

  handleEndOpenChange = (open) => {
    console.log(open)
    this.setState({ endOpen: open })
  }
  onPanelChangeStart = (value) => {
    console.log(value)
  }
  renderFooter (){
    return(
      <Button>choose</Button>
    )
  }
  // postData = () => {
  //   this.setState({ endOpen: false })
  //   console.log(this.state.startValue, this.state.endValue)
  // }
  render (){
    const { startValue, endValue, endOpen } = this.state
    return(
      <div>
        <MonthPicker
          disabledDate={this.disabledStartDate}
          showTime
          format="YYYY-MM"
          value={startValue}
          placeholder="Start"
          onChange={this.onStartChange}
          onOpenChange={this.handleStartOpenChange}
          onPanelChange={this.onPanelChangeStart}
          // renderExtraFooter={() => {
          //   return(
          //     <Button type="primary" onClick={this.postData}>确认</Button>
          //   )
          // }}
        />
        ~
        <MonthPicker
          disabledDate={this.disabledEndDate}
          showTime
          format="YYYY-MM"
          value={endValue}
          placeholder="End"
          onChange={this.onEndChange}
          open={endOpen}
          onOpenChange={this.handleEndOpenChange}
          onPanelChange={this.onPanelChangeEnd}
          // renderExtraFooter={() => {
          //   return(
          //     <Button type="primary" onClick={this.postData}>确认</Button>
          //   )
          // }}
        />
      </div>
    )
  }
}

const AssetAdmittanceListForm = Form.create()(AssetAdmitout2)
export default connect()(AssetAdmittanceListForm)
