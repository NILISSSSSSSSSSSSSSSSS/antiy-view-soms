import { Component } from 'react'
import { connect } from 'dva'
import moment from 'moment'
import { Form, Input, Select, LocaleProvider, DatePicker, Radio, Upload, Icon, Popover, Button, message } from 'antd'
import zhCN from 'antd/lib/locale-provider/zh_CN'
import { createHeaders, beforeUpload } from '@/utils/common'
import api from '@/services/api'
import { replaceAliasName } from '@/utils/common'
import './style.less'
import { debounce } from 'lodash'

const { Item } = Form
const { Option } = Select
const { Group } = Radio
const { TextArea } = Input

const hintContent = (
  <div>
    <p>支持上传个数：5</p>
    <p>支持上传大小：10M</p>
    <p>支持扩展名：.rar .zip .7z .doc .docx .pdf .jpg .png .txt .xlsx .xls</p>
  </div>
)

class WorkOrderAdd extends Component {
  constructor (props) {
    super(props)
    this.state = {
      userList: this.props.userList,
      fileList: [],
      fileAccept: '.rar,.zip,.7z,.doc,.docx,.pdf,.jpg,.png,.txt,.xlsx,.xls'
    }
    this.handleSubmit = debounce(this.handleSubmit, 800)
  }
  componentDidMount () {
    this.uuids = []
    // 获取用户
    api.getUsersByAreaOfCurrentUser().then((data) => {
      if (data && data.head && data.head.code === '200') {
        this.setState({
          userList: data.body
        })
      }
    })
    if (this.props.children)
      this.props.children(this)
  }

  disabledDate = (timeValue) => {
    const endValue = new Date()
    timeValue = new Date(timeValue)
    //今天的时间也算
    return (timeValue.valueOf() + 86400000) < endValue.valueOf()
  }
  render () {
    const { userList, fileList, fileAccept } = this.state
    const { getFieldDecorator } = this.props.form
    const uploadProps = {
      name: 'files',
      accept: fileAccept,
      action: '/api/v1/routine/workOrderAttachment/upload',
      headers: createHeaders(),
      multiple: true,
      onChange: this.uploadChange,
      fileList,
      beforeUpload: ((file, fileLists) => beforeUpload(file, fileLists, fileList))
    }
    const formItemLayout = {
      labelCol: {
        span: 8
      },
      wrapperCol: {
        span: 12
      }
    }
    const tailFormItemLayout = {
      wrapperCol: {
        span: 12,
        offset: 8
      }
    }
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
      <div className="work-order-add-wrap">
        <Form className='work-order-add' onSubmit={(e) => {e.preventDefault(), this.handleSubmit()}}>
          <div className="form-content">
            <Item {...formItemLayout} label='工单名称'>
              {getFieldDecorator('name', {
                rules: [{ required: true, message: '请输入工单名称' }, { max: 60, message: '工单名称过长,须小于或等于60个字符' }]
              })(
                <Input autoComplete="off" placeholder='请输入工单名称' />
              )}
            </Item>
            <Item {...formItemLayout} label='工单类型'>
              {getFieldDecorator('alias-orderType', {
                rules: [{ required: true, message: '请选择工单类型' }]
              })(
                <Select placeholder='请选择工单类型' getPopupContainer={triggerNode => triggerNode.parentNode}>
                  <Option key="1">巡检</Option>
                  <Option key="2">预警</Option>
                  <Option key="3">重保</Option>
                  <Option key="4">应急</Option>
                  <Option key="5">清查</Option>
                  <Option key="10">其他</Option>
                  <Option key="11">告警</Option>
                </Select>
              )}
            </Item>
            <Item {...formItemLayout} label="预计开始时间">
              <LocaleProvider locale={zhCN}>
                {getFieldDecorator('alias-startTime', {
                  rules: [{ required: true, message: '请选择预计开始时间' }]
                })(
                  <DatePicker
                    disabledTime={disabledDateTime}
                    style={{ width: '100%' }}
                    disabledDate={this.disabledDate}
                    showTime={{ format: 'HH:mm:ss' }}
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder="请选择预计开始时间"
                    onChange={this.onStartChange}
                    getCalendarContainer={triggerNode => triggerNode.parentNode}
                  />
                )}
              </LocaleProvider>
            </Item>
            <Item {...formItemLayout} label="预计结束时间">
              <LocaleProvider locale={zhCN}>
                {getFieldDecorator('alias-endTime', {
                  rules: [{ required: true, message: '请选择预计结束时间' }, {
                    validator: this.validateEndTime
                  }]
                })(
                  <DatePicker
                    disabledTime={disabledDateTime}
                    style={{ width: '100%' }}
                    disabledDate={this.disabledDate}
                    showTime={{ format: 'HH:mm:ss' }}
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder="请选择预计结束时间"
                    getCalendarContainer={triggerNode => triggerNode.parentNode}
                  />
                )}
              </LocaleProvider>
            </Item>
            <Item {...formItemLayout} label='执行人'>
              {getFieldDecorator('executeUser', {
                rules: [{ required: true, message: '请选择执行人' }]
              })(
                <Select showSearch filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                optionFilterProp="children" labelInValue placeholder='请选择执行人' getPopupContainer={triggerNode => triggerNode.parentNode}>
                  {
                    userList.map(item => (
                      <Option key={item.stringId}>{item.name}</Option>
                    ))
                  }
                </Select>
              )}
            </Item>
            <Item {...formItemLayout} label='工单级别'>
              {getFieldDecorator('alias-workLevel', {
                rules: [{ required: true, message: '请选择工单级别' }]
              })(
                <Group>
                  <Radio value='1'>紧急</Radio>
                  <Radio value='2'>重要</Radio>
                  <Radio value='3'>次要</Radio>
                  <Radio value='4'>提示</Radio>
                </Group>
              )}
            </Item>
            <Item {...formItemLayout} label='工单内容'>
              {getFieldDecorator('content', {
                rules: [{ required: true, message: '请输入工单内容' }, { message: '请输入1-300个字符', max: 300 }]
              })(
                <TextArea placeholder='请输入工单内容' rows={4} />
              )}
            </Item>
            <Item {...tailFormItemLayout}>
              {getFieldDecorator('attachment', {
                // rules: [{ required: false }, { validator: this.checkfile }]
                rules: [{ required: false }]
              })(
                <Upload {...uploadProps}>
                  <div className='work-order-add-upload'>
                    <Icon type='plus' />
                    &nbsp;&nbsp;上传附件&nbsp;&nbsp;
                    <Popover content={hintContent}>
                      <Icon type='question-circle' />
                    </Popover>
                  </div>
                </Upload>
              )}
            </Item>
          </div>
          <div className="Button-center">
            <div>
              <Button type='primary' htmlType='submit'>提交</Button>
              <Button type='primary' ghost onClick={() => this.handleCancel(false)}>取消</Button>
            </div>
          </div>
        </Form>
      </div>
    )
  }
  onStartChange = (value) => {
    const form = this.props.form
    const endTime = form.getFieldValue('alias-endTime')
    setTimeout(() => {
      if (endTime) form.validateFieldsAndScroll(['alias-endTime'], { force: true })
    }, 0)
  }
  //验证附件
  checkfile = (rule, value, callback) => {
    if (!value) callback()
    if (value && value.fileList.length < 6) {
      callback()
    } else {
      return callback(new Error('最多上传5个附件'))
    }
  }
  validateEndTime = (rule, value, callback) => {
    const form = this.props.form
    if (value && moment(value).valueOf() < (moment(form.getFieldValue('alias-startTime')).valueOf())) {
      callback('预计结束时间应大于开始时间!')
    } else {
      callback()
    }
  }
  // 提交表单
  handleSubmit = () => {
    let ms = 1000
    this.props.form.validateFields((err, value) => {
      // replaceAliasName用于处理页面列表与modal中，Form中字段name相同
      const values = replaceAliasName(value)
      if (!err) {
        if (values.attachment) {
          values.workOrderAttachments = values.attachment.fileList.map(item => {
            let init = item.response.body[0].id
            return init
          })
        }
        const postValues = {
          'name': values.name,
          'startTime': (values.startTime.unix() * ms).toString(),
          'endTime': (values.endTime.unix() * ms).toString(),
          'executeUserId': values.executeUser.key,
          'executeUserName': values.executeUser.label,
          'orderType': values.orderType,
          'content': values.content,
          'workLevel': values.workLevel,
          'workOrderAttachments': values.workOrderAttachments ? values.workOrderAttachments : [],
          // todo 后续处理下面两个值的来源
          'orderSource': '1'
        }
        //this.props.dispatch({ type: 'workOrder/add', payload: values })  无返回值调用方式
        //需要根据返回值进行相应的操作
        api.workOrderAdd(postValues).then(response => {
          // todo 处理成功 弹窗 处理失败
          if (response && response.head && response.head.code === '200') {
            this.props.form.resetFields()
            //todo  清除上传组件列表值
            // this.onRemove()
            message.success('登记工单成功')
            this.setState({ fileList: [] })
            if (this.props.children)
              this.handleCancel()
            else
              this.props.history.push('/routine/workorder/create')
          }
        })
      }
    })
  }
  //取消按钮事件
  handleCancel = () => {
    this.props.form.resetFields()
    if (this.props.children)
      this.props.cancel()
    this.setState({ fileList: [] })
  }
  uploadChange = (info) => {
    let fileList = info.fileList
    this.setState({
      fileList
    })
    // 网络失败
    fileList.filter((e) => e.status === 'error').forEach((file) => {
      message.info(file.name + '上传超时！')
    })
    //服务器处理失败
    fileList.filter((e) => e.status === 'done' && e.response && e.response.head.code !== '200' && e.percent === 100 && !this.uuids.includes(e.uid)).forEach((file) => {
      // 如果提示上传失败，下次上传时，不在提示
      this.uuids.push(file.uid)
      message.info('上传 ' + file.name + ' 失败！')
    })
    // 所有文件上传完成时，排除上传失败文件，刷新上传列表
    const list = fileList.filter((e) => e.status === 'done')
    if (list.length === fileList.length) {
      this.uuids = []
      this.setState({
        fileList: list.filter((e) => e.response && e.response.head.code === '200')
      })
    }
  }
}

const mapStateToProps = ({ system }) => {
  return { userList: system.userList }
}

const WorkOrderAddForm = Form.create()(WorkOrderAdd)
export default connect(mapStateToProps)(WorkOrderAddForm)
