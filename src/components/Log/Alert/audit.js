import { Component } from 'react'
import { connect } from 'dva'
import { Row, Col, Input, Form, Upload, Popover, Icon, Modal, message, Button } from 'antd'
import { createHeaders } from '@u/common'
import api from '@/services/api'
const { Item } = Form

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      offset: 0
    },
    sm: {
      offset: 1
    }
  }
}
class  Audit extends Component {
  constructor (props){
    super(props)
    this.state = {
      show: false,
      fileList: [],
      ids: [],
      paramAccept: '.rar,.zip,.7z,.doc,.docx,.jpg,.pdf,.png,.txt,.xlsx,.xls'
    }
  }
  componentDidMount (){
    this.props.auditAlert(this)
  }
  render (){
    const { show, fileList, paramAccept } = this.state
    const { getFieldDecorator } = this.props.form
    const config = {
      name: 'fileList',
      action: '/api/v1/log/upload/file',
      onChange: this.uploadChange,
      beforeUpload: this.beUpload,
      accept: paramAccept,
      multiple: true,
      headers: createHeaders(),
      onRemove: this.fileRemove,
      fileList: fileList
    }

    const hintContent = (
      <div>
        <p>支持上传个数：5</p>
        <p>支持上传大小：10M</p>
        <p>支持扩展名：.rar, .zip, .7z, .doc, .docx, .pdf, .jpg, .png, .txt, .xlsx, .xls</p>
      </div>
    )
    return(
      <div>
        <Modal className='over-scroll-modal' title='审计' visible={show} width={600} footer={null}>
          <Form style={{ paddingLeft: 30 }} className="form-single" layout="horizontal" onSubmit={this.Submit} >
            <div className='form-content'>
              <Row>
                <Col span={24}>
                  <Item {...tailFormItemLayout} label="审计报告名称">
                    {
                      getFieldDecorator('auditReportName', {
                        rules: [{ required: true, message: '请输入审计报告名称！' }, { max: 60, message: '字符长度不能超过60' }]
                      })(
                        <Input autoComplete="off" placeholder='请输入报告名称'/>
                      )
                    }
                  </Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Item {...tailFormItemLayout} label="审计结论">
                    {
                      getFieldDecorator('auditContent', {
                        rules: [{ required: true, message: '请输入审计结论！' }, { max: 300, message: '字符长度必须小于等于300' }]
                      })(
                        <Input.TextArea rows={3} placeholder="请输入" style={{ resize: 'none' }} />
                      )
                    }
                  </Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Item {...tailFormItemLayout} label="文件上传">
                    {
                      getFieldDecorator('attachmentList', {
                      })(
                        <Upload {...config} fileList={this.state.fileList}>
                          <div className="uploads">
                            <Icon type="upload" />
                          &nbsp;&nbsp;上传附件&nbsp;&nbsp;
                            <Popover content={ hintContent }>
                              <Icon type="question-circle" />
                            </Popover>
                          </div>
                        </Upload>
                      )
                    }
                  </Item>
                </Col>
              </Row>
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
  //取消
  handleCancel= ()=>{
    this.setState({
      show: false,
      ids: [],
      fileList: []
    })
    this.props.form.resetFields()
  }
  //显示弹窗
  show = (data)=>{
    this.setState({
      show: true,
      ids: data
    })
  }
  //文件上传前
  beUpload = (file, fileLists ) => {
    const { paramAccept, fileList } = this.state
    const strFileName = file.name.replace(/.+\./, '.').toLowerCase()
    if (paramAccept.indexOf(strFileName) === -1) {
      message.error(`不支持${strFileName}文件类型`)
      return Promise.reject()
    }
    let fileLen = file.name.length - strFileName.length
    if ( fileLen > 120) {
      message.error('文件名长度不能超过120')
      return Promise.reject()
    }
    const newList = [ ...fileList, ...fileLists]
    const index = newList.indexOf(file)
    if(index >= 5){
      if(index === 5){
        message.info('上传文件不能超过五个！')
      }
      return  Promise.reject()
    }
    const init = 1024 * 1024 * 10
    if (file.size > init) {
      message.error('文件不能大于10M!')
      return Promise.reject()
    }
    if (file.size === 0 ) {
      message.error('上传文件不能为空，请重新选择')
      return Promise.reject()
    }
  }
  //文件上传
  uploadChange = info => {
    const { file } = info
    let { fileList } = info

    if (file.status === 'done') {
      if (fileList.length > 5) {
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
    this.setState({ fileList })
  }
  //删除文件
  fileRemove=(file)=>{
    const fileUrl = file.response.body[0].fileUrl
    api.deleteAuditReportFile({ fileUrl }).then(data=>{
      if(data.head && data.head.code === '200' ){
        message.success(`删除${data.head.result}`)
      }
    })
  }
  //提交
  Submit= (e)=>{
    e.preventDefault()
    let { fileList, ids } = this.state
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.attachmentList = fileList.map(item=>{
          let originFileName = item.name
          let fileSize = item.size
          let fileUrl = item.url
          let md5 = item.md5
          return{ fileName: originFileName, fileSize, fileUrl, md5 }
        })
        values.operLogIds = ids
        api.postAuditReport(values).then(data=>{
          if(data.head && data.head.code === '200'){
            message.success(`提交${data.head.result}!`)
            if(ids.length > 1 )
              this.props.success(true)
            else
              this.props.success()
            this.handleCancel()
          }
        })
      }
    })
  }
}
const mapStateToProps = ({ Logs }) => {
  return {
  }
}
const AuditForm = Form.create()(Audit)
export default connect(mapStateToProps)(AuditForm)