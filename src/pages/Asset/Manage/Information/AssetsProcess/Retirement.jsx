import React, { Component, Fragment } from 'react'
import { connect } from 'dva'
import { CommonModal } from '@c'
import { Form, Input, Upload, Icon, Select, message, Table } from 'antd'
import PropTypes from 'prop-types'
import { uploadLimit, createHeaders, TooltipFn } from '@/utils/common'
import { cloneDeep, throttle } from 'lodash'
import './style.less'
import api from '@/services/api'

const FormItem = Form.Item
const { TextArea } = Input
const { Option } = Select

@Form.create()
@connect(({ asset, staticAsset }) => ({
  assetModelColumns: staticAsset.assetModelColumns,
  usersByRoleCodeAndAreaIdList: asset.usersByRoleCodeAndAreaIdList
}))
class Retirement extends Component{
    state = {
      PrefixCls: 'AssetsProcess',
      fileList: '',
      visible: false,
      isTable: true,
      recordsArr: [],
      keyWords: '退役',
      assetStatus: 7
    }
    uuids=[]
    cloneInitState={}  //保存初始状态

    static defaultProps={

    }

    static propTypes = {
      assetModelColumns: PropTypes.array,
      usersByRoleCodeAndAreaIdList: PropTypes.array,
      onRef: PropTypes.func
      // assetStatus: PropTypes.oneOf([7, 12])
    }

    openModel= (visible = true, recordsArr = [], assetStatus = 7)=>{
      const Arr = [
        { name: '退役', val: 7 },
        { name: '报废', val: 12 }
      ]
      this.setState({
        visible,
        recordsArr,
        assetStatus,
        keyWords: Arr.filter(item=>item.val === assetStatus)[0].name,
        isTable: recordsArr.length > 1 ? true : false
      }, ()=>{
        if(!visible) return void(0)
        this.getUsersByRoleCodeAndAreaId()

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
      let isAssetPlanRetire = false
      this.state.recordsArr.forEach(item=>{
        const content = {
          taskId: item.waitingTaskReponse ? item.waitingTaskReponse.taskId : null,
          assetId: item.stringId
        }
        assetInfoList.push(content)
        isAssetPlanRetire = item.waitingTaskReponse ? false : true
      })
      if(values.operator === ' '){
        values.operator = this.props.usersByRoleCodeAndAreaIdList.map(item=>item.stringId).join(',')
      }

      const params = {
        assetFlowEnum: 'TO_WAIT_RETIRE',
        assetInfoList,
        isAssetPlanRetire,
        formData: { 'retireUserId': values.operator ? values.operator : '' },
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
    }

    /***************副作用开始************** */

    //操作人员
    getUsersByRoleCodeAndAreaId=()=>{
      this.props.dispatch({ type: 'asset/getUsersByRoleCodeAndAreaId', payload: {
        flowNodeTag: 'asset_ty_make_plan', flowId: 6, areaId: this.getRecordsArrIds('areaId') }
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
      const { PrefixCls, fileList, visible, isTable, recordsArr, keyWords } = this.state
      const {
        usersByRoleCodeAndAreaIdList,
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

      return(
        <CommonModal
          title={`${keyWords}申请`}
          type="search"
          visible={visible}
          width={isTable ? 900 : 680}
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

                <section>
                  {/* <h3>填写退役结果</h3> */}
                  <Form layout="horizontal">
                    <FormItem {...formItemLayout} label={`拟定${keyWords}方案`}>
                      {getFieldDecorator('note', {
                        rules: [
                          { message: '最多300个字符！', max: 300 },
                          { required: true, message: `请输入${keyWords}方案！` }
                        ]
                      })(
                        <TextArea rows={6} placeholder="请输入" style={{ resize: 'none' }} />
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
                    <FormItem {...formItemLayout} label='审批人'>
                      {getFieldDecorator('operator2', {
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
                    </FormItem>
                    <FormItem {...formItemLayout} label={`${keyWords}执行人`}>
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

export default Retirement
