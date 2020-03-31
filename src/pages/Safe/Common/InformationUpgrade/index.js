import { Component } from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { message, Table, Pagination, Select } from 'antd'
import ModalConfirm from '@/components/common/ModalConfirm'
import moment from 'moment'
import api from '@/services/api'
import { analysisUrl, transliteration, emptyFilter, evalSearchParam, cacheSearchParameter } from '@/utils/common'
import './style.less'
import ManualInstallModal from '@/components/common/ManualInstallModal'
import Search from '@/components/common/Search'
import DetailFiedls from '@/components/common/DetailFiedls'
import Tooltip from '@/components/common/CustomTooltip'

const Option = Select.Option

// 安装状态
const upgradeStatusList = [
  { key: 'NOT_UPDATE', value: '待安装' },
  { key: 'SUCCESS', value: '安装成功' },
  { key: 'FAIL', value: '安装失败' },
  { key: 'UPDATING', value: '安装中' }
]

//版本信息升级
class SafeInformationUpgrade extends Component {
  constructor (props) {
    super(props)
    const from = analysisUrl(window.location.href).from
    this.state = {
      body: null,
      facturer: this.props.facturer,
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      info: {},
      values: {},
      //版本号
      safetyQueryPulldown: this.props.safetyQueryPulldown,
      //人工升级
      manualModal: {
        visible: false
      },
      confirmModalData: {
        visible: false,
        data: {}
      }
    }
    this.fromTitle = from === 'version' ? '升级包' : '特征库'
    this.columns = [
      {
        title: '名称',
        dataIndex: 'name',
        width: '14%',
        render: (text) => {
          return (
            <Tooltip title={text} placement="topLeft">
              {text}
            </Tooltip>)
        }
      },
      {
        title: `${this.fromTitle}序列号`,
        dataIndex: 'number',
        width: '10%',
        render: (text) => {
          return (
            <Tooltip title={text}>
              {text}
            </Tooltip>)
        }
      },
      {
        title: `${this.fromTitle}版本`,
        width: '10%',
        dataIndex: 'version'
      },
      {
        title: '登记时间',
        dataIndex: 'gmtCreate',
        // width: timeWidth,
        width: '16%',
        render: timestamp => {
          const time = timestamp <= 0 ? '' : moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
          return emptyFilter(time)
        }
      },
      {
        title: '升级方式',
        dataIndex: 'upgradeType',
        width: '12%',
        render: (text, record, idx) => {
          let initMode
          if (text === 'MANUAL') {
            initMode = '人工'
          } else {
            initMode = '自动'
          }
          // 安装中时，只显示文字
          if (['UPDATING'].includes(record.upgradeStatus)) {
            return initMode
          } else {
            return (
              <Select value={text} style={{ width: 80 }} placeholder="请选择" onChange={(value) => this.installModeChange(value, record, idx)}>
                <Option key="MANUAL">人工</Option>
                <Option key="AUTO_MATIC">自动</Option>
              </Select>
            )
          }
        }
      },
      {
        title: '升级状态',
        dataIndex: 'upgradeStatus',
        // width: installStatusWidth,
        width: '8%',
        render: (text) => {
          const status = upgradeStatusList.find((e) => e.key === text) || {}
          return emptyFilter(status.value)
        }
      },
      {
        title: '升级时间',
        dataIndex: 'upgradeDate',
        width: '16%',
        // width: timeWidth,
        render: (text) => {
          const v = text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : null
          return emptyFilter(v)
        }

      },
      {
        title: '操作',
        key: 'operate',
        width: '14%',
        render: (record) => {
          // const id = analysisUrl(window.location.href).from === 'version' ? record.stringId : record.featureLibraryId
          const actions = [
            { type: 'a', text: '安装', onClick: () => this.install(record), check: (record) => record.upgradeStatus !== 'UPDATING' && record.upgradeStatus !== 'SUCCESS' },
            { type: 'link', text: '查看', to: from === 'version' ? `/safe/version/detail?from=${from}&id=${transliteration(record.stringId)}` : `/safe/feature/detail?from=${from}&id=${transliteration(record.stringId)}` }
          ]
          return (
            <div className="operate-wrap">
              {
                actions.map((e, i) => {
                  const show = e.check ? e.check(record) : true
                  if (show) {
                    const style = { display: 'inline-block' }
                    if (e.type === 'a') {
                      return (<div style={style} key={i}><a onClick={e.onClick}>{e.text}</a></div>)
                    } else if (e.type === 'link') {
                      const index = e.to.indexOf('?')
                      const to = {
                        pathname: e.to.slice(0, index),
                        search: e.to.slice(index),
                        state: { rCaches: 1 }
                      }
                      return (<div style={style} key={i}><Link to={to}>{e.text}</Link></div>)
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
    this.filterFields = []
    this.defaultFields = [
      { label: '综合查询', span: 12, maxLength: 30, placeholder: `名称/${from === 'version' ? '升级包序列号' : '特征库序列号'}`, key: 'multipleQuery', type: 'input' },
      { label: `${this.fromTitle}版本`, key: 'versions', multiple: true, getChildrenKeys: false, config: { name: 'label', value: 'value' }, type: 'select', placeholder: '全部', data: [] },
      { label: '登记时间', key: 'time', type: 'dateRange', placeholder: ['开始日期', '结束日期'], data: [] }
    ]
  }

  componentDidMount () {
    const cache = evalSearchParam(this, {}, false)
    //有缓存查询参数时
    if (cache && cache.list && cache.list.length) {
      const { page, parameter: values } = (cache || {}).list[0] || {}
      /**
       * 组装查询表单字段
       * @type {{multipleQuery: *, time: Array}}
       */
      const parameter = { time: [], multipleQuery: values.multipleQuery }
      parameter.time[0] = values.beginTime ? moment(Number(values.beginTime)) : null
      parameter.time[1] = values.endTime ? moment(Number(values.endTime)) : null
      parameter.versions = analysisUrl(window.location.href).from === 'version' ? values.versions : values.featureLibraryVersions
      // 设置查询表单
      this.searchForm.setFieldsValue({ ...parameter })
      this.setState({ pagingParameter: page, values })
      this.getList({ ...page, ...values }, false)
    } else {
      this.getList({ ...this.state.pagingParameter }, false)
    }
    this.getInfo()
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    //版本号
    this.setState({
      safetyQueryPulldown: nextProps.safetyQueryPulldown
    })
  }

  /**
   * 手动安装弹窗安装成功后的回调
   * @param data {{ upgradeStatus: String, memo: String, installTime: Number }} 人工安装的信息
   * */
  onOk = (data = {}) => {
    // this.getList({ pageSize: 10, currentPage: 1 })
    const { from, assetId } = analysisUrl(window.location.href)
    //this.props.manualModal同时包含特征库和版本需要的参数
    const { version, newVersion, upgradePackageId, featureLibraryId, relationId, featureLibraryVersion } = this.state.manualModal.data
    const { status, memo, installTime } = data
    let url, param
    if (from === 'version') {
      param = {
        //要升级到的版本号
        aimVwesion: version,
        assetId,
        currentVwesion: newVersion,
        installType: 'MANUAL',
        upgradePackageId: upgradePackageId,
        installTime: installTime.valueOf(),
        memo,
        upgradeStatus: status
      }
      url = 'upgradePackageUpgrade'
    } else {
      param = {
        assetId,
        featureLibraryId,
        //id,stringID关系表ID
        id: relationId,
        stringId: relationId,
        version: featureLibraryVersion,
        installTime: installTime.valueOf(),
        installType: 'MANUAL',
        safeTySoftUpdateType: status,
        memo
      }
      url = 'featureUpgrade'
    }
    api[url](param).then(response => {
      if (response && response.head && response.head.code === '200') {
        message.success('操作成功')
        this.getInfo()
        this.setListData({ ...data, upgradeStatus: status })
        this.handleCancel()
      }
    }).catch(err => { })
  }
  /**
   * 手动安装时，设置当前数据信息，需要手动刷新才会重新获取数据，否则更改本地显示
   * @param data {{ upgradeStatus: String, memo: String, installTime: Number }} 人工安装的信息
   * */
  setListData = ({ upgradeStatus, memo, installTime: upgradeDate }) => {
    const { manualModal: { data = {} }, body } = this.state
    const { items } = body || {}
    const list = (items || []).map((e) => ({
      ...e,
      upgradeStatus: data.stringId === e.stringId ? upgradeStatus : e.upgradeStatus,
      memo: data.stringId === e.stringId ? memo : e.memo,
      upgradeDate: data.stringId === e.stringId ? upgradeDate : e.upgradeDate
    }))
    this.setState({ body: { ...body, items: list } })
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
      return e
    })
  }
  render () {
    const { from } = analysisUrl(window.location.href)
    const text = '当前设备'
    // 基础信息版本字段
    const versionText = from === 'version' ? '软件版本' : '特征库版本号'
    // const pageTitle = from === 'version' ? '设备版本升级' : '设备特征库升级'
    const { info, pagingParameter, body, safetyQueryPulldown, manualModal, confirmModalData } = this.state
    const columns = this.columns
    let list = []
    let total = 0
    if (body) {
      list = body.items
      total = body.totalRecords
    }
    const innerIpInfo = {
      visible: confirmModalData.visible,
      onOk: this.onConfirm,
      onCancel: () => this.setState({ confirmModalData: { visible: false } }),
      children: (<p className="model-text">确定对所选设备执行自动安装?</p>)
    }
    const _basiInfo = [{ name: '设备名称', key: 'name' }, { name: '硬件版本', key: 'version', value: info.categoryModelName }, { name: versionText, key: from === 'version' ? 'newVersion' : 'maxFeatureLibrary', showTips: false }, { name: '设备编号', key: 'number', value: info.number }, { name: 'IP', key: 'ip', showTips: false, value: info.ip }, { name: '厂商', key: 'manufacturer', value: info.manufacturer }]
    const defultFields = this.setFilterData(this.defaultFields, [{ key: 'versions', data: (safetyQueryPulldown || []).map(e => ({ label: e, value: e })) }])
    const fields = this.setFilterData(this.filterFields, [{ key: 'versions', data: (safetyQueryPulldown || []).map(e => ({ label: e, value: e })) }])
    return (
      <div className="main-detail-content information-upgrade main-table-content">
        <p className="detail-title">{`${text}信息`}</p>
        <ModalConfirm props={innerIpInfo} />
        <div className="">
          <div className="detail-content">
            <DetailFiedls fields={_basiInfo} data={info} />
          </div>
        </div>
        <div className="search-bar">
          <Search fieldList={fields} wrappedComponentRef={search => { search && (this.searchForm = search.props.form) }} onSubmit={this.onSubmit} defaultFields={defultFields} onReset={this.handleReset} />
        </div>
        <div className="table-wrap">
          <Table rowKey={from === 'version' ? 'upgradePackageId' : 'featureLibraryId'} columns={columns} dataSource={list} pagination={false} />
          <Pagination
            className="table-pagination"
            total={total} showTotal={(total) => `共 ${total || 0} 条数据`}
            showSizeChanger={ total > 10 ? true : false }
            showQuickJumper={true}
            onChange={this.changePage}
            onShowSizeChange={this.changeShowSize}
            pageSize={pagingParameter.pageSize}
            current={pagingParameter.currentPage} />
        </div>
        {/* <div className="Button-center back-btn">
          <Button type="primary" ghost onClick={this.props.history.goBack}>返回</Button>
        </div> */}
        {/* 安装弹框 */}
        {
          manualModal.visible ?
            <ManualInstallModal
              visible={manualModal.visible}
              handleCancel={this.handleCancel}
              onSubmit={this.onOk}
            />
            : null
        }

      </div>
    )
  }

  //安装
  install = (record) => {
    record.upgradeType === 'AUTO_MATIC' ? this.autoInstall(record) : this.manualInstall(record)
  }

  //人工安装
  manualInstall = (record) => {
    //当前版本号
    record.newVersion = this.state.info.newVersion
    this.setState({
      manualModal: {
        visible: true,
        data: record
      }
    })
  }

  //自动安装
  autoInstall = (record) => {
    const { from, assetId } = analysisUrl(window.location.href)
    let param, url
    if (from === 'version') {
      url = 'upgradePackageUpgrade'
      param = {
        aimVwesion: record.version,
        assetId,
        currentVwesion: this.state.info.newVersion,
        installType: 'AUTO_MATIC',
        upgradePackageId: record.upgradePackageId,
        upgradeStatus: 'UPDATING'
      }
    } else {
      url = 'featureUpgrade'
      param = {
        assetId,
        featureLibraryId: record.featureLibraryId,
        id: record.relationId,
        stringId: record.relationId,
        installType: 'AUTO_MATIC',
        safeTySoftUpdateType: record.upgradeStatus,
        version: record.featureLibraryVersion
      }
    }
    this.setState({ confirmModalData: { url, param, visible: true } })
  }
  // 单个设备自动安装，确认事件
  onConfirm = () => {
    const { confirmModalData: { url, param }, pagingParameter: { pageSize } } = this.state
    api[url](param).then(response => {
      if (response && response.head && response.head.code === '200') {
        message.success('操作成功')
        this.setState({ confirmModalData: { visible: false } })
        this.getList({
          pageSize,
          currentPage: 1
        })
      }
    }).catch(err => { })
  }
  /**
   * 更改升级方式事件
   * @param value 当前升级方式的值
   * @param record 当条记录对象
   * @param idx 当条记录所在列表中的下标
   */
  installModeChange = (value, record, idx) => {
    const { body } = this.state
    const { items } = body || {}
    const list = items.map((e, i) => ({
      ...e,
      // 更改要变更升级方式的数据
      upgradeType: i === idx ? value : e.upgradeType
    }))
    this.setState({ body: { ...body, items: list } })
  }

  //关闭安装弹框
  handleCancel = () => {
    this.setState({
      manualModal: {
        visible: false
      }
    })
  }

  //表单重置
  handleReset = () => {
    this.setState({
      values: {}
    }, () => {
      this.getList({
        pageSize: this.state.pagingParameter.pageSize,
        currentPage: 1
      })
    })
  }

  //表单查询
  onSubmit = (params) => {
    const values = { ...params }
    const { from } = analysisUrl(window.location.href)
    if (values.versions && from === 'feature') {
      values.featureLibraryVersions = values.versions
    }
    if (values.time && values.time.length > 0) {
      values.beginTime = values.time[0] ? values.time[0].valueOf() + '' : ''
      values.endTime = values.time[1] ? values.time[1].valueOf() + '' : ''
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

  //获取列表
  getList = (param, isCache = true) => {
    const { from, assetId } = analysisUrl(window.location.href)
    let url
    if (from === 'version') {
      url = 'upgradeablePackageList'
      param.versions = Array.isArray(param.versions) ? param.versions : []
    } else {
      url = 'featureQueryUpdateList'
      param.featureLibraryVersions = Array.isArray(param.featureLibraryVersions) ? param.featureLibraryVersions : []
    }
    param.assetId = assetId
    const parameter = { ...param }
    delete parameter.currentPage
    delete parameter.pageSize
    // 缓存查询条件
    isCache && cacheSearchParameter([{ page: { pageSize: param.pageSize, currentPage: param.currentPage }, parameter }], this.props.history)
    this.setState({
      pagingParameter: {
        pageSize: param.pageSize,
        currentPage: param.currentPage
      }
    })
    api[url](param).then(response => {
      if (response && response.head && response.head.code === '200') {
        response.body.items.forEach(item => {
          if (from === 'feature') {
            const { upgradeStatusCode, upgradeTime, upgradeTypeCode, featureLibraryName, featureLibraryNumber, featureLibraryVersion, gmtCreate } = item
            item.upgradeStatus = upgradeStatusCode
            item.upgradeDate = upgradeTime
            item.upgradeType = upgradeTypeCode
            item.name = featureLibraryName
            item.number = featureLibraryNumber
            item.version = featureLibraryVersion
            item.gmtCreate = gmtCreate
            item.filepath = item.filePath
          } else {
            //方式、时间、状态判空处理
            item.upgradeType = !item.upgradeType || item.upgradeType === '' ? 'MANUAL' : item.upgradeType
            item.upgradeStatus = !item.upgradeStatus || item.upgradeStatus === '' ? 'NOT_UPDATE' : item.upgradeStatus
          }
        })
        this.setState({
          body: response.body
        })
      }
    }).catch(err => {
      console.log(err)
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
      ...this.state.values,
      currentPage,
      pageSize
    }
    this.getList(values)
  }

  //查询详情
  getInfo = () => {
    const { assetId, from } = analysisUrl(window.location.href)
    // const primaryKey = from === 'version' ? id : assetId
    api.equipmentQueryById({
      primaryKey: assetId
    }).then(response => {
      if (response && response.head && response.head.code === '200') {
        const info = response.body || {}
        this.setState({
          info
        })
        //查询指定版本号
        let type, payload = {}
        payload.businessIds = [ response.body.businessId ]
        if (from === 'version') {
          type = 'safe/safetyQueryPulldown'
          payload.currentVersion = response.body.newVersion
        } else {
          type = 'safe/featurelibraryQueryVersion'
          payload.currentVersion = response.body.featureLibrary
        }
        this.props.dispatch({ type, payload })
      }
    }).catch(err => { })
  }
}

const mapStateToProps = ({ safe }) => {
  return {
    safetyQueryPulldown: safe.safetyQueryPulldown
  }
}

export default connect(mapStateToProps)(SafeInformationUpgrade)
