
import { Component, Fragment } from 'react'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import { Form, Table, Pagination, Button, message } from 'antd'
import { Link } from 'react-router-dom'
import { transliteration, TooltipFn, analysisUrl, evalSearchParam, cacheSearchParameter } from '@/utils/common'
import { configPermission } from '@a/permission'
import api from '@/services/api'
import hasAuth from '@/utils/auth'
import { BASE_SOURCE, OPERATE_TYPE, BASE_STATUS_CHECK, BASE_STATUS_REINFORCE, CONFIG_STATUS } from '@a/js/enume'
import { Search, CommonModal } from '@c/index'
import OperateModal from '@/components/BaseSetting/OperateModal'
import './style.less'
import { map } from 'lodash'
const { Item } = Form
class BaseSettingManageForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      page: this.props.match.params.page,  // 当前页面类型，核查/加固
      osList: this.props.osList || [],     // 操作系统列表
      list: {},
      areaId: '',
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      alertShow: false,
      saveItem: {},
      seekTerm: {},                        // 搜索条件
      operateModalVisible: false,          // 操作modal
      thisOperateStatus: undefined,
      thisWaitingConfigId: undefined,
      thisTaskId: undefined,
      thisAssetId: undefined,
      thisBaselineTemplateId: undefined,
      areaIdList: [],
      Visible: false, //配置扫描弹框
      checkItem: {},
      selectedRowKeys: [], //选中的数据
      selectedRows: []
    }
  }
  componentDidMount () {
    // 获取列表
    let { list } = evalSearchParam(this, {}, false) || {}
    if((analysisUrl(this.props.location.search).isScan)){
      this.searchForm.setFieldsValue({ sourceList: [5] })
    } else if ((analysisUrl(this.props.location.search).isAsset)) {
      this.searchForm.setFieldsValue({ sourceList: [2] })
    }
    else {
      this.searchForm.setFieldsValue({ sourceList: [] })
    }
    if (list) {
      this.searchForm.setFieldsValue({ ...list[0].parameter })
      this.setState({ pagingParameter: list[0].page, seekTerm: list[0].parameter }, () => this.getList())
    } else {
      this.getList(false)
    }
    // 获取筛选项列表数据
    this.props.dispatch({ type: 'baseSetting/getConfigOsList', payload: { name: '操作系统' } })
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    //使用同一页面
    if (this.props.match.params.page !== nextProps.match.params.page) {
      sessionStorage.removeItem('searchParameter')
      this.searchForm.resetFields()
      const { page } = nextProps.match.params
      this.setState({
        seekTerm: {},
        pagingParameter: {
          pageSize: 10,
          currentPage: 1
        },
        list: {},
        page
      }, () => {
        this.getList()
      })
    }
    if (nextProps.osList && JSON.stringify(this.props.osList) !== JSON.stringify(nextProps.osList)) {
      this.setState({
        osList: nextProps.osList
      })
    }
  }
  getList = (isCache = true) => {
    const { page, seekTerm, pagingParameter } = this.state
    const postParms = {
      ...seekTerm,
      ...pagingParameter,
      assetId: analysisUrl(this.props.location.search).id
    }
    if (isCache) {
      cacheSearchParameter([{
        page: pagingParameter,
        parameter: { ...seekTerm }
      }], this.props.history)
    }
    const businessId = analysisUrl(this.props.location.search).businessId
    businessId && businessId.split(',').length > 1 ? postParms.businessIds = businessId.split(',') : postParms.businessId = businessId
    //工作台核查跳转
    if (analysisUrl(this.props.location.search).check)
      postParms.configStatusList = [2, 5, 6, 4]
    //工作台加固跳转
    else if (analysisUrl(this.props.location.search).fix)
      postParms.configStatusList = [7, 10, 11, 9]
    api[page === 'enforcement' ? 'getCheckList' : 'getReinforceList'](postParms).then(response => {
      if (postParms.currentPage !== 1 && response.body.items === null) {
        this.setState({
          pagingParameter: {
            currentPage: postParms.currentPage - 1,
            pageSize: postParms.pageSize
          }
        })
        this.getList(false)
      } else {
        this.setState({
          list: response.body
        })
      }
    })
  }
  setModalVisible = (modalVisible, type) => {
    this.setState({
      [modalVisible]: type
    })
  }
  // 提交表单，执行查询
  handleSubmit = values => {
    const { configStatusList } = values
    let list = []
    if (configStatusList) {
      values.configStatusList.forEach(item => {
        if (Array.isArray(item)) {
          list = list.concat(item)
        } else {
          list.push(item)
        }
      })
    }
    values.configStatusList = list
    this.setState({
      pagingParameter: {
        pageSize: this.state.pagingParameter.pageSize,
        currentPage: 1
      },
      seekTerm: values,
      pageIndex: 1
    }, () => {
      this.getList()
    })
  }
  //查询条件重置
  handleReset = () => {
    sessionStorage.removeItem('searchParameter')
    this.props.form.resetFields()
    //重置查询条件后，重新查询页面数据
    this.setState({
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      seekTerm: {}
    }, () => {
      this.getList()
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
      this.getList()
    })
  }
  checkOperateIt = record => {
    let { page } = this.props.match.params
    this.setState({
      selectedRowKeys: []
    })
    if(record.configStatus === 7 && page === 'validation'){
      //加固界面 来源为配置扫描的时候选择阻断入网的操作
      api.entryOperation({ assetIds: [record.assetId] }).then(res => {
        if(res.body){
          this.setModalVisible('Visible', true)
          this.setState({
            checkItem: record
          })
        }else{
          this.operateIt(record)
        }
      })
    }else{
      this.operateIt(record)
    }
  }
  // 操作
  operateIt = record => {
    const { configStatus, waitingConfigId, waitingTaskReponse, areaId, assetId, templateId } = record
    const { taskId } = waitingTaskReponse
    const userId = sessionStorage.getItem('id')
    // 认领任务
    api.recieveTask({
      taskId,
      userId
    }).then(response => {
      this.setState({
        thisOperateStatus: configStatus,
        thisWaitingConfigId: waitingConfigId,
        thisTaskId: taskId,
        thisAssetId: [assetId],
        thisBaselineTemplateId: templateId,
        areaIdList: [areaId]
      }, () => {
        this.setModalVisible('operateModalVisible', true)
      })
    })
  }
  //操作按钮渲染
  getWorkOrderBtn = (record) => {
    let operateText = ''
    if (record.configStatus === CONFIG_STATUS.waitCheck && hasAuth(configPermission.baseCheck)) {                         // 当状态为待核查，操作为“核查”
      operateText = '核查'
    } else if (record.configStatus === CONFIG_STATUS.inCheck) {                                                           // 当状态为核查中，无对应操作
      operateText = ''
    } else if (record.configStatus === CONFIG_STATUS.checkWaitConfirm && hasAuth(configPermission.baseCheckHandle)) {     // 当状态为核查待确认，操作为“处理”
      operateText = '处理'
    } else if (record.configStatus === CONFIG_STATUS.checkFailed && hasAuth(configPermission.baseCheckHandle)) {          // 当状态为核查失败，操作为“处理”
      operateText = '处理'
    } else if (record.configStatus === CONFIG_STATUS.checkFailedByManual && hasAuth(configPermission.baseCheckHandle)) {  // 当状态为核查失败(人工核查)，操作为“处理”
      operateText = '处理'
    } else if (record.configStatus === CONFIG_STATUS.waitFasten && hasAuth(configPermission.baseFixed)) {                 // 当状态为待加固，操作为“加固”
      operateText = '加固'
    } else if (record.configStatus === CONFIG_STATUS.inFasten) {                                                          // 当状态为加固中，无对应操作
      operateText = ''
    } else if (record.configStatus === CONFIG_STATUS.fastenWaitConfirm && hasAuth(configPermission.baseFixedHandle)) {    // 当状态为加固待确认，操作为“处理”
      operateText = '处理'
    } else if (record.configStatus === CONFIG_STATUS.fastenFailed && hasAuth(configPermission.baseFixedHandle)) {         // 当状态为加固失败，操作为“处理”
      operateText = '处理'
    } else if (record.configStatus === CONFIG_STATUS.fastenFailedByManual && hasAuth(configPermission.baseFixedHandle)) { // 当状态为加固失败(人工加固)，操作为“处理”
      operateText = '处理'
    }
    return (
      <Fragment>
        {
          <Fragment>
            <Link to={`/basesetting/manage/setting?waitingConfigId=${transliteration(record.waitingConfigId)}&tepId=${record.templateId}`}>查看</Link>
            {operateText && <a onClick={() => this.checkOperateIt(record)}>{operateText}</a>}
          </Fragment>
        }
      </Fragment>
    )
  }
  //阻断入网
  render () {
    const {
      list,
      pagingParameter,
      operateModalVisible,
      thisOperateStatus,
      osList,
      thisWaitingConfigId,
      thisTaskId,
      thisAssetId,
      thisBaselineTemplateId,
      areaIdList,
      Visible,
      selectedRowKeys,
      selectedRows
    } = this.state
    const { page } = this.props.match.params
    const columns = [{
      title: '资产名称',
      dataIndex: 'assetName',
      key: 'assetName',
      width: '14%',
      isShow: true,
      render: text => TooltipFn(text)
    }, {
      title: '资产编号',
      dataIndex: 'assetNumber',
      key: 'assetNumber',
      width: '12%',
      isShow: true,
      render: text => TooltipFn(text)
    },
    {
      title: 'IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: '10%',
      isShow: true,
      render: text => TooltipFn(text)
    }, {
      title: 'MAC',
      dataIndex: 'macAddress',
      key: 'macAddress',
      width: '10%',
      isShow: true,
      render: text => TooltipFn(text)
    }, {
      title: '配置来源',
      dataIndex: 'sourceName',
      width: '10%',
      key: 'sourceName',
      isShow: true,
      render: text => TooltipFn(text)
    }, {
      title: '适用系统',
      dataIndex: 'systemName',
      key: 'systemName',
      width: '10%',
      isShow: true,
      render: text => TooltipFn(text)
    },
    {
      title: '状态',
      dataIndex: 'statusName',
      key: 'statusName',
      width: '10%',
      isShow: true,
      render: text => TooltipFn(text)
    },
    {
      title: '执行方式',
      dataIndex: 'checkTypeName',
      key: 'checkTypeName',
      width: '10%',
      isShow: true,
      render: text => TooltipFn(text)
    },
    {
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      width: '14%',
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
      { type: 'select', multiple: true, label: '配置来源', placeholder: '全部', key: 'sourceList', data: BASE_SOURCE },
      { type: 'select', multiple: true, label: '状态', placeholder: '全部', key: 'configStatusList', data: page === 'enforcement' ? BASE_STATUS_CHECK : BASE_STATUS_REINFORCE },
      { type: 'select', multiple: false, label: '执行方式', placeholder: '请输入', key: 'checkType', data: OPERATE_TYPE },
      { type: 'treeSelect', multiple: true, placeholder: '全部', label: '适用系统', key: 'systemList', data: osList, config: { name: 'name', value: 'node' }, treeDefaultExpandAll: false }
    ]
    const formLayout = {
      labelCol: {
        span: 14
      },
      wrapperCol: {
        span: 8
      }
    }
    this.formFields = [
      {
        type: 'radioGroup', key: 'updateStatus', name: '是否要在加固前阻断入网',
        defaultValue: '',
        rules: [{ required: true }],
        onChange: this.agreeChange,
        data: [{ label: '是', value: '2' }, { label: '否', value: '1' }]
      }
    ]
    //勾选事件
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys,
          selectedRows
        })
      },
      getCheckboxProps: record => ({
        disabled: ((this.props.match.params.page === 'validation' && record.configStatus !== 7) || (this.props.match.params.page === 'enforcement' && record.configStatus !== 2)),
        status: record.configStatus
      })
    }
    return (
      <article className="main-table-content">
        <div className="search-bar">
          <Search showExpand={false} wrappedComponentRef={search => { search && (this.searchForm = search.props.form) }} defaultFields={defaultFields} fieldList={fields} onSubmit={this.handleSubmit} onReset={this.handleReset} />
        </div>
        <section className="table-wrap table-style">
          {
            hasAuth(configPermission.baseFixed) && page === 'validation' ? <div className="table-btn">
              <div className="left-btn">
                <Button type="primary" onClick={this.checkAlert}>批量加固</Button>
              </div>
            </div> : null}
          {
            hasAuth(configPermission.baseCheck) && page === 'enforcement' ? <div className="table-btn">
              <div className="left-btn">
                <Button type="primary" onClick={this.checkAlert}>批量核查</Button>
              </div>
            </div> : null}
          <Table rowKey="waitingConfigId" columns={columns} dataSource={list ? list.items : []} pagination={false} rowSelection={rowSelection}/>
          {
            list.totalRecords > 0 &&
            <Pagination current={pagingParameter.currentPage} pageSize={pagingParameter.pageSize} className="table-pagination" onChange={this.pageChange}
              onShowSizeChange={this.pageChange} defaultPageSize={10}
              total={list ? list.totalRecords : 0} showTotal={(total) => `共 ${total} 条数据`}
              showSizeChanger={true} showQuickJumper={true} />
          }
        </section>
        <OperateModal visible={operateModalVisible}
          state={page === 'enforcement' ? 1 : 2}
          areaId={areaIdList}
          status={thisOperateStatus}
          waitingConfigId={thisWaitingConfigId}
          taskId={thisTaskId}
          assetId={thisAssetId}
          baselineTemplateId={thisBaselineTemplateId}
          tabData={selectedRows}
          isBatch = { selectedRowKeys.length ? true : false }
          onClose={() => { this.setModalVisible('operateModalVisible', false) }}
          getList={this.getList}
        >
        </OperateModal>
        <CommonModal
          type="form"
          visible={Visible}
          title=""
          width={400}
          value={this.updateStatus}
          fields={this.formFields}
          column={1}
          FormItem={Item}
          formLayout={formLayout}
          onClose={() => { this.setState({ Visible: false }) }}
        >
        </CommonModal>
      </article>
    )
  }
  //更新入网状态
  updateStatus = (values)=>{
    let { checkItem } = this.state
    let param = { entrySource: 'CONFIG_SCAN', assetActivityRequests: [{ stringId: checkItem.assetId }] }
    if(values.updateStatus === '2'){
      api.updateEntryStatus(param).then(res=>{
        console.log(res)
      }, ()=>this.operateIt(checkItem))
    }else{
      this.operateIt(checkItem)
    }
  }
  //
  checkAlert = ()=>{
    let { selectedRowKeys } = this.state
    if (!selectedRowKeys.length)
      message.warn('请先选择要核查的项！')
    else
      this.batchOperateIt()
  }
  batchOperateIt = ()=>{
    const { selectedRows } = this.state
    let taskIds = selectedRows.map(item=>item.waitingTaskReponse.taskId)
    const userId = sessionStorage.getItem('id')
    // 认领任务
    api.claimTaskBatch({
      taskIds,
      userId
    }).then(response => {
      this.setState({
        thisOperateStatus: map(selectedRows, 'configStatus')[0],
        thisWaitingConfigId: map(selectedRows, 'waitingConfigId').join(','),
        thisTaskId: taskIds,
        thisAssetId: map(selectedRows, 'assetId'),
        thisBaselineTemplateId: map(selectedRows, 'templateId'),
        areaIdList: map(selectedRows, 'areaId')
      }, () => {
        this.setModalVisible('operateModalVisible', true)
      })
    })
  }
}
const mapStateToProps = ({ baseSetting }) => {
  return {
    osList: baseSetting.osList
  }
}
const BaseSettingManage = Form.create()(BaseSettingManageForm)
export default withRouter(connect(mapStateToProps)(BaseSettingManage))
