import React, { Fragment, Component } from 'react'
import { Link } from 'dva/router'
import { connect } from 'dva'
import { Table, Pagination, Button, message } from 'antd'
import { Search } from '@c/index'  //引入方式
import { SOURCE_LEVEL } from '@a/js/enume'
import { TooltipFn, transliteration, download } from '@/utils/common'
import api from '@/services/api'
import { find } from 'lodash'
export class ModelEditTable extends Component {
  constructor (props) {
    super(props)
    this.state = {
      sorter: { sortName: '', sortOrder: '' },
      osList: this.props.osList || [],
      assetCurrentPage: 1,
      baseCurrentPage: 1,
      softCurrentPage: 1,
      pageIndex: 1,
      baseValues: {},
      softValues: {},
      assetTabData: [], //资产数据
      softTabData: [],  //软件数据
      baseTabData: [], //基准项数据
      typeList: this.props.typeList || [],
      selectedRowKeys: [],
      storeData: [],
      assetTotal: 0,
      SelfData: []
    }
  }

  componentDidMount () {
    //获取基准项
    const { props } = this.props
    if (this.props.children)
      this.props.children(this)
    if (props.title === 'base')
      this.getRelationById(false)
    //获取软件列表
    if (props.title === 'soft')
      this.getSoftListById(false)
    //获取资产信息
    if (props.title === 'asset' && !props.isCheck)
      this.getAssetById(false)
    if (props.isCheck) {
      this.showList()
    }
    this.props.dispatch({ type: 'baseSetting/getBaseLineType' })
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    if (nextProps.typeList && JSON.stringify(this.props.typeList) !== JSON.stringify(nextProps.typeList)) {
      this.setState({
        typeList: nextProps.typeList
      })
    }
  }
  render () {
    const { props } = this.props
    let { AlertChange } = this.props
    let { assetTabData, softTabData, baseTabData, baseCurrentPage, softCurrentPage, assetCurrentPage, sorter, typeList, SelfData, assetTotal,
      selectedRowKeys } = this.state
    const tabData = props.title === 'base' ? baseTabData : (props.title === 'asset' ? assetTabData : softTabData)
    let currentPage = props.title === 'base' ? baseCurrentPage : (props.title === 'asset' ? assetCurrentPage : softCurrentPage)
    let list = [], total = 0
    if (tabData) {
      list = tabData.items
      total = Number(tabData.totalRecords)
    } else if (props.isCheck) {
      total = assetTotal
    }
    const itemColumns = [{
      title: '名称',
      dataIndex: 'configName',
      key: 'configName',
      render: text => TooltipFn(text)
    }, {
      title: '编号',
      dataIndex: 'ruleId',
      key: 'ruleId',
      render: text => TooltipFn(text)
    }, {
      title: '安全级别',
      dataIndex: 'level',
      key: 'level',
      sorter: true,
      sortOrder: sorter.sortOrder,
      render: (text) => {
        return (text && text !== 4 ? SOURCE_LEVEL[text - 1].name : '--')
      }
    }, {
      title: '值',
      dataIndex: 'defineValue',
      key: 'defineValue',
      isShow: true,
      render: text => TooltipFn(text)
    }, {
      title: '基准类型',
      dataIndex: 'typeName',
      key: 'typeName',
      width: '15%',
      isShow: true,
      render: text => TooltipFn(text)
    }, {
      title: '适用系统',
      dataIndex: 'systemName',
      key: 'systemName',
      width: '15%',
      isShow: true,
      render: text => TooltipFn(text)
    },
    {
      title: '操作',
      width: 120,
      render: (text, record) => {
        return (
          <div className="operate-wrap">
            <Link to={`/basesetting/storage/detail?stringId=${transliteration(record.stringId)}`} target="_blank">查看</Link>
          </div>
        )
      }
    }]
    const defaultBaseFields = [
      { type: 'input', label: '名称', placeholder: '请输入基准项名称', key: 'name', allowClear: true },
      { type: 'input', label: '编号', placeholder: '请输入基准项编号', key: 'ruleId', allowClear: true },
      { type: 'select', multiple: false, label: '安全级别', placeholder: '请输入', key: 'level', data: SOURCE_LEVEL },
      { type: 'treeSelect', multiple: true, placeholder: '全部', label: '基准类型', key: 'typeList', data: typeList, config: { name: 'name', value: 'node' }, treeDefaultExpandAll: false }
    ]
    const defaultSoftFields = [
      { type: 'input', label: '厂商', placeholder: '请输入厂商', key: 'manufacturer', allowClear: true },
      { type: 'input', label: '名称', placeholder: '请输入名称', key: 'softwareName', allowClear: true }
    ]
    //勾选事件
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys
        }, AlertChange(selectedRows))
      },
      getCheckboxProps: record => ({
        disabled: (record.statusName !== '已入网'),
        status: record.statusName
      })
    }
    return (
      <Fragment>
        {props.title !== 'asset' ?
          < div className="search-bar">
            {/* 基准项查询 */}
            {props.title === 'base' && <Search defaultFields={defaultBaseFields} onSubmit={this.handleSubmit} onReset={this.handleReset} />}
            {/* 软件查询 */}
            {props.title === 'soft' && <Search defaultFields={defaultSoftFields} onSubmit={this.handleSubmit} onReset={this.handleReset} />}
          </div> : null
        }
        {props.title === 'base' ? <div className="table-btn">
          <div className="left-btn">
            <Button type="primary" onClick={() => download('/api/v1/config/baselinetemplate/export', { requestId: props.stringId })}>导出</Button>
          </div>
        </div> : null}
        {/* 只有已入网状态资产才可进行变更 */}
        {props.isScan && props.title === 'asset' ? <Table rowKey="stringId" rowSelection={rowSelection} columns={props.columns || itemColumns} dataSource={[{ name: 111, statusName: '已入网' }]} pagination={false} onChange={this.handleTableChange}></Table>
          : <Table rowKey="stringId" columns={props.columns || itemColumns} dataSource={props.isCheck ? SelfData : list} pagination={false} onChange={this.handleTableChange}></Table>}
        {
          total > 0 && <Pagination
            className="table-pagination"
            total={total}
            showTotal={(total) => `共 ${total || 0} 条数据`}
            showSizeChanger={false}
            showQuickJumper
            onChange={!props.isCheck ? this.changePage : this.changePageByself}
            onShowSizeChange={!props.isCheck ? this.changePage : this.changePageByself}
            current={currentPage || props.currentPage} />
        }
      </Fragment >
    )
  }
  //排序
  handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      sorter: {
        sortName: sorter.columnKey === 'gmtCreate' ? 'gmt_create' : sorter.columnKey,
        sortOrder: sorter.columnKey === 'level' ? sorter.order : ''
      }
    }, this.getRelationById)
  }
  //获取基准项信息
  getRelationById = (isCache = true) => {
    const { props } = this.props
    let { sorter, baseValues } = this.state
    let param = { ...sorter, ...baseValues }
    if (param.sortOrder === 'ascend') {
      param.sortOrder = 'asc'
    } else if (param.sortOrder === 'descend') {
      param.sortOrder = 'desc'
    }
    if (!param.sortOrder) {
      delete param.sortOrder
    }
    if (!param.sortName) {
      delete param.sortName
    }
    param.templateId = props.stringId
    param.currentPage = this.state.baseCurrentPage
    api.listConfigForTemplateByPage(param).then(res => {
      this.setState({
        baseTabData: res.body
      })
    })
  }
  //获取资产信息
  getAssetById = (isCache = true) => {
    let param = {}
    const { props } = this.props
    param.currentPage = this.state.assetCurrentPage
    param.templateIds = [props.stringId]
    api.listAssetForTemplateByPage(param).then(res => {
      this.setState({
        assetTabData: res.body
      })
    })
  }
  //获取软件列表信息
  getSoftListById = (isCache = true) => {
    let param = {}
    const { props } = this.props
    param = { ...this.state.softValues }
    param.currentPage = this.state.softCurrentPage
    param.templateId = props.stringId
    api.listSoftwareForTemplateByPage(param).then(res => {
      this.setState({
        softTabData: res.body
      })
    })
  }
  //查询
  handleSubmit = (values) => {
    const { props } = this.props
    let param = {}
    let param2 = {}
    param.name = values.name
    param.ruleId = values.ruleId
    param.level = values.level
    param.os = values.os
    param.typeList = values.typeList
    param2.manufacturer = values.manufacturer
    param2.softwareName = values.softwareName
    // 基准项查询
    if (props.title === 'base') {
      this.setState({
        baseCurrentPage: 1,
        baseValues: param
      }, this.getRelationById)
    } else {
      // 软件查询
      this.setState({
        softCurrentPage: 1,
        softValues: param2
      }, this.getSoftListById)
    }
  }
  //翻页
  changePage = (page, pageSize) => {
    const { props } = this.props
    if (props.title === 'base') {
      this.setState({
        baseCurrentPage: page
      }, this.getRelationById)
    } else if (props.title === 'soft') {
      this.setState({
        softCurrentPage: page
      }, this.getSoftListById)
    } else {
      this.setState({
        assetCurrentPage: page
      }, this.getAssetById)
    }
  }
  //重置
  handleReset = () => {
    const { props, form } = this.props
    form.resetFields()
    if (props.title === 'base') {
      this.setState({
        sorter: {
          sortOrder: '',
          sortName: ''
        },
        baseValues: {},
        baseCurrentPage: 1
      }, this.getRelationById)
    } else if (props.title === 'soft') {
      this.setState({
        softValues: {},
        softCurrentPage: 1
      }, this.getSoftListById)
    }
  }
  //showList
  showList = () => {
    const { props, changeStatus } = this.props
    let checkData = props.tabData
    this.setState({
      SelfData: checkData.slice(0, 10),
      assetTotal: checkData.length,
      storeData: checkData
    }, changeStatus)
  }
  //基准项分页
  changePageByself = (currentPage, pageSize) => {
    this.setState({
      assetCurrentPage: {
        currentPage
      }
    }, () => {
      this.getCacheList(this.state.storeData, currentPage, pageSize)
    })
  }
  //获取缓存的基准项列表
  getCacheList = (data, currentPage, pageSize) => {
    let items = data.filter((item, index) => index >= (currentPage * pageSize - pageSize) && index < (currentPage * pageSize))
    // 黑名单缓存
    this.setState({
      SelfData: items,
      assetTotal: data.length
    })
  }
  passChange=(val, index)=>{
    const { NextcheckChange } = this.props
    let { storeData, SelfData } = this.state
    SelfData = JSON.parse(JSON.stringify(SelfData))
    SelfData[index].isStopInNet = val
    let ob = SelfData[index]
    let obj = find(storeData, { waitingConfigId: ob.waitingConfigId })
    if (obj) {
      obj.isStopInNet = ob.isStopInNet
    }
    this.setState({
      SelfData
    }, ()=>{
      NextcheckChange(storeData)
    })
  }
}
const mapStateToProps = ({ baseSetting }) => {
  return {
    typeList: baseSetting.typeList
  }
}
export default connect(mapStateToProps)(ModelEditTable)
