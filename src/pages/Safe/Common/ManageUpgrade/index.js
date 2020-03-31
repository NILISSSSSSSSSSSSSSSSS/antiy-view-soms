import React, { Component } from 'react'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import { Button, Message, Select } from 'antd'
import moment from 'moment'
import { debounce } from 'lodash'
import api from '@/services/api'
import { analysisUrl, transliteration, cacheSearchParameter, getCaches } from '@/utils/common'
import ManualInstallModal from '@/components/common/ManualInstallModal'
import DetailFiedls from '@/components/common/DetailFiedls'
import Table from '@/components/common/Table'
import Tooltip from '@/components/common/CustomTooltip'
import Search from '@/components/common/Search'
import ModalConfirm from '@/components/common/ModalConfirm'
import './style.less'

const Option = Select.Option

// 安装状态
const upgradeStatusList = [
  { key: 'NOT_UPDATE', value: '待安装' },
  { key: 'SUCCESS', value: '安装成功' },
  { key: 'FAIL', value: '安装失败' },
  { key: 'UPDATING', value: '安装中' }
]
const searchIndex = 0 //在该路由下所在的第几个查询
// 特征库、版本安装界面组件
class SafeManageUpgrade extends Component {
  constructor (props) {
    super(props)
    // const { from } = analysisUrl(window.location.href)
    this.state = {
      columns: [
        {
          title: '资产名称',
          dataIndex: 'name',
          width: '16%',
          render: (text) => {
            return <Tooltip title={text} placement="topLeft">{text}</Tooltip>
          }
        },
        {
          title: '资产编号',
          dataIndex: 'number',
          width: '10%',
          render: (text) => {
            return (
              <Tooltip title={text}>{text}</Tooltip>
            )
          }
        },
        {
          title: '版本',
          dataIndex: 'assetVersion',
          width: '10%',
          render: (text) => {
            return (
              <Tooltip title={text}>{text}</Tooltip>
            )
          }
        },
        {
          title: '安装方式',
          dataIndex: 'upgradeType',
          width: '8%',
          render: (text, record, idx) => {
            let initMode = ''
            if (text === 'MANUAL') {
              initMode = '人工'
            } else {
              initMode = '自动'
            }

            if (['UPDATING'].includes(record.upgradeStatus)) {
              return initMode
            } else {
              const defaultValue = text ? { value: text } : {}
              return (
                <Select
                  disabled={record.disabledSelect}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  {...defaultValue}
                  style={{ width: 80 }}
                  placeholder="请选择"
                  onChange={(value) => this.installModeChange(value, record, idx)}>
                  <Option key="MANUAL">人工</Option>
                  <Option key="AUTO_MATIC">自动</Option>
                </Select>
              )
            }
          }
        },
        {
          title: '安装状态',
          dataIndex: 'upgradeStatus',
          width: '12%',
          // width: installStatusWidth,
          render: (text) => {
            const status = upgradeStatusList.find((e) => e.key === text) || {}
            return status.value || ''
          }
        },
        {
          title: '安装时间',
          dataIndex: 'upgradeDate',
          // width: timeWidth,
          width: '16%',
          render: (text) => {
            const time = text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : null
            return <Tooltip title={time}>{time}</Tooltip>
          }
        }
      ],
      body: null,
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      selectedRows: [],
      selectedRowKeys: [],
      info: {},
      values: {},
      //人工升级
      manualModal: {
        visible: false
      },
      autoInstallModal: {
        visible: false,
        data: {},
        contentText: ''
      }
    }
    this.actions = [
      {
        type: 'btn',
        label: '安装',
        onClick: (record) => this.install(record),
        check: (record) => record.upgradeStatus !== 'UPDATING' && record.upgradeStatus !== 'SUCCESS'
      },
      {
        type: 'link',
        label: '查看',
        to: (record) => {
          const { from } = analysisUrl(window.location.href)
          const { categoryId: categoryModelId, assetId, categoryModel } = record
          const newCategoryModelId = from === 'feature' ? categoryModelId : categoryModel
          return {
            pathname: '/safe/equipment/detail',
            search: `?id=${transliteration(assetId)}&categoryModel=${transliteration(newCategoryModelId)}`,
            state: { rCaches: 1 }
          }
        }
      }]
    this.urlParam = analysisUrl(window.location.href)
    // 是否是批量安装
    this.batch = false
  }

  componentDidMount () {
    const cache = getCaches(this, false, searchIndex)
    // 有缓存时
    if (cache) {
      const { page: pagingParameter, parameter: values } = cache
      const param = { pagingParameter, values }
      this.setState(param)
      this.getList(param)
      // 回显查询条件
      this.searchForm.setFieldsValue(values)
    } else {
      this.getList({
        ...this.state.pagingParameter
      }, false)
    }

    this.getInfo().then((data = {}) => {
      // const { from } = this.urlParam
      // 根据资产类型ID获取厂商
    })
  }
  //安装
  install = (record) => {
    this.batch = false
    record.upgradeType === 'AUTO_MATIC' ? this.openAutoInstallModal(record, '确定对设备执行自动安装') : this.openManualInstallModal(record)
  }

  //人工安装
  openManualInstallModal = (record) => {
    const { from, id } = analysisUrl(window.location.href)
    let data
    if (from === 'version') {
      let installInfos = []
      if (record) {
        installInfos = [{ assetId: record.assetId, id: record.stringId }]
      } else {
        installInfos = this.state.selectedRows.map(item => {
          return {
            assetId: item.assetId,
            id: item.stringId
          }
        })
      }
      data = {
        installType: 'MANUAL',
        upgradePackageId: id,
        version: this.state.info.version,
        //单个或多个
        installInfos
      }
    } else {
      let installInfos = []
      if (record) {
        installInfos = [{ assetId: record.assetId, rId: record.rId }]
      } else {
        installInfos = this.state.selectedRows.map(item => {
          return {
            assetId: item.assetId,
            rId: item.rId
          }
        })
      }
      data = {
        featureLibraryId: id,
        //单个或多个
        installInfos,
        installType: 'MANUAL',
        version: this.state.info.version
      }
    }
    // 批量安装时，存在改字段
    if (record) {
      data.status = record.upgradeStatus
      data.assetId = record.assetId
      data.installTime = moment(record.upgradeTime)
      data.memo = moment(record.memo)
    }

    this.setState({
      manualModal: {
        visible: true,
        data
      }
    })
  }
  // 批量安装
  installBatch = () => {
    const { selectedRows = [] } = this.state
    if (!selectedRows.length) {
      Message.info('请先选择要批量安装的资产')
    } else {
      this.batch = true
      const isAuto = selectedRows[0].upgradeType === 'AUTO_MATIC'
      isAuto ? this.autoInstallBatch() : this.manualInstallBatch()
    }
  }
  //批量人工安装
  manualInstallBatch = () => {
    if (this.state.selectedRows.length === 0) {
      Message.info('请先选择')
      return
    }
    this.openManualInstallModal()
  }

  //自动安装
  openAutoInstallModal = (record, contentText) => {
    this.setState({ autoInstallModal: { data: record, visible: true, contentText } })
  }
  /**
   * 自动安装确认事件
   */
  autoInstallOnOk = () => {
    const { autoInstallModal: { data: record } } = this.state
    const { id, from } = analysisUrl(window.location.href)
    const url = from === 'version' ? 'upgradePackageInstall' : 'featureQueryBatch'
    let param
    if (from === 'version') {
      param = {
        installType: 'AUTO_MATIC',
        upgradePackageId: id,
        upgradeStatus: 'UPDATING',
        version: this.state.info.version,
        //单个或多个
        installInfos: record ? [{
          assetId: record.assetId,
          id: record.stringId
        }] : this.state.selectedRows.map(item => {
          return {
            assetId: item.assetId,
            id: item.stringId
          }
        })
      }
    } else {
      param = {
        featureLibraryId: id,
        //单个或多个
        installInfos: record ? [{
          assetId: record.assetId,
          rId: record.rId
        }] : this.state.selectedRows.map(item => {
          return {
            assetId: item.assetId,
            rId: item.rId
          }
        })
      }
    }
    api[url](param).then(response => {
      if (response && response.head && response.head.code === '200') {
        Message.success('操作成功')
        const { values } = this.state
        this.setState({
          autoInstallModal: { data: {}, visible: false, contentText: '' },
          selectedRowKeys: [],
          selectedRows: []
        })
        this.getList({
          pageSize: 10,
          currentPage: 1,
          ...values
        })
      }
    }).catch(err => {
    })
  }

  //批量自动安装
  autoInstallBatch = () => {
    if (this.state.selectedRows.length === 0) {
      Message.info('请先选择')
      return
    }
    this.openAutoInstallModal(null, '确定对所选设备执行批量自动安装')
  }

  //行选择
  rowChange = (selectedRowKeys, data) => {
    const { body } = this.state
    const { items: list } = body || {}
    let newList = JSON.parse(JSON.stringify(list))
    //禁用与初次点击行安装方式不一致的行
    if (data.length) {
      newList = newList.map((item) => {
        if (data.length) {
          // 跟一条选中记录比对，是否是同一种安装方式,并且不是安装状态
          const result = data[0].upgradeType === item.upgradeType && item.upgradeStatus !== 'UPDATING'
          // 是否被选中，安装方式不可改变
          const length = data.filter(el => el.assetId === item.assetId).length
          return { ...item, disabled: !result, disabledSelect: !!length }
        } else {
          return null
        }
      })
    }
    //清空时还原
    if (data.length === 0) {
      newList.filter(item => item.upgradeStatus !== 'UPDATING').forEach(item => {
        item.disabled = false
      })
      newList.forEach(item => {
        item.disabledSelect = false
      })
    }
    this.setState({
      selectedRows: data,
      selectedRowKeys,
      body: { ...body, items: newList }
    })
  }

  //当前选择行，勾选后禁止下拉选择
  onSelect = (record) => {
    const currentRow = this.state.body.items.filter(item => record.assetId === item.assetId)[0]
    currentRow.disabledSelect = !currentRow.disabledSelect
  }

  //关闭升级弹框
  handleCancel = () => {
    this.setState({
      manualModal: {
        visible: false,
        data: {}
      }
    })
  }
  /**
   * 人工安装确认函数
   * @param params{ Object } 安装状态 status 、安装时间 installTime、和备注memo的描述
   */
  manualInstallSubmit = debounce((params = {}) => {
    const { status: upgradeStatus, installTime, memo } = params
    const { from } = analysisUrl(window.location.href)
    const { manualModal } = this.state
    let url, param = {
      ...manualModal.data,
      upgradeStatus,
      installTime: installTime.valueOf(),
      memo
    }
    if (from === 'version') {
      param.upgradeStatus = upgradeStatus
      url = 'upgradePackageInstall'
    } else {
      param.safeTySoftUpdateType = upgradeStatus
      url = 'featureInstall'
    }
    api[url](param).then(response => {
      if (response && response.head && response.head.code === '200') {
        Message.success('操作成功')
        this.setState({ selectedRowKeys: [], selectedRows: [] })
        if (upgradeStatus !== 'SUCCESS') {
          this.getList({
            pageSize: 10,
            currentPage: 1
          })
        } else {
          const { selectedRowKeys, selectedRows } = this.state
          let assetIdList = []
          // 批量安装时，修改所选中的资产安装状态和时间
          if (this.batch) {
            assetIdList = selectedRowKeys
            // 批量安装时，安装完成就清除选中状态
          } else {
            // 单个安装时，去除当前安装的设备的选中状态
            const newSelectedRowKeys = selectedRowKeys.filter((e) => e !== manualModal.data.assetId)
            const newSelectedRows = selectedRows.filter((e) => e.assetId !== manualModal.data.assetId)
            this.setState({ selectedRowKeys: newSelectedRowKeys, selectedRows: newSelectedRows })
            // 单个安装时，修改单个的资产安装状态和时间
            assetIdList = [manualModal.data.assetId]
          }
          // 若安装状态为成功，只修改当前项的显示，不重新获取列表
          this.changeListItem(assetIdList, installTime.valueOf())
        }
        this.handleCancel()
      }
    }).catch(err => {
    })
  })
  //表单重置
  handleReset = () => {
    this.setState({
      values: {}
    }, () => {
      this.setState({
        selectedRowKeys: [],
        selectedRows: []
      })
      this.getList({
        pageSize: 10,
        currentPage: 1
      })
    })
  }

  //表单查询
  handleSubmit = (values = {}) => {
    this.setState({
      pagingParameter: {
        pageSize: this.state.pagingParameter.pageSize,
        currentPage: 1
      },
      values
    }, () => {
      this.setState({
        selectedRowKeys: [],
        selectedRows: []
      })
      this.getList({
        ...this.state.pagingParameter,
        ...values
      })
    })
  }

  //升级方式
  installModeChange = (value, record, idx) => {
    const { body, selectedRows } = this.state
    const { items } = body || {}
    const list = items.map((e, i) => {
      if (i === idx) {
        return { ...e, upgradeType: value }
      }
      return e
    }).map((e) => {
      // 跟一条选中记录比对，是否是同一种安装方式，并且不是安装中状态
      if (selectedRows.length) {
        const result = selectedRows[0].upgradeType === e.upgradeType && e.upgradeStatus !== 'UPDATING'
        // 是否被选中，安装方式不可改变
        const length = selectedRows.filter(el => el.assetId === e.assetId).length
        return { ...e, disabled: !result, disabledSelect: !!length }
      }
      return e
    })
    const allCheckboxStatus = this.getAllCheckboxStatus(list)
    this.setState({ body: { ...body, items: list }, allCheckboxStatus })
  }

  //获取列表
  getList = (param, isCache = true) => {
    this.setState({
      pagingParameter: {
        pageSize: param.pageSize,
        currentPage: param.currentPage
      }
    })
    const { id, from } = analysisUrl(window.location.href)
    let url
    if (from === 'version') {
      url = 'installableEquipmentList'
      param.upgradePackageId = id
    } else {
      url = 'featureInstallQuery'
      param.id = id
    }
    const { pageSize, currentPage, multipleQuery } = param
    const parameter = { multipleQuery }
    // 缓存数据
    isCache && cacheSearchParameter([{ page: { pageSize, currentPage }, parameter }], this.props.history)
    api[url](param).then(response => {
      if (response && response.head && response.head.code === '200') {
        (response.body.items || []).forEach(item => {
          if (from === 'feature') {
            item.upgradeDate = item.upgradeTime
            item.name = item.assetName
            item.number = item.assetNumber
          }
          //方式、时间、状态判空处理
          item.upgradeType = !item.upgradeType ? 'MANUAL' : item.upgradeType
          item.upgradeStatus = !item.upgradeStatus ? 'NOT_UPDATE' : item.upgradeStatus
          item.disabled = item.upgradeStatus === 'UPDATING'
          item.disabledSelect = false
          // item.upgradeDate = !item.upgradeDate || item.upgradeDate === '' ? (new Date()).getTime() : item.upgradeDate
        })
        const allCheckboxStatus = this.getAllCheckboxStatus(response.body.items || [])
        this.setState({
          body: response.body,
          allCheckboxStatus
        })
      }
    }).catch(err => {
      console.log(err)
    })
  }

  // 修改列表项
  changeListItem = (assetIdList = [], installTime) => {
    const list = [...this.state.body.items]
    list.forEach(item => {
      if (assetIdList.includes(item.assetId)) {
        item.upgradeStatus = 'SUCCESS'
        item.upgradeDate = installTime
        item.disabled = true
        item.disabledSelect = true
      }
    })
    this.setState({
      body: {
        ...this.state.body,
        items: list
      }
    })
  }

  //改变当前页显示数量
  changeShowSize = (currentPage, pageSize) => {
    this.pageModify(pageSize, currentPage)
  }

  //当前页码改变
  changePage = (pagingParameter) => {
    const { pageSize, current: currentPage } = pagingParameter
    this.pageModify(pageSize, currentPage)
  }

  //页面修改
  pageModify = (pageSize, currentPage) => {
    const { values = {} } = this.state
    let params = {
      currentPage,
      pageSize,
      ...values
    }
    this.getList(params)
  }

  //查询详情
  getInfo = () => {
    const { id, from } = analysisUrl(window.location.href)
    const url = from === 'version' ? 'queryPackageDetail' : 'featureQuerySafetyQuery'
    return api[url]({
      primaryKey: id
    }).then(response => {
      if (response && response.head && response.head.code === '200') {
        let data
        if (from === 'version') {
          data = response.body.safetyUpgradePackageResponse
        } else {
          data = response.body
          data.name = data.featureLibraryName
          data.version = data.featureLibraryVersion
        }
        this.setState({
          info: data
        })
        return data
      }
    })
  }
  getAllCheckboxStatus = (list = []) => {
    let MANUAL = 0
    let AUTO_MATIC = 0
    if (!list.length || list.length === 1) {
      return false
    }
    for (let i = 0, len = list.length; i < len; ++i) {
      const record = list[i]
      if (['NOT_UPDATE', 'FAIL'].includes(record.upgradeStatus)) {
        if (record.upgradeType === 'MANUAL') {
          ++MANUAL
        } else {
          ++AUTO_MATIC
        }
      }
      // 列表中含有人工和自动时、或者有在安装中中，隐藏全选
      if (MANUAL && AUTO_MATIC || 'UPDATING' === record.upgradeStatus) {
        return false
      }
    }
    // 列表中只有人工或者只有自动时，显示全选
    return true
  }
  render () {
    const { from } = analysisUrl(window.location.href)
    const text = from === 'version' ? '版本' : '特征库'
    // 基础信息版本字段
    const versionText = from === 'version' ? '升级包版本' : '特征库版本'
    const { info, columns, pagingParameter, body, manualModal, allCheckboxStatus, autoInstallModal: { visible, contentText }, selectedRowKeys, selectedRows } = this.state
    let list = []
    let total = 0
    if (body) {
      list = body.items || []
      total = body.totalRecords
    }
    const initValue = {}
    if (manualModal.visible) {
      initValue.installTime = manualModal.data.installTime
      initValue.status = manualModal.data.status
      initValue.memo = manualModal.data.memo
    }
    const basiInfo1 = [
      { name: '厂商', key: 'relatedAssetManufacturer', value: info.relatedAssetManufacturer },
      { name: '名称', key: 'relatedAssetName', value: info.relatedAssetName },
      { name: '版本', key: 'relatedAssetVersion', value: info.relatedAssetVersion, showTips: false }
    ]
    const basiInfo2 = [
      { name: '名称', key: 'name', value: info.name },
      { name: versionText, key: 'version', value: info.version, showTips: false }
    ]
    const filter = [
      { key: 'multipleQuery', label: '综合查询', type: 'input', placeholder: '名称/编号/IP/Mac' }
    ]
    const innerIpInfo = {
      visible,
      onOk: this.autoInstallOnOk,
      onCancel: () => this.setState({ autoInstallModal: { data: {}, visible: false, contentText: '' } }),
      children: (<p className="model-text">{contentText}</p>)
    }
    const rowSelection = {
      selectedRowKeys,
      getCheckboxProps: (record) => {
        return {
          disabled: record.disabled
        }
      },
      onChange: (selectedKeys, selectedRows) => {
        this.rowChange(selectedKeys, selectedRows)
      }
    }
    let isAllSelect = false
    if (selectedRows.length) {
      isAllSelect = list.filter(e => selectedRows[0].upgradeType === e.upgradeType).length === list.length
    } else {
      const length = list.filter(e => e.upgradeType === 'MANUAL').length
      if (!length) { // 都是自动时
        isAllSelect = true
      } else if (length === list.length) { // 都是人工时
        isAllSelect = true
      }
    }
    return (
      <div className="main-detail-content safe-version-upgrade main-table-content">
        <ModalConfirm props={innerIpInfo} />
        <div className="">
          <p className="detail-title">{`${text}信息`}</p>
          <div className="detail-content">
            <div className="detail-content-equ">
              <div className="detail-content-equ-label">
                关联设备
              </div>
              <DetailFiedls fields={basiInfo1} data={info} />
            </div>
            <DetailFiedls fields={basiInfo2} data={info} />
          </div>
        </div>
        <div className="search-bar">
          <Search onSubmit={this.handleSubmit} wrappedComponentRef={search => { search && (this.searchForm = search.props.form) }} onReset={this.handleReset} defaultFields={filter} />
        </div>
        <div className="table-wrap">
          <div className="table-btn">
            {/*占位*/}
            <div className="left-btn"></div>
            <div className="right-btn"><Button type="primary" onClick={this.installBatch}>批量安装</Button></div>
          </div>
          <Table
            rowKey="assetId"
            className={isAllSelect ? '' : 'disabled-select-table'}
            allCheckBoxProps={{ width: '6%' }}
            actionsProps={{ width: '12%' }}
            allCheckBox={allCheckboxStatus}
            onChange={this.changePage}
            pagination={{ ...pagingParameter, total }}
            rowSelection={rowSelection}
            dataSource={list}
            columns={columns}
            actions={this.actions}
          />
        </div>
        {/* <div className="Button-center back-btn">
          <Button type="primary" ghost onClick={this.props.history.goBack}>返回</Button>
        </div> */}
        {/* 安装弹框 */}
        {
          manualModal.visible ? <ManualInstallModal visible={manualModal.visible} handleCancel={this.handleCancel} onSubmit={this.manualInstallSubmit} />
            : null
        }

      </div>
    )
  }

}
export default connect()(withRouter(SafeManageUpgrade))
