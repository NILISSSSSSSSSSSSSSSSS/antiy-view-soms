
import { Component } from 'react'
import { Modal, Form, Row, Select, Button, Upload, message } from 'antd'
import { createHeaders } from '@/utils/common'
import api from '@/services/api'
// import { download } from '@/utils/common'
import './style.less'

const { Option } = Select
class logImport extends Component{
  constructor (props){
    super(props)
    this.state = {
      fileList: [],
      logTypeList: [],
      disabled: true
    }
  }

  componentDidMount (){
  }
  getLogTypeList = (value) => {
    api.logTypeList({ operatingSystem: value }).then( res => {
      this.setState({ logTypeList: res.body })
    })
  }
  sysOnChange = (value) => {
    this.getLogTypeList(value)
    this.setState({ disabled: false })
  }
    //文件上传
    uploadChange = info => {
    //   const { paramAccept } = this.state
    //   const { file } = info
      let { fileList } = info
      console.log(info)
      //   const strFileName = file.name.replace(/.+\./, '.').toLowerCase()
      //界面不展示此file文件
      //   if (paramAccept.indexOf(strFileName) === -1) {
      //     message.error(`不支持${strFileName}文件类型`)
      //     return false
      //   }

      this.setState({ fileList })
    }
    postData = () => {
      console.log(1)
      //   e.preventDefault()
      this.props.form.validateFields((err, values) => {
        console.log(values)
        this.props.onCancel()
      })
    }
    render (){
      let { visible } = this.props
      let { getFieldDecorator } = this.props.form
      let { fileList, logTypeList, disabled } = this.state
      const config = {
        name: 'files',
        action: '/api/v1/device/log/upload/file',
        headers: createHeaders(),
        accept: '.txt,.xlsx,.xls',
        beforeUpload: this.beUpload,
        onChange: this.uploadChange,
        fileList: fileList
      }
      return(
        <div>
          <Modal title='导入'
            visible={visible}
            onOK={this.postData}
            onCancel={this.props.onCancel}>
            <Form className="filter-form" layout="inline" onSubmit={this.postData}>
              <Row>
                <Form.Item label="操作系统">
                  {
                    getFieldDecorator('operatingSystem' )(
                      <Select  placeholder="请选择操作系统" onChange={this.sysOnChange}>
                        <Option value={1}>windows</Option>
                        <Option value={2}>linux</Option>
                      </Select>
                    )
                  }
                </Form.Item>
                <Form.Item label="日志类型">
                  {
                    getFieldDecorator('logType' )(
                      <Select placeholder="请选择日志类型" disabled ={disabled}>
                        {
                          logTypeList.map( item => {
                            return(
                              <Option value={item.code}>{item.name}</Option>
                            )
                          })
                        }
                      </Select>
                    )
                  }
                </Form.Item>
                <Form.Item label="上传文件" extra="上传格式：excel">
                  {getFieldDecorator('upload', {
                  })(
                    <Upload {...config}>
                      <Button> + 上传文件 </Button>
                    </Upload>
                  )}
                </Form.Item>
              </Row>
            </Form>
          </Modal>
        </div>
      )
    }
}
const logImports = Form.create()(logImport)
export default logImports