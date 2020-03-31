import React, { Component, Fragment } from 'react'
import { connect } from 'dva'
import { CommonModal } from '@c'
import { Form, Radio, Input, Upload, Icon, Select, message } from 'antd'
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
class Rectification extends Component{
    state = {
      PrefixCls: 'AssetsProcess',
      isReject: false, //是否必填
      fileList: '',
      visible: false,
      recordsArr: [],
      valOnProgress: 0, //漏洞
      conOnProgress: 6, //配置
      urlAssetId: '',
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
      //有bug
      this.setState({
        visible,
        recordsArr
      }, ()=>{
        if(!visible) return void(0)
        Promise.all([
          this.previousBatch(),
          this.getUsersByRoleCodeAndAreaId(),
          this.untreatedVulAsset(),
          this.baselineassetAsset()
        ])
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

    //ui同意拒绝回调
    changeReject = () => {
      const agree = this.props.form.getFieldValue('agree')
      const isAllow = agree === '0' || agree === 0
      this.setState({
        isReject: !isAllow
      })
    }

    getRecordsArrIds=(stringId)=>{
      let stringIds = []
      this.state.recordsArr.forEach(v=>stringIds.push(v[stringId]))
      return stringIds
    }

    urlCB=(url)=>{
      window.open(`/#${url}id=${this.state.urlAssetId}`, '_blank')
    }

    //配置显示
    conOnProgressShow =conOnProgress=>{
      let content
      switch(conOnProgress){
        case(1):
          content =
          <Fragment>
            <span className="info">待加固</span>
            <span className="operate">
              <a onClick={() => this.urlCB('/basesetting/list/validation?')}>配置加固</a>
            </span>
          </Fragment>
          break
        case(2):
          content = <span className="info">整改中</span>
          break
        case(3):
          content = <Fragment>
            <span className="info">加固待确认</span>
            <span className="operate">
              <a onClick={() => this.urlCB('/basesetting/list/validation?')}>配置加固</a>
            </span>
          </Fragment>
          break
        case(4):
          content = <Fragment>
            <span className="info">加固失败</span>
            <span className="operate">
              <a onClick={() => this.urlCB('/basesetting/list/validation?')}>配置加固</a>
            </span>
          </Fragment>
          break
        case(5):
          content = <span className="info">无待加固基准</span>
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
        assetFlowEnum: 'CORRECT',
        assetInfoList,
        formData: !this.state.isReject ? { 'safetyChangeUser': values.operator ? values.operator : '', 'safetyChangeResult': 1 } : { 'safetyChangeResult': 0 },
        fileInfo: fileInfo,
        note: values.note,
        waitCorrectToWaitRegister: !!values.waitCorrectToWaitRegister
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
      this.setState({
        basicObj: {
          remarkName: '检查备注',
          note,
          fileInfo
        }
      })
    }

    //操作人员
    getUsersByRoleCodeAndAreaId=()=>{
      this.props.dispatch({ type: 'asset/getUsersByRoleCodeAndAreaId', payload: {
        flowNodeTag: 'safety_check', flowId: 3, areaId: this.getRecordsArrIds('areaId') }
      })
    }

    //资产漏洞扫描
    untreatedVulAsset=()=>{
      const params = {
        stringId: this.getRecordsArrIds('stringId')[0]
      }
      api.untreatedVulAsset(params).then(res=>{
        if (res && res.head && res.head.code === '200') {
          const valOnProgress = res.body.count > 0 ? 1 : 0
          this.setState({ valOnProgress, urlAssetId: res.body.assetId })
        }
      })
    }

    //资产配置检查
    baselineassetAsset=()=>{
      const params = {
        source: 1,
        assetId: this.getRecordsArrIds('stringId')[0],
        stepNode: this.getRecordsArrIds('stepNode')[0]
      }
      api.baselineassetAsset(params).then(res=>{
        if (res && res.head && res.head.code === '200') {
          this.setState({ conOnProgress: res.body.displayCode })
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
      const { PrefixCls, isReject, fileList, visible, basicObj, conOnProgress, valOnProgress } = this.state
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

      const beforeUpload = (file)=>{
        return uploadLimit(file, fileList, 10)
      }

      const config = {
        name: 'fileList',
        action: '/api/v1/asset/file/upload',
        beforeUpload: beforeUpload,
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
          title='整改详情'
          type="search"
          visible={visible}
          width={680}
          // isOk={conOnProgress === 5}
          oktext='不予登记'
          noText= '继续入网'
          onConfirm={this.onSubmit}
          onClose={()=>this.openModel(false)}>
          <div className={PrefixCls}>
            <div className='process-wrap'>

              <div className="modal-content">
                {ProBasicFn(<ProBasic basicObj={basicObj}/>)}

                <section className="operate-info">
                  <h3>检查情况</h3>
                  {/* <p>如果资产存在安全问题，请点击下方“处置”或“加固”按钮跳转至整改界面。如果正处于整改中，则请处置完毕后填写整改结果。</p> */}

                  <div className="operate-content">
                    <div className="result-info">
                      <img src={require('@/assets/item-icon.svg')} className="item-icon" alt=""/>
                      <span>发现漏洞数：</span>
                      {valOnProgress
                        ?
                        <span className="operate">
                          <a onClick={() => this.urlCB(`/bugpatch/bugmanage/dispose/disposebyassets?caches=1&areaId=${encodeURIComponent(this.getRecordsArrIds('areaId')[0])}&`)}>漏洞处置</a>
                        </span>
                        :
                        <span className="info">无待处置漏洞</span>
                      }
                    </div>

                    <div className="result-info">
                      <img src={require('@/assets/item-icon.svg')} className="item-icon" alt=""/>
                      <span>基准核查结果：</span>
                      {this.conOnProgressShow(conOnProgress)}
                    </div>
                  </div>

                  <h3>整改情况</h3>
                  <div className="operate-content">
                    <div className="result-info">
                      <img src={require('@/assets/item-icon.svg')} className="item-icon" alt=""/>
                      <span>修复成功漏洞数：</span>
                    </div>

                    <div className="result-info">
                      <img src={require('@/assets/item-icon.svg')} className="item-icon" alt=""/>
                      <span>修复失败漏洞数：</span>
                    </div>

                    <div className="result-info">
                      <img src={require('@/assets/item-icon.svg')} className="item-icon" alt=""/>
                      <span>忽略漏洞数：</span>
                    </div>

                    <div className="result-info">
                      <img src={require('@/assets/item-icon.svg')} className="item-icon" alt=""/>
                      <span>配置状态：</span>
                    </div>
                  </div>
                </section>
                {/* // {!![2, 3, 4].includes(conOnProgress) || */}
                {/* {(conOnProgress === 5) &&
                <section>
                  <h3>填写整改结果</h3>
                  <Form layout="horizontal">
                    <FormItem {...formItemLayout} label="整改结果">
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
                    {isReject && <FormItem {...formItemLayout} label='未通过原因'>
                      {getFieldDecorator('waitCorrectToWaitRegister', {
                        rules: [{ required: true, message: '请选择' }]
                      })(
                        <Select showSearch
                          allowClear
                          getPopupContainer={triggerNode => triggerNode.parentNode}
                          placeholder="请选择"
                          optionFilterProp="children">
                          <Option value={0}>检查建议不适用，退回至安全检查</Option>
                          <Option value={1}>资产信息不匹配，退回至待登记</Option>
                        </Select>
                      ) }
                    </FormItem>}
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
                    {!isReject && <FormItem {...formItemLayout} label='安全检查执行人'>
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
                </section>} */}
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
      this.props.onRef(this, 3)
    }

    shouldComponentUpdate (nextProps,  nextState){
      if((nextState.visible !== this.state.visible) && nextState.visible === false){
        // 重置state
        this.setState({ ...this.cloneInitState })
      }
      return true
    }
}

export default Rectification
