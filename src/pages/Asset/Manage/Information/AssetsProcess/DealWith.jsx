import React, { Component, Fragment } from 'react'
import { connect } from 'dva'
import { CommonModal } from '@c'
import { Form, Radio, Input, Upload, Icon, Table, message } from 'antd'
import PropTypes from 'prop-types'
import { download, uploadLimit, createHeaders, TooltipFn } from '@/utils/common'
import { cloneDeep, throttle } from 'lodash'
import './style.less'
import api from '@/services/api'

import ProBasic from'./ProcessCom/ProBasic'
import ModalConfirm from '@/components/common/ModalConfirm'

const FormItem = Form.Item
const { TextArea } = Input
const RadioGroup = Radio.Group

@Form.create()
@connect(({ asset, staticAsset }) => ({
  assetModelColumns: staticAsset.assetModelColumns,
  previousBatch: asset.previousBatch
}))
// 入网14，退役15，报废16
class DealWith extends Component{
    state = {
      PrefixCls: 'AssetsProcess',
      isReject: false, //是否必填
      fileList: '',
      visible: false,
      isTable: true,
      isDelete: false,
      deleteId: '',
      recordsArr: [],
      basicObj: {
        remarkName: '',
        note: '',
        fileInfo: '[]'
      },  //上一步附件等信息
      keyWords: '入网',
      assetStatus: 5
    }
    uuids=[]
    cloneInitState={}  //保存初始状态

    static defaultProps= {

    }

    static propTypes = {
      assetModelColumns: PropTypes.array,
      previousBatch: PropTypes.array,
      onRef: PropTypes.func
      // assetStatus: PropTypes.oneOf([5, 11, 15])
    }

    //查看
    lookReportBatch=()=>{

    }

    openModel= (visible = true, recordsArr = [], assetStatus = 5)=>{
      const keyArr = [
        { name: '入网', val: 5 },
        { name: '退役', val: 11 },
        { name: '报废', val: 15 }
      ]
      this.setState({
        visible,
        recordsArr,
        assetStatus,
        keyWords: keyArr.filter(item=>item.val === assetStatus)[0].name,
        isTable: recordsArr.length > 1 ? true : false
      }, ()=>{
        if(!visible) return void(0)
        this.previousBatch()
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

    downTempAlone=()=>{
      const ids = this.getRecordsArrIds('stringId')
      const params = {
        flag: true,
        ids
      }
      this.downTemp(params)
    }

    downTempBatch=id=>{
      const params = {
        flag: true,
        ids: [id]
      }
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

    /***************副作用开始************** */
    //上一步备注附件信息查询
    previousBatch=async ()=>{
      await  this.props.dispatch({ type: 'asset/previousBatch', payload: { ids: this.getRecordsArrIds('stringId') } })
      const { previousBatch } = this.props
      if(this.state.isTable){
        const recordsArr = cloneDeep(this.state.recordsArr)
        recordsArr.forEach(v=>{
          previousBatch.forEach(t=>{
            if(v.stringId === t.assetId){
              [v.note, v.fileInfo] = [v.note, t.fileInfo]
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

    //下载模板
    downTemp=params=>{
      download('/api/v1/config/baselineasset/export/implementation/file',  {  flag: params.flag, ids: params.ids })
    }

    //提交
    onSubmit = throttle(values => {
      // const {}=this.props
      this.props.form.validateFields((err, values = {}) => {
        if (err) return void(0)

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

        const params = {
          agree: values.agree,
          assetFlowEnum: 'NET_IN',
          assetInfoList,
          formData: { 'netImplement': values.agree },
          // fileInfo: this.state.fileList,
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
        basicObj,
        isDelete,
        keyWords,
        assetStatus
      } = this.state
      const {
        assetModelColumns,
        form: { getFieldDecorator }
      } = this.props

      let columns = cloneDeep(assetModelColumns)

      const operateColumns = [
        {
          title: '审批意见',
          dataIndex: 'note',
          key: 'note',
          render: text=>TooltipFn(text)
        },
        {
          title: '审批人',
          dataIndex: 'stringId',
          key: 'stringId',
          render: text=>TooltipFn(text)
        },
        {
          title: '操作',
          key: 'operate',
          width: '18%',
          render: (text, item)=>{
            return(
              <Fragment>
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

      return(
        <CommonModal
          title={`${keyWords}审批未通过`}
          type="search"
          visible={visible}
          width={isTable ? 900 : 680}
          oktext={assetStatus === 5 ? '登记' : `继续${keyWords}`}
          noText={assetStatus === 5 ? '不予登记' : `关闭${keyWords}`}
          onConfirm={this.onSubmit}
          onClose={()=>this.openModel(false)}>
          <div className={PrefixCls}>
            <div className='process-wrap'>

              <div className="modal-content">
                {isTable ? <Table
                  className="table-small"
                  rowKey='stringId'
                  columns={columns}
                  dataSource={recordsArr}
                  pagination={false}/>
                  :  <section className="operate-info">
                    <div className="operate-content">
                      <div className="result-info">
                        <img src={require('@/assets/item-icon.svg')} className="item-icon" alt=""/>
                        <span>审批结果：</span>
                        <span className="info">未通过</span>
                      </div>

                      <div className="result-info">
                        <img src={require('@/assets/item-icon.svg')} className="item-icon" alt=""/>
                        <span>审批意见：</span>
                        <span className="info">该资产业务关系填写错误</span>
                      </div>

                      <div className="result-info">
                        <img src={require('@/assets/item-icon.svg')} className="item-icon" alt=""/>
                        <span>审批人：</span>
                        <span className="info">李嘉诚</span>
                      </div>
                    </div>
                  </section>}
                {/*
                {isTable ||
                  <section className="operate-info">
                    <h3>线下入网实施</h3>
                    <p>请对资产进行入网实施。</p>
                    <span className="download">
                      <img src={require('@/assets/download.svg')} className="download-icon" alt=""/>
                      <a onClick={this.downTempAlone}>资产列表</a>
                    </span>
                  </section>
                } */}

                {/* <section>
                  <h3>填写入网结果</h3>
                  <Form layout="horizontal">
                    <FormItem {...formItemLayout} label="入网结果">
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
                          { required: isReject, message: '请输入备注！' },
                          { message: '最多300个字符！', max: 300 }
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

    componentDidMount (){
      this.props.onRef(this, 5)
    }

    shouldComponentUpdate (nextProps,  nextState){
      if((nextState.visible !== this.state.visible) && nextState.visible === false){
        // 重置state
        this.setState({ ...this.cloneInitState })
      }
      return true
    }
}

export default DealWith
