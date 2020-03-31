import { Component } from 'react'
import { connect } from 'dva'
import { Row, Col, Button, Select, Form, Radio, Input, Icon, Upload, Popover, Modal, message } from 'antd'
import { createHeaders, beforeUpload } from '@/utils/common'
import { map, find } from 'lodash'
import DownloadFile from '@/components/common/DownloadFile'

const { Item } = Form
const { Group } = Radio
const { Option } = Select
const { TextArea } = Input

class ValidateForm extends Component {
  constructor (props){
    super(props)
    this.state = {
      detail: {},
      cycle: '1',
      saveItem: this.props.saveItem,
      usersByRoleCodeAndAreaIdList: this.props.usersByRoleCodeAndAreaIdList,
      configResultInfo: this.props.configResultInfo,
      fileList: [],
      fileAccept: '.rar,.zip,.7z,.doc,.docx,.pdf,.jpg,.png,.txt,.xlsx,.xls'
    }
    this.uuids = []
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    //备注和文件
    if (JSON.stringify(this.props.configResultInfo) !== JSON.stringify(nextProps.configResultInfo)) {
      this.setState({
        configResultInfo: nextProps.configResultInfo
      })
    }
    //入网人员、验证人员
    if (JSON.stringify(this.props.usersByRoleCodeAndAreaIdList) !== JSON.stringify(nextProps.usersByRoleCodeAndAreaIdList)) {
      this.setState({
        usersByRoleCodeAndAreaIdList: nextProps.usersByRoleCodeAndAreaIdList
      })
    }
  }
  render (){
    const {  visible, form, page } = this.props
    const { cycle, usersByRoleCodeAndAreaIdList, configResultInfo, fileList, fileAccept } = this.state
    const { getFieldDecorator } = form
    const formItemLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 16
      }
    }
    const hintContent = (
      <div>
        <p>支持上传个数：5个</p>
        <p>支持上传大小：10M</p>
        <p>支持扩展名：.rar .zip 7z.doc .docx .pdf .jpg  .png .txt .xlsx .xls </p>
      </div>
    )
    const config = {
      name: 'fileList',
      action: '/api/v1/file/upload',
      headers: createHeaders(),
      accept: fileAccept,
      onChange: this.UploadChange,
      fileList,
      multiple: true,
      onRemove: this.fileRemove,
      beforeUpload: ((file, fileLists) => beforeUpload(file, fileLists, fileList))
    }
    return(
      <Modal
        title={page === 'validation' ? '基准验证' : '基准实施'}
        onCancel={this.cancel}
        className="over-scroll-modal"
        visible={visible}
        width={650}
        footer={null}
      >
        <div className="form-content">
          {configResultInfo.implMode === '2' ?
            <div className="detail-content">
              <Row>
                <Col span={4}><span className="detail-content-label">{page === 'validation' ? '实施备注' : (configResultInfo.type === 3 ? '验证备注' : '配置备注')}：</span></Col>
                <Col span={20}>{configResultInfo.memo}</Col>
              </Row>
              <Row>
                <Col span={4}><span className="detail-content-label">相关附件：</span></Col>
                <Col span={20}>
                  {configResultInfo.fileRequests && configResultInfo.fileRequests.length ? <DownloadFile filelist={configResultInfo.fileRequests.map(item =>({ ...item, fileName: item.fileName }))}/> : '无' }
                </Col>
              </Row>
            </div> : null
          }
          <Form>
            <Item {...formItemLayout} label={page === 'validation' ? '验证情况' : '实施情况'}>
              {getFieldDecorator('analysisResult', { initialValue: '1', rules: [{ required: true, message: '请选择验证情况！' }] })(
                <Group onChange={this.cycleChange}>
                  <Radio value="1" className="rigister-radio">通过</Radio>
                  <Radio value="0">不通过</Radio>
                </Group>
              )}
            </Item>
            {
              cycle === '0' ?
                <Item {...formItemLayout} label="备注信息">
                  {getFieldDecorator('memo', { rules: [{ required: true, message: '最多300个字符！', max: 300 }] })(
                    <TextArea placeholder="请输入" rows={4} />
                  )}
                </Item> :
                <Item {...formItemLayout} label="备注信息">
                  {getFieldDecorator('memo1', { rules: [{ required: false, message: '最多300个字符！', max: 300 }] })(
                    <TextArea placeholder="请输入" rows={4} />
                  )}
                </Item>
            }
            <Item {...formItemLayout} label="相关附件">
              {
                getFieldDecorator('fileRequests', {
                })(
                  <Upload {...config}>
                    <div className="uploads">
                      <Icon type="plus" />
                    &nbsp;&nbsp;上传附件&nbsp;&nbsp;
                      <Popover content={hintContent}>
                        <Icon type="question-circle" />
                      </Popover>
                    </div>
                  </Upload>
                )
              }
            </Item>
            {
              cycle === '1' && configResultInfo.source === 1 && page === 'validation' ? (
                <Item {...formItemLayout} label="选择入网执行人员">
                  {getFieldDecorator('UserId', { rules: [{ required: true, message: '请选择入网执行人员！' }] })(
                    <Select placeholder={'选择入网执行人员'} showSearch>
                      {usersByRoleCodeAndAreaIdList.length ? <Option value='all'>全部</Option> : null }
                      {
                        usersByRoleCodeAndAreaIdList && usersByRoleCodeAndAreaIdList.map(item => (
                          <Option value={item.name} key={item.stringId}>{item.name}</Option>
                        ))
                      }
                    </Select>
                  )}
                </Item>) : null
            }
            {
              cycle === '1' && page === 'enforcement' ? (
                <Item {...formItemLayout} label="选择基准验证人员">
                  {getFieldDecorator('UserId', { rules: [{ required: true, message: '请选择基准验证人员！' }] })(
                    <Select placeholder={'选择基准验证人员'} showSearch>
                      {usersByRoleCodeAndAreaIdList.length ? <Option value='all'>全部</Option> : null }
                      {
                        usersByRoleCodeAndAreaIdList && usersByRoleCodeAndAreaIdList.map(item => (
                          <Option value={item.name} key={item.stringId}>{item.name}</Option>
                        ))
                      }
                    </Select>
                  )}
                </Item>) : null
            }
          </Form>
        </div>
        <div className="Button-center">
          <div>
            <Button type="primary" onClick={this.Submit}>提交</Button>
            <Button style={{ marginLeft: '8px' }}  type='primary' ghost onClick={this.cancel}>取消</Button>
          </div>
        </div>
      </Modal>
    )
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
  //提交
  Submit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let { usersByRoleCodeAndAreaIdList, configResultInfo, cycle } = this.state
        if(values.UserId === 'all' || (configResultInfo.implMode === '1' && cycle === '0')){
          values.UserId = map(usersByRoleCodeAndAreaIdList, 'stringId').join(',')
        }else if(values.UserId){
          values.UserId = find(usersByRoleCodeAndAreaIdList, { 'name': values.UserId }).stringId
        }
        this.props.saveAlert(values)
        let _t = this
        setTimeout(()=>{
          _t.cancel()
        }, 100)
      }
    })
  }
  cycleChange = (e) => {
    this.setState({
      cycle: e.target.value
    })
  }
  cancel =() =>{
    this.props.form.resetFields()
    this.setState({
      fileList: [],
      cycle: '1'
    })
    this.props.cancelAlert()
  }
  goBack = () =>{
    this.props.form.resetFields()
    this.props.history.goBack()
  }
}
const mapStateToProps = ({ asset }) => {
  return {
    usersByRoleCodeAndAreaIdList: asset.usersByRoleCodeAndAreaIdList
  }
}
const ModalFormWrap = Form.create()(ValidateForm)
export default connect(mapStateToProps)(ModalFormWrap)
