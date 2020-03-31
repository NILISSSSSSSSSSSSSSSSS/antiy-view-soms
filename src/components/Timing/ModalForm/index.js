import { Component, Fragment } from 'react'
import { connect } from 'dva'
import { Modal, Form, Radio, Select, LocaleProvider, DatePicker, Input, TimePicker, Button } from 'antd'
import api from '@/services/api'
import zhCN from 'antd/lib/locale-provider/zh_CN'
import { replaceAliasName, getDisabledWeek, getDisabledMonth } from '@/utils/common'
import './style.less'

import moment from 'moment'
// import _ from 'lodash'
const { Item } = Form
const { Group } = Radio
const { Option } = Select
const { TextArea } = Input

class ModalForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      startTime: '', // 开始时间
      endTime: '', // 结束时间
      weekArr: [], // 开始时间与结束时间之间包含的星期数
      monthArr: [], // 开始时间与结束时间之间包含的月数
      title: '',
      modalCycle: 'once' // 任务周期
    }
  }
  componentDidMount (){
    document.addEventListener('keydown', (e) => {
      if(e.srcElement.nodeName === 'DIV'){
        e.preventDefault()
      }
    })
  }
  componentWillUnmount (){
    document.removeEventListener('keydown', ()=>{})
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    if(this.props.visible !== nextProps.visible && nextProps.visible){
      this.setState({
        weekArr: [],
        monthArr: [],
        title: nextProps.taskPlan.modalData ? '编辑定时任务' : '登记定时任务',
        isEdit: nextProps.taskPlan.modalData ? true : false,
        modalCycle: nextProps.taskPlan.modalCycle,
        startTime: nextProps.taskPlan.modalData ? moment(nextProps.taskPlan.modalData.startTime).format('YYYY-MM-DD HH:mm:ss') : '',
        endTime: nextProps.taskPlan.modalData ? moment(nextProps.taskPlan.modalData.endTime).format('YYYY-MM-DD HH:mm:ss') : ''
      })
      this.editEndTime = false
      this.editCycle = false
    }
  }
  /**
   * 注：编辑状态时，当还未修改完成时间时，不限制开始时间必须限制小于完成时间
   * 避免由于完成时间小于系统当前时间，开始时间又限制大于当前时间，造成开始时间无可选范围的问题
   **/
  disabledStartDate = current  => {
    const { endTime, isEdit } = this.state
    if (!current || !endTime || (isEdit && !this.editEndTime)) {
      return current && current < moment().startOf('day')
    }
    return current < moment().startOf('day') || current.valueOf() > moment(endTime).endOf('day')
  }
  disabledEndDate = current => {
    const { startTime } = this.state
    if (!current || !startTime) {
      return current && current < moment().startOf('day')
    }
    return  current < moment().startOf('day') || current.valueOf() <  moment(startTime).startOf('day')
  }

  render () {
    const { visible, form } = this.props
    const { getFieldDecorator } = form
    const { typeMapping, modalData, monthday } = this.props.taskPlan
    const { weekArr, monthArr, title, modalCycle } = this.state
    const formItemLayout = {
      labelCol: {
        span: 8
      },
      wrapperCol: {
        span: 12
      }
    }
    function disabledDate (current) {
      return current && current < moment().startOf('day')
    }
    /**
     *  限制选择的时分秒
     *  选择的时间，若日期与当前系统日期相等，并且小时数等于当前系统时间时，限制时和分在当前时间以前的不可选
     */
    function disabledDateTime (current) {
      if (!current) return {
        disabledHours: () => range(0, 24),
        disabledMinutes: () => range(0, 60),
        disabledSeconds: () => range(0, 60)
      }
      let hours = moment().hours()
      let minutes = moment().minutes()
      if (moment(current).format('YYYY-MM-DD') === moment(new Date()).format('YYYY-MM-DD')) {
        if (moment(current).hours() === hours) {
          return {
            disabledHours: () => range(0, hours),
            disabledMinutes: () => range(0, minutes)
          }
        } else {
          return {
            disabledHours: () => range(0, hours)
          }
        }
      }
    }

    function range (start, end) {
      const result = []
      for (let i = start; i < end; i++) {
        result.push(i)
      }
      return result
    }

    return (
      <Modal
        className="over-scroll-modal timing-modal"
        title={title}
        width='650px'
        footer={null}
        maskClosable={false} visible={visible} onOk={this.handleSubmit} onCancel={() => {
          this.props.close(form)
          this.resetForm()
        }}>
        <Form>
          <div className="form-content">
            <Item>
              {getFieldDecorator('id', {
                initialValue: modalData && modalData.stringId
              })(
                <Input autoComplete="off" hidden />
              )}
            </Item>
            <Item {...formItemLayout} label="定时任务名称">
              {getFieldDecorator('alias-name', {
                initialValue: modalData && modalData.name,
                rules: [{ required: true, message: '请输入定时任务名称' }, { message: '请输入1-60个字符', max: 60 }]
              })(
                <Input autoComplete="off" placeholder="请输入定时任务名称" disabled={modalData && modalData.name ? true : false}/>
              )}
            </Item>
            <Item {...formItemLayout} label="定时任务类型">
              {getFieldDecorator('alias-executeCommand', {
                initialValue: modalData && `${modalData.executeCommand}`,
                rules: [{ required: true, message: '请选择定时任务类型' }]
              })(
                <Select placeholder="请选择定时任务类型" disabled={modalData && modalData.executeCommand ? true : false} getPopupContainer={triggerNode => triggerNode.parentNode}>
                  {Object.keys(typeMapping).map(key => <Option key={key}>{typeMapping[key]}</Option>)}
                </Select>
              )}
            </Item>
            <Item {...formItemLayout} label="是否启动任务">
              {getFieldDecorator('startPlan', {
                initialValue: 'true',
                rules: [{ required: true, message: '请选择是否启动任务' }]
              })(
                <Group>
                  <Radio value="true">是</Radio>
                  <Radio value="false">否</Radio>
                </Group>
              )}
            </Item>
            <Item {...formItemLayout} label="任务周期">
              {getFieldDecorator('alias-taskCycle', {
                initialValue: modalData && modalData.taskCycle ? modalData.taskCycle.toLowerCase() : 'once',
                rules: [{ required: true, message: '请选择任务周期' }]
              })(
                <Group onChange={this.cycleChange}>
                  <Radio value="once">一次</Radio>
                  <Radio value="daily">每天</Radio>
                  <Radio value="weekly">每周</Radio>
                  <Radio value="month">每月</Radio>
                </Group>
              )}
            </Item>
            {
              modalCycle !== 'once' ? (
                <Fragment>
                  <Item {...formItemLayout} label="定时任务开始时间">
                    <LocaleProvider locale={zhCN}>
                      {getFieldDecorator('startTime', {
                        initialValue: !this.editCycle && modalData && modalData.startTime > 0 ? moment(modalData.startTime, 'x') : undefined,
                        rules: [{ required: true, message: '请选择定时任务开始时间' }]
                      })(
                        <DatePicker
                          style={{ width: '100%' }}
                          showTime={{ format: 'HH:mm:ss' }}
                          format="YYYY-MM-DD HH:mm:ss"
                          placeholder="请选择定时任务开始时间"
                          disabledDate={this.disabledStartDate}
                          disabledTime={disabledDateTime}
                          onChange={this.onStartChange}
                          getCalendarContainer={triggerNode => triggerNode.parentNode}
                        />
                      )}
                    </LocaleProvider>
                  </Item>
                  <Item {...formItemLayout} label="定时任务完成时间">
                    <LocaleProvider locale={zhCN}>
                      {getFieldDecorator('alias-endTime', {
                        // initialValue: modalData && modalData.endTime > 0 ? moment(modalData.endTime, 'x') : undefined,
                        rules: [{ required: true, message: '请选择定时任务完成时间' }, {
                          validator: this.validateToEndtime
                        }]
                      })(
                        <DatePicker
                          style={{ width: '100%' }}
                          showTime={{ format: 'HH:mm:ss' }}
                          format="YYYY-MM-DD HH:mm:ss"
                          placeholder="请选择定时任务完成时间"
                          disabledDate={this.disabledEndDate}
                          disabledTime={disabledDateTime}
                          onChange={this.onEndChange}
                          getCalendarContainer={triggerNode => triggerNode.parentNode}
                        />
                      )}
                    </LocaleProvider>
                  </Item>
                  <Item {...formItemLayout} label="定时任务执行时间">
                    <LocaleProvider locale={zhCN}>
                      {getFieldDecorator('execTime', {
                        initialValue: !this.editCycle && modalData && modalData.execTime > 0 ? moment(modalData.execTime, 'x') : undefined,
                        rules: [{ required: true, message: '请选择定时任务执行时间' }]
                      })(
                        <TimePicker format="HH:mm:ss"/>
                      )}
                    </LocaleProvider>
                  </Item>
                  {
                    modalCycle === 'weekly' ? (
                      <Item {...formItemLayout} label="周">
                        {getFieldDecorator('dayOfWeek', {
                          initialValue: !this.editCycle && modalData && modalData.dayOfWeek ? modalData.dayOfWeek.split(',') : undefined,
                          rules: [{ required: true, message: '请选择星期几' }]
                        })(
                          <Select mode="multiple" placeholder="请选择星期几" getPopupContainer={triggerNode => triggerNode.parentNode}>
                            <Option key="1" disabled={weekArr.indexOf(7) === -1}>星期日</Option>
                            <Option key="2" disabled={weekArr.indexOf(1) === -1}>星期一</Option>
                            <Option key="3" disabled={weekArr.indexOf(2) === -1}>星期二</Option>
                            <Option key="4" disabled={weekArr.indexOf(3) === -1}>星期三</Option>
                            <Option key="5" disabled={weekArr.indexOf(4) === -1}>星期四</Option>
                            <Option key="6" disabled={weekArr.indexOf(5) === -1}>星期五</Option>
                            <Option key="7" disabled={weekArr.indexOf(6) === -1}>星期六</Option>
                          </Select>
                        )}
                      </Item>
                    ) : null
                  }
                  {
                    modalCycle === 'month' ? <Fragment>
                      <Item {...formItemLayout} label="月">
                        {getFieldDecorator('months', {
                          initialValue: !this.editCycle && modalData && modalData.months ? modalData.months.split(',') : undefined,
                          rules: [{ required: true, message: '请选择月份' }]
                        })(
                          <Select mode="multiple" placeholder="请选择月份" onChange={this.monthCheck} getPopupContainer={triggerNode => triggerNode.parentNode}>
                            <Option key="1" disabled={monthArr.indexOf(1) === -1}>1月</Option>
                            <Option key="2" disabled={monthArr.indexOf(2) === -1}>2月</Option>
                            <Option key="3" disabled={monthArr.indexOf(3) === -1}>3月</Option>
                            <Option key="4" disabled={monthArr.indexOf(4) === -1}>4月</Option>
                            <Option key="5" disabled={monthArr.indexOf(5) === -1}>5月</Option>
                            <Option key="6" disabled={monthArr.indexOf(6) === -1}>6月</Option>
                            <Option key="7" disabled={monthArr.indexOf(7) === -1}>7月</Option>
                            <Option key="8" disabled={monthArr.indexOf(8) === -1}>8月</Option>
                            <Option key="9" disabled={monthArr.indexOf(9) === -1}>9月</Option>
                            <Option key="10" disabled={monthArr.indexOf(10) === -1}>10月</Option>
                            <Option key="11" disabled={monthArr.indexOf(11) === -1}>11月</Option>
                            <Option key="12" disabled={monthArr.indexOf(12) === -1}>12月</Option>
                          </Select>
                        )}
                      </Item>
                      <Item {...formItemLayout} label="天">
                        {getFieldDecorator('dayOfMonth', {
                          initialValue: !this.editCycle && modalData && modalData.dayOfMonth ? modalData.dayOfMonth.split(',') : undefined,
                          rules: [{ required: true, message: '请选择日期' }]
                        })(
                          <Select mode="multiple" placeholder="请选择日期" getPopupContainer={triggerNode => triggerNode.parentNode}>
                            {monthday ?
                              Array(monthday).fill().map((item, index) => (
                                <Option key={index + 1}>{index + 1}</Option>
                              ))
                              : null
                            }
                          </Select>
                        )}
                      </Item>
                    </Fragment> : null
                  }
                </Fragment>
              ) : (
                <Item {...formItemLayout} label="定时任务执行时间">
                  <LocaleProvider locale={zhCN}>
                    {getFieldDecorator('execTime', {
                      initialValue: !this.editCycle && modalData && moment(modalData.execTime, 'x'),
                      rules: [{ required: true, message: '请选择定时任务执行时间' }]
                    })(
                      <DatePicker
                        style={{ width: '100%' }}
                        disabledDate={disabledDate}
                        showTime={{ format: 'HH:mm:ss' }}
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="请选择定时任务执行时间"
                        getCalendarContainer={triggerNode => triggerNode.parentNode}
                      />
                    )}
                  </LocaleProvider>
                </Item>
              )
            }
            <Item {...formItemLayout} label="任务描述">
              {getFieldDecorator('summary', {
                initialValue: modalData && modalData.summary,
                rules: [{ min: 1, max: 300, message: '请输入1-300个字符' }]
              })(
                <TextArea placeholder="请输入任务描述" rows={3} />
              )}
            </Item>
          </div>
          <div className="Button-center">
            <div>
              <Button type="primary" onClick={this.handleSubmit}>提交</Button>
              <Button type="primary" ghost onClick={() => {
                this.props.close(form)
                this.resetForm()
              }}>
                取消
              </Button>
            </div>
          </div>
        </Form>
      </Modal>
    )
  }

  // 提交表单
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, value) => {
      if (!err) {
        // replaceAliasName用于处理页面列表与modal中，Form中字段name相同
        const values = replaceAliasName(value)
        values.taskCycle = values.taskCycle.toUpperCase()
        if (values.startTime) {
          values.startTime = values.startTime.format('x')
        }
        if (values.endTime) {
          values.endTime = values.endTime.format('x')
        }
        if (values.execTime) {
          values.execTime = values.execTime.format('x')
        }
        if (values.dayOfWeek) {
          values.dayOfWeek = values.dayOfWeek.join(',')
        }
        if (values.dayOfMonth) {
          values.dayOfMonth = values.dayOfMonth.join(',')
        }
        if (values.months) {
          values.months = values.months.join(',')
        }
        if (values.id) {
          api.updateTaskPlan(values).then(response => {
            if(response && response.head && response.head.code === '200' ){
              this.props.close(this.props.form)
              this.props.form.resetFields()
              this.resetForm()
              this.props.getList()
            }
          })
        } else {
          api.saveTaskPlan(values).then(response => {
            if(response && response.head && response.head.code === '200' ){
              this.props.close(this.props.form)
              this.props.form.resetFields()
              this.resetForm()
              this.props.getList()
            }
          })
        }
      }
    })
  }
  cycleChange = (e) => {
    this.editCycle = true
    const modalCycle = e.target.value
    this.setState({
      modalCycle,
      weekArr: [],
      monthArr: [],
      startTime: '',
      endTime: ''
    }, () => {
      this.props.form.setFieldsValue({
        'startTime': undefined,
        'alias-endTime': undefined,
        'execTime': undefined,
        'dayOfWeek': undefined,
        'months': undefined,
        'dayOfMonth': undefined
      })
    })
    // this.props.dispatch({ type: 'taskPlan/modifyTaskCycle', payload: { modalCycle } })
  }
  validateToEndtime = (rule, value, callback) => {
    const form = this.props.form
    if(value && form.getFieldValue('startTime') && (form.getFieldValue('startTime').unix() >= value.unix())){
      return callback('定时任务结束时间应该大于开始时间！')
    }
    return callback()
  }
  monthCheck = (value) =>{
    this.props.form.setFieldsValue({
      'dayOfMonth': undefined
    })
    let modalCycle = value
    let startYear = moment(this.props.form.getFieldValue('startTime')).format('YYYY')
    let endYear = moment(this.props.form.getFieldValue('alias-endTime')).format('YYYY')
    let startMonth = Number(moment(this.props.form.getFieldValue('startTime')).format('M'))
    let endMonth = Number(moment(this.props.form.getFieldValue('alias-endTime')).format('M'))
    this.props.dispatch({ type: 'taskPlan/getMonthDay', payload: { modalCycle, startYear, endYear, startMonth, endMonth } })
  }

  // 开始时间或结束时间变化后需要重新获取可供选择的月份和星期
  onChange = (field, value) => {
    this.setState({
      [field]: value
    }, () => {
      const { startTime, endTime } = this.state
      this.props.form.setFieldsValue({
        'dayOfWeek': undefined,
        'months': undefined
      })
      this.setState({
        weekArr: getDisabledWeek(startTime, endTime),
        monthArr: getDisabledMonth(startTime, endTime)
      })
    })
  }
  // 修改开始时间后，validateFieldsAndScroll主动触发结束时间的验证规则
  onStartChange = (value) => {
    this.onChange('startTime', value)
    const form = this.props.form
    const endTime = form.getFieldValue('alias-endTime')
    setTimeout(()=>{
      if (endTime) form.validateFieldsAndScroll([ 'alias-endTime'], { force: true })
    }, 0 )
  }
  onEndChange = (value) => {
    this.editEndTime = true
    this.onChange('endTime', value)
  }

  resetForm = () => {
    this.setState({
      startTime: '',
      endTime: '',
      weekArr: [],
      monthArr: []
    })
  }
}

const ModalFormWrap = Form.create()(ModalForm)
export default connect(({ taskPlan }) => ({ taskPlan }))(ModalFormWrap)
