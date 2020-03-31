import { Component, Fragment } from 'react'
import { connect } from 'dva'
import moment from 'moment'
import { Modal, Form, Radio, Select, LocaleProvider, DatePicker, Input, InputNumber, TimePicker, Button } from 'antd'
import zhCN from 'antd/lib/locale-provider/zh_CN'
import api from '@/services/api'
import { replaceAliasName, getDisabledWeek, getDisabledMonth } from '@/utils/common'
import './style.less'

const { Item } = Form
const { Group } = Radio
const { Option } = Select
const { TextArea } = Input

class ModalForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      cycle: 'ONCE',             // 巡检周期， 默认单次
      userList: props.userList,  // 巡检执行人列表
      startTime: '',             // 开始时间
      endTime: '',               // 结束时间
      weekArr: [],               // 开始时间与结束时间之间包含的星期数
      monthArr: []               // 开始时间与结束时间之间包含的月数
    }
  }
  componentDidMount () {
    // 获取巡检执行人列表
    api.getUsersByAreaOfCurrentUser().then((data) => {
      if (data && data.head && data.head.code === '200') {
        this.setState({
          userList: data.body
        })
      }
    })
  }
  /**
   * 开始时间或结束时间变化后需要重新获取可供选择的月份和星期
   * 并清空已选择的月份和星期
   * @param field startTime/endTime
   * @param value 变化的值
   */
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
  onStartChange = value => {
    const form = this.props.form
    const endTime = form.getFieldValue('alias-endTime')
    this.onChange('startTime', value)
    setTimeout(() => {
      if (endTime) form.validateFieldsAndScroll(['alias-endTime'], { force: true })
    }, 0)
  }
  onEndChange = value => {
    this.onChange('endTime', value)
  }
  //验证完成时间
  validateEndTime = (rule, value, callback) => {
    const form = this.props.form
    if (value && form.getFieldValue('startTime') && (form.getFieldValue('startTime').unix() >= value.unix())) {
      return callback('巡检完成时间应该大于开始时间！')
    }
    return callback()
  }
  /**
   * 当选择的月份变化时，获取选择的月份中的一个月的最少天数
   * 与开始时间与结束时间有关
   * @param value 选择的月份数组
   */
  getMonthDay = (value) => {
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
  // 提交表单
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, value) => {
      if (!err) {
        // replaceAliasName用于处理页面列表与modal中，Form中字段name相同
        const values = replaceAliasName(value)
        if (values.startTime && this.state.cycle !== 'ONCE') {
          values.startTime = values.startTime.format('x')
          values.execTime = values.execTime.format('x')
        } else {
          values.execTime = values.execTime.format('x')
          delete values.startTime
        }
        if (values.endTime) {
          values.endTime = values.endTime.format('x')
        }
        values.expectStartTime = values.expectStartTime * 24 * 60 * 60 * 1000
        values.expectRequiredTime = values.expectRequiredTime * 24 * 60 * 60 * 1000
        if (values.dayOfWeek) {
          values.dayOfWeek = values.dayOfWeek.join(',')
        }
        if (values.dayOfMonth) {
          values.dayOfMonth = values.dayOfMonth.join(',')
        }
        if (values.months) {
          values.months = values.months.join(',')
        }
        api.inspectPlanSaveSingle(values).then(response => {
          if (response && response.head && response.head.code === '200') {
            this.setState({
              body: response.body
            })
            this.props.onOk()
            this.props.form.resetFields()
            this.resetForm()
          }
        })
      }
    })
  }
  // 巡检周期改变，清空已选择的开始时间与结束时间，和与时间相关的字段
  cycleChange = (e) => {
    this.setState({
      cycle: e.target.value,
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
  }
  resetForm = () => {
    this.setState({
      startTime: '',
      endTime: '',
      cycle: 'ONCE',
      weekArr: [],
      monthArr: []
    })
  }

  render () {
    const { cycle, userList, weekArr, monthArr, endTime, startTime } = this.state
    const { monthday } = this.props.taskPlan
    const { visible, form } = this.props
    const { getFieldDecorator } = form
    const formItemLayout = {
      labelCol: {
        span: 8
      },
      wrapperCol: {
        span: 12
      }
    }
    function disabledStartDate (current) {
      if (!current || !endTime) {
        return current < moment().startOf('day')
      }
      return current < moment().startOf('day') || current.valueOf() > moment(endTime).endOf('day')
    }

    function disabledEndDate (current) {
      if (!current || !startTime) {
        return current < moment().startOf('day')
      }
      return current < moment().startOf('day') || current.valueOf() < moment(startTime).startOf('day')
    }
    // 不可选择的时间
    function disabledDateTime (current) {
      if (!current) return {
        disabledHours: () => range(0, 24),
        disabledMinutes: () => range(0, 60),
        disabledSeconds: () => range(0, 60)
      }
      let hours = moment().hours()
      let minutes = moment().minutes()
      /*
       * 注：如果选择的时间是系统当天，并且是当前小时，当前时，分前的时间不可选，秒不限
       * 如果大于系统当前小时，分与秒不限
       */
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
        title='登记巡检计划'
        width="650px"
        className="over-scroll-modal inspection-modal"
        footer={null}
        maskClosable={false} visible={visible} onOk={this.handleSubmit} onCancel={() => {
          this.props.form.resetFields()
          this.props.close()
          this.resetForm()
        }}>
        <Form>
          <div className="form-content">
            <Item {...formItemLayout} label="巡检名称">
              {getFieldDecorator('alias-name', {
                rules: [{ required: true, message: '请输入巡检名称' }, { message: '请输入1-60个字符', max: 60 }]
              })(
                <Input autoComplete="off" placeholder="请输入巡检名称" />
              )}
            </Item>
            <Item {...formItemLayout} label="巡检类型">
              {getFieldDecorator('alias-planType', {
                rules: [{ required: true, message: '请选择巡检类型' }]
              })(
                <Select placeholder="请选择巡检类型" getPopupContainer={triggerNode => triggerNode.parentNode}>
                  <Option key="ASSETS_INSPECT">资产管理</Option>
                  <Option key="BASELINE_INSPECT">配置管理</Option>
                  <Option key="VUL_PATCH_INSPECT">漏洞与补丁管理</Option>
                  <Option key="LOG_WARN_INSPECT">日志与告警管理</Option>
                  <Option key="DAILY_SAFETY_INSPECT">日常安全管理</Option>
                  <Option key="SAFETY_EQUIPMENT_INSPECT">安全设备管理</Option>
                  <Option key="SYSTEM_MANGER_INSPECT">系统管理</Option>
                  {/* <Option key="OTHER_INSPECT">其他 </Option> */}
                </Select>
              )}
            </Item>
            <Item {...formItemLayout} label="巡检级别">
              {getFieldDecorator('alias-planLevel', {
                rules: [{ required: true, message: '请选择巡检级别' }]
              })(
                <Group>
                  <Radio value="URGENT">紧急</Radio>
                  <Radio value="IMPORTANT">重要</Radio>
                  <Radio value="SECONDARY">次要</Radio>
                  <Radio value="PROMPT">提示</Radio>
                </Group>
              )}
            </Item>
            <Item {...formItemLayout} label="预计工单接单天数">
              {getFieldDecorator('expectStartTime', {
                rules: [{ required: true, message: '请输入预计工单接单天数' }]
              })(
                <InputNumber
                  min={0}
                  parser={value => value ? parseInt(value.replace(/[^\d]/g, ''), 10) : ''}
                />
              )}
            </Item>
            <Item {...formItemLayout} label="预计工单完成天数">
              {getFieldDecorator('expectRequiredTime', {
                rules: [{ required: true, message: '请输入预计工单完成天数' }]
              })(
                <InputNumber
                  min={1}
                  parser={value => value.replace(/^(0+)|[^\d]+/g, '')}
                />
              )}
            </Item>
            <Item {...formItemLayout} label="巡检执行人员">
              {getFieldDecorator('executeUser', {
                rules: [{ required: true, message: '请选择巡检执行人' }]
              })(
                <Select placeholder="请选择巡检执行人" showSearch optionFilterProp="children" getPopupContainer={triggerNode => triggerNode.parentNode}>
                  {
                    userList.length && userList.map(item => (
                      <Option value={item.stringId} key={item.stringId}>{item.name}</Option>
                    ))
                  }
                </Select>
              )}
            </Item>
            <Item {...formItemLayout} label="巡检周期">
              {getFieldDecorator('alias-orderCycle', {
                initialValue: 'ONCE', rules: [{ required: true, message: '请选择巡检周期' }]
              })(
                <Group onChange={this.cycleChange}>
                  <Radio value="ONCE">单次</Radio>
                  <Radio value="DAILY">每天</Radio>
                  <Radio value="WEEKLY">每周</Radio>
                  <Radio value="MONTH">每月</Radio>
                </Group>
              )}
            </Item>
            {cycle === 'ONCE' ?
              <Item {...formItemLayout} label="巡检开始执行时间">
                <LocaleProvider locale={zhCN}>
                  {getFieldDecorator('execTime', {
                    rules: [{ required: true, message: '请选择巡检开始执行时间' }]
                  })(
                    <DatePicker
                      style={{ width: '100%' }}
                      showTime={{ format: 'HH:mm:ss' }}
                      placeholder="请选择巡检开始执行时间"
                      format="YYYY-MM-DD HH:mm:ss"
                      getCalendarContainer={triggerNode => triggerNode.parentNode}
                    />
                  )}
                </LocaleProvider>
              </Item>
              :
              <Fragment>
                <Item {...formItemLayout} label="巡检开始时间">
                  <LocaleProvider locale={zhCN}>
                    {getFieldDecorator('startTime', {
                      rules: [{ required: true, message: '请选择巡检开始时间' }]
                    })(
                      <DatePicker
                        style={{ width: '100%' }}
                        showTime={{ format: 'HH:mm:ss' }}
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="请选择巡检开始时间"
                        disabledDate={disabledStartDate}
                        disabledTime={disabledDateTime}
                        onChange={this.onStartChange}
                        getCalendarContainer={triggerNode => triggerNode.parentNode}
                      />
                    )}
                  </LocaleProvider>
                </Item>
                <Item {...formItemLayout} label="巡检完成时间">
                  <LocaleProvider locale={zhCN}>
                    {getFieldDecorator('alias-endTime', {
                      rules: [{ required: true, message: '请选择巡检完成时间' }, {
                        validator: this.validateEndTime
                      }]
                    })(
                      <DatePicker
                        style={{ width: '100%' }}
                        showTime={{ format: 'HH:mm:ss' }}
                        placeholder="请选择巡检完成时间"
                        disabledDate={disabledEndDate}
                        disabledTime={disabledDateTime}
                        format="YYYY-MM-DD HH:mm:ss"
                        onChange={this.onEndChange}
                        getCalendarContainer={triggerNode => triggerNode.parentNode}
                      />
                    )}
                  </LocaleProvider>
                </Item>
                <Item {...formItemLayout} label="巡检开始执行时间">
                  <LocaleProvider locale={zhCN}>
                    {getFieldDecorator('execTime', {
                      rules: [{ required: true, message: '请选择巡检开始执行时间' }]
                    })(
                      <TimePicker format="HH:mm:ss" />
                    )}
                  </LocaleProvider>
                </Item>
              </Fragment>
            }
            {
              cycle !== 'ONCE' ? (
                <Fragment>
                  {
                    cycle === 'WEEKLY' ? (
                      <Item {...formItemLayout} label="周">
                        {getFieldDecorator('dayOfWeek', {
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
                    cycle === 'MONTH' ? (
                      <Fragment>
                        <Item {...formItemLayout} label="月">
                          {getFieldDecorator('months', {
                            rules: [{ required: true, message: '请选择月份' }]
                          })(
                            <Select mode="multiple" placeholder="请选择月份" onChange={this.getMonthDay} getPopupContainer={triggerNode => triggerNode.parentNode}>
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
                      </Fragment>
                    ) : null
                  }
                </Fragment>
              ) : null
            }
            <Item {...formItemLayout} label="巡检内容">
              {getFieldDecorator('content', {
                rules: [{ required: true, message: '请输入巡检内容' }, { max: 300, message: '请输入1-300个字符' }]
              })(
                <TextArea placeholder="请输入巡检内容" rows={3} />
              )}
            </Item>
          </div>
          <div className="Button-center">
            <div>
              <Button type="primary" onClick={this.handleSubmit}>提交</Button>
              <Button type="primary" ghost onClick={() => {
                this.props.form.resetFields()
                this.props.close()
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
}
const mapStateToProps = ({ system, taskPlan }) => {
  return {
    userList: system.userList,
    taskPlan
  }
}
const ModalFormWrap = Form.create()(ModalForm)
export default connect(mapStateToProps)(ModalFormWrap)
