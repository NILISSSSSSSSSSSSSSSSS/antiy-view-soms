import { Component } from 'react'
import { connect } from 'dva'
import { Form, Input, Button, message, Modal, Select, Upload, Icon, Popover } from 'antd'
import api from '@/services/api'
import { createHeaders, beforeUpload } from '@/utils/common'
import './style.less'
import { debounce } from 'lodash'

const { Option } = Select
const { Item } = Form
const { TextArea } = Input

const hintContent = (
  <div>
    <p>支持上传个数：5</p>
    <p>支持上传大小：10M</p>
    <p>支持扩展名：.rar .zip .7z .doc .docx .pdf .jpg .png .txt .xlsx .xls</p>
  </div>
)

class Complete extends Component {
  constructor (props) {
    super(props)
    this.state = {
      complete: {
        visible: false,
        completeStatus: '',
        orderId: ''
      },
      fileList: [],
      fileIdList: [],
      fileAccept: '.rar,.zip,.7z,.doc,.docx,.pdf,.jpg,.png,.txt,.xlsx,.xls'
    }
    this.handleSubmit = debounce(this.handleSubmit, 800)
    this.uuids = []
  }
  componentDidMount () {
    this.props.complete(this)
  }
  render () {
    const { getFieldDecorator } = this.props.form
    const { fileList, fileAccept } = this.state
    const formItemLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 12
      }
    }
    const tailFormItemLayout = {
      wrapperCol: {
        span: 12,
        offset: 6
      }
    }
    //附件相关
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
    return (
      <div>
        <Modal
          title="完成工单"
          width="650px"
          className="over-scroll-modal"
          visible={this.state.complete.visible}
          onCancel={this.handleCancel}
          footer={null}>
          <Form onSubmit={(e) => {e.preventDefault(), this.handleSubmit()}} className="work-order-form">
            <div className="form-content">
              <Item {...formItemLayout} label="是否完成">
                {getFieldDecorator('completedStatus', { rules: [{ required: true, message: '请选择完成状态' }]
                })(
                  <Select placeholder="请选择完成状态">
                    <Option key={true}>正常完成</Option>
                    <Option key={false}>未完成</Option>
                  </Select>
                )}
              </Item>
              <Item {...formItemLayout} label="结果反馈">
                {getFieldDecorator('feedback', {
                  rules: [{ required: true, message: '请输入结果反馈' }, { max: 300, message: '请输入1-300个字符' }]
                })(
                  <TextArea placeholder="请输入结果反馈" rows={4} type="completeReason" />
                )}
              </Item>
              <Item {...tailFormItemLayout}>
                <Upload {...uploadProps}>
                  <div className='work-order-complete-upload'>
                    <Icon type='plus' />
                    &nbsp;&nbsp;上传附件&nbsp;&nbsp;
                    <Popover content={ hintContent }>
                      <Icon type='question-circle' />
                    </Popover>
                  </div>
                </Upload>
              </Item>
            </div>
            <div className="Button-center">
              <div>
                <Button type="primary" htmlType="submit">确定</Button>
                <Button type="primary" ghost onClick={this.handleCancel}>取消</Button>
              </div>
            </div>
          </Form>
        </Modal>
      </div>
    )
  }

  //提交表单
  handleSubmit = () => {
    this.props.form.validateFields((err, { feedback, completedStatus }) => {
      if (!err) {
        let param = {
          completedStatus,
          feedback,
          orderId: this.state.complete.orderId,
          workOrderAttachmentIds: this.state.fileIdList
        }
        api.workOrderCompletedStatus(param).then(response => {
          if(response && response.head && response.head.code === '200' ){
            message.success('完成成功！')
            this.handleCancel()
            this.props.refresh()
          }else {
            message.error('操作失败！' + response.body)
          }
        })
      }
    })
  }
  //弹出
  completeWorkOrder = (id) => {
    this.setState({
      complete: {
        visible: true,
        orderId: id
      }
    })
  }
  //取消
  handleCancel = (e) => {
    this.setState({
      complete: {
        visible: false
      },
      fileList: []
    })
    this.props.form.resetFields()
    this.uuids = []
  }
  //附件上传
  uploadChange = (info) => {
    let fileList = info.fileList
    this.setState({
      fileList
    })
    // 网络失败
    fileList.filter((e)=>e.status === 'error').forEach((file)=>{
      message.info(file.name + '上传超时！')
    })
    //服务器处理失败
    fileList.filter((e)=>e.status === 'done' && e.response && e.response.head.code !== '200' && e.percent === 100 && !this.uuids.includes(e.uid)).forEach((file)=>{
      // 如果提示上传失败，下次上传时，不在提示
      this.uuids.push(file.uid)
      message.info('上传 ' + file.name + ' 失败！')
    })
    // 所有文件上传完成时，排除上传失败文件，刷新上传列表
    const list = fileList.filter((e)=>e.status === 'done')
    if(list.length === fileList.length){
      this.uuids = []
      let fileIdList = []
      const uploadList = list.filter((e)=>e.response && e.response.head.code === '200')
      uploadList.forEach((file) => {
        let response = file.response
        const fileId = response.body[0].id
        fileIdList.push(fileId)
      })
      this.setState({
        fileList: uploadList,
        fileIdList
      })
    }
  }
}

// const mapStateToProps = () => {
// }

const CompleteForm = Form.create()(Complete)
export default connect()(CompleteForm)
