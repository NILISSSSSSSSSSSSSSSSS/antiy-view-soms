import { PureComponent, Fragment } from 'react'
import OaDetail from './OaDetail'
import { analysisUrl, TooltipFn, transliteration, uploadLimit, createHeaders } from '@/utils/common'
import { Link } from 'dva/router'
import './style.less'
import { Table, Button, Form, Input, Upload, Icon, Select, message, Radio, Modal } from 'antd'
import { TableBtns } from '@c/index'
import hasAuth from '@/utils/auth'
import { assetsPermission } from '@a/permission'
import { ASSETS_TYPE } from '@a/js/enume'
import { cloneDeep, debounce } from 'lodash'
import Alerts from './assetAlert'

const FormItem = Form.Item
const { TextArea } = Input
const { Option } = Select
const RadioGroup = Radio.Group

@Form.create()
class AssetOaHandle extends PureComponent{
state = {
  PrefixCls: 'AssetOa',
  visible: false,
  initStatus: {}, //订单详情
  dataSource: { item: [], toltalCount: 0 },
  currentPage: 1,
  pageSize: 10,
  fileList: '',
  keyWords: '退回',
  radioVal: 1,
  usersByRoleCodeAndAreaIdList: [],
  description: analysisUrl(this.props.location.search).description, //审批类型
  stringId: analysisUrl(this.props.location.search).stringId
}

//弹窗
cancelAlert=(visible = false)=>{
  this.setState({ visible })
}

  //返回上级
callBack = ()=>{
  this.props.history.push('/asset/oa')
}
 //分页
 pageChange = (currentPage, pageSize) => {
   this.setState({
     currentPage,
     pageSize
   }, this.getBusinessList)
 }

 radioChange = e => {
   console.log('radio1 checked', e.target.value)
   this.setState({
     radioVal: e.target.value
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

 saveAlert=(values)=>{
   this.setState({ dataSource: { item: values, toltalCount: values.length } })
 }

 onSubmit = debounce(() => {
   //  dataSource
   this.props.form.validateFields((err, values = {}) => {
     if (err) return void(0)
     //  this.onSubmitCB(values)
     console.log(values)
   })
 }, 300)

  //**接口开始 副作用 */
  getBusinessList=debounce(iscache=>{

  }, 300)

  render (){
    const {
      PrefixCls,
      visible,
      stringId,
      initStatus,
      description,
      dataSource,
      currentPage,
      pageSize,
      fileList,
      keyWords,
      radioVal,
      usersByRoleCodeAndAreaIdList
    } = this.state

    const { form: { getFieldDecorator } } = this.props

    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        width: '80px',
        isShow: true,
        render: text => TooltipFn(text)
      }, {
        title: '编号',
        dataIndex: 'number',
        key: 'number',
        width: '80px',
        isShow: true,
        render: text => TooltipFn(text)
      }, {
        title: '类型',
        dataIndex: 'categoryModel',
        key: 'categoryModel',
        width: '90px',
        isShow: true,
        render: status => TooltipFn(ASSETS_TYPE[status - 1])
      },
      {
        title: 'MAC',
        dataIndex: 'macs',
        key: 'macs',
        width: '80px',
        isShow: true,
        render: text => TooltipFn(text)
      },
      {
        title: '资产组',
        dataIndex: 'assetGroup',
        key: 'assetGroup',
        width: '80px',
        isShow: true,
        render: text => TooltipFn(text)
      },
      {
        title: '操作系统',
        dataIndex: 'operationSystemName',
        key: 'operationSystemName',
        width: '80px',
        isShow: true,
        render: text => TooltipFn(text)
      },
      {
        title: '使用者',
        dataIndex: 'responsibleUserName',
        key: 'responsibleUserName',
        width: '80px',
        isShow: true,
        render: text => TooltipFn(text)
      },
      {
        title: '操作',
        dataIndex: 'operate',
        key: 'operate',
        width: '90px',
        isShow: true,
        render: (record, item) => {
          return (
            <div className="operate-wrap">
              {hasAuth(assetsPermission.ASSET_INFO_VIEW) &&
                <Link to={{
                  pathname: '/asset/manage/detail',
                  search: `id=${transliteration(item.stringId)}`,
                  state: { rCaches: 1 }
                }}>查看</Link>}
            </div>
          )

        }
      }
    ]

    const plainOptions = [
      { label: '出借', value: 1 },
      { label: '拒绝', value: 2 }
    ]

    const leftBtns = [
      { label: '选择资产', onClick: () => this.cancelAlert(true), check: () => hasAuth(assetsPermission.ASSET_IMPORT) }
    ]

    const formItemLayout = {
      labelCol: {
        span: 5
      },
      wrapperCol: {
        span: 18
      }
    }

    const hintContent = (
      <div>
        <p>支持上传大小：0-10M</p>
        <p>支持扩展名：.rar .zip .7z .doc .docx .jpg .pdf .png .txt .xlsx .xls </p>
      </div>
    )

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

    const FormInfo = (
      <Fragment>
        <TableBtns leftBtns={leftBtns} />
        <Table
          rowKey='stringId'
          columns={columns}
          dataSource={dataSource.item}
          pagination={{
            showQuickJumper: true,
            showSizeChanger: dataSource.toltalCount > 10,
            pageSizeOptions: ['10', '20', '30', '40'],
            onShowSizeChange: this.changePage,
            showTotal: () => `共 ${dataSource.toltalCount} 条数据`,
            current: currentPage,
            pageSize: pageSize,
            total: dataSource.toltalCount,
            onChange: this.changePage
          }}
        />
        {['3', '4'].includes(description) && (
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
                  <div className="work-order-add-upload" style={{ color: 'white' }}>
                    <Icon type="plus" />
                             &nbsp;&nbsp;上传附件&nbsp;&nbsp;
                  </div>
                </Upload>
              )}
              <div className="format">
                {hintContent}
              </div>
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
        )}
      </Fragment>
    )

    return(
      <section className={PrefixCls}>
        <div className="detail-content asset-group-detail-content">
          <OaDetail initStatus={initStatus}/>
        </div>
        <p className="detail-title">处理：
          {description === '2' && <RadioGroup options={plainOptions} onChange={this.radioChange} value={radioVal}/>}
        </p>
        <div className="table-wrap">
          {radioVal === 1 ? FormInfo : (
            <Form layout="horizontal">
              <FormItem {...formItemLayout} label={'拒绝原因'}>
                {getFieldDecorator('refuse', {
                  rules: [
                    { message: '最多300个字符！', max: 300 },
                    { required: true, message: '请输入拒绝原因！' }
                  ]
                })(
                  <TextArea rows={6} placeholder="请输入" style={{ resize: 'none' }} />
                )}
              </FormItem>
            </Form>
          )}

        </div>

        <footer className="Button-center">
          <div>
            <Button type="primary" onClick={this.onSubmit}>提交</Button>
            <Button type="primary" className="back-btn" ghost onClick={this.callBack }>取消</Button>
          </div>
        </footer>

        <Modal  title="选择资产"
          destroyOnClose
          width={1100}
          className='over-scroll-modal'
          onCancel={()=>{
            this.cancelAlert()
            this.Alerts.handleReset()
          }}
          visible = {visible} footer={null} >
          <Alerts children = {(now)=>this.Alerts = now} saveAlert={this.saveAlert}
            cancelAlert={this.cancelAlert} stringIds={ stringId }></Alerts>
        </Modal>
      </section>
    )
  }

  componentDidMount (){
    const { description } = this.state
    if(description === '3'){
      this.setState({ keyWords: '退回' })
    }else if(description === '4'){
      this.setState({ keyWords: '报废' })
    }
  }

}

export default AssetOaHandle

