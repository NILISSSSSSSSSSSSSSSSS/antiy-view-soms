import { Component, Fragment } from 'react'
import { connect } from 'dva'
import { NavLink, withRouter } from 'dva/router'
import { Button, Table, Pagination, Message } from 'antd'
import api from '@/services/api'
import moment from 'moment'
import { safetyPermission } from '@a/permission'
import hasAuth from '@/utils/auth'
import { transliteration, emptyFilter, cacheSearchParameter, getCaches } from '@/utils/common'
import Search from '@/components/common/Search'
import RegisterModal from '@/components/Safe/RegisterModal'
import Tooltip from '@/components/common/CustomTooltip'
import ModalConfirm from '@/components/common/ModalConfirm'

const statusList = [{ name: '可安装', value: 'INSTALLABILITY' }, { name: '已注销', value: 'CANCELLED' }]
const typeObj = { again: 'again', add: 'add', isChange: 'isChange' }
const SCENE = {
  performance: 1,
  feature: 2,
  version: 3
}
const searchIndex = 0 // 该查询在当前页属于第几个查询
// 一般输入框正常输入最大字符长度
const maxLength = 30
class SafeManage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      columns: [
        {
          title: '名称',
          dataIndex: 'name',
          width: '20%',
          render: (text) => {
            return <Tooltip title={text} placement="topLeft">{text}</Tooltip>
          }
        },
        {
          title: '序列号',
          dataIndex: 'number',
          width: '12%',
          render: (text) => {
            return <Tooltip title={text}>{text}</Tooltip>
          }
        },
        {
          title: `${this.props.from === 'version' ? '升级包版本' : '特征库版本'}`,
          width: '10%',
          dataIndex: 'version'
        },
        {
          title: '登记时间',
          dataIndex: 'gmtCreate',
          // width: timeWidth,
          width: '16%',
          render: (text) => {
            const v = text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : ''
            return (<span className="tabTimeCss">{emptyFilter(v)}</span>)
          }
        },
        {
          title: '状态',
          dataIndex: 'upgradePackageStatus',
          // width: installStatusWidth,
          width: '10%',
          render: (upgradePackageStatus) => {
            return upgradePackageStatus === 'CANCELLED' ? '已注销' : upgradePackageStatus === 'INSTALLABILITY' ? '可安装' : null
          }
        },
        {
          title: '操作',
          key: 'operate',
          width: '20%',
          render: (record) => {
            const { from } = this.props
            let logout = null
            let change = null
            let install = null
            let seeDetail = null
            if (from === 'version') {
              logout = hasAuth(safetyPermission.SAFETY_VERSION_ZX) ? <a onClick={() => this.showLogOutModal(record)}>注销</a> : null
              change = hasAuth(safetyPermission.SAFETY_VERSION_BG) ? <a onClick={() => {
                this.controlModal(true, typeObj.isChange, record)
              }}>变更</a> : null
              install = hasAuth(safetyPermission.SAFETY_VERSION_AZ) ? <NavLink
                to={{
                  pathname: '/safe/version/manageUpgrade',
                  search: `?id=${transliteration(record.stringId)}&from=${from}`,
                  state: { rCaches: 1 }
                }}>安装</NavLink> : null

              // `/safe/version/detail?from=${ this.props.from }&id=${ transliteration(record.stringId) }`
              seeDetail = hasAuth(safetyPermission.SAFETY_VERSION_CK) ? <NavLink
                to={{
                  pathname: '/safe/version/detail',
                  search: `?from=${this.props.from}&id=${transliteration(record.stringId)}`,
                  state: { rCaches: 1 }
                }}>查看</NavLink> : null
            } else if (from === 'feature') {
              logout = hasAuth(safetyPermission.SAFETY_TZKGL_ZX) ? <a onClick={() => this.showLogOutModal(record)}>注销</a> : null
              change = hasAuth(safetyPermission.SAFETY_TZKGL_BG) ? <a onClick={() => {
                this.controlModal(true, typeObj.isChange, record)
              }}>变更</a> : null

              // `/safe/feature/manageupgrade?id=${ transliteration(record.stringId) }&from=${ from }`
              install = hasAuth(safetyPermission.SAFETY_TZKGL_AZ) ? <NavLink
                to={{
                  pathname: '/safe/feature/manageUpgrade',
                  search: `?id=${transliteration(record.stringId)}&from=${from}`,
                  state: { rCaches: 1 }
                }}>安装</NavLink> : null
              // `/safe/feature/detail?from=${ this.props.from }&id=${ transliteration(record.stringId) }`
              seeDetail = hasAuth(safetyPermission.SAFETY_TZKGL_CK) ? <NavLink
                to={{
                  pathname: '/safe/feature/detail',
                  search: `?from=${this.props.from}&id=${transliteration(record.stringId)}`,
                  state: { rCaches: 1 }
                }}>查看</NavLink> : null
            }
            return (
              <div className="operate-wrap">
                {
                  record.upgradePackageStatus === 'INSTALLABILITY' ? (
                    <Fragment>
                      {/*注销*/}
                      {logout}
                      {/*变更*/}
                      {change}
                      {/*安装*/}
                      {install}
                      {/*查看*/}
                      {seeDetail}
                    </Fragment>
                  ) : record.upgradePackageStatus === 'CANCELLED' && hasAuth(from === 'version' ? safetyPermission.SAFETY_VERSION_DJ : safetyPermission.SAFETY_TZKGL_DJ) ?
                    <a onClick={() => { this.controlModal(true, typeObj.again, record) }}>登记</a> : null
                }
              </div>
            )
          }
        }
      ],
      body: null,
      equipment: null, // 选择的设备
      registerType: typeObj.add,
      modalData: {},
      logoutModalData: { record: {}, visible: false },
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      //版本号
      safetyQueryPulldown: [],
      values: {},
      noVersion: false,
      from: props.from,
      supplierList: [],
      nameList: [],
      versionList: []
    }
  }

  componentDidMount () {
    const cache = getCaches(this, false, searchIndex)
    // 有缓存时
    if (cache) {
      const { page: pagingParameter, parameter } = cache
      const { multipleQuery, time, upgradePackageStatus, versions, name, number, searchExpand, equipment = {}, suppliers = [], names = [], businessIds = [] } = parameter
      // 把缓存参数保存至state
      const values = { time, multipleQuery, upgradePackageStatus, versions, equipment, name, number, suppliers, names, businessIds }
      // 回显查询条件
      const [beginTime, endTime] = time
      const field = { time: [beginTime ? moment(beginTime) : undefined, endTime ? moment(endTime) : undefined], multipleQuery, upgradePackageStatus, versions, name, number, suppliers, names, businessIds }
      if (values.time && values.time.length > 0) {
        values.beginTime = beginTime
        values.endTime = endTime
        delete values.time
      }
      if (this.state.from === 'feature') {
        values.versionLibraryStatus = values.upgradePackageStatus
        values.featureLibraryVersions = values.versions
        delete values.upgradePackageStatus
        delete values.versions
      }
      // 根据厂商获取名称
      suppliers.length && this.getNameList({ supplier: suppliers  })
      // 根据名字获取版本
      names.length && this.getVersionList({ supplier: suppliers, name: names })
      // 根据版本号获取特征库/升级包版本
      businessIds.length && this.getVersion({ businessIds })
      // 更新state后，进行查询
      this.setState({ pagingParameter, values, searchExpand })
      // 回显查询条件
      this.searchForm.setFieldsValue(field)
      this.getList({ ...pagingParameter, ...values }, false)
    } else {
      this.getList({ ...this.state.pagingParameter }, false)
    }
    this.getSupplierList()
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
        return { ...e, ...currentData, data: currentData.data }
      }
      return e
    })
  }/**
   * 控制登记、变更弹窗关闭打开
   */
  controlModal = (modalVisible = false, type, row = {}) => {
    this.setState({ modalVisible, registerType: type, modalData: row })
  }
  /**
   * 登记确认完成回调
   * @param type
   */
  registerOk = (type) => {
    // 登记或者变更时，更新数据
    const { pagingParameter, values } = this.state
    if (type === typeObj.add) {
      this.getList({ pageSize: pagingParameter.pageSize, currentPage: 1, ...values })
    } else {
      this.getList({ ...pagingParameter, ...values })
    }
    this.setState({ modalVisible: false, registerType: type, modalData: {} })
  }
  //查找版本号
  getVersion = (value) => {
    //清空之前选择的版本号
    let url
    if (this.props.from === 'version') {
      url = 'safetyQueryPulldown'
    } else {
      url = 'featurelibraryQueryVersion'
    }
    api[url](value).then(response => {
      if (response && response.head && response.head.code === '200') {
        const data = response.body
        const bool = data.length === 0
        this.setState({
          safetyQueryPulldown: data.map(e => ({ name: e, value: e })),
          noVersion: bool
        }, () => {
          // this.searchForm.setFieldsValue({
          //   versions: data.length ? [data[ 0 ]] : []
          // })
        })
      }
    })
  }

  /**
   * 显示注销弹窗
   */
  showLogOutModal = (record) => {
    this.setState({ logoutModalData: { record, visible: true } })
  }
  //注销提交事件
  handleLogOut = () => {
    const { logoutModalData: { record: { stringId } } } = this.state
    const _this = this
    const url = this.props.from === 'version' ? 'upgradepackageLogout' : 'featurelibraryCancel'
    api[url]({
      primaryKey: stringId,
      stringId
    }).then(response => {
      if (response && response.head && response.head.code === '200') {
        Message.success('注销成功')
        const { pagingParameter, values } = _this.state
        this.setState({ logoutModalData: { visible: false, record: {} } })
        _this.getList({
          ...pagingParameter,
          ...values
        })
      }
    })
  }
  //表单重置
  handleReset = () => {
    this.setState({
      values: {},
      // supplierList: [],
      nameList: [],
      versionList: [],
      safetyQueryPulldown: [],
      suppliers: void 0,
      names: void 0,
      businessIds: void 0,
      versions: void 0,
      equipment: null
    }, () => {
      this.getList({
        pageSize: 10,
        currentPage: 1
      })
    })
  }
  //表单查询
  handleSubmit = (params) => {
    const values = { ...params }
    if (this.state.from === 'feature') {
      values.versionLibraryStatus = values.upgradePackageStatus
      delete values.upgradePackageStatus
    }
    if (values.time && values.time.length > 0) {
      // if(values.time.filter((e)=>e).length < 2){
      //   Message.info('请选择完整的查询日期')
      //   return
      // }
      const [beginTime, endTime] = values.time
      values.beginTime = beginTime ? beginTime.valueOf() : ''
      values.endTime = endTime ? endTime.valueOf() : ''
      delete values.time
    }
    this.setState({
      pagingParameter: {
        pageSize: this.state.pagingParameter.pageSize,
        currentPage: 1
      },
      values
    }, () => {
      this.getList({
        ...this.state.pagingParameter,
        ...values
      })
    })
  }
  /**
   * 查询栏的展开回调事件
   * @param searchExpand {Boolean} 查询栏的展开状态
   */
  onExpandSearch = (searchExpand) => {
    this.setState({ searchExpand })
  }
  //获取列表
  getList = (param, isCache = true) => {
    const { searchExpand } = this.state
    this.setState({
      pagingParameter: {
        pageSize: param.pageSize,
        currentPage: param.currentPage
      }
    })
    const { pageSize, currentPage, beginTime, endTime } = param
    const parameter = { ...param, time: [beginTime, endTime], searchExpand }
    delete parameter.beginTime
    delete parameter.endTime
    delete parameter.currentPage
    delete parameter.pageSize
    // 在缓存的时候版本、特征库保存的是字段一致，
    if (this.state.from === 'feature') {
      parameter.upgradePackageStatus = parameter.versionLibraryStatus
      parameter.versions = parameter.featureLibraryVersions
      delete parameter.featureLibraryVersions
      delete parameter.versionLibraryStatus
    }
    // 缓存数据
    isCache && cacheSearchParameter([{ page: { pageSize, currentPage }, parameter }], this.props.history)
    const url = this.state.from === 'version' ? 'upgradePackageList' : 'featureSafetyQueryList'
    api[url](param).then(response => {
      if (response && response.head && response.head.code === '200') {
        //特征库字段转换
        if (this.state.from === 'feature') {
          response.body.items.forEach(item => {
            const { featureLibraryName, featureLibraryNumber, featureLibraryVersion, featureLibraryStatusMsg } = item
            item.upgradePackageStatus = featureLibraryStatusMsg === '可安装' ? 'INSTALLABILITY' : 'CANCELLED'
            item.name = featureLibraryName
            item.number = featureLibraryNumber
            item.version = featureLibraryVersion
          })
        }
        this.setState({
          body: response.body
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
    let values = {
      currentPage,
      pageSize,
      ...this.state.values
    }
    this.getList(values)
  }
  /**
   * 获取厂商列表数据
   */
  getSupplierList = () => {
    const { from: scene } = this.props
    return api.getSafetySupplier({ use: SCENE[scene] }).then(res=>{
      const supplierList = (res.body || []).map(e=>({ name: e.val, value: e.val }))
      this.setState({ supplierList })
      return res
    })
  }
  /**
   * 获取名称列表数据
   */
  getNameList = (params) => {
    const { from: scene } = this.props
    return api.getSafetyName({ ...params, use: SCENE[scene] }).then(res=>{
      const nameList = (res.body || []).map(e=>({ name: e.val, value: e.val }))
      this.setState({ nameList })
      return res
    })
  }
  /**
   * 获取版本列表数据
   */
  getVersionList = (params) => {
    const { from: scene } = this.props
    return api.getSafetyVersion({ ...params, use: SCENE[scene] }).then(res=>{
      const versionList = (res.body || []).map(e=>({ name: e.val, value: e.businessId }))
      this.setState({ versionList })
      return res
    })
  }
  onSelect = (type, key) => {
    let { supplier, name, nameList, versionList, safetyQueryPulldown } = this.state || {}
    let _value = {}
    if(type === 'supplier'){
      if(key.length){
        this.getNameList({ supplier: key })
      }else {
        nameList = []
        versionList = []
        safetyQueryPulldown = []
      }
      _value = { suppliers: key, names: void 0, businessIds: void 0, versions: void 0 }
    }else if(type === 'name'){
      if(key.length){
        this.getVersionList({ supplier: supplier, name: key })
      }else {
        versionList = []
        safetyQueryPulldown = []
      }
      _value = { suppliers: supplier, names: key, businessIds: void 0, versions: void 0 }
    }else if(type === 'version'){
      if(key.length){
        this.getVersion({ businessIds: key })
      }else {
        safetyQueryPulldown = []
      }
      _value = { suppliers: supplier, names: name, businessIds: key, versions: void 0 }
    }
    this.searchForm.setFieldsValue(_value)
    this.setState({ [type]: key, nameList, versionList, safetyQueryPulldown })
  }
  render () {
    let { columns, pagingParameter, body, safetyQueryPulldown, noVersion, equipment, modalVisible, registerType, modalData = {}, logoutModalData, searchExpand } = this.state
    const { supplierList, nameList, versionList } = this.state
    const { from } = this.props
    const text = this.props.from === 'version' ? '升级包' : '特征库'
    let list = []
    let total = 0
    if (body) {
      list = body.items
      total = body.totalRecords
    }
    this.filterFields = [
      { type: 'supplierLine1', style: { top: 33, fontSize: 14, color: '#98ACD9', position: 'absolute', marginTop: 10 }, showLine: false },
      { type: 'select', multiple: true, label: '厂商', placeholder: '全部', showSearch: true, key: 'suppliers', data: supplierList, onChange: (key)=>this.onSelect('supplier', key) },
      { type: 'select', multiple: true, label: '名称', placeholder: '全部', showSearch: true, key: 'names', data: nameList, onChange: (key)=>this.onSelect('name', key) },
      { type: 'select', multiple: true, label: '版本', placeholder: '全部', showSearch: true, key: 'businessIds', data: versionList, onChange: (key)=>this.onSelect('version', key) },
      { type: 'supplierLine2' },
      { type: 'input', key: 'name', label: `${text}名称`, maxLength },
      { type: 'input', key: 'number', label: `${text}序列号`, maxLength }
    ]
    const defaultFields = this.setFilterData(this.filterFields, [{
      key: 'versions',
      data: safetyQueryPulldown,
      placeholder: equipment ? '全部' : (noVersion ? '暂无版本数据' : '请选择版本号')
    }])
    const innerIpInfo = {
      visible: logoutModalData.visible,
      onOk: this.handleLogOut,
      onCancel: () => this.setState({ logoutModalData: { record: {}, visible: false } }),
      children: (<p className="model-text">确定注销{text}{logoutModalData.record.name}?</p>)
    }
    const fields = [
      { label: `${text}版本`, key: 'versions', type: 'select', multiple: true, allowClear: true, placeholder: '全部', data: [] },
      {
        label: '状态',
        key: 'upgradePackageStatus',
        allowClear: true,
        type: 'select',
        placeholder: '全部',
        showSearch: false,
        data: [...statusList]
      },
      { label: '发布时间', key: 'time', type: 'dateRange' }
    ]
    const _fields = this.setFilterData(fields, [{
      key: 'versions',
      data: safetyQueryPulldown,
      placeholder: equipment ? '全部' : (noVersion ? '暂无版本数据' : '请选择版本号')
    }])
    return (
      <div className="safe-version">
        {
          modalVisible ? <RegisterModal from={from} id={modalData.stringId} type={registerType} onOk={this.registerOk} onCancel={this.controlModal} /> : null
        }
        <ModalConfirm props={innerIpInfo} />
        <div className="search-bar">
          <Search defaultExpanded={searchExpand} wrappedComponentRef={search => { search && (this.searchForm = search.props.form) }} onSubmit={this.handleSubmit} onReset={this.handleReset} defaultFields={[].concat(defaultFields).concat(_fields)} onExpand={this.onExpandSearch} />
        </div>
        <div className="table-wrap">
          <div className="table-btn">
            <div className="left-btn">
              {
                hasAuth(from === 'version' ? safetyPermission.SAFETY_VERSION_DJ : safetyPermission.SAFETY_TZKGL_DJ) ?
                  <Button type="primary" onClick={() => {
                    this.controlModal(true, typeObj.add)
                  }}>登记</Button>
                  : null
              }
            </div>
          </div>
          <Table rowKey="stringId" columns={columns} dataSource={list} pagination={false} />
          {
            total
              ? <Pagination
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
    )
  }
}
export default connect()(withRouter(SafeManage))
