import React, { Component, Fragment } from 'react'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import { Form, Table, Pagination, Button, message } from 'antd'
import { Link } from 'react-router-dom'
import { TooltipFn, transliteration, analysisUrl, evalSearchParam, cacheSearchParameter } from '@/utils/common'
import api from '@/services/api'
import hasAuth from '@/utils/auth'
import { BASE_SOURCE, OPERATE_TYPE } from '@a/js/enume'
import { configPermission } from '@a/permission'
import { Search } from '@c/index'
import ModalConfirm from '@/components/common/ModalConfirm'
import './style.less'

export class BaseSettingManageForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      osList: this.props.osList || [], // 操作系统列表
      list: {},                        // 待配置的资产列表
      rowsSelectedList: [],
      selectedRowKeys: [],
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      seekTerm: {},
      selectSystem: undefined,        // 当前勾选的列表项的操作系统
      isAllCanCheck: false,            // 全选是否可选
      showAlert: false,                //忽略弹框显示
      waitingConfigId: []   //忽略集合
    }
  }
  componentDidMount () {
    // 获取列表
    let { list } = evalSearchParam(this, {}, false) || {}
    if (list) {
      this.searchForm.setFieldsValue({ ...list[0].parameter })
      this.setState({ pagingParameter: list[0].page, seekTerm: list[0].parameter }, () => this.getBaseSettingManageList())
    } else {
      this.getBaseSettingManageList(false)
    }
    // 获取筛选项列表数据
    this.props.dispatch({ type: 'baseSetting/getConfigOsList', payload: { name: '操作系统' } })
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    // 更新列表数据
    if (nextProps.osList && JSON.stringify(this.props.osList) !== JSON.stringify(nextProps.osList)) {
      this.setState({
        osList: nextProps.osList
      })
    }
  }
  getBaseSettingManageList = (isCache = true) => {
    const { seekTerm, pagingParameter } = this.state
    const postParms = {
      ...seekTerm,
      ...pagingParameter
    }
    if (isCache) {
      cacheSearchParameter([{
        page: pagingParameter,
        parameter: { ...seekTerm }
      }], this.props.history)
    }
    const businessId = analysisUrl(this.props.location.search).businessId
    businessId && businessId.split(',').length > 1 ? postParms.businessIds = businessId.split(',') : postParms.businessId = businessId
    api.getConfigAssetsList(postParms).then(response => {
      if (response && response.head && response.head.code === '200') {
        const list = response.body.items
        const systemList = []
        list.forEach(item => {
          systemList.push(item.systemName)
        })
        const ele1 = systemList[0]
        const isAllCanCheck = systemList.every((val) => {
          return val === ele1
        })
        this.setState({
          list: response.body,
          systemList,
          isAllCanCheck
        })
      }
    })
  }
  // 提交表单，执行查询
  handleSubmit = values => {
    this.setState({
      pagingParameter: {
        pageSize: this.state.pagingParameter.pageSize,
        currentPage: 1
      },
      seekTerm: values
    }, () => {
      this.getBaseSettingManageList()
    })
  }
  //查询条件重置
  handleReset = () => {
    sessionStorage.removeItem('searchParameter')
    this.props.form.resetFields()
    //重置查询条件后，重新查询页面数据
    this.setState({
      selectedRowKeys: [],
      rowsSelectedList: [],
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      seekTerm: {}
    }, () => {
      this.getBaseSettingManageList(false)
    })
  }
  //翻页
  pageChange = (page, pageSize) => {
    this.setState({
      pagingParameter: {
        currentPage: page,
        pageSize: pageSize
      }
    }, () => {
      this.getBaseSettingManageList()
    })
  }
  // 单个资产配置
  toConfigItem = record => {
    const { taskId } = record.waitingTaskReponse
    const userId = sessionStorage.getItem('id')
    // 认领任务
    api.recieveTask({
      taskId,
      userId
    }).then(response => {
      this.props.history.push(`/basesetting/manage/setting?waitingConfigId=${transliteration(record.waitingConfigId)}`)
    })
  }
  // 批量配置
  toConfig = () => {
    const { selectedRowKeys, rowsSelectedList } = this.state
    const userId = sessionStorage.getItem('id')
    if (!selectedRowKeys.length) {
      message.info('请先勾选要批量配置的资产！')
      return
    }
    const waitingConfigIdList = []
    const taskIds = []
    rowsSelectedList.forEach(item => {
      waitingConfigIdList.push(item.waitingConfigId)
      taskIds.push(item.waitingTaskReponse.taskId)
    })
    const waitingConfigIds = waitingConfigIdList.join('/')
    // 认领任务
    api.claimTaskBatch({
      taskIds,
      userId
    }).then(response => {
      this.props.history.push(`/basesetting/manage/setting?waitingConfigId=${waitingConfigIds}`)
    })
  }
  //批量忽略
  toIgnore = (record) => {
    if (!this.state.selectedRowKeys.length && !record) {
      message.info('请先勾选要批量忽略的资产！')
      return
    } else {
      const { rowsSelectedList } = this.state
      let waitingConfigIdList = []
      if(rowsSelectedList.find(item=>item.configStatus !== 13 )){
        message.info('勾选中有不能忽略的资产！')
        return
      }else{
        rowsSelectedList.forEach(item => {
          waitingConfigIdList.push(item.waitingConfigId)
        })
        this.setState({
          showAlert: true,
          waitingConfigId: record ? [record.waitingConfigId] : waitingConfigIdList
        })
      }
    }
  }
  //忽略取消
  handleCancel = () => {
    this.setState({
      showAlert: false,
      selectedRowKeys: [],
      rowsSelectedList: []
    })
  }
  alertOk = () => {
    // 忽略确认
    api.ignoreBaseLineConfig({ waitingConfigId: this.state.waitingConfigId }).then(response => {
      message.success('操作成功!')
      this.setState({
        showAlert: false
      }, this.getBaseSettingManageList)
    })
  }
  getWorkOrderBtn = (record) => {
    return (
      <Fragment>
        {
          <Fragment>
            <Link to={{
              pathname: '/asset/manage/detail',
              search: `id=${record.assetId}`,
              state: { rCaches: 1 }
            }}>查看</Link>
            {hasAuth(configPermission.baseConfig) && record.configStatus === 13 ? <a onClick={() => this.toIgnore(record)}>忽略</a> : null}
            {hasAuth(configPermission.baseConfig) ? <a onClick={() => this.toConfigItem(record)}>配置</a> : null}
          </Fragment>
        }
      </Fragment>
    )
  }
  render () {
    let { list, pagingParameter, selectedRowKeys, selectSystem, isAllCanCheck, osList, showAlert } = this.state
    console.log(osList)
    const AlertInfo = {
      visible: showAlert,
      onOk: this.alertOk,
      onCancel: this.handleCancel,
      children: (<p className="model-text">是否确认忽略此配置信息？</p>)
    }
    const columns = [{
      title: '资产名称',
      dataIndex: 'assetName',
      key: 'assetName',
      isShow: true,
      width: '16%',
      render: text => TooltipFn(text)
    }, {
      title: '资产编号',
      dataIndex: 'assetNumber',
      key: 'assetNumber',
      width: '14%',
      isShow: true,
      render: text => TooltipFn(text)
    }, {
      title: 'IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: '12%',
      isShow: true,
      render: text => TooltipFn(text)
    }, {
      title: 'MAC',
      dataIndex: 'macAddress',
      key: 'macAddress',
      width: '12%',
      isShow: true,
      render: text => TooltipFn(text)
    }, {
      title: '配置来源',
      dataIndex: 'source',
      key: 'source',
      width: '10%',
      isShow: true,
      render: val => {
        return val ? BASE_SOURCE[val - 1].name : null
      }
    }, {
      title: '适用系统',
      dataIndex: 'systemName',
      key: 'systemName',
      isShow: true,
      render: val => {
        return TooltipFn(val)
      }
    }, {
      title: '状态',
      dataIndex: 'statusName',
      key: 'statusName',
      isShow: true,
      width: '10%'
    }, {
      title: '操作',
      width: '10%',
      render: (text, record) => {
        return (
          <div className="operate-wrap">
            {
              this.getWorkOrderBtn(record)
            }
          </div>
        )
      }
    }]
    const defaultFields = [
      { type: 'input', label: '综合查询', placeholder: '名称/编号/IP/MAC', key: 'blurQueryField', allowClear: true }
    ]
    const fields = [
      { type: 'select', multiple: true, placeholder: '全部', label: '配置来源', key: 'sourceList', data: BASE_SOURCE },
      { type: 'select', multiple: false, label: '执行方式', placeholder: '请输入', key: 'checkType', data: OPERATE_TYPE },
      { type: 'treeSelect', multiple: true, placeholder: '全部', label: '适用系统', key: 'systemList', data: osList, config: { name: 'name', value: 'node' }, treeDefaultExpandAll: false }
    ]
    //复选框
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        let rowsSelectedList = [...this.state.rowsSelectedList]
        if (!this.state.rowsSelectedList.length) {
          rowsSelectedList = selectedRows
        } else {
          selectedRowKeys.forEach((item1, index1) => {
            // 已选中的列表是否已存在这个id
            const has = rowsSelectedList.some(e => item1 === e.waitingConfigId)
            if (!has) {
              selectedRows.forEach((item, index) => {
                if (item1 === item.waitingConfigId) {
                  rowsSelectedList.push(selectedRows[index])
                }
              })
            }
          })
        }
        // 是否取消了已选中的id
        rowsSelectedList.forEach((item1, index1) => {
          const has = selectedRowKeys.some(item => item === item1.waitingConfigId)
          if (!has) rowsSelectedList.splice(index1, 1)
        })
        this.setState({
          selectedRowKeys,
          rowsSelectedList,
          selectSystem: selectedRows[0] ? selectedRows[0].systemName : undefined
        })
      },
      // 注：只有相同的操作系统才能批量操作；如果勾选了一个资产，则默认只有与这个资产操作系统相同的资产复选框才可选
      getCheckboxProps: record => ({
        disabled: (selectSystem !== undefined && record.systemName !== selectSystem),
        status: record.status
      })
    }
    return (
      <article className="main-table-content">
        <div className="search-bar">
          <Search defaultFields={defaultFields} fieldList={fields} wrappedComponentRef={search => { search && (this.searchForm = search.props.form) }} onSubmit={this.handleSubmit} onReset={this.handleReset} showExpand={false}/>
        </div>
        <section className="table-wrap table-style">
          <div className="table-btn">
            <div className="left-btn"></div>
            <div className="right-btn">
              {hasAuth(configPermission.baseConfig) ? <Button type="primary" onClick={() => this.toIgnore(0)}>忽略</Button> : null}
              {hasAuth(configPermission.baseConfig) ? <Button type="primary" onClick={this.toConfig}>配置</Button> : null}
            </div>
          </div>
          <Table className={isAllCanCheck ? '' : 'disabled-select-table'} rowKey="waitingConfigId" columns={columns} rowSelection={rowSelection} dataSource={list ? list.items : []} pagination={false} />
          {
            list.totalRecords > 0 &&
            <Pagination current={pagingParameter.currentPage} pageSize={pagingParameter.pageSize} className="table-pagination" onChange={this.pageChange}
              onShowSizeChange={this.pageChange} defaultPageSize={10}
              total={list ? list.totalRecords : 0} showTotal={(total) => `共 ${total} 条数据`}
              showSizeChanger={true} showQuickJumper={true} />
          }
        </section>
        <ModalConfirm props={AlertInfo} />
      </article>
    )
  }
}
const mapStateToProps = ({ baseSetting }) => {
  return {
    osList: baseSetting.osList
  }
}
const BaseSettingManage = Form.create()(BaseSettingManageForm)
export default withRouter(connect(mapStateToProps)(BaseSettingManage))
