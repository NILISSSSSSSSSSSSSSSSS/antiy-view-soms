import React, { Component, Fragment } from 'react'
import { connect } from 'dva'
import { CommonModal } from '@c'
import { Form, Radio, Input, Upload, Icon, message, Select } from 'antd'
import PropTypes from 'prop-types'
import { uploadLimit, createHeaders } from '@/utils/common'
import { cloneDeep, throttle } from 'lodash'
import './style.less'
import api from '@/services/api'

import ProBasic from'./ProcessCom/ProBasic'

const FormItem = Form.Item
const { TextArea } = Input
const RadioGroup = Radio.Group
const { Option } = Select

@Form.create()
@connect(({ asset }) => ({
  previousBatch: asset.previousBatch,
  usersByRoleCodeAndAreaIdList: asset.usersByRoleCodeAndAreaIdList
}))
class Examination extends Component{
    state = {
      PrefixCls: 'AssetsProcess',
      isReject: false, //是否必填
      fileList: '',
      visible: false,
      recordsArr: [],
      valOnProgress: 0, //漏洞
      conOnProgress: 6, //配置
      reportURL: '', //配置地址
      basicObj: {
        remarkName: '',
        note: '',
        fileInfo: '[]'
      }  //上一步附件等信息
    }
    uuids=[]
    cloneInitState={}  //保存初始状态

    static defaultProps= {

    }

    static propTypes = {
      previousBatch: PropTypes.array,
      usersByRoleCodeAndAreaIdList: PropTypes.array,
      onRef: PropTypes.func
    }

    openModel=(visible = true, recordsArr = [])=>{
      this.setState({
        visible,
        recordsArr
      }, ()=>{
        if(!visible) return void(0)
        Promise.all([
          this.previousBatch(),
          this.getUsersByRoleCodeAndAreaId(),
          this.scanBySingleAsset(),
          this.baselineassetAsset()
        ])
      })
    }

    //ui同意拒绝回调
    changeReject = () => {
      const isAllow = this.props.form.getFieldValue('agree') === '0' || this.props.form.getFieldValue('agree') === 0
      this.setState({
        isReject: !isAllow
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

    getRecordsArrIds=(stringId)=>{
      let stringIds = []
      this.state.recordsArr.forEach(v=>stringIds.push(v[stringId]))
      return stringIds
    }

    urlCB=(url)=>{
      const assetId = this.getRecordsArrIds('stringId')[0]
      window.open(`/#${url}id=${encodeURIComponent(assetId)}`, '_blank')
    }

    //配置显示
    conOnProgressShow =conOnProgress=>{
      let content
      const contSpan = (font = '查看配置核查结果')=> (
        <span className="operate">
          <a onClick={() => this.urlCB('/basesetting/list/enforcement?')}>{font}</a>
        </span>
      )

      const report = (
        <span className="operate">
          <a onClick={() => window.open(`${this.state.reportURL}`)}>查看报告</a>
        </span>
      )
      switch(Number(conOnProgress)){
        case(6):
          content =
          <Fragment>
            <span className="info">待核查</span>
            {contSpan('配置核查')}
          </Fragment>
          break
        case(7):
          content = <span className="info">核查中</span>
          break
        case(8):
          content =
          <Fragment>
            <span className="info">核查失败</span>
            {contSpan()}
          </Fragment>
          break
        case(9):
          content =
          <Fragment>
            <span className="info">核查待确认</span>
            {contSpan()}
          </Fragment>
          break
        case(11):
          content =
          <Fragment>
            <span className="info">核查不通过</span>
            {report}
          </Fragment>
          break
        case(10):
          content =
          <Fragment>
            <span className="info">核查通过</span>
            {report}
          </Fragment>
          break
        default:
          break
      }
      return content
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
        assetFlowEnum: 'CHECK',
        assetInfoList,
        formData: !this.state.isReject ? { 'safetyCheckResult': 1 } : { 'safetyChangeUser': values.operator ? values.operator : null, 'safetyCheckResult': 0 },
        fileInfo: fileInfo,
        note: values.note
      }

      api.statusJump(params).then(res=>{
        if (res && res.head && res.head.code === '200') {
          this.props.getAssetList()
          this.openModel(false)
          message.success(`${res.head.result}`)
        }
      })
    }

    /***************副作用开始************** */

    //上一步备注附件信息查询
    previousBatch=async ()=>{
      await  this.props.dispatch({ type: 'asset/previousBatch', payload: { ids: this.getRecordsArrIds('stringId') } })
      const { previousBatch } = this.props
      const isAdd = !!previousBatch.length
      const note = isAdd ? previousBatch[0].note : ''
      const fileInfo = isAdd ? previousBatch[0].fileInfo : '[]'
      const originStatus = isAdd ? previousBatch[0].originStatus : ''
      this.setState({
        originStatus,
        basicObj: {
          remarkName: '整改备注',
          note,
          fileInfo
        }
      })
    }

    //操作人员
    getUsersByRoleCodeAndAreaId=()=>{
      this.props.dispatch({ type: 'asset/getUsersByRoleCodeAndAreaId', payload: {
        flowNodeTag: 'safety_modify', flowId: 3, areaId: this.getRecordsArrIds('areaId') }
      })
    }

    //资产漏洞扫描
    scanBySingleAsset=()=>{
      const params = {
        assetId: this.getRecordsArrIds('decryptId')[0]
      }
      api.scanBySingleAsset(params).then(res=>{
        if (res && res.head && res.head.code === '200') {
          this.setState({ valOnProgress: res.body.onProgress })
        }
      })
    }

    //资产配置检查
    baselineassetAsset=()=>{
      const params = {
        source: 2,
        assetId: this.getRecordsArrIds('stringId')[0],
        stepNode: this.getRecordsArrIds('stepNode')[0]
      }
      api.baselineassetAsset(params).then(res=>{
        if (res && res.head && res.head.code === '200') {
          const { displayCode, reportURL } = res.body
          this.setState({ conOnProgress: displayCode, reportURL })
        }
      })
    }

    //提交
    onSubmit = throttle(values => {
      this.props.form.validateFields((err, values = {}) => {
        if (err) return void(0)
        this.onSubmitCB(values)
      })
    }, 5000, { trailing: false })

    render (){
      const { PrefixCls, isReject, fileList, visible, basicObj, valOnProgress, conOnProgress, originStatus } = this.state
      const {
        usersByRoleCodeAndAreaIdList,
        form: { getFieldDecorator }
      } = this.props

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

      return(
        <CommonModal
          title='安全检查'
          type="search"
          visible={visible}
          width={680}
          oktext='确定'
          isOk={(valOnProgress ? (!![10, 11].includes(conOnProgress)) : null)}
          onConfirm={this.onSubmit}
          onClose={()=>this.openModel(false)}>
          <div className={PrefixCls}>
            <div className='process-wrap'>

              <div className="modal-content">
                {ProBasicFn(<ProBasic basicObj={basicObj}/>)}

                <section className="operate-info">
                  <h3>在线检查</h3>
                  <p>系统对资产进行自动安全检查，如果正处于检查中，请等待。待检查完毕后可以点击查看检查结果。</p>

                  <div className="operate-content">
                    <div className="result-info">
                      <img src={require('@/assets/item-icon.svg')} className="item-icon" alt=""/>
                      <span>漏洞检查结果：</span>
                      {valOnProgress
                        ?
                        <span className="operate">
                          <a onClick={() => this.urlCB('/asset/manage/detail?tab=3&')}>查看漏洞检查结果</a>
                        </span>
                        :
                        <span className="info">漏洞检查中</span>
                      }
                    </div>

                    <div className="result-info">
                      <img src={require('@/assets/item-icon.svg')} className="item-icon" alt=""/>
                      <span>配置检查结果：</span>
                      {this.conOnProgressShow(conOnProgress)}
                    </div>
                  </div>
                </section>
                {(valOnProgress && !![10, 11].includes(conOnProgress)) ?
                  <section>
                    <h3>填写检查结果</h3>
                    <Form layout="horizontal">
                      <FormItem {...formItemLayout} label="检查结果">
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
                      {(isReject && originStatus !== 8) && <FormItem {...formItemLayout} label='安全整改执行人'>
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
                  </section>
                  : null
                }
              </div>
            </div>
          </div>

        </CommonModal>
      )
    }

    UNSAFE_componentWillMount (){
      this.cloneInitState = cloneDeep(this.state)
      delete this.cloneInitState.visible
    }

    componentDidMount (){
      this.props.onRef(this, 7)
    }

    shouldComponentUpdate (nextProps,  nextState){
      if((nextState.visible !== this.state.visible) && nextState.visible === false){
        // 重置state
        this.setState({ ...this.cloneInitState })
      }
      return true
    }
}

export default Examination
