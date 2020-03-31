import React, { Component, Fragment } from 'react'
import { Table, Row, Col } from 'antd'
import Tooltip from '@/components/common/CustomTooltip'
import { transliteration } from '@/utils/common'
import api from '@/services/api'
import BlackAndWhiteList from './BlackAndWhiteList'
import HisConfigRecord from './HisConfigRecord'
import { BLANK_LIST } from '@a/js/enume'
import './index.less'
import Search  from '@c/common/Search'

/**
 * 资产信息的配置信息列表
 */
const pageSize = 10
export default class AssetConfigInfo extends Component {
  constructor (props){
    super(props)
    this.state = {
      list: [],
      total: 0,
      currentPage: 1,
      pageSize,
      title: ''
    }
  }
  componentDidMount () {
    const { currentPage, pageSize } = this.state
    this.getConfigTemplateById()
    this.getList({ currentPage, pageSize })
  }

  /**
   * 获取基准模板信息
   */
  getConfigTemplateById = () => {
    const { templateId } = this.props
    templateId && api.getConfigTemplateById({ primaryKey: templateId }).then((res)=>{
      const { name } = BLANK_LIST.find(e=>e.value === res.body.softwareType && res.body.softwareType) || {}
      this.setState({ title: name })
    })
  }
  /**
   * 获取基准列表
   * @param param
   */
  getList = (param) => {
    const { templateId } = this.props
    templateId && api.listConfigForTemplateByPage({ templateId, ...param }).then((res)=>{
      const { totalRecords: total, items: list, currentPage } = res.body
      this.setState({
        total,
        list,
        currentPage
      })
    })
  }
  pageChange = (currentPage, pageSize) => {
    this.setState({ currentPage, pageSize })
    this.getList({ currentPage, pageSize })
  }
  goTo = (scope) => {
    window.open(`/#/basesetting/storage/detail?stringId=${transliteration(scope.stringId)}`)
  }

  onSubmit=()=>{

  }

  onReset=()=>{

  }

  render () {
    const  { total, list, currentPage, pageSize, title } = this.state
    const  { templateId } = this.props
    const columns = [
      {
        title: '名称',
        key: 'configName',
        dataIndex: 'configName',
        render: text=><Tooltip title={text}>{text}</Tooltip>
      },
      {
        title: '编号',
        key: 'ruleId',
        dataIndex: 'ruleId',
        render: text=><Tooltip title={text}>{text}</Tooltip>
      },
      {
        title: '等级',
        key: 'level',
        dataIndex: 'level',
        render: (v) => {
          if(v === 1){
            return '高'
          }else if(v === 2){
            return '中'
          }else if(v === 3){
            return '低'
          }
        }
      },
      {
        title: '值',
        key: 'defineValue',
        dataIndex: 'defineValue',
        render: (text)=>{
          return <Tooltip title={text}>{text}</Tooltip>
        }
      },
      {
        title: '基准类型',
        key: 'defineValue1',
        dataIndex: 'defineValue1',
        render: (text)=>{
          return <Tooltip title={text}>{text}</Tooltip>
        }
      },
      {
        title: '适用系统',
        key: 'systemName',
        dataIndex: 'systemName',
        render: text=><Tooltip title={text}>{text}</Tooltip>
      },
      {
        title: '操作',
        key: 'operate',
        render: (record, scope) => (
          <div className="operate-wrap">
            {/*/basesetting/storage/detail?stringId=22&caches=1*/}
            <a onClick={()=>this.goTo(scope)}>查看</a>
          </div>
        )
      }
    ]

    const data = [
      { name: '高', value: 1 },
      { name: '中', value: 2 },
      { name: '低', value: 3 }
    ]

    const defaultFields = [
      { type: 'input', label: '名称', placeholder: '请输入', key: 'assetName', allowClear: true, maxLength: 64 },
      { type: 'input', label: '编号', placeholder: '请输入', key: 'assetNo', allowClear: true, maxLength: 64 },
      { type: 'select', label: '登记', placeholder: '请输入', key: 'assetNo1', data: data }
    ]

    const span = { xxl: 6, xl: 8 }

    return (
      <div className="main-detail-content asset-config-info">
        <p className="detail-title">基准模板信息</p>
        <div className="detail-content asset-group-detail-content">
          <Row>
            <Col {...span}><span className="detail-content-label">名称：</span>{null}</Col>
            <Col {...span}><span className="detail-content-label">编号：</span>{null}</Col>
            <Col {...span}><span className="detail-content-label">创建人：</span>{null}</Col>
          </Row>
          <Row>
            <Col {...span}><span className="detail-content-label">基准类型：</span>{null}</Col>
            <Col {...span}><span className="detail-content-label">更新时间：</span>{null}</Col>
            <Col {...span}><span className="detail-content-label">黑白名单：</span>{null}</Col>
          </Row>
          <Row>
            <Col xxl={24} xl={24}><span className="detail-content-label">描述：</span>{null}</Col>
          </Row>
        </div>
        <p className="detail-title">基准项信息</p>
        <div className="table-wrap">
          <div className="search-bar">
            <Search defaultFields={defaultFields} onSubmit={this.onSubmit} onReset={this.onReset} />
          </div>
          <Table
            rowKey="stringId"
            columns={columns}
            dataSource={list}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              showSizeChanger: false,
              onShowSizeChange: this.pageChange,
              showQuickJumper: false,
              showTotal: () => `共 ${total ? total : 0} 条数据`,
              total: total || 0,
              onChange: this.pageChange
            }}
          />
        </div>
        {
          title && <Fragment>
            <p className="detail-title">{title}</p>
            <BlackAndWhiteList templateId={templateId}/>
          </Fragment>
        }
        <p className="detail-title">历史配置记录</p>
        <HisConfigRecord templateId={templateId}/>
      </div>

    )
  }
}
