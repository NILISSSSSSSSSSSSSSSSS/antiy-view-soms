import { Component } from 'react'
import { connect } from 'dva'
import {  Button, Form, Upload, Modal, message, Spin, Input, Steps, Progress } from 'antd'
import { LOGINOUT_CODES } from '@a/js/enume'
import {  download, beforeUpload, createHeaders } from '@u/common'
import * as regExp from '@u/regExp'
import api from '@/services/api'

const TextArea = Input.TextArea
const { Step } = Steps
class ImportForm extends Component {
  constructor (props){
    super(props)
    this.state = {
      fileList: [],
      loading: false,
      info: null,
      state: 0,
      percent: 20, //进度条
      fileAccept: '.xlsx',
      successText: ''
    }
    this.uuids = []
  }

  render (){
    const {  data } = this.props
    const headers = createHeaders()
    const { fileList, loading, info, fileAccept, state, percent, successText } = this.state
    const config = {
      name: 'file',
      action: data.uploadUrl,
      accept: data.fileAccept ? data.fileAccept : fileAccept,
      onChange: (info)=>{
        this.setState({ state }, ()=>{})
        this.UploadChange(info)
      },
      fileList,
      headers: {
        ...headers
      },
      data: data.uploadDate,
      multiple: false,
      onRemove: this.fileRemove,
      beforeUpload: (file, fileLists) =>{
        if(!data.showMsg){
          return beforeUpload(file, fileLists, fileList)
        }else{
          return beforeUpload(file, fileLists, fileList, 4, 'GB', 1, regExp.fileTypePattern2)
        }
      }
    }
    const style = {
      style: {
        marginRight: '8px'
      }
    }
    const borStyle = {
      style: {
        border: 'none'
      }
    }
    return(
      <Modal
        title={'导入'}
        onCancel={()=>this.onCancel()}
        className="over-scroll-modal export-modal"
        visible={data.visible}
        width={680}
        footer={null}
      >
        <Spin spinning={loading}>
          <div className="import-and-export-handle">
            <Steps current={state}>
              <Step title="上传文件"/>
              <Step title="数据校验"/>
              <Step title="导入数据"/>
            </Steps>
          </div>
          {
            state === 0 ? (
              <div className="form-content">
                <div className="uploads" {...borStyle}>
                  <div className="uploadInfo">
                    <p>填写导入数据信息</p>
                    <p>请按照数据模板的标准格式填入数据，模板中的表头不可更改，表头行不能删除</p>
                    <p>
                      <img src={require('@a/images/download.svg')} className="download-icon" alt="" onClick={()=>this.checkVaild(data.downloadUrl, data.values)}/>
                      <a onClick={()=>this.checkVaild(data.downloadUrl, data.values)} {...style}>计算设备</a>

                      <img src={require('@a/images/download.svg')} className="download-icon" alt="" onClick={()=>this.checkVaild(data.downloadUrl, data.values)}/>
                      <a onClick={()=>this.checkVaild(data.downloadUrl, data.values)} {...style}>网络设备</a>

                      <img src={require('@a/images/download.svg')} className="download-icon" alt="" onClick={()=>this.checkVaild(data.downloadUrl, data.values)}/>
                      <a onClick={()=>this.checkVaild(data.downloadUrl, data.values)} {...style}>安全设备</a>

                      <img src={require('@a/images/download.svg')} className="download-icon" alt="" onClick={()=>this.checkVaild(data.downloadUrl, data.values)}/>
                      <a onClick={()=>this.checkVaild(data.downloadUrl, data.values)} {...style}>储存设备</a>

                      <img src={require('@a/images/download.svg')} className="download-icon" alt="" onClick={()=>this.checkVaild(data.downloadUrl, data.values)}/>
                      <a onClick={()=>this.checkVaild(data.downloadUrl, data.values)} {...style}>其他设备</a>
                    </p>
                  </div>
                </div>
                <div className="uploads" {...borStyle}>
                  <div className="uploadInfo">
                    <p>上传填好的信息表</p>
                    <p>{data.showMsg ? data.showMsg : '文件后缀必须是 xlsx (即Excel格式),文件大小不得大于10M，最多一次导入2000条数据'}</p>
                    <div>
                      <img src={require('@a/images/upload.svg')} className="download-icon icon-two" alt="" onClick={()=>{
                        document.querySelector('#upload-two').click()
                      }}/>
                      <Upload {...config}>
                        <span  id="upload-two">上传附件</span>
                      </Upload></div>
                  </div>
                </div>
              </div>
            ) : null
          }
          {info && state === 1 ? (<div className="content-error">
            <div className="content-progress" style={{ padding: '10px' }}>
              <div className='title'>
                <img src={require('@a/images/fail.svg')} alt=""/>
                <span>导入失败！</span></div>
            </div>
            <TextArea rows={8} placeholder="请输入" disabled style={{ resize: 'none', color: '#000', width: '560px', margin: '0 60px' }} value={info} />
            <div>
            </div>
          </div>) : null
          }{
            state === 2 ? (
              <div className="content-progress">
                <Progress percent={percent} showInfo={false} />
                <div className='title'>正在导入数据, 请稍等</div>
              </div>
            ) : null
          }
          {
            state === 3 ? (
              <div className="content-progress">
                <div className='title'>
                  <img src={require('@a/images/success.svg')} alt=""/>
                  <span>导入完成！</span></div>
                <p className="successText">{successText}</p>
              </div>
            ) : null
          }
          <div className="button-center" style={{ border: 'none' }}>
            <div>
              {
                state === 1 ? (
                  <Button style={{ marginLeft: '8px' }}  type='primary' ghost onClick={this.startAgain}>重新上传</Button> ) : (
                  <Button style={{ marginLeft: '8px' }}  type='primary' ghost onClick={()=>{
                    if(state === 3)
                      this.props.data.onOk()
                    this.onCancel()
                  }}>{ state === 3 ? '确认' : '取消' }</Button>
                )
              }
            </div>
          </div>
        </Spin>
      </Modal>
    )
  }
  //删除
  fileRemove= ()=>{
    this.setState({
      info: '',
      fileList: []
    })
  }
  //重新上传
  startAgain = ()=>{
    this.setState({
      state: 0,
      info: '',
      fileList: [],
      percent: 0
    })
  }
  //取消
  onCancel = ()=>{
    this.setState({
      fileList: [],
      info: '',
      state: 0,
      percent: 0
    }, ()=>this.props.data.onCancel())
  }
  //判断下载权限
  checkVaild= (url, values)=>{
    api.checkDownloadAuth({ token: sessionStorage.getItem('token') }).then(res => {
      download(url, values)
    })
  }
  //上传文件判断状态
  UploadChange = (info) => {
    //上传多个始终保持一个文件
    const { max = 1 } = this.props
    let fileList = info.fileList
    if(max === 1){
      let file = info.file
      this.setState({
        fileList: [file]
      })
    }else {
      this.setState({
        fileList
      })
    }
    // 网络失败
    fileList.filter((e)=>e.status === 'error').forEach((file)=>{
      this.setState({ state: 0, percent: 0, fileList: [] })
      message.info(file.name + '上传超时！')
    })
    //权限改变
    if(info.file.response && info.file.status !== 'error' ){
      const LOGINOUT_CODES_CODE = Object.values(LOGINOUT_CODES)
      // 属于重新登录的code时
      if(LOGINOUT_CODES_CODE.includes(info.file.response.head.code)){
        message.error(`${info.file.response.body}`)
        window.location.href = '/#/login'
      }
    }
    //除补丁服务器处理失败
    if(!this.props.data.showMsg){
      fileList.filter((e)=>e.status === 'done' && e.response && e.response.head.code !== '200' && !this.uuids.includes(e.uid)).forEach((file)=>{
        // 如果提示上传失败，下次上传时，不在提示
        this.uuids.push(file.uid)
        this.setState({
          info: file.response.body,
          state: 1,
          percent: 0
        })
      })
    }else{
      //补丁处理失败
      fileList.filter((e)=>e.status === 'done' && e.response && e.response.head.code !== '200' && !this.uuids.includes(e.uid)).forEach((file)=>{
        // 如果提示上传失败，下次上传时，不在提示
        if(Object.prototype.toString.call(file.response.body) === '[object String]'){
          this.uuids.push(file.uid)
          this.setState({
            info: file.response.body,
            state: 1,
            percent: 0
          })
        }else{
          let ob = file.response.body
          let strings = ''
          let init = ob
          init.forEach((item)=>{
            let name = item.sheetName
            if(item.data && item.data.length){
              item.data.forEach((ob)=>{
                strings += `${name}第${ob.lineNumber}行,` + ob.message + '\n'
              })
            }
          })
          this.setState({
            info: strings,
            state: 1,
            percent: 0
          })
        }
      })
    }
    //服务器处理成功
    fileList.filter((e)=>e.status === 'done' && e.response && e.response.head.code === '200' && e.percent === 100 && !this.uuids.includes(e.uid)).forEach((file)=>{
      // 漏洞模块
      if(file.response.body && file.response.body.errorCount){
        this.uuids.push(file.uid)
        let arr = file.response.body.dtos
        let str = arr.map((item, index) => {
          return ('第' + item.line + '行,' + item.msg + '\n')
        }).join('')
        this.setState({
          info: str,
          state: 1,
          percent: 0
        })
      } else {
        //除漏洞模块
        let msg = file.response.body && file.response.body.totalCount ? '您已成功导入' + file.response.body.totalCount + '条数据' : file.response.body
        this.setState({
          fileList: [],
          info: '',
          state: 3,
          percent: 0,
          successText: msg
        })
      }
    })
    this.setState({ percent: Math.floor(info.file.percent) })
  }
}
const mapStateToProps = () => {
  return {
  }
}
const ModalFormWrap = Form.create()(ImportForm)
export default connect(mapStateToProps)(ModalFormWrap)
