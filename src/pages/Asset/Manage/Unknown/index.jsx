import React, { Component } from 'react'
import { TableBtns, Table } from '@c/index'
import { withRouter } from 'dva/router'
import Tooltip from '@/components/common/CustomTooltip'
import ScanModal from '@/components/Asset/Unknown/ScanModal'
import { transliteration, analysisUrl, cacheSearchParameter, evalSearchParam } from '@/utils/common'
import moment from 'moment'
import { WAIT_REGISTER, ASSET_SOURCE } from '@a/js/enume'
import Search from '@/components/common/Search'
import Scan from '@/components/common/Scan'
import ExportModal from '@/components/common/ExportModal'
import { assetsPermission } from '@a/permission'
import api from '@/services/api'
import hasAuth from '@/utils/auth'
import { message } from 'antd'
const pageSize = 10
export class Unknown extends Component{
  constructor (props){
    super(props)
    // ?status=2&assetSource=1&work=true&conditionShow=true
    const param = analysisUrl(props.location.search)
    this.expandedStatus = param.conditionShow === 'true'
    this.id = param.status === '2' ? param.id : null
    this.enterControl = param.work === 'true' ? true : void 0
    this.state = {
      filter: {
        // assetSource: param.assetSource ? parseInt(param.assetSource, 10) : void 0,
        sortOrder: {}
      },
      exportVisible: false, // 导出弹窗状态
      scanVisible: false, // 扫描进度弹窗
      modalData: { // 资产探测探测
        visible: false
      },
      selectedRowKeys: [],
      scanParams: {}, // 调教探测的参数
      currentPage: 1,
      pageSize,
      scanData: {}, // 实时探测信息
      total: 0,
      list: []
    }
  }
  onSearch = (values) => {
    const { pageSize, filter } = this.state
    this.setState({ filter: { ...filter, currentPage: 1, ...values } })
    this.getList({ ...filter, ...values }, 1, pageSize)
  }
  /**
   * 重置查询
   */
  onReset = () => {
    this.setState({
      filter: {
        // assetSource: void 0,
        sortOrder: {}
      }
    }, ()=>this.onSearch({}))
  }
  /**
   * 获取资产列表
   * @param filter
   * @param currentPage
   * @param pageSize
   * @param isSave {Boolean} 是否保存数据
   * @return {*}
   */
  getList = (filter, currentPage, pageSize, isSave = true) => {
    const { firstEnter = [], multipleQuery, sortOrder, assetSource, enterControl } = filter || {}
    const [ firstEnterStartTime, firstEnterEndTime ] = firstEnter
    const { columnKey: sortName, order  } = sortOrder
    const pagingParameter = {
      currentPage,
      pageSize
    }
    const params = {
      multipleQuery
      // assetSource: this.state.filter.assetSource || assetSource || ''
    }
    const paramsOyher = {
      sortName,
      assetStatusList: [ WAIT_REGISTER.value ], // 永远只能查询待登记状态的资产
      unknownAssets: true,
      firstEnterStartTime: firstEnterStartTime ? firstEnterStartTime.valueOf() : null,
      firstEnterEndTime: firstEnterEndTime ? firstEnterEndTime.valueOf() : null,
      sortOrder: order === 'ascend' ? 'ASC' : 'DESC',
      enterControl: this.enterControl || enterControl
    }
    // 保存最新查询条件，供导出时使用
    this.exportParams = { ...params, ...pagingParameter, ...paramsOyher, assetId: this.id }
    cacheSearchParameter([{
      page: pagingParameter,
      parameter: {
        ...params,
        firstEnterStartTime,
        firstEnterEndTime,
        sortOrder: sortOrder || {},
        enterControl
      }
    }], this.props.history, 1, '2')
    return api.getAssetList(this.exportParams).then(res=>{
      const { items: list, totalRecords: total } = res.body || {}
      isSave && this.setState({ list, total, currentPage })
      return res
    })
  }
  onChange = (pagination, filters, sorter) => {
    const { current: currentPage, pageSize } = pagination
    const { filter } = this.state
    const _filter = { ...filter, sortOrder: sorter }
    this.setState({ currentPage, pageSize, filter: _filter })
    this.getList(_filter, currentPage, pageSize)
  }
  // 单个不予登记
  notRegisterSingle = (record) => {
    this.notRegisterSubmit([record.stringId])
  }
  // 批量不予登记
  notRegisterBatch = () => {
    const { selectedRowKeys } = this.state
    this.notRegisterSubmit(selectedRowKeys)
  }
  /**
   * 不予登记提交
   * @param assetId
   */
  notRegisterSubmit = (assetIds) => {
    let assetList = []
    assetIds.forEach(item=>{
      const content = {
        taskId: null,
        assetId: item
      }
      assetList.push(content)
    })
    api.assetNoRegister(assetList).then(res => {
      if(res && res.head && res.head.code === '200' ){
        const { filter, currentPage, pageSize } = this.state
        message.success('操作成功！')
        this.setState({ selectedRowKeys: [] })
        this.getList(filter, currentPage, pageSize)
      }
    }).catch(() => {})
  }
  onSubmitScan = (values) => {
    const scanParams = { ...values }
    if(values.alarm === 2){
      scanParams.alarm = false
    }else {
      scanParams.alarm = true
    }
    this.onSubmitAssetDetect(scanParams)
  }
  /**
   * 提交探测
   * @param params
   */
  onSubmitAssetDetect = (params) => {
    api.submitAssetDetect(params).then(()=>{
      this.setState({ modalData: { visible: false }, scanVisible: true, scanParams: params })
    })
  }
  /**
   * 资产探测前提
   * */
  // assetDetectPrecondition = () => {
  //   api.getAssetDetect().then((res)=>{
  //     if(res.body){
  //       this.setState({ scanVisible: true, scanData: res.body || {} })
  //     }else {
  //       this.setState({ modalData: { visible: true }, scanVisible: false })
  //     }
  //   })
  // }
  /**
   * 导出事件，导出之前先去查询一下最新数据
   **/
  exportExcel = () => {
    const { filter } = this.state
    this.getList(filter, void 0, void 0, false).then(res=>{
      const { totalRecords: total } = res.body || {}
      if(total){
        this.setState({ exportVisible: true })
      }else {
        message.error('暂无数据可导出!')
      }
    })
  }
  /**
   * 操作之前，验证资产状态是否被改变
   * @param record {Object} 资产信息
   * @param operation {Number} 操作类型
   *    1 变更
   *    2 登记
   *    3 不予登记
   *    4 拟退役
   *  */
  verificationAssetStatus = (operation, record) => {
    return  api.verificationAssetStatus({ assetId: record.stringId, operation }).catch((err)=>{
      this.onReset()
      return Promise.reject(err)
    })
  }
  render () {
    const { currentPage, pageSize, total, list, filter: { assetSource }, selectedRowKeys, modalData: { visible }, scanVisible, exportVisible, scanParams } = this.state
    //漏洞扫描
    // const scanConfig = {
    //   isAssets: true,
    //   equipments: 0,
    //   interval: 5000,
    //   params: scanParams,
    //   scanUrl: 'getAssetDetect',
    //   title: '资产探测扫描',
    //   visible: scanVisible,
    //   onClose: () => {
    //     this.setState({ scanVisible: false })
    //   },
    //   onBackstage: () => {
    //     this.setState({ scanVisible: false })
    //   },
    //   onStopFind: () => {
    //     api.stopAssetDetect().then(()=>{
    //       this.setState({ scanVisible: false })
    //     })
    //   },
    //   goTo: () => {
    //     api.stopAssetDetect()
    //     this.onReset()
    //     this.searchResetKey = Math.random()
    //     this.setState({ scanVisible: false })
    //   },
    //   // 探测数据变化了，进行回调，重置列表数据
    //   dataChangeCallback: () => {
    //     this.searchResetKey = Math.random()
    //     this.onReset()
    //   }
    // }
    const columns = [
      {
        title: 'IP',
        dataIndex: 'ips',
        render: text=><Tooltip title={text}>{text}</Tooltip>
      },
      {
        title: 'MAC',
        dataIndex: 'macs',
        render: text=><Tooltip title={text}>{text}</Tooltip>
      },
      {
        title: '资产来源',
        dataIndex: 'assetSourceName',
        render: (text, record)=> <Tooltip title={text}>{text}</Tooltip>
      },
      {
        title: '首次发现时间',
        dataIndex: 'gmtCreate',
        render: (text) => {
          return ( text ? <span className="tabTimeCss">{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span> : '--')
        },
        sorter: true
      }
    ]
    const actions = [
      {
        type: 'link',
        label: '查看',
        // check: hasAuth(assetsPermission.ASSET_INFO_VIEW),
        to: (record)=>`/asset/manage/detail?id=${transliteration(record.stringId)}`
      },
      {
        type: 'btn',
        label: '不予登记',
        confirm: { onOk: this.notRegisterSingle, text: '是否将该资产列为"不予登记"状态?' },
        check: (record)=>record.assetStatus === WAIT_REGISTER.value && hasAuth(assetsPermission.ASSET_BYDJ)
      },
      {
        type: 'btn',
        label: '登记',
        // to: (record)=>`/asset/manage/register?source=appear&id=${transliteration(record.stringId)}&categoryModel=${record.categoryModel}&register=again`,
        onClick: (record)=>{
          const { push } = this.props.history
          this.verificationAssetStatus(2, record).then(()=>{
            push(`/asset/manage/register?source=appear&id=${transliteration(record.stringId)}&categoryModel=${record.categoryModel}&register=again`)
          })
        },
        check: (record)=>record.assetStatus === WAIT_REGISTER.value && hasAuth(assetsPermission.ASSET_DJ)
      }
    ]
    const leftBtns = [
      { label: '导出', check: hasAuth(assetsPermission.ASSET_EXPORT), onClick: this.exportExcel }
      // { label: '资产探测', check: hasAuth(assetsPermission.ASSET_UNKNOWN_FIND), onClick: this.assetDetectPrecondition }
    ]
    const rightBtns = [{ label: '不予登记', check: hasAuth(assetsPermission.ASSET_BYDJ), checkUsable: ()=> selectedRowKeys.length ? null : '请选择资产！', confirm: { onOk: this.notRegisterBatch, text: '是否将该资产列为"不予登记"状态?' }  }]
    const defaultFields = [ { label: '综合查询', maxLength: 30, key: 'multipleQuery', span: 12, type: 'input', placeholder: '请输入IP/MAC' }]
    const fieldList = [
      // { label: '资产来源', key: 'assetSource', initialValue: assetSource, type: 'select', data: ASSET_SOURCE },
      { label: '首次发现时间', key: 'firstEnter', type: 'dateRange' }
    ]
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys)=>{
        this.setState({ selectedRowKeys })
      }
    }
    return(
      <div className="unknown-containar">
        <div className="search-bar">
          <Search key={this.searchResetKey}
            defaultFields={defaultFields}
            fieldList={fieldList}
            onReset={this.onReset}
            onSubmit={this.onSearch}
            setDefaultExpandedStatus={this.expandedStatus}
            wrappedComponentRef={search => { search && (this.searchForm = search.props.form) }}
          />
        </div>
        <div className='table-wrap'>
          <TableBtns leftBtns={leftBtns} rightBtns={rightBtns}/>
          <Table rowSelection={rowSelection} columns={columns} page={{ currentPage, pageSize, total }} dataSource={list} actions={actions} onChange={this.onChange}/>
        </div>
        { visible && <ScanModal visible={visible} onSubmit={this.onSubmitScan} onClose={()=>this.setState({ modalData: { visible: false } })}/> }
        {/* { scanVisible && <Scan  {...scanConfig}/>} */}
        {/* 导出 */}
        {
          exportVisible && <ExportModal
            exportModal={{
              exportVisible, //弹框显示
              searchValues: this.exportParams, //搜索条件
              total, //数据总数
              threshold: 5000, //阈值
              url: '/api/v1/asset/export/file' //下载地址
            }}
            handleCancelExport={() => this.setState({ exportVisible: false })} />
        }
      </div>
    )
  }
  componentDidMount () {
    const { filter, currentPage, pageSize } = this.state
    const { id } = analysisUrl(this.props.location.search) // id为外部链接跳转过来时，直接查询某一条资产

    const { list } = evalSearchParam(this, {}, false) || {}
    //判断是否存有数据
    if (list && list[1]) {
      const { page: { pageSize, currentPage }, parameter } = list[1]
      this.setState({
        pageSize,
        currentPage
      }, () => {
        this.searchForm.setFieldsValue( parameter )
        this.getList({ ...parameter, stringId: id }, currentPage, pageSize)
      })
    } else {
      this.getList({ ...filter, stringId: id }, currentPage, pageSize)
    }
  }
}
export default withRouter(Unknown)
