import React, { Component, Fragment } from 'react'
import { connect } from 'dva'
import { CommonModal } from '@c'
import { Form, Radio, Input, Upload, Icon, message, Table } from 'antd'
import PropTypes from 'prop-types'
import { uploadLimit, createHeaders, TooltipFn } from '@/utils/common'
import { cloneDeep, throttle } from 'lodash'
import './style.less'
import api from '@/services/api'

import ProBasic from'./ProcessCom/ProBasic'

const FormItem = Form.Item
const { TextArea } = Input
const RadioGroup = Radio.Group

@Form.create()
@connect(({ asset, staticAsset }) => ({
  assetModelColumns: staticAsset.assetModelColumns,
  previousBatch: asset.previousBatch
}))
class Decommission extends Component{
    state = {
      PrefixCls: 'AssetsProcess',
      isReject: false, //是否必填
      fileList: '',
      visible: false,
      isTable: true,
      recordsArr: [],
      keyWords: '退役',
      assetStatus: 9,
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
      assetModelColumns: PropTypes.array,
      previousBatch: PropTypes.array,
      onRef: PropTypes.func
      // assetStatus: PropTypes.oneOf([9, 13])
    }

    openModel=(visible = true, recordsArr = [], assetStatus = 9)=>{
      const Arr = [
        { name: '退役', val: 9 },
        { name: '报废', val: 13 }
      ]
      this.setState({
        visible,
        recordsArr,
        assetStatus,
        keyWords: Arr.filter(item=>item.val === assetStatus)[0].name,
        isTable: recordsArr.length > 1 ? true : false
      }, ()=>{
        if(!visible) return void(0)
        Promise.all([
          this.previousBatch()
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
      const isAllow = this.props.form.getFieldValue('agree') === '0' || this.props.form.getFieldValue('agree') === 0
      this.setState({
        isReject: !isAllow
      })
    }

    getRecordsArrIds=(stringId)=>{
      let stringIds = []
      this.state.recordsArr.forEach(v=>stringIds.push(v[stringId]))
      return stringIds
    }

    /***************副作用开始************** */

    previousBatch=async ()=>{
      await  this.props.dispatch({ type: 'asset/previousBatch', payload: { ids: this.getRecordsArrIds('stringId') } })
      const { previousBatch } = this.props
      const isAdd = !!previousBatch.length
      const note = isAdd ? previousBatch[0].note : ''
      const fileInfo = isAdd ? previousBatch[0].fileInfo : '[]'
      this.setState({
        basicObj: {
          remarkName: `${this.state.keyWords}方案`,
          note,
          fileInfo
        }
      })
    }

    //提交
    onSubmit = throttle(values => {
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
          assetFlowEnum: 'RETIRE',
          assetInfoList,
          formData: { 'assetRetireResult': values.agree },
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
      const { PrefixCls, isReject, fileList, visible, basicObj, isTable, recordsArr, keyWords } = this.state
      const {
        assetModelColumns,
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
        {
          title: `${keyWords}方案`,
          dataIndex: 'note1',
          key: 'note1',
          render: text=>TooltipFn(text)
        },
        {
          title: '附件',
          dataIndex: 'fileInfo',
          key: 'fileInfo',
          render: text=>{
            const fileInfos = text ? JSON.parse(text) : []
            const styles = {
              style: {
                display: 'block',
                overflow: 'hidden',
                'text-overflow': 'ellipsis',
                'white-space': 'nowrap'
              }
            }
            return Array.isArray(fileInfos) && fileInfos.map((v, i)=>(
              <a {...styles} onClick={() => window.open(`/api/v1/file/download?access_token=${sessionStorage.getItem('token')}&url=${v.url}&fileName=${encodeURIComponent(v.fileName)}`)}>
                {/* {TooltipFn(v.fileName)} */}
                {v.fileName}
              </a>
            ))
          }
        },   {
          title: '审批意见',
          dataIndex: 'note2',
          key: 'note2',
          render: text=>TooltipFn(text)
        }, {
          title: '操作',
          isShow: true,
          key: 'stringId',
          width: '20%',
          render: (record, item)=>{
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
        }
      ]
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

      return(
        <CommonModal
          title={`${keyWords}执行`}
          type="search"
          visible={visible}
          width={isTable ? 900 : 680}
          oktext='确定'
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
                  pagination={false}/> :
                  ProBasicFn(<ProBasic basicObj={basicObj}/>)}
                <section className="operate-info">
                  <div className="operate-content">
                    <div className="result-info">
                      <img src={require('@/assets/item-icon.svg')} className="item-icon" alt=""/>
                      <span>审批意见</span>
                      <span className="info">同意!</span>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 style={{ textAlign: 'center' }}>{keyWords}已完成</h3>
                  <Form layout="horizontal">
                    {/* <FormItem {...formItemLayout} label="审批意见">
                      {getFieldDecorator('agree', {
                        rules: [{ required: true, message: '请选择！' }],
                        initialValue: 1
                      })(
                        <RadioGroup onChange={this.changeReject}>
                          <Radio value={1}>通过</Radio>
                          <Radio value={0}>未通过</Radio>
                        </RadioGroup>
                      )}
                    </FormItem> */}
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
                  </Form>
                </section>

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
      this.props.onRef(this, 9)
    }

    shouldComponentUpdate (nextProps,  nextState){
      if((nextState.visible !== this.state.visible) && nextState.visible === false){
        // 重置state
        this.setState({ ...this.cloneInitState })
      }
      return true
    }
}

export default Decommission
