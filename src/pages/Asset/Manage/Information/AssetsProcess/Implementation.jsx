import React, { Component, Fragment } from 'react'
import { connect } from 'dva'
import { CommonModal } from '@c'
import { Form, Radio, Input, Upload, message, Icon, Table, Select } from 'antd'
import PropTypes from 'prop-types'
import { download, uploadLimit, beforeUpload, createHeaders, TooltipFn } from '@/utils/common'
import { cloneDeep, throttle } from 'lodash'
import './style.less'
import api from '@/services/api'

import ProBasic from'./ProcessCom/ProBasic'
import ModalConfirm from '@/components/common/ModalConfirm'

const FormItem = Form.Item
const { TextArea } = Input
const RadioGroup = Radio.Group
const { Option } = Select

@Form.create()
@connect(({ asset, staticAsset }) => ({
  assetModelColumns: staticAsset.assetModelColumns,
  previousBatch: asset.previousBatch,
  usersByRoleCodeAndAreaIdList: asset.usersByRoleCodeAndAreaIdList
}))
class Implementation extends Component{
    state = {
      PrefixCls: 'AssetsProcess',
      isReject: false, //是否必填
      fileList: '',  //附件
      visible: false,
      inAnalysis: false,
      analysisSuccess: true,
      analysisCarry: false,
      isTable: false,
      isDelete: false,
      deleteId: '',
      fileList_report: [], //报告
      recordsArr: [],
      basicObj: {
        remarkName: '',
        note: '',
        fileInfo: '[]'
      }  //上一步附件等信息
    }
    uuids=[]
    cloneInitState={}  //保存初始状态

    static propTypes = {
      assetModelColumns: PropTypes.array,
      previousBatch: PropTypes.array,
      usersByRoleCodeAndAreaIdList: PropTypes.array,
      onRef: PropTypes.func
    }

    openModel= (visible = true, recordsArr = [])=>{
      this.setState({
        visible,
        recordsArr,
        isTable: recordsArr.length > 1 ? true : false
      }, async ()=>{
        if(!visible) return void(0)
        await Promise.all([
          this.previousBatch(),
          this.getUsersByRoleCodeAndAreaId()
        ])
        await this.baselineFileAsset()
      })
    }

    //上传附件
    UploadChange = (info) => {
      const fileList = info.fileList.slice(0, 5)
      this.setState({ fileList })
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

    uploadProps=(assetId)=>{
      const { fileList_report } = this.state
      return {
        name: 'file',
        accept: '.xml',
        action: '/api/v1/config/check/uploadCheckResult',
        headers: createHeaders(),
        multiple: false,
        showUploadList: false,
        onChange: info=>this.uploadChange(info, assetId),
        data: {
          assetId,
          type: 2
        },
        beforeUpload: ((file, fileLists) => beforeUpload(file, fileLists, fileList_report, 10000, 'MB', 2, /^(xml)$/i))
      }
    }

    // 上传报告批量改变
    uploadChangeBatch=(assetId, inAnalysis, analysisCarry, analysisSuccess)=>{
      const recordsArr = cloneDeep(this.state.recordsArr)
      recordsArr.forEach(v=>{
        if(v.stringId === assetId) [v.inAnalysis, v.analysisCarry, v.analysisSuccess] = [inAnalysis, analysisCarry, analysisSuccess]
      })
      this.setState({ recordsArr })
    }

    isTableFn=(fnA, fnB)=>{
      if(this.state.isTable){
        fnA()
      }else{
        fnB()
      }
    }

    //上传报告
    uploadChange = (info, assetId = null) => {
      let fileList_report = cloneDeep([info.fileList[info.fileList.length - 1]])
      let analysisSuccess = true
      this.setState({ fileList_report })

      //上传中
      fileList_report.filter((e)=>e.status === 'uploading').forEach(file=>{
        this.isTableFn(
          ()=>{this.uploadChangeBatch(assetId, true, false)},
          ()=>{this.setState({ inAnalysis: true })}
        )
      })

      // 网络失败
      fileList_report.filter((e)=>e.status === 'error').forEach((file)=>{
        message.info(file.name + '上传超时！')
        analysisSuccess = false
      })

      //服务器处理失败
      fileList_report.filter((e)=> {
        if(e.status === 'done' && e.response && e.response.head.code !== '200' && e.percent === 100){
          // 如果提示上传失败，下次上传时，不在提示
          message.info('上传 ' + e.name + ' 失败！')
          analysisSuccess = false
        }
      })

      // 所有文件上传完成时，排除上传失败文件，刷新上传列表
      const list = fileList_report.filter((e)=>e.status === 'done')
      if(list.length === fileList_report.length){
        this.isTableFn(
          ()=>{this.uploadChangeBatch(assetId, false, true, analysisSuccess )},
          ()=>{this.setState({ inAnalysis: false, analysisCarry: true, analysisSuccess })}
        )
        this.setState({ fileList_report: [] })
      }
    }

    //ui同意拒绝回调
    changeReject = () => {
      const agree = this.props.form.getFieldValue('agree')
      const isAllow = agree === '0' || agree === 0
      this.setState({ isReject: !isAllow })
    }

    getRecordsArrIds=(recordsArr, stringId)=>{
      let stringIds = []
      recordsArr.forEach(v=>stringIds.push(v[stringId]))
      return stringIds
    }

    lookReportAlone=()=>{
      const params = {
        assetId: this.getRecordsArrIds(this.state.recordsArr, 'stringId')[0]
      }
      this.getFixReportAsset(params)
    }

    lookReportBatch=assetId=>{
      const params = {
        assetId
      }
      this.getFixReportAsset(params)
    }

    getDownParams=recordsArr=>{
      const comArr = recordsArr.filter(item=>item.categoryModel === 1)
      const comIds = this.getRecordsArrIds(comArr, 'stringId')
      const ids = this.getRecordsArrIds(recordsArr, 'stringId')
      return {
        flag: false,
        comIds,
        ids
      }
    }

    downTempAlone=()=>{
      const { recordsArr } = this.state
      const params = this.getDownParams(recordsArr)
      this.downTemp(params)
    }

    downTempBatch=recordsArr=>{
      const params = this.getDownParams([recordsArr])
      this.downTemp(params)
    }

    //移除
    delete=stringId=>{
      this.setState({ isDelete: true, deleteId: stringId })
    }

    isDeleteCB=()=>{
      const recordsArr = cloneDeep(this.state.recordsArr)
      recordsArr.forEach((v, i)=>{
        v.stringId === this.state.deleteId && recordsArr.splice(i, 1)
      })
      this.setState({ recordsArr, isDelete: false  })
    }

    onSubmitCB=values=>{
      const fileList = values.file && values.file.fileList
      let fileInfo = []
      if(fileList) {
        fileList.forEach((item)=>{
          const obj = {
            url: item.response.body[0].fileUrl,
            fileName: item.response.body[0].originFileName
          }
          fileInfo.push(obj)
        })
      }
      fileInfo = JSON.stringify(fileInfo)
      let assetInfoList = []
      this.state.recordsArr.forEach(item=>{
        const content = {
          taskId: item.waitingTaskReponse.taskId,
          assetId: item.stringId
        }
        assetInfoList.push(content)
      })
      if(values.operator === ' '){
        values.operator = this.props.usersByRoleCodeAndAreaIdList.map(item=>item.stringId).join(',')
      }

      const params = {
        agree: values.agree,
        assetFlowEnum: 'TEMPLATE_IMPL',
        assetInfoList,
        formData: !this.state.isReject ? { 'resultCheckUser': values.operator ? values.operator : '', 'templateImplementResult': 1 } : { 'templateImplementResult': 0 },
        fileInfo: fileInfo,
        note: values.note

      }

      api.statusJump(params).then(res=>{
        if (res && res.head && res.head.code === '200') {
          this.onSubmitCbApi(res)
        }
      })
    }

    onSubmitCbApi=res=>{
      this.props.getAssetList()
      this.openModel(false)
      message.success(`${res.head.result}`)
    }

    /***************副作用开始************** */

    //上一步备注附件信息查询
    previousBatch=async ()=>{
      await  this.props.dispatch({ type: 'asset/previousBatch', payload: { ids: this.getRecordsArrIds(this.state.recordsArr, 'stringId') } })
      const { previousBatch } = this.props
      if(this.state.isTable){
        const recordsArr = cloneDeep(this.state.recordsArr)
        recordsArr.forEach(v=>{
          previousBatch.forEach(t=>{
            if(v.stringId === t.assetId){
              [v.note, v.fileInfo, v.inAnalysis, v.analysisCarry, v.analysisSuccess] = [t.note, t.fileInfo, false, false, true]
            }
          })
        })
        this.setState({ recordsArr })
        return void(0)
      }

      const isAdd = !!previousBatch.length
      const note = isAdd ? previousBatch[0].note : ''
      const fileInfo = isAdd ? previousBatch[0].fileInfo : '[]'
      this.setState({
        basicObj: {
          remarkName: '验证备注',
          note,
          fileInfo
        }
      })
    }

    //操作人员
    getUsersByRoleCodeAndAreaId=()=>{
      this.props.dispatch({ type: 'asset/getUsersByRoleCodeAndAreaId', payload: {
        flowNodeTag: 'validate_result', flowId: 3, areaId: this.getRecordsArrIds(this.state.recordsArr, 'areaId') }
      })
    }

    //下载模板
    downTemp=params=>{
      download('/api/v1/config/baselineasset/export/implementation/file',  {
        flag: params.flag,
        ids: params.ids,
        comIds: params.comIds
      })
    }

    //查看报告
    getFixReportAsset=params=>{
      api.getFixReportAsset(params).then(res=>{
        if (res && res.head && res.head.code === '200') {
          window.open(res.body)
        }
      })
    }

    //查看资产是否关联配置附件
    baselineFileAssetCB=(recordsArr, body)=>{
      recordsArr.forEach(v=>{
        body.forEach(t=>{
          if((v.stringId === t.assetId) && t.result === true){
            [v.inAnalysis, v.analysisSuccess, v.analysisCarry] = [false, true, true]
          }
        })
      })
      this.setState({ recordsArr })
    }

    baselineFileAsset=()=>{
      const recordsArr = cloneDeep(this.state.recordsArr)
      api.baselineFileAsset({
        ids: this.getRecordsArrIds(recordsArr, 'stringId'),
        type: 'WAIT_TEMPLATE_IMPL'
      }).then(res=>{
        if (res && res.head && res.head.code === '200') {
          this.isTableFn(()=>{this.baselineFileAssetCB(recordsArr, res.body)}
            , ()=>{res.body[0].result && this.setState({
              inAnalysis: false,
              analysisSuccess: true,
              analysisCarry: true
            })})
        }
      })
    }

    //提交
    onSubmit = throttle(values => {
      this.props.form.validateFields((err, values = {}) => {
        if (err) return void(0)
        // console.log(err)
        this.onSubmitCB(values)
      })
    }, 5000, { trailing: false })

    render (){
      const {
        PrefixCls,
        isReject,
        fileList,
        visible,
        recordsArr,
        isTable,
        inAnalysis,
        analysisCarry,
        analysisSuccess,
        basicObj,
        isDelete,
        fileList_report
      } = this.state
      const {
        assetModelColumns,
        usersByRoleCodeAndAreaIdList,
        form: { getFieldDecorator }
      } = this.props

      let columns = cloneDeep(assetModelColumns)

      const operateColumns = [
        {
          title: 'MAC',
          dataIndex: 'note',
          key: 'note',
          render: text=>TooltipFn(text)
        },
        // {
        //   title: '验证附件',
        //   dataIndex: 'fileInfo',
        //   key: 'fileInfo',
        //   render: text=>{
        //     const fileInfos = text ? JSON.parse(text) : []
        //     const styles = {
        //       style: {
        //         display: 'block',
        //         overflow: 'hidden',
        //         'text-overflow': 'ellipsis',
        //         'white-space': 'nowrap'
        //       }
        //     }
        //     return Array.isArray(fileInfos) && fileInfos.map((v, i)=>(
        //       <a {...styles} onClick={() => window.open(`/api/v1/file/download?access_token=${sessionStorage.getItem('token')}&url=${v.url}&fileName=${encodeURIComponent(v.fileName)}`)}>
        //         {/* {TooltipFn(v.fileName)} */}
        //         {v.fileName}
        //       </a>
        //     ))
        //   }
        // },
        // {
        //   title: '下载模板',
        //   dataIndex: 'stringId2',
        //   key: 'stringId2',
        //   render: (text, item)=>
        //     <div className="operate-wrap">
        //       <a onClick={()=>this.downTempBatch(item)}>下载模板</a>
        //     </div>
        // },
        {
          title: '操作',
          isShow: true,
          key: 'stringId',
          width: '20%',
          render: (record, item)=>{
            return(
              <Fragment>
                {/* <Fragment>
                  {(item.analysisCarry && item.analysisSuccess) &&
                     <span className="operate-wrap">
                       <a onClick={()=>this.lookReportBatch(item.stringId)}>查看</a>
                     </span>
                  }
                  <Upload {...this.uploadProps(item.stringId)} fileList={fileList_report} disabled={item.inAnalysis}>
                    <span className="operate-wrap">
                      {item.analysisCarry ?
                        <a>{item.inAnalysis ? '报告正在解析中' : '重新上传'}</a>
                        :
                        <a>{item.inAnalysis ? '报告正在解析中' : '上传配置加固结果'}</a>
                      }
                    </span>
                  </Upload>
                </Fragment> */}
                <span className="operate-wrap">
                  <a onClick={()=>this.lookReportBatch(item.stringId)}>查看</a>
                </span>
                <div className="operate-wrap">
                  <a onClick={()=>this.delete(item.stringId)}>移除</a>
                </div>
              </Fragment>
            )
          }
        }]

      columns = columns.concat(operateColumns)

      const formItemLayout = {
        labelCol: {
          span: 5
        },
        wrapperCol: {
          span: 18
        }
      }

      const config = {
        name: 'fileList',
        action: '/api/v1/asset/file/upload',
        beforeUpload: file=>uploadLimit(file, fileList, 10),
        accept: '.rar,.zip,.7z,.doc,.docx,.jpg,.pdf,.png,.txt,.xlsx,.xls',
        onChange: this.UploadChange,
        fileList,
        data: {
          fileUse: 'SCHEME_FILE'
        },
        headers: createHeaders()
      }

      const hintContent = (
        <div>
          <p>支持上传大小：0-10M</p>
          <p>支持扩展名：.rar .zip .7z .doc .docx .jpg .pdf .png .txt .xlsx .xls </p>
        </div>
      )

      const ProBasicFn = cont=>(!!basicObj.note === false && (!!(JSON.parse(basicObj.fileInfo).length) === false))
        ? null : cont

      const isDeleteInfo = {
        visible: isDelete,
        onOk: this.isDeleteCB,
        onCancel: ()=>this.setState({ isDelete: false }),
        children: (<p className="model-text">确定要从当前列表移除这一项?</p>)
      }

      const assetIdUp = this.getRecordsArrIds(recordsArr, 'stringId')[0]

      // const isShowFillIn = isTable ?  //隐藏显示
      //   recordsArr.every(item=>(!item.inAnalysis && item.analysisCarry && item.analysisSuccess) === true)
      //   : !inAnalysis && analysisCarry && analysisSuccess

      return(
        <CommonModal
          title='准入实施'
          type="search"
          visible={visible}
          width={isTable ? 900 : 680}
          oktext='允许'
          noText='禁止'
          // isOk={isShowFillIn}
          onConfirm={this.onSubmit}
          onClose={()=>this.openModel(false)}>
          <div className={PrefixCls}>
            <div className='process-wrap'>

              <div className="modal-content">
                {isTable && <Table
                  className="table-small"
                  rowKey='stringId'
                  columns={columns}
                  dataSource={recordsArr}
                  pagination={false}/>}

                <h3 style={{ textAlign: 'center' }}>是否允许修改设备准入?</h3>

                {/* {isTable ||
                  <section className="operate-info">
                    <h3>线下实施模板</h3>
                    <p>如果没有实施模版，请先下载资产列表、资产配置模版、配置基准模版，在线下载资产实施模版内容。</p>
                    <span className="download">
                      <img src={require('@/assets/download.svg')} className="download-icon" alt=""/>
                      <a onClick={this.downTempAlone}>下载模板</a>
                    </span>

                    <Fragment>
                      {(analysisCarry && analysisSuccess) &&
                          <span className="operate">
                            <a onClick={this.lookReportAlone}>查看报告</a>
                          </span>
                      }
                      <span className="operate">
                        <Upload {...this.uploadProps(assetIdUp)} fileList= {fileList_report} disabled={inAnalysis}>
                          {analysisCarry ?
                            <span>{inAnalysis ? '报告正在解析中' : '重新上传'}</span>
                            :
                            <span>{inAnalysis ? '报告正在解析中' : '上传配置加固结果'}</span>
                          }
                        </Upload>
                      </span>
                    </Fragment>

                  </section>
                } */}

                {/* {isShowFillIn && */}
                {/* <section>
                  <h3>填写实施结果</h3>
                  <Form layout="horizontal">
                    <FormItem {...formItemLayout} label="实施结果">
                      {getFieldDecorator('agree', {
                        rules: [{ required: true, message: '请选择！' }],
                        initialValue: 1
                      })(
                        <RadioGroup onChange={this.changeReject}>
                          <Radio value={1}>通过</Radio>
                          <Radio value={0}>未通过</Radio>
                        </RadioGroup>
                      )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="备注">
                      {getFieldDecorator('note', {
                        rules: [
                          { message: '最多300个字符！', max: 300 },
                          { required: isReject, message: '请输入备注！' }
                        ]
                      })(
                        <TextArea rows={6} placeholder="请输入..." style={{ resize: 'none' }} />
                      )}
                    </FormItem>
                    <FormItem  {...formItemLayout} label="上传附件">
                      {getFieldDecorator('file')(
                        <Upload {...config}>
                          <div className="work-order-add-upload">
                            <Icon type="plus" />
                                &nbsp;&nbsp;上传附件&nbsp;&nbsp;
                          </div>
                        </Upload>
                      )}
                      <div className="format">
                        {hintContent}
                      </div>
                    </FormItem>
                    {!isReject && <FormItem {...formItemLayout} label='结果验证执行人'>
                      {getFieldDecorator('operator', {
                        initialValue: ' ',
                        rules: [{ required: true, message: '请指派人员！' }]
                      })(
                        <Select showSearch
                          allowClear
                          getPopupContainer={triggerNode => triggerNode.parentNode}
                          placeholder="请选择"
                          optionFilterProp="children">
                          {usersByRoleCodeAndAreaIdList.length ? <Option value=' '>全部</Option> : ''}
                          {usersByRoleCodeAndAreaIdList.map(
                            (now, index)=>(<Option value = {now.stringId} key={index + 'operator'}>{now.name}</Option>))
                          }
                        </Select>
                      ) }
                    </FormItem>}
                  </Form>
                </section> */}

              </div>
            </div>
          </div>
          {isDelete && <ModalConfirm props={isDeleteInfo}/>}
        </CommonModal>
      )
    }

    UNSAFE_componentWillMount (){
      this.cloneInitState = cloneDeep(this.state)
      delete this.cloneInitState.visible
    }

    async componentDidMount (){
      this.props.onRef(this, 6)
    }

    shouldComponentUpdate (nextProps,  nextState){
      if((nextState.visible !== this.state.visible) && nextState.visible === false){
        // 重置state
        this.setState({ ...this.cloneInitState })
      }
      return true
    }
}

export default Implementation
