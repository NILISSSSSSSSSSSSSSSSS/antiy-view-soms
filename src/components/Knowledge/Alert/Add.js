
import { Component } from 'react'
import { connect } from 'dva'
import { Input, Form, Select, Upload, Button, Icon, Modal, message, Popover } from 'antd'
import api from '@/services/api'
import { createHeaders, beforeUpload } from '@/utils/common'
import { replaceAliasName } from '@/utils/common'
const { Item } = Form
const { Option } = Select
const { TextArea } = Input
const FormLayout = {
  labelCol: {
    span: 8
  },
  wrapperCol: {
    span: 12
  }
}
const hintContent = (
  <div>
    <p>支持上传个数：5</p>
    <p>支持上传大小：100M</p>
    <p>支持扩展名：.rar .zip .7z .doc .docx .pdf .jpg .png .txt .xlsx .xls</p>
  </div>
)
class Add extends Component {
  constructor (props){
    super(props)
    this.state = {
      AddModal: false,
      fileList: [],
      record: null,
      title: '',
      fileAccept: '.rar,.zip,.7z,.doc,.docx,.pdf,.jpg,.png,.txt,.xlsx,.xls'
    }
    this.uuids = []
  }
  componentDidMount (){
    this.props.AddModal(this)
  }
  //表单提交
  Submit=(e)=>{
    e.preventDefault()
    this.props.form.validateFields((err, value)=>{
      if (!err) {
        // replaceAliasName用于处理页面列表与modal中，Form中字段name相同
        const values = replaceAliasName(value)
        // 组装filesInfo数据
        const record = this.state.record
        if (values.files) { // 当上传按钮被点过时
          values.filesInfo = values.files.fileList.map(item => {
            let init
            if (item.response) { // item为上传来的数据
              init = item.response.body[0]
            } else { // item为根据原数据组装后的Upload组件数据
              // 遍历原数据，找到item对应的原数据项
              for (let i = 0; i < this.state.fileList.length; i++) {
                if (this.state.fileList[i].currFileName === item.currFileName) {
                  init = this.state.fileList[i]
                }
              }
            }
            return init
          })
        } else if (record) { // 当上传按钮没被点过，且为变更时
          values.filesInfo = record.filesInfo
        } else { // 当上传按钮没被点过，且为登记时
          values.filesInfo = []
        }
        if(record)
          values.id = record.id
        delete values.files
        api[record ? 'knowledgeUpdate' : 'KnowledgeSave'](values).then(response => {
          if(response && response.head && response.head.code === '200' ){
            message.success('操作成功')
            this.setState({
              AddModal: false,
              record: null
            })
            this.handleCancel()
            this.props.getKnowledgeList()
          }
        })
      }
    })
  }
  //隐藏弹框
  handleCancel= ()=>{
    this.setState({
      AddModal: false,
      fileList: [],
      record: null
    })
    this.props.form.resetFields()
  }
  UploadChange = (info) => {
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
      this.setState({
        fileList: list.filter((e)=>e.response && e.response.head.code === '200')
      })
    }
  }
  //显示弹窗
  ShowModal= (id)=>{
    this.setState({
      title: id ? '知识库变更' : '登记知识库'
    })
    if (id) {
      api.getKnowledgeDetail({ primaryKey: id }).then(res => {
        if(res && res.head && res.head.code === '200'){
          this.props.form.setFieldsValue({
            'alias-name': res.body.name,
            'alias-keyWords': res.body.keyWords,
            'alias-knowledgeType': res.body.knowledgeType,
            'content': res.body.content
          })
          this.setState({
            record: res.body,
            fileList: res.body.filesInfo.map((item, index) => ({ // 根据原数据组装为的Upload组件所需的数据
              uid: index,
              name: item.originFileName,
              currFileName: item.currFileName, // currFileName是唯一的，用于提交时的判断
              id: item.id,
              md5: item.md5,
              originFileName: item.originFileName,
              fileSize: item.fileSize,
              fileUrl: item.fileUrl
            }))
          })
        }
      })
    }
    this.setState({
      AddModal: true
    })
  }
  render (){
    const { AddModal, fileList, title, fileAccept } = this.state
    const { getFieldDecorator } = this.props.form
    const config = {
      name: 'fileList',
      accept: fileAccept,
      action: '/api/v1/file/upload',
      headers: createHeaders(),
      multiple: true,
      onChange: this.UploadChange,
      fileList,
      beforeUpload: ((file, fileLists) => beforeUpload(file, fileLists, fileList, 100))
    }
    return(
      <div>
        <Modal className="over-scroll-modal" title={title} width="650px" footer={null} visible={AddModal} onOk={this.Submit} onCancel={this.handleCancel}>
          <Form onSubmit={this.Submit}>
            <div className="form-content">
              <Item {...FormLayout} label="名称">
                {
                  getFieldDecorator('alias-name', {
                    rules: [{ required: true, message: '请输入名称' }, { max: 30,  message: '请输入1-30个字符' }]
                  })(
                    <Input autoComplete="off" className='ant-form-item-control-wrapper'  placeholder='请输入名称'/>
                  )
                }
              </Item>
              <Item {...FormLayout} label="关键字">
                {
                  getFieldDecorator('alias-keyWords', {
                    rules: [{ required: true, message: '请输入关键名' }, { min: 1, max: 30,  message: '长度最小为1，最大不能超过30' }]
                  })(
                    <Input autoComplete="off" className='ant-form-item-control-wrapper' placeholder='请输入关键字'/>
                  )
                }
              </Item>
              <Item {...FormLayout} label="知识库类型">
                {
                  getFieldDecorator('alias-knowledgeType', {
                    rules: [{ required: true, message: '请选择知识库类型' } ]
                  })(
                    <Select className='ant-form-item-control-wrapper' style={{ width: '100%' }} placeholder='请选择知识库类型' getPopupContainer={triggerNode => triggerNode.parentNode}>
                      <Option key="EVENT">事件库</Option>
                      <Option key="PLAN">方案库</Option>
                      <Option key="CASE">案例库</Option>
                      <Option key='BENCHMARK_STRATEGY'>基准策略库</Option>
                    </Select>
                  )
                }
              </Item>
              <Item {...FormLayout} label="内容">
                {
                  getFieldDecorator('content', {
                    rules: [{ required: true, message: '请输入内容' }, { max: 5000,  message: '请输入1-5000个字符' }]
                  })(
                    <TextArea className='ant-form-item-control-wrapper' placeholder='关于知识库的内容描述'>
                    </TextArea>
                  )
                }
              </Item>
              <Item {...FormLayout} label="文件上传">
                {
                  getFieldDecorator('files')(
                    <Upload {...config}>
                      <div className='work-order-add-upload'>
                        <Icon type='plus' />
                        &nbsp;&nbsp;上传附件&nbsp;&nbsp;
                        <Popover content={ hintContent }>
                          <Icon type='question-circle' />
                        </Popover>
                      </div>
                    </Upload>
                  )
                }
              </Item>
            </div>
            <div className="Button-center">
              <div>
                <Button type='primary' htmlType='submit' className='work-order-add-btn'>提交</Button>
                <Button type='primary' ghost onClick={this.handleCancel}>取消</Button>
              </div>
            </div>
          </Form>
        </Modal>
      </div>
    )
  }
}
const mapStateToProps = ({ vul }) => {
  return {
  }
}
const AddForm = Form.create()(Add)
export default connect(mapStateToProps)(AddForm)
