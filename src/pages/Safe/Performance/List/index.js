import { Component } from 'react'
import { NavLink, withRouter } from 'dva/router'
import { connect } from 'dva'
import { Table, TreeSelect } from 'antd'
import api from '@/services/api'
import { safetyPermission } from '@a/permission'
import hasAuth from '@/utils/auth'
import { transliteration, emptyFilter, cacheSearchParameter, getCaches } from '@/utils/common'
import Status from '@/components/common/Status'
import Search from '@/components/common/Search'
import Tooltip from '@/components/common/CustomTooltip'
import './index.less'

const { TreeNode } = TreeSelect
// 排序字段，提交后台时
const SORT_FEILD = { MEMORY: 'MEMORY', DISK: 'DISK', CPU: 'CPU', DAY: 'SAFEDAY' }
class Performance extends Component {
  constructor (props) {
    super(props)
    this.state = {
      modalVisible: false,
      loading: false, // 表格的loading状态和查询按钮的loading
      cancelLaoding: true, // 是否取消loading状态
      pagingParameter: { //分页
        pageSize: 10,
        currentPage: 1
      },
      categoryList: [],
      params: {} // 排序信息
    }
    this.columnsFixed = [
      {
        title: () => {
          return (
            <div className="operate-title">
              操作
            </div>
          )
        },
        key: 'operate',
        isShow: true,
        width: '16%',
        render: (record) => {
          const to = {
            pathname: '/safe/performance/detail',
            search: `?id=${transliteration(record.assetId)}`,
            state: {
              rCaches: 1
            }
          }
          return (
            <div className="operate-wrap">
              {hasAuth(safetyPermission.SAFETY_XN_CK) && <NavLink to={to}>查看</NavLink>}
            </div>
          )
        }
      }
    ]
    this.defaultFields = [
      { key: 'ip', label: 'IP', type: 'input', maxLength: 30, placeholder: '请输入IP' }
    ]
  }

  componentDidMount () {
    const cache = getCaches(this, false, 0)
    // 有缓存时
    if (cache) {
      // sortType, performanceFilterType
      const { page: pagingParameter, parameter } = cache
      const { sortType, performanceFilterType, ip, manufacturer, name, version } = parameter
      const obj = { ip, manufacturer, name, version, params: { sortType, performanceFilterType } }
      // 更新state后，进行查询
      this.setState({ pagingParameter, ...obj, setDefaultExpandedStatus: true }, () => { this.init() })
      // 回显查询条件
      this.searchForm.setFieldsValue({ ip, manufacturer, name, version })
    } else {
      this.init()
    }
    // this.getPerList()
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
        if (val && val.length) dispatch({ type: 'safe/getSafetyName', payload: { supplier: val, use: 1 } })
      } else {
        dispatch({ type: 'safe/clearSafetyVersion' })
        if (supplier && supplier.length && val && val.length) dispatch({ type: 'safe/getSafetyVersion', payload: { supplier: supplier, name: val, use: 1 } })
      }
    })
  }
  // 获取告警规则列表
  getPerList = () => {
    api.getAlarmPerSafetyList().then((data) => {
      if (data.head && data.head.code === '200') {
        this.setState({
          cpuConfig: (data.body || []).find((el) => {
            return el.typeName.indexOf('CPU') >= 0 || el.typeName.indexOf('cpu') >= 0
          }) || {},
          diskConfig: (data.body || []).find((el) => {
            return el.typeName.indexOf('磁盘') >= 0 || el.typeName.indexOf('DISK') >= 0
          }) || {},
          memoryConfig: (data.body || []).find((el) => {
            return el.typeName.indexOf('内存') >= 0 || el.typeName.indexOf('memory') >= 0
          }) || {}
        })
      }
    })
  }
  /**
   * 渲染表格的告警单元格
   * @param type {String} 那种性能 CPU | DISK | MEMORY
   * @param text {String} 单元格显示值
   * @param style {Object} 单元格样式
   * @returns {*}
   */
  renderWarrTd = (type, text, style = {}) => {
    const { cpuConfig = {}, diskConfig = {}, memoryConfig = {} } = this.state
    const num = parseInt(text, 10)
    let alarmNewLevel = memoryConfig.alarmNewLevel
    if (type === 'CPU' && parseInt(cpuConfig.threshold, 10) <= num || type === 'DISK' && parseInt(diskConfig.threshold, 10) <= num || type === 'MEMORY' && parseInt(memoryConfig.threshold, 10) <= num) {
      alarmNewLevel = memoryConfig.alarmNewLevel
    } else {
      alarmNewLevel = 0
    }
    const _text = `${text}%`
    const level = typeof alarmNewLevel === 'number' ? `${alarmNewLevel}` : '1'
    return <Status level={level} text={_text} />
  }
  setLoading = (status) => {
    const { cancelLaoding } = this.state
    if (cancelLaoding) {
      return
    }
    this.setState({ loading: status })
  }
  //根据页面获取列表数据
  getList = (values = {}, isCache = true) => {
    this.setLoading(true)
    const { pageSize, currentPage, ip, manufacturer, name, version, sortType, performanceFilterType } = values
    // 设置缓存
    const parameter = { ip, manufacturer, name, version, sortType, performanceFilterType }
    isCache && cacheSearchParameter([{ page: { pageSize, currentPage }, parameter }], this.props.history)
    api.getPerformanceLineList(values).then(response => {
      this.setLoading(false)
      if (response && response.head && response.head.code === '200') {
        this.setState({
          body: response.body
        })
      }
    }).catch(() => {
      this.setLoading(false)
    })
  }
  //表单查询
  Submit = (values = {}) => {
    const { loading } = this.state
    if (loading) {
      return
    }
    const { pagingParameter } = this.state
    const { pageSize } = pagingParameter || {}
    const categoryList = values.stringId ? [values.stringId] : []
    // 每次重新查询时，都会从第一页开始
    this.setState({ params: values, categoryList, pagingParameter: { ...pagingParameter, currentPage: 1 } })
    // 获取列表数据
    this.getList({
      pageSize,
      currentPage: 1,
      ...values
    })
  }
  //重置
  onReset = () => {
    const { dispatch } = this.props
    const pagingParameter = { pageSize: 10, currentPage: 1 }
    this.setState({
      pagingParameter,
      categoryList: [],
      params: {}
    })
    dispatch({ type: 'safe/clearSafetyName' })
    this.getList({ ...pagingParameter })
  }
  //分页
  pageModify = (pageSize, currentPage, params = {}) => {
    const { categoryList } = this.state
    this.setState({
      pagingParameter: {
        pageSize,
        currentPage
      },
      params
    })
    this.getList({ categoryList, pageSize, currentPage, ...params })
  }
  /**
   * 改变单页显示数量事件
   * @param currentPage
   * @param pageSize
   */
  changePageSize = (currentPage, pageSize) => {
    const { params } = this.state
    this.pageModify(pageSize, currentPage, params)
  }
  /**
   * 翻页事件
   * @param pagination {Object} 分页数据
   * @param filter{Object} 过滤条件
   * @param sorter {Object} 排序的字段
   */
  changePage = (pagination, filter, sorter) => {
    const { current, pageSize } = pagination || {}
    const { order, column } = sorter || {}
    const params = column ? {
      sortType: order === 'descend' ? 2 : 1,
      performanceFilterType: column.performanceFilterType
    } : {}
    this.pageModify(pageSize, current, params)
  }

  //渲染关联设备型号
  renderCategoryModelNodeTree = (data = {}) => {
    return (
      <TreeNode value={data.stringId} title={data.name} key={`${data.stringId}`}>
        {
          data.childrenNode && data.childrenNode.length ? (
            data.childrenNode.map(item => {
              return this.renderCategoryModelNodeTree(item)
            })
          ) : null
        }
      </TreeNode>
    )
  }
  //页面初始化数据请求
  init = () => {
    const { dispatch } = this.props
    const { pagingParameter, categoryList, params } = this.state
    this.getList({ categoryList, ...pagingParameter, ...params }, false)
    dispatch({ type: 'safe/getSafetySupplier', payload: { use: 1 } })
  }
  generateColumns = () => {
    const { params: { sortType, performanceFilterType } } = this.state
    let sortOrder = false
    if (sortType === 2) {
      sortOrder = 'descend'
    } else if (sortType === 1) {
      sortOrder = 'ascend'
    } else {
      sortOrder = false
    }
    return (
      [
        {
          title: '名称',
          key: 'assetName',
          dataIndex: 'assetName',
          isShow: true,
          width: '27%',
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
          key: 'version',
          dataIndex: 'version',
          isShow: true,
          width: '12%',
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
          key: 'ip',
          dataIndex: 'ip',
          width: '12%',
          isShow: true
        },
        {
          title: 'CPU占用率',
          key: 'cpuOccupyRate',
          dataIndex: 'cpuOccupyRate',
          sorter: true,
          isShow: true,
          width: '11%',
          sortOrder: performanceFilterType === SORT_FEILD.CPU ? sortOrder : false,
          performanceFilterType: SORT_FEILD.CPU,
          render: (text) => {
            const _text = text ? `${text}%` : ''
            return emptyFilter(_text)
          }
        },
        {
          title: '内存占用率',
          key: 'memoryOccupyRate',
          dataIndex: 'memoryOccupyRate',
          isShow: true,
          sorter: true,
          width: '11%',
          sortOrder: performanceFilterType === SORT_FEILD.MEMORY ? sortOrder : false,
          performanceFilterType: SORT_FEILD.MEMORY,
          render: (text) => {
            const _text = text ? `${text}%` : ''
            return emptyFilter(_text)
          }
        },
        {
          title: '磁盘占用率',
          key: 'diskOccupyRate',
          dataIndex: 'diskOccupyRate',
          sorter: true,
          isShow: true,
          width: '11%',
          sortOrder: performanceFilterType === SORT_FEILD.DISK ? sortOrder : false,
          performanceFilterType: SORT_FEILD.DISK,
          render: (text) => {
            const _text = text ? `${text}%` : ''
            return emptyFilter(_text)
          }
        },
        {
          title: '安全运行(天)',
          key: 'safeDay',
          dataIndex: 'safeDay',
          sorter: true,
          isShow: true,
          width: '11%',
          sortOrder: performanceFilterType === SORT_FEILD.DAY ? sortOrder : false,
          performanceFilterType: SORT_FEILD.DAY
        }
      ]
    )
  }
  render () {
    const { pagingParameter, body, loading, setDefaultExpandedStatus } = this.state
    const { safetySupplierList, safetyVersionList, safetyNameList } = this.props
    const columns = this.generateColumns()
    columns.push(this.columnsFixed[0])
    let list = []
    let total = 0
    if (body) {
      list = body.items || []
      total = body.totalRecords
    }

    const fileds = [
      // { type: 'supplierLine1', subfieldTitle: false, style: { marginTop: '55px' } },
      { type: 'select', multiple: true, label: '厂商', placeholder: '全部', showSearch: true, key: 'manufacturer', data: safetySupplierList, onChange: (val) => this.resetSearch(val, 1, 'name', 'version') },
      { type: 'select', multiple: true, label: '名称', placeholder: '全部', showSearch: true, key: 'name', data: safetyNameList, onChange: (val) => this.resetSearch(val, 2, 'version') },
      { type: 'select', multiple: true, label: '版本', placeholder: '全部', showSearch: true, key: 'version', data: safetyVersionList }
      // { type: 'supplierLine2' }
    ]
    console.log(setDefaultExpandedStatus)
    return (
      <div className="">
        <div className="search-bar">
          <Search fieldList={fileds} setDefaultExpandedStatus={setDefaultExpandedStatus} wrappedComponentRef={search => { search && (this.searchForm = search.props.form) }} defaultFields={this.defaultFields} onSubmit={this.Submit} onReset={this.onReset} />
        </div>
        <div className="table-wrap">
          <Table rowKey="stringId" loading={loading} columns={columns} dataSource={list} pagination={{
            current: pagingParameter.currentPage,
            pageSize: pagingParameter.pageSize,
            total: total,
            showTotal: (total) => `共 ${total || 0} 条数据`,
            showSizeChanger: (total > 10),
            showQuickJumper: true,
            onShowSizeChange: this.changePageSize
          }} onChange={this.changePage} />
        </div>
      </div>
    )
  }
}
const mapStateToProps = ({ safe }) => {
  return {
    safetySupplierList: safe.safetySupplierList,
    safetyVersionList: safe.safetyVersionList,
    safetyNameList: safe.safetyNameList
  }
}
export default connect(mapStateToProps)(withRouter(Performance))
