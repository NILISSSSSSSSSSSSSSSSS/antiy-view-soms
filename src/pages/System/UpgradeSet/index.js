
import { Component } from 'react'
import { Upload, message, Progress, Form, Button, Spin, Icon } from 'antd'
import qs from 'qs'
import moment from 'moment'
import api from '@/services/api'
import { createHeaders } from '@u/common'
import hasAuth from '@/utils/auth'
import CommonModal from '@/components/common/Modal'
import OnlineSet from '@/components/System/OnlineSet'
import { LOGINOUT_CODES } from '@a/js/enume'
import { systemPermission } from '@a/permission'
import './style.less'

const { Item } = Form
const fileAccept = '.rar,.zip,.7z'
const downloadList = [{
  type: 'all',
  name: '全库升级包',
  downloadApi: '/api/v1/routine/upgrade/master/download/all',
  uploadApi: '/api/v1/routine/upgrade/slave/upload/all',
  uploadText: '全库',
  judgeApi: api.judgeAll
}
  // {
  //   type: 'asset',
  //   name: '资产升级包',
  //   downloadApi: '/api/v1/routine/upgrade/master/download/asset',
  //   uploadApi: '/api/v1/routine/upgrade/slave/upload/asset',
  //   uploadText: '资产知识库',
  //   judgeApi: api.judgeAssets
  // }, {
  //   type: 'baseline',
  //   name: '基准升级包',
  //   downloadApi: '/api/v1/routine/upgrade/master/download/baseline',
  //   uploadApi: '/api/v1/routine/upgrade/slave/upload/baseline',
  //   uploadText: '配置知识库',
  //   judgeApi: api.judgeBaseline
  // }, {
  //   type: 'vuln',
  //   name: '漏洞升级包',
  //   downloadApi: '/api/v1/routine/upgrade/master/download/vuln',
  //   uploadApi: '/api/v1/routine/upgrade/slave/upload/vuln',
  //   uploadText: '漏洞知识库',
  //   judgeApi: api.judgeVuln
  // }, {
  //   type: 'patch',
  //   name: '补丁升级包',
  //   downloadApi: '/api/v1/routine/upgrade/master/download/patch',
  //   uploadApi: '/api/v1/routine/upgrade/slave/upload/patch',
  //   uploadText: '补丁知识库',
  //   judgeApi: api.judgePatch
  // }
]

class UpgradeSet extends Component {
  constructor (props) {
    super(props)
    this.state = {
      modalVisible: false,         // 长传进度modal
      downloadModalVisible: false, // 下载Modal
      version: '',                 // 导入文件的版本
      fileList: [],                // 上传文件列表
      isUpload: false,             // 是否是在上传
      percent: 0,                  // 上传进度
      errMsg: '',                  // 导入的错误提示
      uploadErr: false,            // 导入失败
      uploadSuccess: false,        // 导入成功
      uploadText: '',              // 显示导入升级包类型
      async: false,                // 是否异步导入
      downloadFormData: {          // 下载Modal表单
        type: 'all',               // 升级类型默认全量
        startStamp: '',
        endStamp: ''
      },
      downloadApi: '',             // 下载api
      uploadApi: '',               // 导入api
      judgeApi: ''                 // 下载判空api
    }
  }
  // 检查导入文件接口的登录状态
  checkStatus = res => {
    const loginoutCodes = Object.keys(LOGINOUT_CODES).map(key => LOGINOUT_CODES[key])
    if (loginoutCodes.indexOf(res.head.code) !== -1) { // token过期
      message.error(res.body.data)
      sessionStorage.clear()
      window.location.href = '/#/login'  //登录有了开
    }
  }
  /**
   *上传文件状态改变时，回调
   * @param info
   */
  onChange = (info) => {
    this.setState({
      status: info.file.status
    })
    console.log(info)
    if (info.file.response && info.file.response.head && info.file.response.head.code === '200') {
      const { version, async } = info.file.response.body
      this.setState({
        uploadSuccess: true,
        version,
        async
      })
    }
    if (info.file.status === 'error') {
      this.setState({
        fileList: [],
        isUpload: false,
        modalVisible: true,
        percent: 0,  // 上传进度
        errMsg: '链接已超时，请重新上传',   // 服务器解析文件格式返回的提示
        uploadErr: true
      })
      return
    }
    if (info.file.response && info.file.response.head && info.file.response.head.code !== '200') {
      this.checkStatus(info.file.response)
      if (info.file.status === 'error') {
        message.error('网络传输错误', 5)
        this.setState({
          fileList: [],
          isUpload: false,
          percent: 0  // 上传进度
        })
      } else {
        this.setState({
          fileList: [],
          isUpload: false,
          modalVisible: true,
          percent: 0,  // 上传进度
          errMsg: info.file.response.body,   // 服务器解析文件格式返回的提示
          uploadErr: true
        })
      }
      return
    }
    // 删除上传时
    if (!info.fileList.length) {
      this.setState({
        fileList: [],
        isUpload: false,
        percent: 0  // 上传进度
      })
    } else { // 上传文件时
      this.setState({
        fileList: [info.file],
        isUpload: true,
        modalVisible: true,
        percent: Math.ceil(info.file.percent)  // 上传进度
      })
      if (info.file.percent === 100) {
        this.setState({ isUpload: false })
      }
    }
  }
  setModalVisible = (modalVisible, type) => {
    this.setState({
      [modalVisible]: type
    })
  }
  // 修改升级类型
  typeChange = e => {
    const { downloadFormData } = this.state
    this.setState({
      downloadFormData: {
        ...downloadFormData,
        type: e.target.value
      }
    })
  }
  // 点击下载升级包
  downloadIt = (downloadApi, judgeApi) => {
    this.setState({
      downloadApi,
      judgeApi,
      downloadModalVisible: true,
      downloadFormData: {
        type: 'all',
        startStamp: '',
        endStamp: ''
      }
    })
  }
  // 点击导入升级包
  uploadIt = (uploadText, uploadApi) => {
    this.setState({
      uploadText,
      uploadApi
    })
  }
  modalHandleSubmit = values => {
    const { downloadApi, judgeApi } = this.state
    const versionArr = values.version ? [...values.version] : undefined
    if (versionArr) values.startStamp = versionArr[0] ? versionArr[0].valueOf() : ''
    delete values.version
    this.setState({
      downloadFormData: values
    }, () => {
      const { downloadFormData } = this.state
      const { startStamp } = downloadFormData
      let params = {}
      if (downloadFormData.type === 'increment') {
        params = { startStamp }
      }
      judgeApi(params).then(response => {
        if (response.body.isEmpty) return message.error('下载数据不能为空，请重新选择')

        const headers = createHeaders(params) // 把请求参数传入到函数，生成headers
        params = Object.assign(headers, params) // 把请求参数和headers合并，生成新的请求参数
        window.open(`${downloadApi}?${qs.stringify(params)}`) // 拼接下载url，执行下载

        this.setModalVisible('downloadModalVisible', false)
      })
    })
  }
  render () {
    const {
      version,
      uploadText,
      uploadApi,
      fileList,
      errMsg,
      status,
      uploadErr,
      uploadSuccess,
      async,
      percent,
      modalVisible,
      downloadModalVisible,
      downloadFormData
    } = this.state
    // 下载form字段定义
    const modalFormFields = [
      {
        type: 'radioGroup', key: 'type', name: '升级类型', onChange: this.typeChange,
        defaultValue: downloadFormData.type,
        data: [{ label: '全量升级', value: 'all' }, { label: '增量升级', value: 'increment' }]
      }
    ]
    // 选择版本的开始时间默认为昨天的0点。结束时间默认为昨天，且不可编辑。
    const versionItem = {
      type: 'dateRange', key: 'version', name: '选择版本', todayUsable: false,
      disabledRange: [false, true],
      initialValue: [moment(moment(Date.now()).startOf('day').valueOf() - 24 * 60 * 60 * 1000), moment(Date.now() - 24 * 60 * 60 * 1000)],
      rules: [{ required: true, message: ['请选择版本'] }]
    }
    // 注： 当升级类型为“增量升级时”，需要选择版本
    if (downloadFormData.type === 'increment') modalFormFields.push(versionItem)
    const formLayout = {
      labelCol: {
        span: 4
      },
      wrapperCol: {
        span: 16
      }
    }
    const config = {
      name: 'upgradeFile',
      accept: fileAccept,
      action: uploadApi,
      headers: {
        ...createHeaders()
      },
      multiple: false,
      showUploadList: false,
      onChange: this.onChange,
      fileList,
      beforeUpload: (file) => {
        this.setState({
          errMsg: '',
          uploadErr: false,
          uploadSuccess: false,
          percent: 0,
          isUpload: false,
          async: false
        }, () => {
          this.originFileObj = file
          // 上传文件大小不能为0
          if (file.size === 0) {
            message.info('上传文件不能为空，请重新选择')
            return Promise.reject()
          }
        })
      }
    }
    const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />
    return (
      <div className="main-detail-content upgrade-set">
        {
          hasAuth(systemPermission.sysSetUpgradeOnline) &&
          <div>
            <p className="detail-title detail-title-online">在线升级配置</p>
            <OnlineSet />
          </div>
        }
        {
          hasAuth(systemPermission.sysSetUpgradeOffline) &&
          <div>
            <p className="detail-title detail-title-offline">离线升级</p>
            <div className="detail-content">
              {/* {
            hasAuth('upgrade:set:offlineupgrade:download') &&
            <div className="attachment">
              {
                downloadList.map(item => {
                  return (
                    <div className="attachment-item" title="" key={item.type}>
                      <p className="attachment-item-title">{item.name}</p>
                      <div className="download" onClick={() => {this.downloadIt(item.downloadApi, item.judgeApi)}}>
                        <img src={require('@/assets/download.svg')} className="download-icon" alt=""/>
                          下载
                      </div>
                    </div>
                  )
                })
              }
            </div>
            } */}
              {
                hasAuth(systemPermission.sysSetUpgradeOfflineImport) &&
                <div className="attachment">
                  {
                    downloadList.map(item => {
                      return (
                        <div className="attachment-item" title="" key={item.type}>
                          <p className="attachment-item-title">{item.name}</p>
                          <Upload {...config}>
                            <div className="download">
                              <div onClick={() => { this.uploadIt(item.uploadText, item.uploadApi) }}>
                                <img src={require('@/assets/import.svg')} className="download-icon" alt="" />
                                导入
                              </div>
                            </div>
                          </Upload>
                        </div>
                      )
                    })
                  }
                </div>
              }
            </div>
          </div>
        }
        <CommonModal
          type="normal"
          visible={modalVisible}
          width={400}
          onClose={() => { this.setModalVisible('modalVisible', false) }}
        >
          <div className="progress-wrap">
            {/* 正在导入 */}
            <div className="import" style={{ display: percent !== 100 && !errMsg ? 'block' : 'none' }}>
              <Progress strokeColor='#3B6CFF' percent={percent} showInfo={false} />
              <p className="tips">
                正在导入数据，请稍等…
                <span className="percent">{`（${percent}）%`}</span>
              </p>
            </div>
            {/* 上传成功等待导入结果返回，加载中... */}
            <div className="loading" style={{ display: percent === 100 && !uploadSuccess ? 'block' : 'none' }}>
              <Spin indicator={antIcon} />
              <p className="msg">文件校验中，请稍等...</p>
            </div>
            {/* 导入同步完成 */}
            <div className="success" style={{ display: status === 'done' && percent === 100 && uploadSuccess && !async ? 'block' : 'none' }}>
              <div className="complete">
                <img
                  src={require('@/assets/success.svg')}
                  alt="" />
                <span>导入完成</span>
              </div>
              <p className="version">系统{uploadText}已升级至{version}版本</p>
              <div className="btn-wrap">
                <Button type="primary" onClick={() => { this.setModalVisible('modalVisible', false) }}>
                  确定
                </Button>
              </div>
            </div>
            {/* 导入异步完成,实际后台还在异步执行中 */}
            <div className="success" style={{ display: status === 'done' && percent === 100 && uploadSuccess && async ? 'block' : 'none' }}>
              <p className="waiting">数据升级中，请稍后在升级记录中查看结果</p>
              <div className="btn-wrap">
                <Button type="primary" onClick={() => { this.setModalVisible('modalVisible', false) }}>
                  确定
                </Button>
              </div>
            </div>
            {/* 导入失败 */}
            <div className="success" style={{ display: uploadErr ? 'block' : 'none' }}>
              <div className="complete">
                <span>导入失败！</span>
              </div>
              <p className="err-msg">
                <img
                  src={require('@/assets/error.svg')}
                  alt="" />
                <span>{`${errMsg}！`}</span>
              </p>
              <div className="btn-wrap">
                <Upload {...config}>
                  <Button type="primary">
                    重新上传
                  </Button>
                </Upload>
                <Button
                  type="primary"
                  className="back"
                  ghost
                  onClick={() => { this.setModalVisible('modalVisible', false) }}
                >
                  取消
                </Button>
              </div>
            </div>
          </div>
        </CommonModal>
        <CommonModal
          type="form"
          className="download-modal"
          visible={downloadModalVisible}
          title="离线升级"
          width={650}
          oktext="下载"
          value={this.modalHandleSubmit}
          onClose={() => { this.setModalVisible('downloadModalVisible', false) }}
          fields={modalFormFields}
          column={1}
          FormItem={Item}
          formLayout={formLayout}
        >
        </CommonModal>
      </div>
    )
  }
}
export default UpgradeSet
