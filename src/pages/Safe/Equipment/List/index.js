import { Component } from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { Form, Button, Table, Pagination, message } from 'antd'
import api from '@/services/api'
import moment from 'moment'
import hasAuth from '@/utils/auth'
import ExportModal from '@/components/common/ExportModal'
import Status from '@/components/common/Status'
import { safetyPermission } from '@a/permission'
import { transliteration, emptyFilter, cacheSearchParameter, getCaches, removeCriteria } from '@/utils/common'
import Search from '@/components/common/Search'
import Tooltip from '@/components/common/CustomTooltip'
// import config from '@/components/Safe/config'
import ModalConfirm from '@/components/common/ModalConfirm'

// const { timeWidth } = config
// 一般输入框正常输入最大字符长度
const maxLength = 30
const searchIndex = 0  //此处数字代表着在查询条件在该路由下的数组下标
class EquipmentList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      body: null,
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      values: {},
      defaultExpanded: false,
      //资产类型
      categoryModelNode: this.props.categoryModelNode,
      conditionShow: false,
      facturerData: this.props.facturerData,
      exportTotal: 0, // 导出时，列表所有数据的总数
      modalData: { record: {}, visible: false }, // 剔除管理弹窗数据
      manage: []
    }
    this.exportDownParam = {} //导出时的参数
    this.columns = [
      {
        title: '名称',
        dataIndex: 'name',
        width: '14%',
        render: (text) => {
          return (
            <Tooltip title={text} placement="topLeft">
              {text}
            </Tooltip>
          )
        }
      },
      {
        title: '版本',
        dataIndex: 'version',
        width: '14%',
        render: (text) => {
          return (
            <Tooltip title={text} placement="topLeft">
              {text}
            </Tooltip>
          )
        }
      },
      {
        title: '编号',
        dataIndex: 'number',
        width: '11%',
        key: 'number',
        render: (text) => {
          return (
            <Tooltip title={text} placement="top">
              {text}
            </Tooltip>
          )
        }
      },
      {
        title: 'IP',
        dataIndex: 'ip',
        key: 'ip',
        // width: ipWidth,
        width: '11%',
        render: (text) => {
          return (
            <Tooltip title={text} placement="top">
              {text}
            </Tooltip>
          )
        }
      },
      {
        title: '网络连接',
        dataIndex: 'networkState',
        key: 'networkState',
        // width: networkStateWidth,
        width: '8%',
        render: (v) => {
          return <Status level={v === '1' ? '0' : '5'} />
        }
      },
      {
        title: '状态',
        dataIndex: 'manage',
        key: 'manage',
        // width: installStatusWidth,
        width: '8%',
        render: (text) => {
          return (
            text ? '已管理' : '未管理'
          )
        }
      },
      {
        title: '首次入网时间',
        dataIndex: 'firstEnterNett',
        key: 'firstEnterNett',
        width: '16%',
        render: (timestamp) => {
          const text = timestamp <= 0 ? '' : moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
          return <span className="tabTimeCss">{emptyFilter(text)}</span>

        }
      },
      {
        title: '操作',
        key: 'operate',
        // width: 200,
        width: '23%',
        render: (text, record) => {
          const actions = [
            { type: 'link', text: '变更', to: `/safe/equipment/change?assetId=${transliteration(record.assetId)}&type=change&manage=${record.manage}`, check: (record) => { return hasAuth(safetyPermission.SAFETY_SB_BG) && record.manage && hasAuth(safetyPermission.SAFETY_SB_TC) } },
            { type: 'link', text: '查看', to: `/safe/equipment/detail?tabs=1&id=${transliteration(record.assetId)}&categoryModel=${transliteration(record.categoryModelId)}`, check: () => { return hasAuth(safetyPermission.SAFETY_SB_CK) } },
            { type: 'a', text: '剔除管理', onClick: () => this.showModal(record), check: (record) => { return record.manage && hasAuth(safetyPermission.SAFETY_SB_TC) } },
            { type: 'link', text: '纳入管理', to: `/safe/equipment/register?assetId=${transliteration(record.assetId)}&stringId=${transliteration(record.stringId)}&type=into&manage=${record.manage}`, check: (record) => { return hasAuth(safetyPermission.SAFETY_SB_NR) && !record.manage } },
            { type: 'a', text: '版本升级', onClick: () => { this.goToUpgrade(record, 1) }, check: (record) => { return record.manage && hasAuth(safetyPermission.SAFETY_SB_VERSION) } },
            { type: 'a', text: '特征库升级', onClick: () => { this.goToUpgrade(record, 2) }, check: (record) => { return record.manage && hasAuth(safetyPermission.SAFETY_SB_TZK) } }
          ]
          return (
            <div className="operate-wrap">
              {
                actions.map((e, i) => {
                  const show = e.check(record)
                  if (show) {
                    if (e.type === 'a') {
                      return (<a onClick={e.onClick} key={i}>{e.text}</a>)
                    } else if (e.type === 'link') {
                      // const index = e.to.indexOf('?')
                      // const to = {
                      //   pathname: e.to.slice(0, index),
                      //   search: e.to.slice(index)
                      //   // state: { rcaches: 1 }
                      // }
                      return (<Link to={e.to} key={i}>{e.text}</Link>)
                    }
                  }
                  return null
                })
              }
            </div>
          )
        }
      }
    ]
    this.defaultFields = [
      { label: '综合查询', maxLength: 30, key: 'multipleQuery', span: 12, type: 'input', placeholder: '编号/IP' }
    ]
  }
  componentDidMount () {
    const { dispatch } = this.props
    //是否有缓存查询条件
    const cache = getCaches(this, false, searchIndex)
    if (cache) {
      const { page, parameter } = cache
      if (parameter.time && parameter.time.length) {
        parameter.time.forEach((ele, idx) => {
          ele && (parameter.time[idx] = moment(moment(ele).format('YYYY-MM-DD')))
        })
      }
      this.setState({ pagingParameter: page, values: { ...parameter }, searchExpand: true })
      // 设置查询表单
      this.searchForm.setFieldsValue({ ...parameter })
      this.getList({
        ...page,
        ...parameter
      }, page.currentPage || 1, false)
    } else {
      this.getList({}, 1, false)
    }
    // 资产类型
    // dispatch({ type: 'safe/sefetySpecifiedCategoryNode', payload: { parameter: 'EQU_MANAGE' } })
    //获取厂商、名称、版本
    dispatch({ type: 'safe/getSafetySupplier' })
  }
  /**
   * 联动选择厂商/名称/版本
   * @param fields
   */
  resetSearch = (val, index, keys1, keys2) => {
    const { dispatch } = this.props
    this.searchForm.setFieldsValue({
      [keys1]: undefined,
      [keys2]: undefined
    }, () => {
      let supplier = this.searchForm.getFieldValue('manufacturer')
      if (index === 1) {
        dispatch({ type: 'safe/clearSafetyName' })
        if (val && val.length) dispatch({ type: 'safe/getSafetyName', payload: { supplier: val } })
      } else {
        dispatch({ type: 'safe/clearSafetyVersion' })
        if (supplier && supplier.length && val && val.length) dispatch({ type: 'safe/getSafetyVersion', payload: { supplier: supplier, name: val } })
      }
    })
  }
  /**
   * 检查当前设备是否有新的特征库、版本
   * @param params
   * @returns {Promise<any>}
   */
  checkVersion = (params = {}) => {
    return api.checkVersion(params).then((res) => {
      if (res.head && res.head.code === '200') {
        if (res.body) {
          return res.body
        } else {
          message.info('当前已是最高版本')
        }
      } else {
        return Promise.reject('请求失败')
      }
    })
  }
  /**
   * 跳转版本、特征库升级界面
   * @param record{Object} 当前设备
   * @param type{Number} 1：版本 2：特征
   * */
  goToUpgrade = (record, type) => {
    const { history: { push } } = this.props
    const params = { type, businessId: record.businessId, newVersion: record.newVersion, featureLibrary: record.featureLibrary, stringId: record.stringId }
    // 检查是否有新的版本和特征库
    this.checkVersion(params).then((result) => {
      if (result) {
        if (type === 1) {
          // 跳转至版本升级
          push({
            pathname: '/safe/equipment/versionInformationUpgrade',
            search: `?id=${transliteration(record.stringId)}&assetId=${transliteration(record.assetId)}&from=version`,
            state: { rCaches: 1 } // 清除缓存
          })
        } else if (type === 2) {
          // 跳转至特征库升级
          push({
            pathname: '/safe/equipment/featureInformationUpgrade',
            search: `?id=${transliteration(record.stringId)}&assetId=${transliteration(record.assetId)}&from=feature`,
            state: { rCaches: 1 } // 清除缓存
          })
        }
      }
    })
  }

  /**
   * 给查询条件设置查询选项值
   * @param fields
   * @param list
   * @return {any[]}
   */
  setFilterData = (fields = [], list = []) => {
    return fields.map((e) => {
      const currentData = list.find(it => it.key === e.key) || {}
      if (e.key === currentData.key) {
        return { ...e, data: currentData.data }
      }
      // if(this.cacheParam && this.cacheParam[e.key]){
      //   return { ...e, data}
      // }
      return e
    })
  }
  onSubmit = (values) => {
    this.setState({ values })
    this.getList(values)
  }
  /**
   * 查询栏的展开回调事件
   * @param searchExpand {Boolean} 查询栏的展开状态
   */
  onExpandSearch = (searchExpand) => {
    this.setState({ searchExpand })
  }
  /**
   * 重置查询表单
   */
  onReset = () => {
    const { dispatch } = this.props
    this.setState({ values: {} }, () => this.getList({}, 1, false))
    removeCriteria()
    dispatch({ type: 'safe/clearSafetyName' })
  }
  /**
   * 查询条件变更时
   * @param values
   */
  searchChange = (values) => {
    this.exportDownParam = values
  }
  render () {
    const { pagingParameter, body, exportModalStatus, exportTotal, modalData: { visible }, searchExpand } = this.state
    const { specifiedCategoryNode: categoryModelNode, safetySupplierList, safetyVersionList, safetyNameList } = this.props
    this.filterFields = [
      // { type: 'supplierLine1', subfieldTitle: false },
      { type: 'select', multiple: true, label: '厂商', maxLength, placeholder: '全部', showSearch: true, key: 'manufacturer', data: safetySupplierList, onChange: (val) => this.resetSearch(val, 1, 'name', 'version') },
      { type: 'select', multiple: true, label: '名称', maxLength, placeholder: '全部', showSearch: true, key: 'name', data: safetyNameList, onChange: (val) => this.resetSearch(val, 2, 'version') },
      { type: 'select', multiple: true, label: '版本', maxLength, placeholder: '全部', showSearch: true, key: 'version', data: safetyVersionList },
      // { type: 'supplierLine2' },
      { label: '首次入网时间', key: 'time', type: 'dateRange', placeholder: ['开始日期', '结束日期'], data: [] }
    ]
    let list = []
    let total = 0
    if (body) {
      list = body.items
      total = body.totalRecords
    }
    const innerIpInfo = {
      visible,
      onOk: this.onOk,
      onCancel: () => this.setState({ modalData: { record: {}, visible: false } }),
      children: (<p className="model-text">执行剔除管理操作后，安全设备管理其它功能将不再显示该设备！</p>)
    }
    const fields = this.setFilterData(this.filterFields, [{ key: 'categoryModels', data: categoryModelNode }])
    return (
      <div className="main-table-content">
        <ModalConfirm props={innerIpInfo} />
        {
          exportModalStatus && (
            <ExportModal
              exportModal={{
                //弹框显示
                exportVisible: exportModalStatus,
                //搜索条件
                searchValues: this.exportDownParam,
                //数据总数
                total: exportTotal,
                //阈值
                threshold: 5000,
                //下载地址
                url: '/api/v1/safety/safetyequipment/export/safety'
              }}
              handleCancelExport={this.openExportModal}
            />
          )
        }
        <div>
          <div className="search-bar">
            <Search fieldList={fields} setDefaultExpandedStatus={searchExpand} wrappedComponentRef={(search) => { search && (this.searchForm = search.props.form) }} onChange={this.searchChange} onSubmit={this.onSubmit} onReset={this.onReset} defaultFields={this.defaultFields} />
          </div>
          <div className="table-wrap">
            <div className="table-btn">
              <div className="left-btn">
                {
                  hasAuth(safetyPermission.SAFETY_SB_DC) ? <Button type="primary" onClick={this.openExportModal}>导出</Button> : null
                }
              </div>
            </div>
            <Table rowKey="assetId" columns={this.columns} dataSource={list} pagination={false} />
            {
              total ? <Pagination
                className="table-pagination"
                total={total} showTotal={(total) => `共 ${total || 0} 条数据`}
                showSizeChanger={total > 10}
                showQuickJumper={true}
                onChange={this.changePage}
                onShowSizeChange={this.changeShowSize}
                pageSize={pagingParameter.pageSize}
                current={pagingParameter.currentPage} />
                : null
            }
          </div>
        </div>
      </div>
    )
  }
  /**
   * 导出之前的最新查询
   * @param params
   */
  exportBefore = () => {
    const values = { ...this.exportDownParam }
    const pageSize = 1
    const currentPage = 10
    if (values.time && values.time.length > 0) {
      values.beginTime = values.time[0] ? moment(values.time[0].format('YYYY-MM-DD') + ' 00:00:00').valueOf() + '' : ''
      values.endTime = values.time[1] ? moment(values.time[1].format('YYYY-MM-DD') + ' 23:59:59').valueOf() + '' : ''
      delete values.time
    }
    return api.equipmentQueryList({ pageSize, currentPage, ...values }).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({ exportTotal: response.body.totalRecords })
        return response.body.totalRecords
      }
    })
  }
  /**
   * //获取列表
   * @param parmes 新的请求参数
   * @param currentPage 请求的当前页
   * @param isCache 是否进行缓存查询参数
   */
  getList = (parmes = {}, currentPage = 1, isCache = true) => {
    const { values: oldValues } = this.state
    const values = { ...oldValues, ...parmes }
    // values.manufacturer = ['antiy']
    const { pagingParameter: { pageSize } } = this.state
    isCache && cacheSearchParameter([{ page: { pageSize, currentPage }, parameter: values }], this.props.history)
    if (values.time && values.time.length > 0) {
      values.beginTime = values.time[0] ? values.time[0].valueOf() + '' : ''
      values.endTime = values.time[1] ? values.time[1].valueOf() + '' : ''
      delete values.time
    }
    // this.setState({ exportDownParam: values })
    this.exportDownParam = { ...values } //导出时的参数
    api.equipmentQueryList({ pageSize, currentPage, ...values }).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          body: response.body,
          pagingParameter: { currentPage, pageSize },
          exportTotal: response.body.totalRecords,
          manage: response.body.items.map(item => item.manage)
        })
      }
    })
  }
  //改变当前页显示数量
  changeShowSize = (currentPage, pageSize) => {
    this.pageModify(pageSize, currentPage)
  }

  //当前页码改变
  changePage = (currentPage) => {
    const pageSize = this.state.pagingParameter.pageSize
    this.pageModify(pageSize, currentPage)
  }

  //页面修改
  pageModify = (pageSize, currentPage) => {
    this.setState({ pagingParameter: { pageSize, currentPage } }, () => {
      this.getList({}, currentPage)
    })
  }

  //显示剔除弹框
  showModal = (record) => {
    this.setState({ modalData: { record, visible: true } })
  }
  /**
   * 剔除管理确认事件
   */
  onOk = () => {
    const { modalData: { record } } = this.state
    const self = this
    record.manage = record.isManage === 'false' ? 'ture' : 'false'
    api.equipmentDeleteAddById({ assetId: record.assetId, stringId: record.stringId, isManage: record.manage }).then(response => {
      if (response && response.head && response.head.code === '200') {
        const { pagingParameter: { currentPage } } = self.state
        self.getList({}, currentPage)
        this.setState({ modalData: { visible: false, record: {} } })
      }
    })
  }
  // 控制导出弹窗的显示
  openExportModal = () => {
    const { exportModalStatus } = this.state
    if (exportModalStatus) {
      this.setState({ exportModalStatus: !exportModalStatus })
    } else {
      this.exportBefore().then((flag) => {
        // 有数据时，打开导出按钮
        if (flag) {
          this.setState({ exportModalStatus: true })
        } else {
          message.info('暂无数据可导出！')
        }
      })
    }
  }
}
const mapStateToProps = ({ safe }) => {
  return {
    categoryModelNode: safe.categoryModelNode || [],
    facturerData: safe.facturer,
    areaData: safe.treeData,
    specifiedCategoryNode: safe.specifiedCategoryNode,
    safetySupplierList: safe.safetySupplierList,
    safetyVersionList: safe.safetyVersionList,
    safetyNameList: safe.safetyNameList
  }
}

const EquipmentListForm = Form.create()(EquipmentList)
export default connect(mapStateToProps)(EquipmentListForm)
