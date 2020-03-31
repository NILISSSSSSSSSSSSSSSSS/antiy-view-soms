import React, { PureComponent } from 'react'
import { Spin, Steps, Button, Upload, message, Radio, Input } from 'antd'
import { createHeaders, beforeUpload, download, TooltipFn, emptyFilter } from '@/utils/common'
import CommonModal from '@/components/common/Modal'
import { CONFIG_STATUS, BASELINE_OPERATE_TYPE } from '@a/js/enume'
import api from '@/services/api'
import * as regExp from '@u/regExp'
import SubmitForm from './SubmitForm.js'
import ConfigForm from './ConfigForm.js'
import './style.less'
import AssetTable from '../../../pages/BaseSetting/Model/CheckDetail/checkTable/index.js'
import DownLoadModal from '@/components/common/DownLoadModal'

const { Step } = Steps
const { Group } = Radio
const TextArea = Input.TextArea
const ANALYSIS_STATUS = {
  INANALYSIS: 1,
  SUCCSSS: 2,
  FAILD: 3
}
class OperateModal extends PureComponent {
  state = {
    status: undefined,
    loading: true,
    fileList: [],
    reportAnalysisSuccess: false,  // 报告是否解析成功
    reportAnalysisFaild: false,    // 报告是否解析失败
    inAnalysis: false,             // 报告解析中
    checkResult: {                 // 核查信息
      checkFile: [],
      checkUrlName: [],
      checkRemark: '',
      reportUrl: '',
      failReason: ''
    },
    reinforceResult: {             // 加固信息
      fixUrl: [],
      fixUrlName: [],
      fixRemark: '',
      reportUrl: '',
      failReason: ''
    },
    fileAccept: '.xml',
    assetColumns: [{
      title: '名称',
      dataIndex: 'assetName',
      key: 'assetName',
      render: text => TooltipFn(text)
    }, {
      title: '编号',
      dataIndex: 'assetNumber',
      key: 'assetNumber',
      render: text => TooltipFn(text)
    },
    {
      title: 'IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      isShow: true,
      render: text => TooltipFn(text)
    }, {
      title: 'MAC',
      dataIndex: 'macAddress',
      key: 'macAddress',
      isShow: true,
      render: text => TooltipFn(text)
    }, {
      title: '配置来源',
      dataIndex: 'sourceName',
      key: 'sourceName',
      isShow: true,
      render: text => TooltipFn(text)
    }, {
      title: '适用系统',
      dataIndex: 'systemName',
      key: 'systemName',
      isShow: true,
      render: text => TooltipFn(text)
    }, {
      title: '状态',
      dataIndex: 'statusName',
      key: 'statusName',
      isShow: true,
      render: text => TooltipFn(text)
    }, {
      title: '执行方式',
      dataIndex: 'checkTypeName',
      key: 'checkTypeName',
      isShow: true,
      render: text => TooltipFn(text)
    },
    {
      title: '备注',
      dataIndex: 'checkRemark',
      key: 'checkRemark',
      isShow: true,
      render: text => TooltipFn(text)
    }, {
      title: '附件',
      dataIndex: 'configFiles',
      key: 'configFiles',
      isShow: true,
      width: '10%',
      render: (text, scope, index) => {
        return(
          <div style={{ overflow: 'visible', textOverflow: 'initial', whiteSpace: 'pre-wrap' }}>
            {emptyFilter(
              scope.checkFiles && scope.checkFiles.length ?
                <div className="operate-wrap">
                  <a onClick={ () => this.showFileModal(scope) }>文件下载 </a>
                </div>
                : ''
            )}
          </div>
        )
      }
    }, {
      title: '是否阻断',
      dataIndex: 'isStopInNet',
      key: 'isStopInNet',
      width: '15%',
      render: (text, scope, index) => {
        return (
          < span >
            <Group onChange={(v)=>this.passChange(v, scope, index)} value={ scope.isStopInNet }>
              <Radio value={2}>是</Radio>
              <Radio value={1}>否</Radio>
            </Group>
          </span >
        )
      }
    }],
    checkColumns: [{
      title: '名称',
      dataIndex: 'assetName',
      key: 'assetName',
      render: text => TooltipFn(text)
    }, {
      title: '编号',
      dataIndex: 'assetNumber',
      key: 'assetNumber',
      render: text => TooltipFn(text)
    }, {
      title: '备注',
      dataIndex: 'configRemark',
      key: 'configRemark',
      isShow: true,
      render: text => TooltipFn(text)
    }, {
      title: '附件',
      dataIndex: 'configFiles',
      key: 'configFiles',
      isShow: true,
      render: (text, scope, index) => {
        return(
          <div style={{ overflow: 'visible', textOverflow: 'initial', whiteSpace: 'pre-wrap' }}>
            {emptyFilter(
              scope.configFiles && scope.configFiles.length ?
                <div className="operate-wrap">
                  <a onClick={ () => this.showFileModal(scope) }>文件下载 </a>
                </div>
                : ''
            )}
          </div>
        )
      }
    }],
    isFinished: false,
    assetActivityRequests: [],
    fileModal: false,
    fileVal: null,
    importInfo: ''
  }
  componentDidMount () {
    this.uuids1 = []
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    if (nextProps.visible && JSON.stringify(this.props.visible) !== JSON.stringify(nextProps.visible)) {
      this.setState({
        status: nextProps.status,
        reportAnalysisSuccess: false,
        reportAnalysisFaild: false,
        inAnalysis: false,
        loading: true,
        fileList: [],
        isFinished: false,
        assetActivityRequests: []
      }, () => {
        if(!this.props.isBatch)
          this.getResult()
        else this.setState({
          loading: false
        })
      })
    }
  }
  //显示文件下载弹窗
  showFileModal = (scope) =>{
    this.setState({
      fileModal: true,
      fileVal: scope.checkFiles || scope.configFiles
    })
  }
  getResult = () => {
    const { state } = this.props
    switch (state) {
      case BASELINE_OPERATE_TYPE.CONFIG:    // 基准配置
        this.setState({
          loading: false
        })
        break
      case BASELINE_OPERATE_TYPE.CHECK:     // 基准核查
        this.getCheckResult()
        break
      case BASELINE_OPERATE_TYPE.REINFORCE: // 基准加固
        this.getReinfoceResult()
        break
      default:
        break
    }
  }
  // 获取核查结果相关信息（备注，附件地址，结果，是否超时，上传核查解析结果）
  getCheckResult = () => {
    const { waitingConfigId } = this.props
    api.getCheckResult({
      primaryKey: waitingConfigId
    }).then(response => {
      if (!response.body) {
        this.setState({
          loading: false
        })
        return false
      }
      const { checkUrl, checkUrlName, checkRemark, reportUrl, failReason, parseStatus } = response.body
      this.setState({
        checkResult: {
          checkUrl,
          checkUrlName,
          checkRemark,
          reportUrl,
          failReason
        },
        reportAnalysisSuccess: parseStatus === ANALYSIS_STATUS.SUCCSSS,
        reportAnalysisFaild: parseStatus === ANALYSIS_STATUS.FAILD,
        inAnalysis: parseStatus === ANALYSIS_STATUS.INANALYSIS,
        loading: false
      })
    })
  }
  // 获取加固结果相关信息（备注，附件地址，结果，是否超时，上传加固解析结果）
  getReinfoceResult = () => {
    const { waitingConfigId } = this.props
    api.getReinforceResult({
      primaryKey: waitingConfigId
    }).then(response => {
      if (!response.body) {
        this.setState({
          loading: false
        })
        return false
      }
      const { fixUrl, fixUrlName, fixRemark, reportUrl, failReason, parseStatus, isFromWaiting } = response.body
      this.setState({
        reinforceResult: {
          fixUrl,
          fixUrlName,
          fixRemark,
          reportUrl,
          failReason,
          isFromWaiting
        },
        reportAnalysisSuccess: parseStatus === ANALYSIS_STATUS.SUCCSSS,
        reportAnalysisFaild: parseStatus === ANALYSIS_STATUS.FAILD,
        inAnalysis: parseStatus === ANALYSIS_STATUS.INANALYSIS,
        loading: false
      })
    }).catch(() => {
      this.setState({ loading: false })
    })
  }
  uploadChange = (info) => {
    let fileList = info.fileList
    this.setState({
      fileList,
      inAnalysis: true
    })
    // 网络失败
    fileList.filter((e) => e.status === 'error').forEach((file) => {
      message.info(file.name + '上传超时！')
    })
    //服务器处理失败
    fileList.filter((e) => e.status === 'done' && e.response && e.response.head.code !== '200' && e.percent === 100 && !this.uuids1.includes(e.uid)).forEach((file) => {
      // 如果提示上传失败，下次上传时，不在提示
      this.uuids1.push(file.uid)
      file.response.head.code !== '500' ? message.info(file.response.body) : message.info('上传' + file.name + ' 失败！')
      this.setState({
        inAnalysis: false,
        reportAnalysisFaild: true,
        reportAnalysisSuccess: false,
        importInfo: 'FSFSSSSSSSSSSSSSSSSSFFFFFFF'
      })
    })
    const list = fileList.filter((e) => e.status === 'done')
    if (list.length === fileList.length) {
      this.uuids1 = []
      this.setState({
        fileList: list.filter((e) => e.response && e.response.head.code === '200')
      }, () => {
        if (this.state.fileList.length) {
          this.setState({
            inAnalysis: false,
            reportAnalysisSuccess: true,
            reportAnalysisFaild: false,
            fileList: []
          })
        }
      })
    }
  }
  // 重新自动核查
  automaticCheck = () => {
    const { waitingConfigId } = this.props
    api.automaticCheck({
      primaryKey: waitingConfigId
    }).then(response => {
      message.success('操作成功！')
      this.getNewList()
    })
  }
  // 重新自动加固
  automaticReinforce = () => {
    const { waitingConfigId } = this.props
    api.automaticReinforce({
      primaryKey: waitingConfigId
    }).then(response => {
      message.success('操作成功！')
      this.getNewList()
    })
  }
  getNewList = () => {
    this.props.onClose()
    this.props.getList()
  }
  // 人工核查
  handCheck = () => {
    this.setState({
      status: CONFIG_STATUS.checkFailedByManual
    })
  }
  // 人工加固
  handFasten = () => {
    this.setState({
      status: CONFIG_STATUS.fastenFailedByManual
    })
  }
  configSubmit = value => {
    this.props.configSubmit(value)
  }
  // 状态变更
  checkStatusChange = () => {
    const { waitingConfigId } = this.props
    api.checkStatusChange({
      primaryKey: waitingConfigId
    })
  }
  reinforceStatusChange = () => {
    const { waitingConfigId } = this.props
    api.reinforceStatusChange({
      primaryKey: waitingConfigId
    })
  }
  //获取报告
  getReport = () => {
    const { waitingConfigId, state } = this.props
    api[state === BASELINE_OPERATE_TYPE.CHECK ? 'getCheckReport' : 'getReinforceReport']({
      waitingConfigId
    }).then(response => {
      window.open(`${response.body}`, '_blank')
    })
  }
  passChange = (v, scope, index) => {
    this.AssetTable.passChange(v.target.value, index)
  }
  NextcheckChange=(data)=>{
    const assetActivityRequests = data.map(item=>{
      if(item.isStopInNet === 2){
        return { stringId: item.assetId }
      }else{
        return null
      }
    })
    this.setState({
      assetActivityRequests: assetActivityRequests.filter(item=>item !== null)
    })
  }
  changeState =(show)=>{
    this.updateStatus(show)
  }
  //更新入网状态
  updateStatus = (show)=>{
    let { assetActivityRequests } = this.state
    console.log(assetActivityRequests)
    if(assetActivityRequests && assetActivityRequests.length){
      let param = { entrySource: 'CONFIG_SCAN', updateStatus: 2, assetActivityRequests: assetActivityRequests }
      api.updateEntryStatus(param).then(res => {
        console.log(res)
        this.setState({
          isFinished: true
        })
      })
    }else if(show){
      this.setState({
        isFinished: true
      })
    }else{
      this.setState({
        importInfo: '',
        isFinished: false
      })
    }
  }
  render () {
    const {
      loading,
      fileAccept,
      fileList,
      reportAnalysisSuccess,
      reportAnalysisFaild,
      inAnalysis,
      status,
      checkResult,
      reinforceResult,
      assetColumns,
      isFinished,
      checkColumns,
      fileVal,
      fileModal,
      importInfo
    } = this.state
    const { visible, onClose, state, areaId, waitingConfigId, getList, taskId, assetId, baselineTemplateId, isBatch, tabData } = this.props
    const uploadProps = {
      name: 'file',
      accept: isBatch ? '.zip' : fileAccept,
      headers: createHeaders(),
      action: isBatch ? '/api/v1/config/check/upload/CheckResultBatch' : '/api/v1/config/check/uploadCheckResult',
      multiple: false,
      showUploadList: false,
      onChange: this.uploadChange,
      fileList,
      beforeUpload: ((file, fileLists) => beforeUpload(file, fileLists, fileList, 5, 'MB', 2, (!isBatch ? regExp.fileTypePatternXML : regExp.fileTypePattern2)))
    }
    console.log(waitingConfigId)
    // 上传核查结果
    const uploadCheckProps = {
      ...uploadProps,
      data: {
        waitingConfigId,
        type: 1
      }
    }
    // 上传加固结果
    const uploadReinforceProps = {
      ...uploadProps,
      data: {
        waitingConfigId,
        type: 2
      }
    }
    let title = ''
    switch (state) {
      case BASELINE_OPERATE_TYPE.CONFIG:
        title = '配置基准'
        break
      case BASELINE_OPERATE_TYPE.CHECK:
        title = '配置核查'
        break
      case BASELINE_OPERATE_TYPE.REINFORCE:
        title = '配置加固'
        break
      default:
        break
    }
    let assetProps = {
      columns: assetColumns,
      currentPage: 1,
      title: 'asset',
      stringId: '',
      isScan: false,
      isCheck: true,
      tabData: tabData
    }
    let checkProps = {
      columns: checkColumns,
      currentPage: 1,
      title: 'asset',
      stringId: '',
      isScan: false,
      isCheck: true,
      tabData: tabData
    }
    return (
      <CommonModal
        type="normal"
        visible={visible}
        className="operate-modal"
        title={title}
        width={1200}
        onClose={state === BASELINE_OPERATE_TYPE.CONFIG ? onClose : this.getNewList}
      >
        <Spin spinning={loading}>
          <div className="modal-content-warp">
            <div className="steps-wrap">
              <Steps current={state}>
                <Step title="配置基准" />
                <Step title="配置核查" />
                <Step title="配置加固" />
              </Steps>
            </div>
            {/* 配置基准 */}
            {state === BASELINE_OPERATE_TYPE.CONFIG &&
              <div className="modal-content">
                <ConfigForm areaId={areaId}
                  waitingConfigId={waitingConfigId}
                  configSubmit={this.configSubmit}
                  onClose={onClose} />
              </div>
            }
            {/* 配置核查 */}
            {state === BASELINE_OPERATE_TYPE.CHECK &&
              <div className="modal-content">
                {(checkResult.checkRemark || checkResult.checkUrlName.length) ?
                  <div className="basic-info">
                    {checkResult.checkRemark &&
                      <p>
                        <span className="label">配置备注：</span>
                        <span>{checkResult.checkRemark}</span>
                      </p>
                    }
                    {
                      checkResult.checkUrlName.length ?
                        <span>
                          <span className="label">附件：</span>
                          <span>{
                            checkResult.checkUrlName.map((item, index) => (
                              <a onClick={() => download('/api/v1/config/file/fileDownload', { fileUrl: checkResult.checkUrl[index] })}>{item}</a>))
                          }</span>
                        </span>
                        : null
                    }
                  </div> : null
                }
                {/* 资产状态为待核查或核查失败后选择进行人工核查 */}
                {(status === CONFIG_STATUS.waitCheck || status === CONFIG_STATUS.checkFailedByManual || isBatch ) &&
                  <div className="operate-info">
                    {!isBatch && <h3 className="title">配置核查</h3>}
                    { isBatch && !isFinished ? <AssetTable props={checkProps} form={this.props.form} /> : null}
                    {(isFinished || !isBatch) ? <div className="operate-content">
                      <p className="tips">请先下载配置核查脚本在线下对资产进行核查，然后将核查后的结果文件上传至系统</p>
                      <div className="operate-bar">
                        <span className="download">
                          <img src={require('@/assets/download.svg')} className="download-icon" alt="" />
                          {isBatch ? <a onClick={() => download('/api/v1/config/check/download/CheckScriptBatch', { waitingConfigIds: waitingConfigId })}>批量下载配置核查脚本</a>
                            : <a onClick={() => download('/api/v1/config/check/downloadCheckScript', { primaryKey: waitingConfigId })}>下载配置核查脚本</a>}
                        </span>
                        {reportAnalysisSuccess &&
                          (
                            <span>
                              <span className="operate">
                                {
                                  checkResult.reportUrl
                                    ? <a href={(`${checkResult.reportUrl}`)} target="_blank" rel="noopener noreferrer">查看核查报告</a>
                                    : <a onClick={this.getReport}>查看核查报告</a>
                                }
                              </span>
                              <span className="operate">
                                <Upload {...uploadCheckProps}>
                                  {status === CONFIG_STATUS.checkFailedByManual
                                    ? <span onClick={this.checkStatusChange}>{inAnalysis ? '报告解析中' : '重新上传'}</span>
                                    : <span>{inAnalysis ? '报告解析中' : '重新上传'}</span>
                                  }
                                </Upload>
                              </span>
                            </span>
                          )
                        }
                        {reportAnalysisFaild &&
                          <span className="operate">
                            <Upload {...uploadCheckProps}>
                              {status === CONFIG_STATUS.checkFailedByManual
                                ? <span onClick={this.checkStatusChange}>{inAnalysis ? '报告解析中' : '重新上传'}</span>
                                : <span>{inAnalysis ? '报告解析中' : '重新上传'}</span>
                              }
                            </Upload>
                          </span>
                        }
                        {!reportAnalysisSuccess && !reportAnalysisFaild &&
                          <span className="operate">
                            <Upload {...uploadCheckProps}>
                              {status === CONFIG_STATUS.checkFailedByManual
                                ? <span onClick={this.checkStatusChange}>{inAnalysis ? '报告解析中' : '上传核查结果'}</span>
                                : <span>{inAnalysis ? '报告解析中' : '上传核查结果'}</span>
                              }
                            </Upload>
                          </span>
                        }
                      </div>
                    </div> : null}
                  </div>
                }
                {/* 资产状态为核查待确认 */}
                {status === CONFIG_STATUS.checkWaitConfirm &&
                  <div>
                    <div className="operate-info">
                      <h3 className="title">核查报告</h3>
                      <div className="operate-content">
                        <p className="tips">请查看核查报告后，填写结果</p>
                        <div className="result-info">
                          <span className="operate">
                            <a href={(`${checkResult.reportUrl}`)} target="_blank" rel="noopener noreferrer">查看核查报告</a>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                }
                {/* 资产状态为核查失败 */}
                {status === CONFIG_STATUS.checkFailed &&
                  <div>
                    <div className="operate-info">
                      <h3 className="title">核查报告</h3>
                      <div className="operate-content">
                        <div className="result-info">
                          <img src={require('@/assets/item-icon.svg')} className="item-icon" alt="" />
                          <span>失败原因：</span>
                          <span className="info">{checkResult.failReason}</span>
                          <div className="operate-btn-wrap">
                            <Button className="operate-btn" onClick={this.automaticCheck}>重新自动核查</Button>
                            <Button className="operate-btn" onClick={this.handCheck}>人工核查</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
                {importInfo && <TextArea rows={6} placeholder="请输入" disabled style={{ resize: 'none', marginTop: '10px', marginLeft: '10px' }} value={importInfo} />}
                {(reportAnalysisSuccess || status === CONFIG_STATUS.checkWaitConfirm)
                  ? <SubmitForm state={state}
                    status={status}
                    areaId={areaId}
                    onClose={onClose}
                    getList={getList}
                    waitingConfigId={waitingConfigId}
                    taskId={taskId}
                    assetId={assetId}
                    baselineTemplateId={baselineTemplateId} />
                  :
                  <div className="button-center" style={{ border: 'none' }}>
                    <div>
                      { !isFinished ? <Button type='primary' onClick={()=>this.changeState(1)} style={{ marginRight: '20px' }}>下一步</Button> :
                        <Button type='primary' onClick={()=>this.changeState(0)} style={{ marginRight: '20px' }}>上一步</Button>}
                      <Button type='primary' ghost onClick={state === BASELINE_OPERATE_TYPE.CONFIG ? onClose : this.getNewList}>取消</Button>
                    </div>
                  </div>
                }
              </div>
            }
            {/* 配置加固 */}
            {state === BASELINE_OPERATE_TYPE.REINFORCE &&
              <div className="modal-content">
                {(reinforceResult.fixRemark || reinforceResult.fixUrlName.length) && !isBatch ?
                  <div className="basic-info">
                    {reinforceResult.fixRemark &&
                      <p>
                        <span className="label">{reinforceResult.isFromWaiting ?  '配置备注：' : '核查备注：'}</span>
                        <span>{reinforceResult.fixRemark}</span>
                      </p>
                    }
                    {
                      reinforceResult.fixUrlName.length ?
                        <span>
                          <span className="label">附件：</span>
                          <span>{
                            reinforceResult.fixUrlName.map((item, index) => (
                              <a onClick={() => download('/api/v1/config/file/fileDownload', { fileUrl: reinforceResult.fixUrl[index] })}>{item}</a>))
                          }</span>
                        </span>
                        : null
                    }
                  </div> : null
                }
                {/* 资产状态为待加固或加固失败后选择进行人工加固 */}
                {(status === CONFIG_STATUS.waitFasten || status === CONFIG_STATUS.fastenFailedByManual) &&
                  <div className="operate-info">
                    { !isBatch && <h3 className="title">配置加固</h3>}
                    { isBatch && !isFinished ? <AssetTable NextcheckChange={this.NextcheckChange} props={assetProps} form={this.props.form} changeStatus={this.changeStatus} children={(now) => this.AssetTable = now}/> : null}
                    {(isFinished || !isBatch ) ? <div className="operate-content">
                      <p className="tips">请先下载配置加固脚本在线下对资产进行加固，然后将加固后的结果文件上传至系统。</p>
                      <div className="operate-bar">
                        <span className="download">
                          <img src={require('@/assets/download.svg')} className="download-icon" alt="" />
                          {isBatch ? <a onClick={() => download('/api/v1/config/fix/download/fixScriptBatch', { waitingConfigIds: waitingConfigId })}>批量下载配置加固脚本</a> : 
                            <a onClick={() => download('/api/v1/config/fix/downloadFixScript', { primaryKey: waitingConfigId })}>下载配置加固脚本</a>}
                        </span>
                        {reportAnalysisSuccess &&
                          (
                            <span>
                              <span className="operate">
                                {
                                  reinforceResult.reportUrl
                                    ? <a href={(`${reinforceResult.reportUrl}`)} target="_blank" rel="noopener noreferrer">查看加固报告</a>
                                    : <a onClick={this.getReport}>查看加固报告</a>
                                }
                              </span>
                              <span className="operate">
                                <Upload {...uploadReinforceProps}>
                                  {status === CONFIG_STATUS.fastenFailedByManual
                                    ? <span onClick={this.reinforceStatusChange}>{inAnalysis ? '报告解析中' : '重新上传'}</span>
                                    : <span>{inAnalysis ? '报告解析中' : '重新上传'}</span>
                                  }
                                </Upload>
                              </span>
                            </span>
                          )
                        }
                        {reportAnalysisFaild &&
                          <span className="operate">
                            <Upload {...uploadReinforceProps}>
                              {status === CONFIG_STATUS.fastenFailedByManual
                                ? <span onClick={this.reinforceStatusChange}>{inAnalysis ? '报告解析中' : '重新上传'}</span>
                                : <span>{inAnalysis ? '报告解析中' : '重新上传'}</span>
                              }
                            </Upload>
                          </span>
                        }
                        {!reportAnalysisSuccess && !reportAnalysisFaild &&
                          <span className="operate">
                            <Upload {...uploadReinforceProps}>
                              {status === CONFIG_STATUS.fastenFailedByManual
                                ? <span onClick={this.reinforceStatusChange}>{inAnalysis ? '报告解析中' : '上传加固结果'}</span>
                                : <span>{inAnalysis ? '报告解析中' : '上传加固结果'}</span>
                              }
                            </Upload>
                          </span>
                        }
                      </div>
                    </div> : null }
                  </div>
                }
                {/* 资产状态为加固待确认 */}
                {status === CONFIG_STATUS.fastenWaitConfirm &&
                  <div>
                    <div className="operate-info">
                      <h3 className="title">基准自动加固</h3>
                      <div className="operate-content">
                        <p className="tips">请先查看加固验证报告后，填写加固结果</p>
                        <div className="result-info">
                          <span className="operate">
                            <a href={(`${reinforceResult.reportUrl}`)} target="_blank" rel="noopener noreferrer">查看加固报告</a>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                }
                {/* 资产状态为加固失败 */}
                {status === CONFIG_STATUS.fastenFailed &&
                  <div>
                    <div className="operate-info">
                      <h3 className="title">基准自动加固</h3>
                      <div className="operate-content">
                        <div className="result-info">
                          <img src={require('@/assets/item-icon.svg')} className="item-icon" alt="" />
                          <span>失败原因：</span>
                          <span className="info">{reinforceResult.failReason}</span>
                          <div className="operate-btn-wrap">
                            <Button className="operate-btn" onClick={this.automaticReinforce}>重新自动加固</Button>
                            <Button className="operate-btn" id="fasten" onClick={this.handFasten}>人工加固</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
                {importInfo && <TextArea rows={8} placeholder="请输入" disabled style={{ resize: 'none', marginTop: '10px', marginLeft: '10px' }} value={importInfo} />}
                {(reportAnalysisSuccess || status === CONFIG_STATUS.fastenWaitConfirm)
                  ? <SubmitForm state={state}
                    status={status}
                    areaId={areaId}
                    onClose={onClose}
                    getList={getList}
                    waitingConfigId={waitingConfigId}
                    taskId={taskId}
                    assetId={assetId}
                    baselineTemplateId={baselineTemplateId} />
                  :
                  <div className="button-center" style={{ border: 'none' }}>
                    <div>
                      { !isFinished ? <Button type='primary' onClick={()=>this.changeState(1)} style={{ marginRight: '20px' }}>下一步</Button> :
                        <Button type='primary' onClick={()=>this.changeState(0)} style={{ marginRight: '20px' }}>上一步</Button>}
                      <Button type='primary' ghost onClick={state === BASELINE_OPERATE_TYPE.CONFIG ? onClose : this.getNewList}>取消</Button>
                    </div>
                  </div>
                }
              </div>
            }
            {/* 文件下载弹出框 */}
            <DownLoadModal
              params = {{
                fileModal,
                attachmentList: fileVal,
                url: '/api/v1/config/file/fileDownload'
              }}
              onCancel= {() => this.setState({ fileModal: false })}
            />
          </div>
        </Spin>
      </CommonModal>
    )
  }
}
export default OperateModal
