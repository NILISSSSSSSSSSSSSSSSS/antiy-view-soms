import { PureComponent } from 'react'
import { Table, Form, message } from 'antd'
import './style.less'
import { connect } from 'dva'
import { analysisUrl, TooltipFn, evalSearchParam, cacheSearchParameter, removeCriteria } from '@/utils/common'
import api from '@/services/api'
import hasAuth from '@/utils/auth'
import { debounce, cloneDeep } from 'lodash'
import { withRouter } from 'dva/router'
import Search from '@/components/common/Search'
import ExportModal from '@/components/common/ExportModal'
import ModalConfirm from '@/components/common/ModalConfirm'
import { assetsPermission } from '@a/permission'
import { TableBtns } from '@c/index'
import { ACCESS_STATE } from '@a/js/enume'

//准入管理
@withRouter
@Form.create()
@connect(({ information }) => ({
  getGroupInfo: information.getGroupInfo
}))
class AssetAdmittance extends PureComponent{
  state = {
    PrefixCls: 'AssetAdmittance',
    showAlert: false, //弹框状态
    alertCont: {}, //弹窗内容
    //表单提交
    currentPage: 1,
    pageSize: 10,
    exportVisible: false, //导出
    admittanceBody: { items: [], totalRecords: '' },
    entryStatus: '', //下拉框选项
    multipleQuery: null,
    assetGroups: null,
    selectedRowKeys: [], //多选list
    selectedRows: [],  //多选数据
    statusChanging: false
  }

  // 提交表单，执行查询
  handleSubmit = values => {
    this.setState({
      currentPage: 1,
      entryStatus: values.entryStatus,
      multipleQuery: values.multipleQuery,
      assetGroups: values.assetGroups
    }, this.getAdmittanceList)
  }

  onReset=()=>{
    removeCriteria(false, this.props.history)
    this.setState({
      currentPage: 1,
      entryStatus: '',
      multipleQuery: null,
      assetGroups: null
    }, ()=>this.getAdmittanceList(true))
  }

  //操作
  alertOk =()=>{
    this.setState({ statusChanging: true })
    const { alertCont: { assetIds, status } } = this.state
    // ENTRY_MANAGE
    const params = {
      assetActivityRequests: assetIds,
      updateStatus: status,
      entrySource: 'ENTRY_MANAGE'
    }
    api.getAdmittanceAccess(params).then(response => {
      if(response && response.head && response.head.code === '200' && response.body === 1 ){
        // 重新查询列表
        this.setState({
          currentPage: 1,
          statusChanging: false
        }, this.getAdmittanceList)
        message.success('状态更新成功')
      }else {// 失败
        message.error('状态更新失败' + response.body)
      }
      this.handleCancel()
    })
  }

  //关闭弹窗
  handleCancel=()=>{
    this.setState({ showAlert: false })
  }

  //显示弹窗允许禁止
  showAlert =(cont, text, status)=>{
    const assetIds = !!cont ? [{ id: cont.stringId }] : cloneDeep(this.state.selectedRowKeys).map(item=>{
      return {
        id: item
      }
    })
    this.setState({
      showAlert: true,
      statusChanging: false,
      alertCont: {
        // assetName: cont.name,
        text: text,
        assetIds: assetIds,
        status: status
      } })
  }

  pageChange = (page, pageSize)=>{
    this.setState({
      currentPage: page,
      pageSize: pageSize
    }, this.getAdmittanceList)
  }

  //导出
  exportAdmittance = () => {
    const { entryStatus, multipleQuery, assetGroups } = this.state
    api.getAdmittanceList({
      currentPage: 1,
      pageSize: 10,
      entryStatus,
      multipleQuery,
      assetGroups
    }).then(res=>{
      if(res && res.head && res.head.code === '200'){
        //总数为0 ，测试要求前端判断
        if(res.body && res.body.totalRecords && res.body.totalRecords !== 0){
          this.setState({
            exportVisible: true,
            entryStatus
          })
        }else{
          message.error('暂无数据可导出!')
        }
      }
    })
  }

  jumpAdmittance=(stringId)=>{
    this.props.history.push(`/asset/admittance/hisAccessRecord?stringId=${stringId}`)
  }

  onSelectChange = (selectedRowKeys, selectedRows) => {
    const bodys = cloneDeep(this.state.admittanceBody)
    if (!bodys.items) return void (0)

    //禁用与初次点击行状态不一致的行
    if (selectedRows.length === 1) {
      bodys.items.filter(v => v.entryStatus !== selectedRows[0].entryStatus).forEach(t => t.disabled = true)
    } else if (selectedRows.length === 0) {
      //清空时还原，如果entryOperation被禁止则禁用复选
      bodys.items.forEach(v =>!v.entryOperation ? (v.disabled = true) : (v.disabled = false))
    } else { //全选
    }

    this.setState({ selectedRows, selectedRowKeys, admittanceBody: bodys })
  };

   //列表初始化
   itemsInit = (assetBody) => {
     if (!(assetBody && assetBody.items)) assetBody.items = []
     const isAllSelectShow = assetBody.items.every(item => item.entryStatus === assetBody.items[0].entryStatus)
     const Arr = assetBody.items.map(v=>v.stringId)
     const isDisabData = this.state.selectedRows[0]
     assetBody.items.forEach(item => {
       if(!item.entryOperation){
         item.disabled = true
       }
       if(!(isDisabData && Arr.includes(isDisabData.stringId))){
         return void(0)
       }
       if(item.entryStatus !== isDisabData.entryStatus){
         item.disabled = true
       }
     })
     this.setState({
       admittanceBody: assetBody,
       isAllSelectShow
     })
   }

  //**接口开始 */
  // 根据页面获取列表数据
  getAdmittanceList=debounce(iscache=>{
    const state = this.state
    const pagingParameter = {
      currentPage: state.currentPage,
      pageSize: state.pageSize
    }
    const parameter = {
      entryStatus: state.entryStatus,
      multipleQuery: state.multipleQuery,
      assetGroups: state.assetGroups
    }
    const payload = {
      ...pagingParameter,
      ...parameter
    }
    !iscache && cacheSearchParameter([{
      page: pagingParameter,
      parameter: parameter
    }], this.props.history, 0)
    api.getAdmittanceList(payload).then(res => {
      if (res && res.head && res.head.code === '200') {
        this.itemsInit(res.body)
      }
    })
  }, 300)

  render (){
    const {
      currentPage,
      pageSize,
      showAlert,
      alertCont,
      exportVisible,
      entryStatus,
      multipleQuery,
      assetGroups,
      PrefixCls,
      admittanceBody,
      selectedRowKeys,
      isAllSelectShow,
      statusChanging
    } = this.state

    const columns = [ {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      isShow: true,
      width: '26%',
      render: text=>TooltipFn(text)
    }, {
      title: '编号',
      dataIndex: 'number',
      key: 'number',
      isShow: true,
      width: '26%',
      render: text=>TooltipFn(text)
    }, {
      title: '资产组',
      dataIndex: 'assetGroupName',
      key: 'assetGroupName',
      isShow: true,
      width: '16%',
      render: text=>TooltipFn(text)
    }, {
      title: 'IP',
      dataIndex: 'ip',
      key: 'ip',
      isShow: true,
      width: '16%',
      render: text=>TooltipFn(text)
    }, {
      title: 'MAC',
      dataIndex: 'mac',
      key: 'mac',
      isShow: true,
      width: '16%',
      render: text=>TooltipFn(text)
    }, {
      title: '状态',
      width: '10%',
      dataIndex: 'entryStatus',
      key: 'entryStatus',
      isShow: true,
      render: (status)=>{
        if(status === 1){//待设置
          return (<span >允许</span>)
        }else if(status === 2){
          return (<span >禁止</span>)
        }
      }
    }, {
      title: '操作',
      isShow: true,
      key: 'operate',
      width: '16%',
      render: (text, recode)=>{
        let cont = null
        if(recode.entryStatus === 1){
          cont = hasAuth(assetsPermission.ASSET_ZR_ALLOW) ? <a style={{ marginRight: '10px' }} onClick={()=> this.showAlert(recode, '允许', 1)} >允许</a> : null
        }else if(recode.entryStatus === 2){
          cont = hasAuth(assetsPermission.ASSET_ZR_DISA) ? <a onClick={()=>this.showAlert(recode, '禁止', 2)}>禁止</a> : null
        }
        return (
          <span className="operate-wrap">
            <a onClick={()=>this.jumpAdmittance(recode.stringId)}>查看</a>
            {recode.entryOperation && cont}
          </span>
        )
      }
    }]

    const AlertInfo = {
      visible: showAlert,
      footer: !statusChanging,  //多个
      onOk: this.alertOk,
      onCancel: this.handleCancel,
      children: !statusChanging ? (<p className="model-text">确定将这些资产准入状态
        {/* <span className="alert-identifying">{alertCont.assetName}</span> */}
     设置为<span>"{alertCont.text}"？</span>
      </p>) : (<p className="model-text">准入状态变更中</p>)
    }
    const defaultFields = [
      { label: '综合查询', key: 'multipleQuery', type: 'input', placeholder: '名称/编号IP/MAC' },
      { label: '资产组', key: 'assetGroups', type: 'select', multiple: true, data: cloneDeep(this.props.getGroupInfo).map(v=>{[v.value, v.name] = [v.id, v.value]
        return v
      }) },
      { label: '状态', key: 'entryStatus', type: 'select', data: ACCESS_STATE }
    ]

    const leftBtns = [
      { label: '导出', onClick: this.exportAdmittance, check: () => hasAuth(assetsPermission.ASSET_ZR_EXPORT) }
    ]

    const rightBtns = [
      { label: '允许', onClick: ()=>this.showAlert(null, '允许', 1), check: () => hasAuth(assetsPermission.ASSET_ZR_EXPORT) },
      { label: '禁止', onClick: ()=>this.showAlert(null, '禁止', 1), check: () => hasAuth(assetsPermission.ASSET_ZR_EXPORT) }
    ]

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps: record => {
        return {
          disabled: record.disabled
        }
      }
    }

    return(
      <div className={`main-table-content ${PrefixCls}`}>
        {exportVisible && <ExportModal
          exportModal={{
            //弹框显示
            exportVisible,
            //搜索条件
            searchValues: { status: entryStatus, multipleQuery, assetGroups },
            //数据总数
            total: (admittanceBody || {}).totalRecords || 0,
            //阈值
            threshold: 5000,
            //下载地址
            url: '/api/v1/asset/entryControl/access/export'
          }}
          handleCancelExport={() => this.setState({ exportVisible: false })} />
        }
        <div className="search-bar">
          <Search defaultFields={ defaultFields }
            onSubmit={ this.handleSubmit }
            onReset={ this.onReset }
            wrappedComponentRef={search => { search && (this.searchForm = search.props.form) }}
          />
        </div>
        <section className="table-wrap">
          <TableBtns leftBtns={leftBtns} rightBtns={rightBtns} />
          <Table
            rowKey='stringId'
            className={`asset-table ${isAllSelectShow ? '' : 'disabled-select-table'}`}
            rowClassName={(record, index) => !record.entryOperation ? 'selection-hide' : ''}
            columns={columns}
            dataSource={admittanceBody.items}
            rowSelection={rowSelection}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              showQuickJumper: true,
              showSizeChanger: admittanceBody.totalRecords > 10,
              pageSizeOptions: ['10', '20', '30', '40'],
              onShowSizeChange: this.pageChange,
              showTotal: () => `共 ${admittanceBody.totalRecords} 条数据`,
              defaultCurrent: 1,
              defaultPageSize: 10,
              total: admittanceBody.totalRecords,
              onChange: this.pageChange
            }}
          />
        </section>

        <ModalConfirm props={AlertInfo}/>
      </div>
    )
  }

  async componentDidMount () {
    const { dispatch, location } = this.props
    const status = analysisUrl(location.search).status
    await dispatch({ type: 'information/getGroupInfo' }) // 资产组
    const { list } = evalSearchParam(this, {}, false) || {}
    if(list && list[0]){
      const { page, parameter } = list[0]
      if(!!status) parameter.entryStatus = status
      this.setState({
        ...page,
        ...parameter
      }, ()=>this.getAdmittanceList(true))
      this.searchForm.setFieldsValue( parameter )
    }else{
      this.setState({
        entryStatus: status || null
      }, ()=>this.getAdmittanceList(true))
    }
  }
}

export default AssetAdmittance

