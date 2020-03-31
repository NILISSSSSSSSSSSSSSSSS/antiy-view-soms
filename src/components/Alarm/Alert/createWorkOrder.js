import { Component } from 'react'
import { connect } from 'dva'
import { Input, Form, Modal, message, Select, Upload, Icon, DatePicker, Popover, Button } from 'antd'
import { createHeaders } from '@/utils/common'
import api from '@/services/api'
import moment from 'moment'
const { Item } = Form
const Option  =  Select.Option
const FormLayout = {
  labelCol: {
    span: 10
  },
  wrapperCol: {
    span: 14
  }
}
class  createWorkOrder extends Component {
  constructor (props){
    super(props)
    this.state = {
      show: false,
      userList: this.props.userList,
      list: {},
      fileList: [],
      paramAccept: '.rar,.zip,.7z,.doc,.docx,.pdf,.jpg,.png,.txt,.xlsx,.xls'
    }
  }
  componentDidMount (){
    this.props.childrens(this)
    this.props.dispatch({ type: 'system/getAllUserList' })
    api.getUsersByAreaOfCurrentUser().then((data)=>{
      if(data && data.head && data.head.code === '200'){
        this.setState({
          userList: data.body
        })
      }
    })
  }
  disabledDate = (timeValue) => {
    const endValue = new Date()
    timeValue = new Date(timeValue)
    //今天的时间也算
    return (timeValue.valueOf() + 86400000) < endValue.valueOf()
  }
  render () {
    const { show, userList, paramAccept, fileList } = this.state
    const { getFieldDecorator } = this.props.form
    const config = {
      name: 'files',
      action: '/api/v1/routine/workOrderAttachment/upload',
      headers: createHeaders(),
      accept: paramAccept,
      beforeUpload: this.beUpload,
      onChange: this.uploadChange,
      multiple: true,
      // onRemove: this.fileRemove,
      fileList: fileList
    }
    const hintContent = (
      <div>
        <p>支持上传个数：5</p>
        <p>支持上传大小：10M</p>
        <p>支持扩展名：.rar, .zip, .7z, .doc, .docx, .pdf, .jpg, .png, .txt, .xlsx, .xls</p>
      </div>
    )
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
    const formItemLayout = {
      labelCol: {
        span: 12
      },
      wrapperCol: {
        span: 12
      }
    }
    return(
      <div>
        <Modal title='创建工单' className='over-scroll-modal' visible={show} onCancel={this.handleCancel} width={600} footer={null}>
          <Form style={{ paddingLeft: 40 }} className="form-single" layout="horizontal" onSubmit={this.Submit}>
            <div className='form-content'>
              <Item {...FormLayout} label="工单名称">
                {
                  getFieldDecorator('name', {
                    rules: [{ required: true, message: '请输入工单名称!' }, { max: 60, message: '工单名称过长,须小于或等于60个字符' }]
                  })(
                    <Input autoComplete="off" placeholder='请输入...' />
                  )
                }
              </Item>
              <Item {...FormLayout} label="工单类型">
                {
                  getFieldDecorator('orderType', {
                    rules: [{ required: true }],
                    initialValue: '11'
                  })(
                    <Select disabled>
                      <Option key='11'>告警</Option>
                    </Select>
                  )
                }
              </Item>
              <Item {...FormLayout} label="工单级别">
                {
                  getFieldDecorator('workLevel', {
                    rules: [{ required: true, message: '请选择工单级别!' }]
                  })(
                    <Select allowClear={true} placeholder="请选择" >
                      {
                        ['紧急', '重要', '次要', '提示'].map((item, index)=>{
                          return(<Option value={index + 1} key={index}>{item}</Option>)
                        })
                      }
                    </Select>
                  )
                }
              </Item>
              <Item {...formItemLayout} label="预计开始时间">
                {getFieldDecorator('startTime', {
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
                  />
                )}
              </Item>
              <Item {...formItemLayout} label="预计结束时间">
                {getFieldDecorator('endTime', {
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
                    placeholder="请选择预计结束时间" />
                )}
              </Item>
              <Item {...FormLayout} label="执行人">
                {
                  getFieldDecorator('executeUser', {
                    rules: [{ required: true, message: '请选择执行人！' }]
                  })(
                    <Select
                      showSearch
                      filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      optionFilterProp="children" labelInValue placeholder='请选择对应处理人员！'>
                      {
                        userList ? userList.map(item => (
                          <Option value={item.stringId} key={item.stringId}>{item.name}</Option>
                        )) : ''
                      }
                    </Select>
                  )
                }
              </Item>
              <Item {...FormLayout} label="工单内容">
                {
                  getFieldDecorator('content', {
                    rules: [{ required: true, message: '请输入工单内容!' }, { min: 1, max: 300, message: '请输入1-300个字符' }]
                  })(
                    <Input.TextArea placeholder='请输入工单内容' rows={4} style={{ resize: 'none' }} />
                  )
                }
              </Item>
              <Item {...FormLayout} label="文件上传">
                {
                  getFieldDecorator('attachmentList', {
                  })(
                    <Upload {...config} >
                      <div className="uploads">
                        <Popover content={ hintContent }>
                          <Icon type="question-circle" />
                        </Popover>
                          &nbsp;&nbsp;上传附件&nbsp;&nbsp;
                      </div>
                    </Upload>
                  )
                }
              </Item>
            </div>
            <div className="Button-center">
              <div>
                <Button type="primary" onClick={this.Submit}>确定</Button>
                <Button type="primary" ghost onClick={this.handleCancel}>
                取消
                </Button>
              </div>
            </div>
          </Form>
        </Modal>
      </div>
    )
  }
  //开始时间小于结束时间
  validateEndTime = (rule, value, callback) => {
    const form = this.props.form
    if (value &&  moment(value).valueOf() < (moment(form.getFieldValue('startTime')).valueOf())) {
      callback('预计结束时间应大于开始时间!')
    } else {
      callback()
    }
  }
  onStartChange = (value) => {
    const form = this.props.form
    const endTime = form.getFieldValue('endTime')
    setTimeout(()=>{
      if (endTime) form.validateFieldsAndScroll([ 'endTime'], { force: true })
    }, 0 )
  }
  //提交
  Submit= (e)=>{
    e.preventDefault()
    let { ids, fileList } = this.state
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values = {
          'name': values.name,
          'startTime': values.startTime.valueOf(),
          'endTime': values.endTime.valueOf(),
          'executeUserId': values.executeUser.key,
          'orderType': values.orderType,
          'content': values.content,
          'workLevel': values.workLevel,
          'workOrderAttachments': fileList ? fileList.map( item => { return( item.response.body[0].id) } ) : [],
          'relatedSourceId': ids
        }
        api.postCreateWorkOrder(values).then(data=>{
          if(data.head && data.head.code === '200'){
            message.success(`${data.head.result}!`)
            this.props.success()
            this.handleCancel()
          }
        })
      }
    })
  }
  //取消
  handleCancel= ()=>{
    this.setState({
      show: false,
      fileList: ''
    })
    this.props.form.resetFields()
  }
  //显示弹窗
  show = (data)=>{
    this.setState({
      show: true,
      ids: data.map(item=>item.stringId)
    })
  }
    //文件上传前
    beUpload = (file, fileLists) => {
      // 这里只控制是否调上传接口，不控制界面是否展示
      const { paramAccept, fileList } = this.state
      const strFileName = file.name.replace(/.+\./, '.').toLowerCase()
      if (paramAccept.indexOf(strFileName) === -1) {
        return false
      }
      const newList = [ ...fileList, ...fileLists]
      const index = newList.indexOf(file)
      if(index >= 5){
        if(index === 5){
          message.info('上传文件不能超过五个！')
        }
        return  Promise.reject()
      }
      let fileLen = file.name.length - strFileName.length
      if ( fileLen > 120) {
        message.error('文件名长度不能超过120')
        return Promise.reject()
      }
      const init = 1024 * 1024 * 10
      if(file.size > init){
        message.info('文件不能大于10M!')
        return  Promise.reject()
      }
      if (file.size === 0 ) {
        message.error('上传文件不能为空，请重新选择')
        return Promise.reject()
      }
    }

  //文件上传
  uploadChange = info => {
    const { paramAccept } = this.state
    const { file } = info
    let { fileList } = info
    const strFileName = file.name.replace(/.+\./, '.').toLowerCase()
    //界面不展示此file文件
    if (paramAccept.indexOf(strFileName) === -1) {
      message.error(`不支持${strFileName}文件类型`)
      return false
    }

    if (file.status === 'done') {
      if(fileList.length > 5){
        message.error('文件不能超过5个')
        fileList = fileList.slice(0, 5)
      }
      fileList = fileList.map(item => {
        if (item.response) {
          item.url = item.response.body[0].fileUrl
          item.md5 = item.response.body[0].md5
        }
        return item
      })
    }
    const init = 1024 * 1024 * 10
    if(file.size > init){
      message.error('文件不能大于10M!')
      return  Promise.reject()
    }
    this.setState({ fileList })
  }
}

const mapStateToProps = ({ system }) => {
  return { userList: system.userList }
}

const createWorkOrders = Form.create()(createWorkOrder)
export default connect(mapStateToProps)(createWorkOrders)