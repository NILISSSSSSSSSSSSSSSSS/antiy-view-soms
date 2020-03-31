
import { Component } from 'react'
import { Form, Button, Row, Col, message } from 'antd'
import { connect } from 'dva'
import moment from 'moment'
import CommonForm from '@/components/common/Form'
import api from '@/services/api'
import { generateRules } from '@/utils/common'

const { Item } = Form
const labelScale = 3
const formLayout = {
  labelCol: {
    span: labelScale
  },
  wrapperCol: {
    span: 20
  }
}
const hintContent = (
  <div>
    <p>地址支持填写IP或域名</p>
  </div>
)
class OnlineSet extends Component {
  constructor (props) {
    super(props)
    this.state = {
      init: false,
      formData: {
        cycle: 'DAY', // 执行周期，默认每天
        enable: false,
        dayOfWeek: [],
        upgradeTime: undefined,
        workStartTime: undefined
      }
    }
  }
  componentDidMount () {
    this.getOnlineSet()
  }
  // 查询定时任务设置
  getOnlineSet = () => {
    api.queryTaskInfo().then(response => {
      if(!response.body) return false
      const formData = response.body
      this.setState({
        formData: {
          ...formData,
          dayOfWeek: formData.dayOfWeek ? formData.dayOfWeek.split(',') : []
        }
      })
    })
  }
  // 修改执行周期
  cycleChange = e => {
    const { formData } = this.state
    this.setState({
      formData: {
        ...formData,
        dayOfWeek: [],
        cycle: e.target.value
      }
    })
  }
  // 修改定时在线升级
  switchChange = value => {
    const { formData } = this.state
    this.setState({
      formData: {
        ...formData,
        enable: value
      }
    })
  }
  // 保存在线升级配置
  onSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (values.upgradeTime) values.upgradeTime = Number(values.upgradeTime.format('x'))
        if (values.workStartTime) values.workStartTime = Number(new Date(moment(values.workStartTime).format('YYYY-MM-DD HH:mm')).getTime())
        if (values.cycle === 'WEEK') values.dayOfWeek = values.dayOfWeek.join(',')
        api.setTaskInfo(values).then(response => {
          message.success('操作成功！')
        })
      }
    })
  }
  disabledDateTime = (current) => {
    if (!current) return {
      disabledHours: () => this.range(0, 24),
      disabledMinutes: () => this.range(0, 60)
    }
    let hours = moment().hours()
    let minutes = moment().minutes()
    if (moment(current).format('YYYY-MM-DD') === moment(new Date()).format('YYYY-MM-DD')) {
      if (moment(current).hours() === hours) {
        return {
          disabledHours: () => this.range(0, hours),
          disabledMinutes: () => this.range(0, minutes)
        }
      } else {
        return {
          disabledHours: () => this.range(0, hours)
        }
      }
    }
  }
  range = (start, end) => {
    const result = []
    for (let i = start; i < end; i++) {
      result.push(i)
    }
    return result
  }
  render () {
    const { formData } = this.state
    // const form = this.props.form
    // let enableChecked = true
    // if (typeof form.getFieldValue('masterUrl') !== 'undefined') {
    //   if(formData.cycle === 'DAY'
    //   && (!form.getFieldValue('masterUrl') || !form.getFieldValue('upgradeTime') || !form.getFieldValue('workStartTime'))){
    //     enableChecked = false
    //   }
    // }
    const onlineSetFields = [
      { type: 'hidden', key: 'stringId', name: '', defaultValue: formData.stringId  },
      { type: 'input', key: 'masterUrl', name: '服务器地址', style: { width: 300 }, defaultValue: formData.masterUrl, popover: hintContent, rules: [{ required: true,  message: '请输入服务器地址' }, ...generateRules()] },
      { type: 'switch', key: 'enable', name: '定时在线升级', rules: [{ required: true }], onChange: this.switchChange,
        checked: formData.enable,
        defaultValue: formData.enable,
        switchLabel: formData.enable ? '开启' : '关闭'
      },
      { type: 'radioGroup', key: 'cycle', name: '执行周期', rules: [{ required: true,  message: '请选择执行周期' }], onChange: this.cycleChange,
        defaultValue: formData.cycle,
        data: [ { label: '每天', value: 'DAY' }, { label: '每周', value: 'WEEK' }]
      },
      { type: 'timePicker', key: 'upgradeTime', name: '执行时间', format: 'HH:mm:ss', defaultValue: formData.upgradeTime ? moment(formData.upgradeTime) : undefined, rules: [{ required: true,  message: '请选择执行时间' }] },
      { type: 'date', key: 'workStartTime', name: '开始生效时间', showTime: { format: 'HH:mm' }, disabledTime: this.disabledDateTime, disabledDate: (current) => current && current < moment(Date.now()).startOf('day'), defaultValue: formData.workStartTime ? moment(formData.workStartTime) : null, format: 'YYYY/MM/DD HH:mm', rules: [{ required: true,  message: '请选择开始生效时间' }] }
    ]
    const weekItem = { type: 'checkboxGroup', key: 'dayOfWeek', name: '周', rules: [{ required: true,  message: '请选择周' }],
      defaultValue: formData.dayOfWeek,
      data: [
        { label: '星期一', value: '2' },
        { label: '星期二', value: '3' },
        { label: '星期三', value: '4' },
        { label: '星期四', value: '5' },
        { label: '星期五', value: '6' },
        { label: '星期六', value: '7' },
        { label: '星期天', value: '1' }]
    }
    if (formData.cycle === 'WEEK') onlineSetFields.push(weekItem)
    return (
      <div className="detail-content online-set-form">
        <CommonForm
          fields={onlineSetFields}
          column={1}
          form={this.props.form}
          FormItem={Item}
          formLayout={formLayout}
        >
        </CommonForm>
        <Row>
          <Col offset={labelScale}>
            <Button
              type="primary"
              onClick={this.onSubmit}
            >
              保存
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}
const OnlineSetForm = Form.create()(OnlineSet)
export default connect()(OnlineSetForm)
