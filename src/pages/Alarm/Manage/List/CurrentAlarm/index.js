
import { Component } from 'react'
import { connect } from 'dva'
import { Button, Form, Table, Select, Pagination, Input, message } from 'antd'
import { transliteration, emptyFilter, cache, TooltipFn, analysisUrl } from '@/utils/common'
import moment from 'moment'
import '../style.less'
import api from '@/services/api'
import { Link } from 'dva/router'
import hasAuth from '@/utils/auth'
import Status from '@/components/common/Status'
import CreateWorkOrder from '@/components/Alarm/Alert/createWorkOrder'
import ChangeInfo from '@/components/Alarm/Alert/changeInfo'
import IsOkModal from '@/components/Alarm/Alert/isOkModal'
import ModalConfirm from '@/components/common/ModalConfirm'
import { logAlarmPermission } from '@a/permission'

const Item = Form.Item
const Option  =  Select.Option
const alarmTypeArray = [
  { value: '', name: '全部' },
  { value: '1', name: '漏洞告警' },
  { value: '2', name: '补丁告警' },
  { value: '3', name: '配置告警' },
  // { value: '4', name: '威胁事件告警' },
  {  value: '5',  name: '安全设备性能告警' },
  {  value: '6', name: '安全运维服务性能告警' },
  { value: '7', name: '异常资产告警' },
  { value: '8', name: '资产状态监控告警' }
]
const alarmGradeArray = [
  { value: '', name: '全部' },
  { value: '1', name: '紧急' },
  { value: '2', name: '重要' },
  { value: '3', name: '次要' },
  { value: '4', name: '提示' }
]
class CurrentAlarm extends Component{
  constructor (props){
    super(props)
    this.state = {
      columns: [
        {
          title: '告警名称',
          dataIndex: 'alarmName',
          key: 'alarmName',
          render: (text) => {
            return(<span>{emptyFilter(TooltipFn(text))}</span>)
          }
        }, {
          title: '告警编号',
          dataIndex: 'alarmNumber',
          key: 'alarmNumber',
          render: (text) => {
            return(<span>{emptyFilter(TooltipFn(text))}</span>)
          }
        }, {
          title: '告警级别',
          dataIndex: 'alarmLevel',
          key: 'alarmLevel',
          width: 100,
          render: (text) => {
            switch (text){
              case 1 : return <Status level={'1'}/>
              case 2 : return <Status level={'2'}/>
              case 3 : return <Status level={'3'}/>
              case 4 : return <Status level={'4'}/>
              default: break
            }
          }
        }, {
          title: '告警类型',
          dataIndex: 'alarmType',
          key: 'alarmType',
          width: 180,
          render: (text)=>{  return(<span>{ alarmTypeArray.map( (item) => { if(item.value.includes(text)){ return item.name } }) }</span>)  }
        }, {
          title: '告警来源',
          dataIndex: 'alarmSource',
          key: 'alarmSource',
          render: (text)=>{
            return(<span>{emptyFilter(TooltipFn(text))}</span>)
          }
        }, {
          title: '告警原因',
          dataIndex: 'reason',
          key: 'reason',
          render: (text, record )=>{
            let paramText = text
            //告警类型为漏洞
            if( record.alarmType === 1){
              paramText = '资产存在漏洞，更多原因请点击[查看]'
            }
            //告警类型为配置
            if( record.alarmType === 3){
              paramText = '资产存在配置异常，更多原因请点击[查看]'
            }
            return(<span>{emptyFilter(TooltipFn(paramText))}</span>)
          }
        }, {
          title: '工单编号',
          dataIndex: 'workOrderCode',
          key: 'workOrderCode',
          width: 180,
          render: (text, record)=>{
            if(text.length > 1)
              return(
                <div className="operate-wrap"> {text}
                  {/* <Link to={`/workOrder/detail?workOrderId=${transliteration(record.workOrderId)}`}>{text}</Link> */}
                </div>
              )
            else
              return(<span>{emptyFilter(text)}</span>)
          }
        }, {
          title: '告警创建时间',
          dataIndex: 'createTime',
          key: 'createTime',
          width: 160,
          render: (text)=>{
            const v = text ? <span className="tabTimeCss">{text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : emptyFilter(text)}</span> : null
            return <span className="tabTimeCss">{emptyFilter(v)}</span>
          }
        }, {
          title: '当前状态',
          dataIndex: 'currentStatus',
          width: 120,
          key: 'currentStatus',
          render: (text)=>{
            return(<span>{ ['', '未确认未清除', '已确认未清除'][text] }</span>)
          }
        }, {
          title: '操作',
          width: 260,
          render: (text, scope)=>{
            // 处置按钮做判断
            let paramLink = ''
            if(scope.alarmType === 1 ){
              // 漏洞修复管理页面
              paramLink = `/bugpatch/bugmanage/dispose?id=${transliteration(scope.assetId)}`
            }else if(scope.alarmType === 2){
              // 补丁信息管理页面
              paramLink = `/bugpatch/patchmanage/information?stringId=${transliteration(scope.assetId)}`
            }else if(scope.alarmType === 3){
              // 基准加固管理界面
              paramLink = `/basesetting/list/validation?businessId=${transliteration(scope.assetId)}`
            }else if(scope.alarmType === 7){
              // 未知/不明资产页面
              paramLink = `/asset/manage?status=2&id=${transliteration(scope.assetCode)}`
            }
            return (
              <div className="operate-wrap">
                { hasAuth(logAlarmPermission.alarmMManageCurrentView) &&
                <Link to={`/logalarm/alarm/manage/details?id=${transliteration(scope.assetId)}&key=1&asset=${transliteration(scope.stringId)}`}>查看</Link> }
                { hasAuth(logAlarmPermission.alarmMManageCurrentClear) && <a onClick={()=>this.setState({ clearModal: true, scope })}>清除</a> }
                { scope.currentStatus !== 2 && hasAuth(logAlarmPermission.alarmMManageCurrentUpdate) && <a onClick={()=>this.rowChangeInfo(scope)}>变更</a> }
                { scope.currentStatus === 2 && hasAuth(logAlarmPermission.alarmMManageCurrentBackConfirm) && <a onClick={()=>this.setState({ isAffirmModal: true, scope })}>反确认</a> }
                { scope.currentStatus !== 2 && hasAuth(logAlarmPermission.alarmMManageCurrentConfirm) && <a onClick={()=>this.setState({ isOkModal: true, scope })}>确认</a> }
                { (scope.alarmType === 1 || scope.alarmType === 2 || scope.alarmType === 3 ||  scope.alarmType === 7) &&  <Link to={paramLink}>处置</Link>}
              </div>
            )
          }
        }],
      nowList: this.props.nowList,
      isAffirmModal: false,
      isOkModal: false,
      clearModal: false,
      selectedRowKeys: [],
      search: {},
      resetPage: false, //判断是否点击重置
      pagingParameter: {
        currentPage: 1,
        pageSize: 10
      }
    }
  }
  componentDidMount (){
    this.props.children(this)
    //解析保留的数据
    const { list } = cache.evalSearchParam(this, {}, false) || {}
    //判断是否存有数据
    if(list && list[0]){
      const { page, parameter } = list[0]
      this.setState({
        pagingParameter: page,
        search: parameter
      }, () => {
        this.getAlarmList({ ...page, ...parameter } )
      })
    }else{
      this.getAlarmList({ currentPage: 1, pageSize: 10, primaryKey: this.props.stringId } )
    }
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    if(JSON.stringify(this.props.nowList) !== JSON.stringify(nextProps.nowList))
      this.setState({ nowList: nextProps.nowList })
  }
  render (){
    let { nowList, isAffirmModal, isOkModal, clearModal, pagingParameter, selectedRowKeys, columns, resetPage } = this.state
    let { getFieldDecorator } = this.props.form
    let initId = analysisUrl(this.props.history.location.search).stringId
    let list = []
    if(nowList){
      list = nowList.items
    }
    //复选框
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys,
          rowsSelectedList: selectedRows
        })
      }
    }
    // comfirm样的model参数
    const alertClear = {
      visible: clearModal,
      children: (<p className='model-text'>是否清除此告警?</p>),
      onOk: this.clearData,
      onCancel: () => this.setState({ clearModal: false })
    }
    const alertBatchIsAffirm = {
      visible: isAffirmModal,
      children: (<p className='model-text'>是否取消确认此告警?</p>),
      onOk: this.batchIsAffirmData,
      onCancel: () => this.setState({ isAffirmModal: false })
    }
    return(
      <div>
        <div className="search-bar">
          <Form className="filter-form new-flex-layout" layout="inline" onSubmit={this.onSubmit}>
            <Item label="告警名称">
              {
                getFieldDecorator('alarmName'
                )(
                  <Input autoComplete="off" className="filter-form-item" placeholder="请输入" maxLength={30} />
                )
              }
            </Item>
            <Item label="告警级别" className='item-separation'>
              {
                getFieldDecorator('alarmLevel',  { initialValue: '' }
                )(
                  <Select
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    className="filter-form-item"
                    placeholder="全部" >
                    {
                      alarmGradeArray.map((item, index)=>{
                        return (<Option value={item.value} key={index + 'auditRank'}>{item.name}</Option>)
                      })
                    }
                  </Select>
                )
              }
            </Item>
            <Item label="告警类型">
              {
                getFieldDecorator('alarmType',  { initialValue: '' }
                )(
                  <Select
                    className="filter-form-item"
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    placeholder="全部" >
                    {
                      alarmTypeArray.map((item, index)=>{
                        return ( <Option value={item.value} key={index + 'reportType'}>{item.name}</Option>)
                      })
                    }
                  </Select>
                )
              }
            </Item>
            <Item label="告警编号">
              {
                getFieldDecorator('alarmNumber', initId && resetPage === false ? { initialValue: list && list[0]  ? list[0].alarmNumber : '' } : { initialValue: '' }
                )(
                  <Input autoComplete="off" className="filter-form-item" placeholder="请输入"  maxLength={30}/>
                )
              }
            </Item>
            <Item label="告警来源" className='item-separation'>
              {
                getFieldDecorator('alarmSource'
                )(
                  <Input autoComplete="off" className="filter-form-item" placeholder="请输入" maxLength={30}/>
                )
              }
            </Item>
            <Item className="search-item">
              <Button type="primary" htmlType="submit">查询</Button>
              <Button type="primary" ghost htmlType='reset' onClick={this.handleReset}>重置</Button>
            </Item>
          </Form>
        </div>
        <div className="table-wrap">
          <div className="table-btn">
            <div className="left-btn">
              { hasAuth(logAlarmPermission.alarmMManageCurrentCreateWorkOrder) && <Button type="primary" onClick={this.setWorkOrder}>创建工单</Button> }
            </div>
            <div className="right-btn">
              { hasAuth(logAlarmPermission.alarmMManageCurrentConfirm) && <Button type="primary" onClick = {this.batchAffirm }>确认</Button> }
              { hasAuth(logAlarmPermission.alarmMManageCurrentBackConfirm) && <Button type="primary" onClick = {this.batchIsAffirm}>反确认</Button> }
              { hasAuth(logAlarmPermission.alarmMManageCurrentClear) && <Button type="primary" onClick={ this.batchClear} >清除</Button> }
            </div>
          </div>
          <div className="alarm-table-box">
            <Table className="alarm-table" rowKey="stringId" rowSelection={rowSelection} columns={columns} dataSource={list} pagination={false}></Table>
          </div>
          {
            nowList.totalRecords > 0 &&
          <Pagination
            current={pagingParameter.currentPage}
            className="table-pagination"
            defaultPageSize={10}
            pageSize={pagingParameter.pageSize}
            onChange={this.pageChange}
            showSizeChanger={nowList.totalRecords > 10 && true}
            onShowSizeChange={ this.pageChange}
            total={nowList.totalRecords ? nowList.totalRecords : 0}
            showTotal={(total) => `共 ${total} 条数据`}
            showQuickJumper={true} />
          }

          {/* 创建工单 */}
          <CreateWorkOrder
            childrens={(now)=>this.CreateWorkOrder = now }
            success={()=>{
              this.getAlarmList({ currentPage: 1, pageSize: pagingParameter.pageSize })
              this.setState({ selectedRowKeys: [], rowsSelectedList: [] })
            }} />
          {/* 变更 */}
          <ChangeInfo childrens={(now)=>this.ChangeInfo = now } success={()=>this.getAlarmList({ ...pagingParameter })} />
          {/* 确认 */}
          <IsOkModal visible ={ isOkModal }  onCancelModal ={ () =>this.setState({ isOkModal: false })} isOkSubmit={this.isOkSubmit} />
          {/* 清除 */}
          <ModalConfirm props={alertClear}/>
          {/* 反确认 */}
          <ModalConfirm props={alertBatchIsAffirm}/>
        </div>
      </div>
    )
  }
  //获取列表数据
  getAlarmList = (param) =>{
    api.getAlarmManagerNowList( param ).then((data)=>{
      this.setState({
        nowList: data.body
      }) })
  }
  //提交表单
  onSubmit = (e) => {
    e.preventDefault()
    let { pagingParameter } = this.state
    this.props.form.validateFields(['alarmName', 'alarmLevel', 'alarmType', 'alarmNumber`', 'alarmSource' ], (err, values) => {
      if (!err) {
        !values.alarmLevel && delete values.alarmLevel
        !values.alarmType && delete values.alarmType
        !values.alarmName && delete values.alarmName
        !values.alarmNumber && delete values.alarmNumber
        cache.cacheSearchParameter([{
          page: pagingParameter,
          parameter: {
            ...values
          }
        }], this.props.history, 0, '0')
        this.setState({
          search: values,
          pagingParameter: {
            currentPage: 1,
            pageSize: pagingParameter.pageSize
          }
        }, ()=>{
          this.getAlarmList({ currentPage: 1, pageSize: pagingParameter.pageSize, ...values })
        })
      }
    })
  }
  //重置表单信息
  handleReset = ()=>{
    this.props.form.resetFields()
    this.setState({
      search: {},
      resetPage: true,
      selectedRowKeys: [],
      rowsSelectedList: [],
      pagingParameter: {
        currentPage: 1,
        pageSize: 10
      }
    }, () => this.getAlarmList({ currentPage: 1, pageSize: 10 }))
  }
  //翻页
  pageChange = (currentPage, pageSize)=>{
    let { search } = this.state
    cache.cacheSearchParameter([{
      page: {
        currentPage,
        pageSize
      },
      parameter: {
        ...search
      }
    }], this.props.history, 0, '0')
    this.setState({
      selectedRowKeys: [],
      rowsSelectedList: [],
      pagingParameter: {
        currentPage,
        pageSize
      }

    }, () =>{
      this.getAlarmList({ currentPage, pageSize, ...search })
    })
  }
  //变更信息
  rowChangeInfo = (row)=>{
    this.ChangeInfo.show(row)
  }
  //批量创建工单
  setWorkOrder = () => {
    let { rowsSelectedList, selectedRowKeys } = this.state
    if(rowsSelectedList && rowsSelectedList.length !== 0){
      //被选中项
      const newSelectedRowKeys = rowsSelectedList.filter(item => (item.workOrderCode === '' )).map(item => (item.stringId))
      //被选中列表
      const newrowSelectedList = rowsSelectedList.filter(item => (item.workOrderCode === '' ))
      //应该被取消的选项数量
      let num = rowsSelectedList.length - newrowSelectedList.length
      //如果选择全都有工单项
      if(newSelectedRowKeys.length !== selectedRowKeys.length && newSelectedRowKeys.length === 0){
        this.setState({
          selectedRowKeys: [],
          rowsSelectedList: []
        })
        message.info('已有工单不可创建工单')
      }
      //如果有工单项，也有无工单项（新旧长度不同）
      if(newSelectedRowKeys.length !== selectedRowKeys.length && newSelectedRowKeys.length !== 0){
        this.setState({
          selectedRowKeys: newSelectedRowKeys,
          rowsSelectedList: newrowSelectedList
        })
        message.info(<span >已有工单不可创建工单, 已取消<span style={{ color: 'red', fontWeight: 'bold', fontSize: 20 }}>{num}</span>项</span>, 5)
        setTimeout(()=>this.CreateWorkOrder.show(rowsSelectedList), 500)
      }
      //如果选择项都没有工单
      if(newSelectedRowKeys.length !== 0 && newSelectedRowKeys.length === selectedRowKeys.length){
        this.CreateWorkOrder.show(rowsSelectedList)
      }
    } else{
      message.info('未勾选操作数据！')
    }
  }
  //批量确认
  batchAffirm = () =>{
    let { rowsSelectedList, selectedRowKeys } = this.state
    if( rowsSelectedList && rowsSelectedList.length !== 0){
      //被选中项
      const newSelectedRowKeys = rowsSelectedList.filter(item => (item.currentStatus === 1 )).map(item => (item.stringId))
      //被选中列表
      const newrowSelectedList = rowsSelectedList.filter(item => (item.currentStatus === 1 ))
      //应该被取消的选项数量
      let num = rowsSelectedList.length - newrowSelectedList.length
      if(newrowSelectedList.length === rowsSelectedList.length ){
        this.setState({
          isOkModal: true,
          rowsSelectedList: newrowSelectedList,
          selectedRowKeys: newSelectedRowKeys
        })
      }
      //当只有不可确认项时
      if(newrowSelectedList.length === 0 && selectedRowKeys.length !== newSelectedRowKeys.length){
        this.setState({
          rowsSelectedList: [],
          selectedRowKeys: []
        })
        message.info('已确认项无需确认')
      }
      //既有已确认也有未确认时
      if(newrowSelectedList.length !== rowsSelectedList.length && newrowSelectedList.length !== 0 ){
        message.info(<span >已确认项无需确认, 已取消<span style={{ color: 'red', fontWeight: 'bold', fontSize: 20 }}>{num}</span>项</span>, 5)
        this.setState({
          rowsSelectedList: newrowSelectedList,
          selectedRowKeys: newSelectedRowKeys
        })
        setTimeout(()=>this.setState({ isOkModal: true }), 500)
      }
    }else{
      message.info('未勾选操作数据！')
      return
    }
  }
  //确认数据
  isOkSubmit = (values) =>{
    let { pagingParameter, rowsSelectedList, scope } = this.state
    //scope在每项操作而不是在复选框操作
    scope ?
    //alarmConfirm： 确认传2，反确认传1
      api.postNowAlarmStatus({ alarmConfirm: 2, stringId: scope.stringId, ...values }).then((data)=>{
        if(data.head && data.head.code === '200'){
          message.success('操作成功！')
          this.getAlarmList({ ...pagingParameter })
          this.setState({ isOkModal: false, scope: undefined })
        }
      })
      :
      api.postNowAlarmStatusList({ alarmConfirm: 2, stringIds: rowsSelectedList.map((item)=>item.stringId), ...values }).then((data)=>{
        if(data.head && data.head.code === '200'){
          message.success('操作成功！')
          this.getAlarmList({ ...pagingParameter })
          this.setState({ selectedRowKeys: [],  rowsSelectedList: [], isOkModal: false })
        }
      })

  }
  //批量反确认
  batchIsAffirm = () => {
    let { rowsSelectedList, selectedRowKeys } = this.state
    //当只有未确认项
    if(rowsSelectedList && rowsSelectedList.length !== 0){
      //被选中项
      const newSelectedRowKeys = rowsSelectedList.filter(item => (item.currentStatus === 2 )).map(item => (item.stringId))
      //被选中列表
      const newrowSelectedList = rowsSelectedList.filter(item => (item.currentStatus === 2 ))
      //应该被取消的选项数量
      let num = rowsSelectedList.length - newrowSelectedList.length
      if(newrowSelectedList.length === rowsSelectedList.length ){
        this.setState({
          rowsSelectedList: newrowSelectedList,
          selectedRowKeys: newSelectedRowKeys,
          isAffirmModal: true
        })
      }
      //当只有不能反确认项时
      if(newrowSelectedList.length === 0 && selectedRowKeys.length !== newSelectedRowKeys.length){
        this.setState({
          rowsSelectedList: [],
          selectedRowKeys: []
        })
        message.info('未确认项无需反确认')
      }
      //既有已确认也有未确认时
      if(newrowSelectedList.length !== rowsSelectedList.length && newrowSelectedList.length !== 0 ){
        message.info(<span >未确认项无需反确认, 已取消<span style={{ color: 'red', fontWeight: 'bold', fontSize: 20 }}>{ num }</span>项</span>, 5)
        this.setState({
          rowsSelectedList: newrowSelectedList,
          selectedRowKeys: newSelectedRowKeys
        })
        setTimeout( () => this.setState({ isAffirmModal: true }), 500)
      }
    }else{
      message.info('未勾选操作数据！')
      return
    }
  }
  //反确认数据
  batchIsAffirmData = () => {
    let { pagingParameter, rowsSelectedList, scope } = this.state
    scope ?
    //alarmConfirm： 确认传2，反确认传1
      api.postNowAlarmStatus({ alarmConfirm: 1, stringId: scope.stringId }).then((data)=>{
        if(data.head && data.head.code === '200'){
          message.success('操作成功！')
          this.getAlarmList({ ...pagingParameter })
          this.setState({ isAffirmModal: false, scope: undefined  })
        }
      }) :
      api.postNowAlarmStatusList({ alarmConfirm: 1, stringIds: rowsSelectedList.map((item)=>item.stringId) }).then((data)=>{
        if(data.head && data.head.code === '200'){
          message.success('操作成功！')
          this.getAlarmList({ ...pagingParameter })
          this.setState({ selectedRowKeys: [], rowsSelectedList: [], isAffirmModal: false })
        }
      })
  }
  //批量清除
  batchClear =() =>{
    let { rowsSelectedList } =  this.state
    rowsSelectedList && rowsSelectedList.length ? this.setState({
      clearModal: true, rowsSelectedList
    }) : message.info('未勾选操作数据！')
  }
  //清除数据
  clearData = () => {
    let { pagingParameter, search, scope, rowsSelectedList } = this.state
    scope ?
      api.deleteNowAlarm({ stringId: scope.stringId }).then((data)=>{
        if(data.head && data.head.code === '200'){
          message.success('操作成功！')
          api.getAlarmManagerNowList({ ...search, ...pagingParameter }).then((data)=>{
            this.setState({
              nowList: data.body,
              scope: undefined,
              clearModal: false
            }, this.isReducePage)
          })
          this.getAlarmList({ ...pagingParameter })
        }
      }) :
      api.deleteNowAlarmList({ stringIds: rowsSelectedList.map(item=>item.stringId) }).then((data)=>{
        if(data.head && data.head.code === '200'){
          message.success('操作成功！')
          api.getAlarmManagerNowList({ ...search, ...pagingParameter }).then((data)=>{
            this.setState({
              selectedRowKeys: [],
              rowsSelectedList: [],
              clearModal: false,
              nowList: data.body
            }, this.isReducePage)
          })
        }
      })
  }
  //是否返回上一页(清除后可能清除的那一页没有数据）
  isReducePage = () =>{
    let { pagingParameter, search } = this.state
    if(this.state.nowList.items.length === 0){
      api.getAlarmManagerNowList({ ...search, currentPage: pagingParameter.currentPage - 1, pageSize: pagingParameter.pageSize }).then((data)=>{
        this.setState({
          nowList: data.body,
          currentPage: pagingParameter.currentPage - 1
        }) })
    }else{
      api.getAlarmManagerNowList({ ...search, ...pagingParameter }).then((data)=>{
        this.setState({
          nowList: data.body
        }) })
    }
  }
}

const mapStateToProps = ({ Alarms }) => {
  return {
    nowList: Alarms.nowList
  }
}
const CurrentAlarms = Form.create()(CurrentAlarm)

export default connect(mapStateToProps)(CurrentAlarms)
