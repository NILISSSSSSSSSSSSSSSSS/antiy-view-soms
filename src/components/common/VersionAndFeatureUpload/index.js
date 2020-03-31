import { Component } from 'react'
import { Upload, Button, message } from 'antd'
import ProgressBar from '@/components/common/ProgressBar'
import './styles.less'

export default class VersionAndFeatureUpload extends Component{
  constructor (props){
    super(props)
    this.state = {
      isUpload: false, // 是否是在上传中
      status: '', // 文件上传状态
      percent: 0,  // 上传进度
      fileList: [], // 上传文件列表
      serverChecking: false // 服务器是否正在校验
    }
  }
  UNSAFE_componentWillReceiveProps (nextProps){
    this.setState({ fileList: nextProps.fileList || [] })
  }
  /**
   *上传文件状态改变时，回调
   * @param info
   */
  onChange = (info) => {
    const { upload: { onChange } } = this.props
    this.setState({ status: info.file.status })
    if(info.file.status === 'error'){
      message.error('链接已超时，请重新上传', 5)
      this.setState({
        fileList: [],
        isUpload: false,
        serverChecking: false,
        percent: 0  // 说明书上传进度
      })
      // onChange && onChange([], info.file.status)
      onChange && onChange([], 'fail')
      return
    }

    if(info.file.response && info.file.response.head && info.file.response.head.code !== '200'){
      if(info.file.status === 'error'){
        message.error('网络传输错误', 5)
      }else {
        message.error(info.file.response.body, 5)
      }
      this.setState({
        fileList: [],
        isUpload: false,
        serverChecking: false,
        percent: 0  // 说明书上传进度
      })
      // onChange && onChange([], info.file.status)
      onChange && onChange([], 'fail')
      return
    }else {
      if(info.file.status === 'done'){
        this.setState({ serverChecking: false })
      }else {
        this.setState({ serverChecking: true })
      }
    }

    // 删除上传时
    if(!info.fileList.length){
      this.setState({
        fileList: [],
        isUpload: false,
        serverChecking: false,
        percent: 0  // 说明书上传进度
      })
      onChange && onChange([], info.file.status)
    }else { // 上传文件时
      this.setState({
        fileList: [info.file],
        isUpload: true,
        percent: Math.ceil(info.file.percent)  // 说明书上传进度
      })
      onChange && onChange([info.file], info.file.status)
      if(info.file.percent === 100){
        this.setState({ isUpload: false })
      }
    }
  }
  upload = () =>{
    const { fileList } = this.state
    const { name } = this.props
    const { upload: { fileList: _, onChange, beforeUpload, ...other } } = this.props
    let init = {
      accept: '',
      action: '',
      onChange: this.onChange,
      multiple: false,
      name: name || 'fileList',
      beforeUpload: (file)=>{
        this.originFileObj = file
        // 上传文件大小不能为0
        if(file.size === 0){
          message.info('上传文件不能为空，请重新选择')
          return Promise.reject()
        }
        // 限制文件名字长度
        const fileNameLength = 120
        // 去除文件格式后缀之后的文件名字符串
        const fileName = file.name.substring(0, file.name.lastIndexOf('.'))
        if(fileName.length > fileNameLength){
          message.info(`文件名长度最多${fileNameLength}字符，请检查`)
          return Promise.reject()
        }
        return beforeUpload(file)
      },
      fileList,
      ...other
    }
    return init
  }
  renderFile = () => {
    const { fileList } = this.state
    return fileList.length ? fileList[0].name : ''
  }
  deleteFile = () =>{
    this.onChange({ fileList: [], file: {}, event: {} })
  }
  /**
   * 获取前置条件信息列表
   * @param precondition {Array} key前置条件的字段，msg前置条件的消息
   * @return Array
   */
  getPreconditionMsg = (precondition) => {
    if(typeof precondition === 'undefined') {
      return []
    }
    const err = (precondition || []).find((e) => {
      if(typeof e.required === 'boolean' && e.required){
        return !e.value
      }
      if(e.pattern) {
        return !e.pattern.test(e.value)
      }
      return false
    })
    return err ? [err].map((e) => ({ key: e.key, msg: e.msg })) : []

  }
  click = (msgList = []) => {
    if(msgList.length === 1){
      return message.info(msgList[0].msg)
    }
    const msg = msgList.map((e)=> e.msg ).join(',')
    message.info(msg)
  }
  render (){
    const { text, serverConfigChecking, upload: { fileList = [], precondition } } = this.props
    const { percent, isUpload, serverChecking, status } = this.state
    const checking = isUpload || serverConfigChecking && serverChecking || fileList.length
    const allowUpload = this.getPreconditionMsg(precondition)
    return(
      <div className="up-load-custom">
        <ProgressBar progress={percent} status={status} name = {this.renderFile()} deleteFile = {this.deleteFile} isUpload={isUpload} serverChecking={serverConfigChecking && serverChecking}/>
        {
          !allowUpload.length ? <Upload disabled={checking} {...this.upload()} className="up-load-custom-btn">
            <Button className={ checking ? 'btn-disabled' : ''}>选择文件</Button>
          </Upload> :
            <div className="up-load-custom-btn">
              <Button className={ checking ? 'btn-disabled' : ''} onClick={()=>{ this.click(allowUpload) }}>选择文件</Button>
            </div>
        }
        <span className="tips">
          {text}
        </span>
      </div>
    )
  }
}
