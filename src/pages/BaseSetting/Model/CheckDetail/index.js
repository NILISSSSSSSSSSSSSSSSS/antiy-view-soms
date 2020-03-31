
import React, { Component, Fragment } from 'react'
import { connect } from 'dva'
import { Form, Row, Col, Button, message } from 'antd'
import './style.less'
import moment from 'moment'
import { transliteration, analysisUrl, TooltipFn, emptyFilter } from '@/utils/common'
import { Link, withRouter } from 'dva/router'
import CheckTable from './checkTable/index'
import AssetModal from './assetModal/index'
import api from '@/services/api'

export class ModelDetails extends Component {
  constructor (props) {
    super(props)
    const query = analysisUrl(this.props.location.search)
    this.state = {
      stringId: query.stringId,
      isScan: query.isScan,
      DetailModel: null, //模板详情
      sorter: { levelorder: '' }, //排序
      dateFormat: 'YYYY-MM-DD HH:mm:ss',
      //资产表头
      assetColumns: [{
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        render: text => TooltipFn(text)
      }, {
        title: '编号',
        dataIndex: 'number',
        key: 'number',
        render: text => TooltipFn(text)
      },
      {
        title: '型号',
        dataIndex: 'categoryModelName',
        key: 'categoryModelName',
        render: text => TooltipFn(text)
      },
      {
        title: 'IP',
        dataIndex: 'ip',
        key: 'ip',
        isShow: true,
        render: text => TooltipFn(text)
      }, {
        title: 'MAC',
        dataIndex: 'mac',
        key: 'mac',
        isShow: true,
        render: text => TooltipFn(text)
      }, {
        title: '状态',
        dataIndex: 'statusName',
        key: 'statusName'
      },
      {
        title: '重要程度',
        dataIndex: 'importanceName',
        key: 'importanceName',
        isShow: true
      }, {
        title: '入网时间',
        dataIndex: 'firstEnterNett',
        key: 'firstEnterNett',
        width: 160,
        render: (text) => {
          return (<span className="tabTimeCss">{text ? moment(text).format(this.state.dateFormat) : '--'}</span>)
        }
      }, {
        title: '操作',
        width: 160,
        render: (text, record) => {
          return (
            <div className="operate-wrap">
              {/* 只有已入网数据可以批量变更 */}
              {query.isScan && record.statusName === '已入网' ? <a onClick={()=>this.AlertChange([record])}>变更</a> : null }
              <Link to={`/asset/manage/detail?id=${transliteration(record.stringId)}`}>查看</Link>
            </div>
          )
        }
      }],
      //软件表头
      SoftColumns: [
        {
          title: '厂商',
          dataIndex: 'manufacturer',
          key: 'manufacturer',
          render: text => TooltipFn(text)
        },
        {
          title: '名称',
          dataIndex: 'softwareName',
          key: 'softwareName',
          render: text => TooltipFn(text)
        },
        {
          title: '版本',
          dataIndex: 'edition',
          key: 'edition',
          render: text => TooltipFn(text)
        }],
      showChange: false,
      tabData: []
    }
  }
  componentDidMount () {
    //获取模板信息
    this.initIdata()
    let { isFinished } = analysisUrl(this.props.location.search)
    if (isFinished) {
      this.setState({
        showChange: true
      }, ()=>this.AssetModal.setState({
        checkState: 1,
        loading: false,
        isFinished: true
      }))
    }
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    console.log(nextProps, this.props)
    let { isFinished } = analysisUrl(nextProps.location.search)
    if (isFinished) {
      this.setState({
        showChange: true
      }, ()=>this.AssetModal.setState({
        checkState: 1,
        loading: false,
        isFinished: true
      }))
    }
  }
  render () {
    let { assetColumns, SoftColumns, DetailModel, dateFormat, stringId, isScan, showChange, tabData } = this.state
    //资产表头
    const span = { xxl: 6, xl: 8 }
    const blockSpan = { xxl: 24, xl: 24 }
    // 资产table
    let assetProps = {
      columns: assetColumns,
      currentPage: 1,
      title: 'asset',
      stringId: stringId,
      isScan: JSON.parse(isScan)
    }
    // 软件table
    const softProps = {
      columns: SoftColumns,
      currentPage: 1,
      title: 'soft',
      stringId: stringId
    }
    // 基准项table
    const baseProps = {
      currentPage: 1,
      title: 'base',
      stringId: stringId
    }
    let propsInfo = {
      visible: showChange,
      state: 1,
      tabData: tabData,
      id: stringId
    }
    return (
      <div className="main-detail-content">
        <p className="detail-title">模板信息</p>
        {/* 模板信息 */}
        {DetailModel && <div className="detail-content detail-content-layout">
          <Row>
            <Col {...span}><span className="detail-content-label">名称：</span>{DetailModel.name}</Col>
            <Col {...span}><span className="detail-content-label">编号：</span>{DetailModel.number}</Col>
            <Col {...span}><span className="detail-content-label">创建人：</span>{emptyFilter(DetailModel.createUserName)}</Col>
            <Col {...span}><span className="detail-content-label">适用系统：</span>{emptyFilter(DetailModel.systemName)}</Col>
            <Col {...span}><span className="detail-content-label">更新时间：</span>{moment(DetailModel.gmtModified).format(dateFormat)}</Col>
            <Col {...blockSpan}><span className="detail-content-label">黑白名单：</span>{DetailModel.softwareTypeName}</Col>
            <Col {...blockSpan}><span className="detail-content-label">描述：</span>{DetailModel.description}</Col>
          </Row>
        </div>}
        {/*  基准项信息 */}
        <p className="detail-title">基准项信息</p>
        <div className="table-wrap">
          <CheckTable props={baseProps} form={this.props.form} />
        </div>
        {/* 黑名单信息 */}
        {DetailModel && DetailModel.softwareTypeName !== '无' && <Fragment><p className="detail-title">{DetailModel.softwareTypeName}</p>
          <div className="table-wrap">
            <CheckTable props={softProps} form={this.props.form} />
          </div></Fragment>}
        {/* 配置资产信息 */}
        <p className="detail-title">配置资产信息</p>
        <div className="table-wrap">
          { JSON.parse(isScan) && <div className="table-btn">
            <div className="left-btn"><Button type="primary" onClick={this.AlertChange}>批量变更</Button></div>
          </div>}
          <CheckTable props={assetProps} form={this.props.form} AlertChange={this.AlertChange}/>
          <AssetModal propsInfo={propsInfo} onClose={()=>{this.setState({ showChange: false })}} children={(now) => this.AssetModal = now}/>
        </div>
      </div>
    )
  }
  //初始化数据
  initIdata = () => {
    api.getConfigTemplateById({ primaryKey: this.state.stringId }).then(res => {
      this.setState({
        DetailModel: res.body
      })
    })
  }
  /* 只有已入网数据可以批量变更 */
  AlertChange = (arr) => {
    if (!arr.length)
      message.warn('请先选择要核查的项！')
    else {
      this.setState({
        tabData: arr
      })
      setTimeout(() => {
        this.setState({
          showChange: true
        })
      }, 100)
    }
  }
}
const ModelDetailss = Form.create()(ModelDetails)
export default withRouter(connect()(ModelDetailss))
