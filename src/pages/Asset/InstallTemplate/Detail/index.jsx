
import React, { Component } from 'react'
// import { connect } from 'dva'
import { Button, Row, Col, Form, Table } from 'antd'
import Steps from '@c/common/Steps'
import { CommonForm } from '@c/index'
import api from '@/services/api'
import { analysisUrl, TooltipFn, generateRules } from '@/utils/common'
const { Item } = Form
export class TemplateDetail extends Component{
  constructor (props){
    super(props)
    this.state = {
      softColumns: [
        {
          title: '厂商',
          dataIndex: 'supplier',
          key: 'supplier',
          render: (text)=>TooltipFn(text)
        }, {
          title: '名称',
          dataIndex: 'productName',
          key: 'productName',
          render: (text)=>TooltipFn(text)
        }, {
          title: '版本',
          dataIndex: 'version',
          key: 'version',
          render: (text)=>TooltipFn(text)
        }, {
          title: '系统版本',
          dataIndex: 'sysVersion',
          key: 'sysVersion',
          render: (text)=>TooltipFn(text)
        }, {
          title: '语言',
          dataIndex: 'language',
          key: 'language',
          render: (text)=>TooltipFn(text)
        }, {
          title: '软件版本',
          dataIndex: 'softVersion',
          key: 'softVersion',
          render: (text)=>TooltipFn(text)
        }, {
          title: '版本平台',
          dataIndex: 'softPlatform',
          key: 'softPlatform',
          render: (text)=>TooltipFn(text)
        }
      ],
      patchColumns: [
        {
          title: '补丁编号',
          dataIndex: 'patchNumber',
          key: 'patchNumber',
          render: (text)=>TooltipFn(text)
        }, {
          title: '补丁名称',
          dataIndex: 'patchName',
          key: 'patchName',
          render: (text)=>TooltipFn(text)
        }, {
          title: '补丁等级',
          dataIndex: 'patchLevel',
          key: 'patchLevel',
          render: (text)=>TooltipFn(text)
        }, {
          title: '补丁来源',
          dataIndex: 'pathSource',
          key: 'pathSource',
          render: (text)=>TooltipFn(text)
        }, {
          title: '补丁热支持',
          dataIndex: 'hotfix',
          key: 'hotfix',
          render: (text)=>TooltipFn(text)
        }, {
          title: '用户交互',
          dataIndex: 'userInteraction',
          key: 'userInteraction',
          render: (text)=>TooltipFn(text)
        }, {
          title: '独占方式安装',
          dataIndex: 'exclusiveInstall',
          key: 'exclusiveInstall',
          render: (text)=>TooltipFn(text)
        }, {
          title: '联网状态',
          dataIndex: 'networkStatus',
          key: 'networkStatus',
          render: (text)=>TooltipFn(text)
        }
      ],
      basicsData: {},
      softdata: [],
      patchdata: [],
      data: [],
      softPagingParameter: {
        currentPage: 1,
        pageSize: 10
      },
      patchPagingParameter: {
        currentPage: 1,
        pageSize: 10
      },
      init: analysisUrl(this.props.location.search)
    }
  }
  componentDidMount () {
    this.getData()
    this.getSoftList()
    this.getPatchList()
    this.getCheckData()
  }

  render () {
    let { softColumns, patchColumns, softList, patchList, basicsData, data, init, showAdvice, softPagingParameter, patchPagingParameter } = this.state
    const span = { xxl: 6, xl: 8 }
    const blockSpan = { xxl: 24, xl: 24 }
    let formFields = [
      { name: '审核结果', key: 'result', placeholder: '请选择', type: 'select', data: [{ value: 1, name: '拒绝' },  { value: 2, name: '通过' }], rules: [{ required: true,  message: '请选择审核结果' }], onChange: this.showAdvice },
      { name: '拒绝理由', key: 'advice', placeholder: '请输入拒绝理由', type: showAdvice === 1 ? 'textArea' : '', rules: [{ required: true,  message: '拒绝理由不能为空' },  ...generateRules(300)] }
    ]
    const formLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 }
    }
    return(
      <div className="main-detail-content">
        <p className="detail-title">模板基础信息</p>
        <div className="detail-content detail-content-layout">
          <Row>
            <Col {...span}><span className="detail-content-label">模板名称：</span>{basicsData.name}</Col>
            <Col {...span}><span className="detail-content-label">适用资产类型：</span>{
              basicsData.categoryModel === 1 && '计算设备' ||
              basicsData.categoryModel === 2 && '网络设备' ||
              basicsData.categoryModel === 3 && '安全设备' ||
              basicsData.categoryModel === 4 && '存储设备' ||
              basicsData.categoryModel === 5 && '其他设备'
            }</Col>
            <Col {...span}><span className="detail-content-label">适用操作系统：</span>{basicsData.operationSystemName}</Col>
            <Col {...span}><span className="detail-content-label">模板编号：</span>{basicsData.numberCode }</Col>
            <Col {...span}><span className="detail-content-label">模板状态：</span>{
              basicsData.currentStatus === 1 && '待审核' ||
              basicsData.currentStatus === 2 && '拒绝' ||
              basicsData.currentStatus === 3 && '启用' ||
              basicsData.currentStatus === 4 && '禁用'
            }</Col>
            <Col {...blockSpan}><span className="detail-content-label">描述：</span>{basicsData.description}</Col>
          </Row>
        </div>
        <p className="detail-title" id="PatchInformation-patch-info">模板包含软件列表</p>
        <div className="table-wrap">
          <Table
            rowKey="stringId"
            columns={softColumns}
            dataSource={ softList }
            pagination={{
              current: softPagingParameter.currentPage,
              pageSize: softPagingParameter.pageSize,
              showSizeChanger: softList && softList.length > 10 && true,
              showQuickJumper: true,
              onChange: this.softPageChange,
              onShowSizeChange: this.softPageChange,
              showTotal: (total) => `共 ${total} 条数据`
            }}></Table>
        </div>
        <p className="detail-title" id="PatchInformation-patch-info">模板包含补丁列表</p>
        <div className="table-wrap">
          <Table
            rowKey="id"
            columns={patchColumns}
            dataSource={ patchList }
            pagination={{
              current: patchPagingParameter.currentPage,
              pageSize: patchPagingParameter.pageSize,
              showSizeChanger: patchList && patchList.length > 10 && true,
              showQuickJumper: true,
              onChange: this.patchPageChange,
              onShowSizeChange: this.patchPageChange,
              showTotal: (total) => `共 ${total} 条数据`
            }}></Table>
        </div>
        {
          init.type === 'check' ?
          // 审计展示
            <div>
              <p className="detail-title">审核</p>
              <div className='detail-content'>
                <CommonForm fields={ formFields } column={ 3 } form={ this.props.form } FormItem={ Item } formLayout={ formLayout } />
              </div>
              <footer className="Button-center back-btn">
                <Button type="primary" ghost onClick={this.onSubmit}>保存</Button>
              </footer>
            </div> :
          //  详情展示
            <div>
              <p className="detail-title">审核记录</p>
              <Steps data={data} />
            </div>
        }
      </div>
    )
  }
  //获取审核结果(如果是拒绝会出现文本框)
  showAdvice = (value)=> {
    this.setState({
      showAdvice: value
    })
  }
  getData= () =>{
    let { init } = this.state
    api.installTemplateById({ primaryKey: init.stringId }).then( res => {
      this.setState({
        basicsData: res.body
      })
    })
  }
  getCheckData= () =>{
    let { init } = this.state
    api.assetInstallTemplateAuditInfo({ primaryKey: init.stringId }).then( res => {
      this.setState({
        data: res.body
      })
    })
  }
  getSoftList = () => {
    let { init } = this.state
    api.installTemplateSoftList({ pid: init.stringId }).then( res => {
      this.setState({
        softList: res.body.items
      })
    })
  }
  getPatchList = () => {
    let { init } = this.state
    api.installTemplatePatchList({ pid: init.stringId }).then( res => {
      this.setState({
        patchList: res.body.items
      })
    })
  }
  //翻页
  softPageChange = (currentPage, pageSize) => {
    this.setState({
      softPagingParameter: {
        currentPage,
        pageSize
      }
    }, this.getSoftList)
  }
  patchPageChange = (currentPage, pageSize) => {
    this.setState({
      patchPagingParameter: {
        currentPage,
        pageSize
      }
    }, this.getPatchList)
  }

  onSubmit = () => {
    let { init } = this.state
    this.props.form.validateFields((err, values) => {
      let result = values.result === 1 ? 0 : 1
      if(!err){
        api.assetInstallTemplateCheck({ ...values, result, stringId: init.stringId }).then( res => {
          this.props.history.goBack()
        })
      }
    })
  }
}

const TemplateDetails = Form.create()(TemplateDetail)
export default TemplateDetails
