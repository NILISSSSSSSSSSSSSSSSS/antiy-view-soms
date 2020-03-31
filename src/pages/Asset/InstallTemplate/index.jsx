
import React, { Component } from 'react'
import { connect } from 'dva'
import {  Form, Button, Table, Pagination, message } from 'antd'
import { transliteration, emptyFilter, analysisUrl, TooltipFn, getAfterDeletePage, removeCriteria, evalSearchParam, cacheSearchParameter  } from '@/utils/common'
import ModalConfirm from '@/components/common/ModalConfirm'
import moment from 'moment'
import { debounce } from 'lodash'
import api from '@/services/api'
import { Link } from 'dva/router'
import hasAuth from '@/utils/auth'
import { assetsPermission } from '@a/permission'
import { Search } from '@c/index'

@Form.create()
class InstallTemplate extends Component{
  constructor (props){
    super(props)
    this.state = {
      columns: [
        {
          title: '模板名称',
          dataIndex: 'name',
          key: 'name',
          render: (text)=>TooltipFn(text)
        }, {
          title: '模板编号',
          dataIndex: 'numberCode',
          key: 'numberCode',
          render: (text)=>TooltipFn(text)
        }, {
          title: '适用资产类型',
          dataIndex: 'categoryModel',
          key: 'categoryModel',
          render: (text)=>{
            switch(text){
              case 1 : return '计算设备'
              case 2 : return '网络设备'
              case 3 : return '安全设备'
              case 4 : return '存储设备'
              case 5 : return '其他设备'
              default: break
            }
          }
        }, {
          title: '状态',
          dataIndex: 'currentStatus',
          key: 'currentStatus',
          render: (text)=>{
            switch(text){
              case 1 : return '待审核'
              case 2 : return '拒绝'
              case 3 : return '启用'
              case 4 : return '禁用'
              default: break
            }
          }
        }, {
          title: '适用操作系统',
          dataIndex: 'operationSystemName',
          key: 'operationSystemName',
          render: (text)=>TooltipFn(text)
        }, {
          title: '创建时间',
          dataIndex: 'gmtCreate',
          key: 'gmtCreate',
          render: (text)=>{
            const v = text ? <span className="tabTimeCss">{text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : emptyFilter(text)}</span> : null
            return <span className="tabTimeCss">{TooltipFn(v)}</span>
          }
        }, {
          title: '操作',
          dataIndex: 'operate',
          key: 'operate',
          render: (text, record)=> {
            return (
              <div className="operate-wrap">
                { record.currentStatus !== 1 && hasAuth(assetsPermission.ASSET_ZJMB_EDIT) && record.waitingTask &&  record.currentStatus === 2 &&
                <Link to={`/asset/installtemplate/edit?stringId=${transliteration(record.stringId)}&taskId=${transliteration(record.waitingTask && record.waitingTask.taskId)}`}>编辑</Link> }
                { record.currentStatus !== 1 && record.currentStatus !== 2 && hasAuth(assetsPermission.ASSET_ZJMB_EDIT) &&
                <Link to={`/asset/installtemplate/edit?stringId=${transliteration(record.stringId)}&taskId=${null}`}>编辑</Link> }
                { record.currentStatus === 2 && hasAuth(assetsPermission.ASSET_ZJMB_DEL) && record.waitingTask && <a onClick={ ()=> this.setState({ templateDeleteModal: true, record })}>删除</a>}
                { record.currentStatus === 4 && hasAuth(assetsPermission.ASSET_ZJMB_UPDOWN) &&  <a onClick={ ()=> this.setState({ templateUpDownModal: true, record })}>启用</a>}
                { record.currentStatus === 3 && hasAuth(assetsPermission.ASSET_ZJMB_UPDOWN) &&  <a onClick={ ()=> this.setState({ templateUpDownModal: true, record })}>禁用</a>}
                {/* 判断登录人和执行人是否是同一个（是同一个后端才会返回waitingTask） */}
                { record.currentStatus === 1 && hasAuth(assetsPermission.ASSET_ZJMB_CHECK) && record.waitingTask !== null &&
                <Link to={`/asset/installtemplate/detail?stringId=${transliteration(record.stringId)}&type=check`}>审核</Link>}
                { hasAuth(assetsPermission.ASSET_ZJMB_VIEW) &&
                <Link to={`/asset/installtemplate/detail?stringId=${transliteration(record.stringId)}`}>查看</Link>}
              </div>
            )
          }
        }
      ],
      templateDeleteModal: false,
      templateUpDownModal: false,
      checkModal: false,
      OperatingSystemArr: [],
      rowsSelectedList: [],
      selectedRowKeys: [],
      statusArr: [],
      search: {},
      body: {},
      pagingParameter: {
        currentPage: 1,
        pageSize: 10
      }

    }
  }

  // 装机列表数据
  getList = debounce(values => {
    const { pagingParameter } = this.state
    const { location, history } = this.props
    cacheSearchParameter([{
      page: pagingParameter,
      parameter: values
    }], history, 0)
    api.queryInstallTempList({ ...pagingParameter, ...values, stringId: location && analysisUrl(location.search).id }).then( res => {
      this.setState({
        body: res.body
      })
    })
  }, 300)

  // 下拉框适用系统
  getInstallTemplateOs = () =>{
    api.listInstallTemplateOs().then(res=>{
      this.setState({
        OperatingSystemArr: res.body
      })
    })
  }
  //下拉框状态
  getStatus = () => {
    api.listInstallTemplateStatus().then(res=>{
      this.setState({
        statusArr: res.body
      })
    })
  }
  //翻页
  pageChange = (currentPage, pageSize) => {
    let { search } = this.state
    this.setState({
      pagingParameter: {
        currentPage,
        pageSize
      }
    }, () => this.getList({ ...search }))
  }
  //是否弹出批量删除
  isAlertDel = () => {
    const { selectedRowKeys } = this.state
    if(selectedRowKeys.length){
      this.setState({
        templateDeleteModal: true
      })
    }else{
      message.warn('请勾选数据')
    }
  }
  //删除（批量和单独）
  clearData = () =>{
    let { record, selectedRowKeys, body, pagingParameter, rowsSelectedList } = this.state
    // 数据id
    let idArr = record ? [record.stringId] : selectedRowKeys
    let _rowsSelectedList = rowsSelectedList.filter(item => selectedRowKeys.includes(item.stringId))
    // 工作流id
    let processInstanceIdsArr = record ? [record.waitingTask ? record.waitingTask.processInstanceId : ''] :
      _rowsSelectedList.map( item => { return( item.waitingTask ? item.waitingTask.processInstanceId : '' )})
    api.installTemplateDeleteById({ ids: idArr, processInstanceIds: processInstanceIdsArr }).then( res => {
      this.getList()
      message.info(res.body)
    })
    let { currentPage, pageSize } = pagingParameter
    currentPage = getAfterDeletePage(body.totalRecords - selectedRowKeys.length, currentPage, pageSize)
    this.setState({
      record: undefined,
      rowsSelectedList: [],
      selectedRowKeys: [],
      templateDeleteModal: false,
      pagingParameter: {
        currentPage,
        pageSize
      }
    })
  }
  //启用禁用调接口
  onIsUpDown = () =>{
    const { record, search, pagingParameter } = this.state
    let updateStatus = record.currentStatus === 3 ? 4 : 3
    api.installTemplateUpDate({ updateStatus, isUpdateStatus: 0, stringId: record.stringId }).then( res => {
      message.info(record.currentStatus === 4 ? '模板已启用' : '模板已禁用')
      this.setState({
        templateUpDownModal: false
      })
      this.getList({ ...search, ...pagingParameter })
    })
  }
  //查询
  onSubmit = (values) => {
    !values.name && delete values.name
    !values.numberCode && delete values.numberCode
    !values.operationSystem && delete values.operationSystem
    !values.currentStatus && delete values.currentStatus
    this.setState({
      search: values,
      pagingParameter: {
        currentPage: 1,
        pageSize: 10
      }
    }, () => this.getList(values))
  }
  //重置
  handleReset = () =>{
    removeCriteria(false, this.props.history)
    this.setState({
      search: {},
      selectedRowKeys: [],
      rowsSelectedList: [],
      pagingParameter: {
        currentPage: 1,
        pageSize: 10
      }
    }, this.getList)
  }
  render (){
    let { columns, body, templateDeleteModal, templateUpDownModal, selectedRowKeys, pagingParameter, record, OperatingSystemArr, statusArr, rowsSelectedList } = this.state
    let list = []
    let totalRecords = 0
    if(body && body.items){
      list = body.items
      totalRecords = body.totalRecords
    }
    let defaultFields = [
      { label: '模板名称', key: 'name', placeholder: '请输入', type: 'input', maxLength: 80 },
      { label: '模板编号', key: 'numberCode', placeholder: '请输入', type: 'input', maxLength: 80 },
      { label: '状态', key: 'currentStatus', placeholder: '请选择', type: 'select', data: statusArr, config: { name: 'statusName', value: 'statusCode' } },
      { label: '适用操作系统', key: 'operationSystem', placeholder: '请选择', type: 'select', data: OperatingSystemArr, config: { name: 'osName', value: 'osCode' } }
    ]
    const templateDelete = {
      visible: templateDeleteModal,
      children: (<p className='model-text'>是否删除模板?</p>),
      onOk: this.clearData,
      onCancel: () => this.setState({ templateDeleteModal: false })
    }
    const templateUpDown = {
      visible: templateUpDownModal,
      children: (<p className='model-text'>是否{ record && record.currentStatus === 3 ? '禁用' : '启用'}模板?</p>),
      onOk: this.onIsUpDown,
      onCancel: () => this.setState({ templateUpDownModal: false })
    }
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
      //分页批量操作
        let _rowsSelectedList = [...rowsSelectedList,  ...selectedRows]//把之前选中的和当前选中的列表放一起
        const tmpArr = _rowsSelectedList.map(e=>JSON.stringify(e))//把列表每项转成字符串
        _rowsSelectedList = [ ...new Set(tmpArr) ].map(e=>JSON.parse(e)).filter(e=>e.currentStatus === 2)// new set()数组去重再转数组，再过滤掉currentStatus=2的
        this.setState({
          selectedRowKeys,
          rowsSelectedList: _rowsSelectedList
        })
      },
      getCheckboxProps: record => (
        { disabled: record.currentStatus !== 2 || !record.waitingTask,
          name: record.name
        })
    }
    return(
      <div className='main-table-content'>
        <div className="search-bar">
          <Search defaultFields={defaultFields} onSubmit={this.onSubmit} onReset={this.handleReset} wrappedComponentRef={search => { search && (this.searchForm = search.props.form) }}/>
        </div>
        <div className="table-wrap">
          <div className="table-btn">
            <div className="left-btn">
              { hasAuth(assetsPermission.ASSET_ZJMB_ADD) && <Button type="primary" style={{ width: 'auto' }} onClick={ () =>this.props.history.push('/asset/installtemplate/create')}>创建</Button> }
            </div>
            <div className="right-btn">
              { hasAuth(assetsPermission.ASSET_ZJMB_DEL) &&  <Button type="primary" style={{ width: 'auto' }} onClick={this.isAlertDel}>删除</Button> }
            </div>
          </div>
          <Table rowKey="stringId" columns={columns} dataSource={list}  rowSelection={rowSelection}  pagination={false}></Table>
          {
            totalRecords > 0 &&
               <Pagination
                 current={pagingParameter.currentPage}
                 className="table-pagination"
                 defaultPageSize={10}
                 pageSize={pagingParameter.pageSize}
                 onChange={this.pageChange}
                 showSizeChanger = {totalRecords > 10}
                 onShowSizeChange={ this.pageChange}
                 total={totalRecords}
                 showTotal={(total) => `共 ${total} 条数据`}
                 showQuickJumper={true} />
          }

        </div>
        <ModalConfirm props={templateDelete}/>
        <ModalConfirm props={templateUpDown}/>
      </div>
    )
  }
  componentDidMount (){
    const { list } = evalSearchParam(this, {}, false) || {}
    if(list && list[0]){
      const { page, parameter } = list[0]
      this.searchForm.setFieldsValue( parameter )
      this.setState({
        pagingParameter: page
      }, ()=>this.getList(parameter))
    }else{
      this.getList()
    }
    this.getInstallTemplateOs()
    this.getStatus()
  }
}

export default connect()(InstallTemplate)
