
import { Component, Fragment } from 'react'
import { connect } from 'dva'
import { Button, Row, Col, Form, Table, Select, Pagination, Input, Steps, message, Tooltip, Icon, Checkbox, Popover } from 'antd'
import { Link } from 'dva/router'
import Api from '@/services/api'
import Audit from '@/components/Log/Alert/audit'
import moment from 'moment'
import hasAuth from '@/utils/auth'
import { cloneDeep } from 'lodash'
import ExportModal from '@/components/common/ExportModal'
import { transliteration, emptyFilter, evalSearchParam, cacheSearchParameter, TooltipFn } from '@/utils/common'
import DateRange from '@/components/common/DateRange'
import PigeonholeTab from '@/components/common/PigeonholeTab'
import { logAlarmPermission } from '@a/permission'

const { Item } = Form
const Option = Select.Option
const Step = Steps.Step
const businessArray = [
  { value: '', name: '全部' },
  { value: '1010', name: '资产管理' },
  { value: '1020', name: '配置管理' },
  // { value: '1030', name: '漏洞管理' },
  { value: '1031', name: '突发漏洞管理' },
  { value: '1032', name: '日常漏洞管理' },
  // { value: '1040', name: '补丁管理' },
  { value: '1041', name: '日常补丁管理' },
  { value: '1042', name: '应急补丁管理' },
  { value: '1050', name: '日志管理' },
  { value: '1060', name: '告警管理' },
  { value: '1070', name: '安全设备管理' },
  { value: '1080', name: '日常安全管理' },
  { value: '1090', name: '系统管理' }
]
class LogManager extends Component{
  constructor (props){
    super(props)
    this.state = {
      list: this.props.list,
      pagingParameter: {
        currentPage: 1,
        pageSize: 10
      },
      selectedRowKeys: [],
      rowsSelectedList: [],
      userList: [],
      statusBar: null,
      statusBarData: [],
      stepsState: null,
      sortedInfo: null,
      isOpen: false,
      columnsFixed: {
        title: () => {
          const columns = this.state.columns.slice(7)
          const content = (
            <div className="table-header-select">
              {columns.map(item => {
                if (item.key !== 'order' && item.key !== 'operate') {
                  return (<Checkbox key={item.key} checked={item.isShow} onClick={() => this.tableHeaderChange(item)}>{item.title}</Checkbox>)
                } else {
                  return null
                }
              })}
            </div>
          )
          return (
            <Fragment>操作 <span className="custom-column">
              <Popover getPopupContainer={triggerNode => triggerNode.parentNode} placement="bottomRight" trigger="click" content={content}>
                <Icon type="setting" className="icons" />
              </Popover>
            </span>
            </Fragment>)
        },
        isShow: true,
        key: 'operate',
        width: '150px',
        render: (record)=>{
          return (
            <div className="operate-wrap">
              { hasAuth(logAlarmPermission.logManageOperateAudit) && <a onClick={()=>this.audit([record.stringId])}>审计</a> }
              { hasAuth(logAlarmPermission.logManageOperateView) && <Link to={`/logalarm/log/manage/details?stringId=${transliteration(record.stringId)}`} >查看</Link> }
            </div>
          )
        }
      },
      columns: [
        {
          title: '日志记录时间',
          dataIndex: 'createTime',
          key: 'createTime',
          sorter: true,
          isShow: true,
          width: 160,
          render: (text)=>{
            const v = text ? <span className="tabTimeCss">{text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : emptyFilter(text)}</span> : null
            return <span className="tabTimeCss">{emptyFilter(v)}</span>
          }
        }, {
          title: '操作用户',
          dataIndex: 'oprName',
          key: 'oprName',
          isShow: true,
          render: (text)=>{
            return(
              <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
                { text }
              </Tooltip>
            )
          }
        }, {
          title: '操作人IP',
          dataIndex: 'oprIp',
          key: 'oprIp',
          width: 150,
          isShow: true,
          render: (text) =>{
            return(
              <span>{emptyFilter(text)}</span>
            )
          }
        }, {
          title: '操作对象',
          dataIndex: 'manageObjBusCode',
          key: 'manageObjBusCode',
          isShow: true,
          render: (text)=>TooltipFn(text)
          // render: (text, record)=>{
          //   let url
          //   let moduleIdArr = ['1', '2', '3', '4', '10', '24' ]
          //   if((record.moduleId === '1' || record.moduleId === '10') || (record.moduleId === '2' || record.moduleId === '10')){
          //     // 硬件详情
          //     url = `/asset/manage/detail/?id=${transliteration(record.manageObjId)}`
          //   }
          //   if( record.moduleId === '24' ){
          //     url = `/asset/installtemplate/detail?id=${transliteration(record.manageObjId)}`
          //   }
          //   if(record.moduleId === '3'){
          //     // 漏洞详情
          //     url = `/bugpatch/bugmanage/information/detail?stringId=${transliteration(record.manageObjId)}`
          //   }
          //   if(record.moduleId === '4'){
          //     // 补丁详情
          //     url = `/bugpatch/patchmanage/install/detail?id=${transliteration(record.manageObjId)}`
          //   }
          //   if(record.moduleId === '25'){
          //     // 端口管理列表
          //     url = `/system/setsystem/port?id=${transliteration(record.manageObjId)}`
          //   }
          //   if(record.moduleId === '26'){
          //     // 网段管理列表
          //     url = `/system/setsystem/port?id=${transliteration(record.manageObjId)}`
          //   }
          //   return(
          //     <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
          //       { (moduleIdArr.includes(record.moduleId) && text ) ? <div className="operate-wrap"> <Link to={url}>{text}</Link> </div> : <span>{emptyFilter(text)}</span> }
          //     </Tooltip>
          //   )
          // }
        }, {
          title: '安全事件',
          dataIndex: 'incident',
          key: 'incident',
          isShow: true,
          render: (text)=>{
            return(
              <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
                { text }
              </Tooltip>
            )
          }
        }, {
          title: '审计人',
          dataIndex: 'auditorName',
          key: 'auditorName',
          isShow: true,
          render: (text)=>{
            return(
              <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
                { emptyFilter(text) }
              </Tooltip>
            )
          }
        }, {
          title: '审计时间',
          dataIndex: 'auditTime',
          key: 'auditTime',
          width: 160,
          isShow: true,
          sorter: true,
          render: (text) => {
            const v = text ? <span className="tabTimeCss">{text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : emptyFilter(text)}</span> : null
            return <span className="tabTimeCss">{emptyFilter(v)}</span>
          }
        }, {
          title: '资产名称',
          dataIndex: 'AssetName',
          key: 'AssetName',
          isShow: false
        }, {
          title: '资产类型',
          dataIndex: 'assetType',
          key: 'assetType',
          isShow: false
        }, {
          title: '区域范围',
          dataIndex: 'areaName',
          key: 'areaName',
          isShow: false
        }, {
          title: '重要程度',
          dataIndex: 'importance',
          key: 'importance',
          isShow: false
        }],
      //保留搜索条件
      search: {},
      writesTime: {},
      auditsTime: {},
      //导出框显示
      exportVisible: false,
      //导出查询条件
      searchValues: {},
      //导出数据总数
      exportTotal: 0
    }
  }

  componentDidMount (){
    console.log(this.props)
    //解析保留的数据
    const { list } = evalSearchParam(this) || {}
    //判断是否存有数据
    if(sessionStorage.searchParameter && list){
      const { page, parameter } = list[0]
      this.setState({
        pagingParameter: page,
        search: parameter,
        sortedInfo: parameter.sortedInfo
      })
      this.getLogHandleList({ currentPage: page.currentPage, pageSize: page.pageSize, ...parameter })
    }else{
      this.getLogHandleList({ currentPage: 1, pageSize: 10 })
    }
    Api.getAllStatusUserInAreaOfCurrentUser().then((data)=>{
      data.body.unshift({ name: '全部', stringId: '0' })
      this.setState({
        userList: data.body
      })
    })
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    if(JSON.stringify(this.props.list) !== JSON.stringify(nextProps.list))
      this.setState({ list: nextProps.list })
  }
  tableHeaderChange = (column) => {
    const columns = cloneDeep(this.state.columns)
    columns.forEach(item => {
      if (item.key === column.key) item.isShow = !item.isShow
    })
    this.setState({ columns })
  }

  render (){
    let { list, pagingParameter, selectedRowKeys, userList, stepsState, statusBarData, exportVisible, searchValues, exportTotal, isOpen } = this.state
    const columns = this.state.columns.filter(item => item.isShow)
    columns.push(this.state.columnsFixed)
    let { getFieldDecorator } = this.props.form
    //监听版本是：基础版，开发版，专业版
    const licenseVersion = JSON.parse(sessionStorage.getItem('licenseVersion'))
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys,
          rowsSelectedList: selectedRows
        })
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User',
        name: record.name
      })
    }
    //如果licenseVersion 2||3 时当前且第5项为 业务流程
    if ((licenseVersion === 2 || licenseVersion === 3) && columns[5].key === 'auditorName') {
      columns.splice(5, 0, {
        title: '业务流程',
        dataIndex: 'moduleId',
        key: 'moduleId',
        width: 140,
        render: (text)=>{
          if( text.includes('1010') ){ return text = '资产管理' }
          if( text.includes('1020') ){ return text = '配置管理' }
          if( text.includes('1031') ){ return text = '突发漏洞管理' }
          if( text.includes('1032') ){ return text = '日常漏洞管理' }
          if( text.includes('1041') ){ return text = '日常补丁管理' }
          if( text.includes('1042') ){ return text = '应急补丁管理' }
          if( text.includes('1050') ){ return text = '日志管理' }
          if( text.includes('1060') ){ return text = '告警管理' }
          if( text.includes('1070') ){ return text = '安全设备管理' }
          if( text.includes('1080') ){ return text = '日常安全管理' }
          if( text.includes('1090') ){ return text = '系统管理' }
          if( text.includes('1100') ){ return text = '报表管理' }
          // if( text.includes('1110') ){ return text = '预警管理'}
          // if( text.includes('1120') ){ return text = '过程评估'}
        }
      })
    }
    return(
      <article className="main-table-content log-manager-list">
        <PigeonholeTab onChange={ (value) =>this.pigeonholeChange(value)}/>
        <div className="search-bar">
          <Form className="filter-form new-flex-layout" layout="inline" onSubmit={(e) => this.postData(e, 'search')} onReset={this.handleReset}>
            <Item label="操作人IP">
              {
                getFieldDecorator('oprIp')(
                  <Input autoComplete="off"  className="filter-form-item" placeholder="请输入" maxLength={60}/>
                )
              }
            </Item>
            <Item label="操作对象" className='item-separation'>
              {
                getFieldDecorator('manageObjBusCode', { rules: [ { max: 30, message: '请输入30个字符以内' }] })(
                  <Input autoComplete="off" className="filter-form-item" placeholder="请输入" />
                )
              }
            </Item>
            <Item className='search-item'>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button type="primary" ghost htmlType='reset'>重置</Button>
              <span className="show-ondition" onClick={() => this.setState({ isOpen: !isOpen })}>
                <Icon type={isOpen ? 'up' : 'down'} />
                {isOpen ? '收起' : '展开'}
              </span>
            </Item>
            {
              isOpen &&
             <Fragment>

               <Item  label="记录时间" className='item-date-container'>
                 {
                   getFieldDecorator('writeTime')(
                     <DateRange format="YYYY-MM-DD" placeholder={['开始日期', '结束日期']} resetKey={this.resetKey} allowClear/>
                   )
                 }
               </Item>
               <Item  label="操作用户" className='item-separation'>
                 {
                   getFieldDecorator('oprId', { initialValue: '0' } )(
                     <Select
                       showSearch
                       filterOption={(input, option) =>
                         option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                       }
                       optionFilterProp="children"
                       getPopupContainer={triggerNode => triggerNode.parentNode}
                       className="filter-form-item" placeholder="全部" >
                       {
                         userList.map((item, index)=>{
                           return(<Option value={item.stringId} key={index + 'oprId'}>{item.name}</Option>)
                         })
                       }
                     </Select>
                   )
                 }
               </Item>
               <Item label="是否审计">
                 {
                   getFieldDecorator('isAudit', { initialValue: '' } )(
                     <Select
                       className="filter-form-item"
                       placeholder="全部"
                       getPopupContainer={triggerNode => triggerNode.parentNode} >
                       <Option value={''} >全部</Option>
                       <Option value={1} >已审计</Option>
                       <Option value={0} >未审计</Option>
                     </Select>
                   )
                 }
               </Item>
               <Item label="审计时间" className='item-date-container'>
                 {
                   getFieldDecorator('auditTime')(
                     <DateRange format="YYYY-MM-DD" placeholder={['开始日期', '结束日期']} resetKey={this.resetKey} allowClear/>
                   )
                 }
               </Item>
               <Item label="审计人" className='item-separation'>
                 {
                   getFieldDecorator('auditorId', { initialValue: '0' })(
                     <Select
                       showSearch
                       getPopupContainer={triggerNode => triggerNode.parentNode}
                       filterOption={(input, option) =>
                         option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                       }
                       optionFilterProp="children"
                       className="filter-form-item" placeholder="全部" >
                       {
                         userList.map((item, index)=>{
                           return(<Option value={item.stringId} key={index + 'auditorId'}>{item.name}</Option>)
                         })
                       }
                     </Select>
                   )
                 }
               </Item>
               <Item label="资产名称">
                 {
                   getFieldDecorator('assetName', { initialValue: '' } )(
                     <Select
                       className="filter-form-item"
                       placeholder="全部"
                       getPopupContainer={triggerNode => triggerNode.parentNode} >
                       <Option value={''} >全部</Option>
                       <Option value={1} >已审计</Option>
                       <Option value={0} >未审计</Option>
                     </Select>
                   )
                 }
               </Item>
               <Item label="资产类型">
                 {
                   getFieldDecorator('assetType', { initialValue: '' } )(
                     <Select
                       className="filter-form-item"
                       placeholder="全部"
                       getPopupContainer={triggerNode => triggerNode.parentNode} >
                       <Option value={''} >全部</Option>
                       <Option value={1} >已审计</Option>
                       <Option value={0} >未审计</Option>
                     </Select>
                   )
                 }
               </Item>
               <Item label="资产区域" className='item-separation'>
                 {
                   getFieldDecorator('assetArea', { initialValue: '' } )(
                     <Select
                       className="filter-form-item"
                       placeholder="全部"
                       getPopupContainer={triggerNode => triggerNode.parentNode} >
                       <Option value={''} >全部</Option>
                       <Option value={1} >已审计</Option>
                       <Option value={0} >未审计</Option>
                     </Select>
                   )
                 }
               </Item>
               <Item label="资产重要程度">
                 {
                   getFieldDecorator('assetImportLevel', { initialValue: '' } )(
                     <Select
                       className="filter-form-item"
                       placeholder="全部"
                       getPopupContainer={triggerNode => triggerNode.parentNode} >
                       <Option value={''} >全部</Option>
                       <Option value={1} >已审计</Option>
                       <Option value={0} >未审计</Option>
                     </Select>
                   )
                 }
               </Item>
               {
                 (licenseVersion === 2 || licenseVersion === 3) &&
                  <Item  label="业务流程" >
                    {
                      getFieldDecorator('moduleId', { initialValue: '' })(
                        <Select
                          className="filter-form-item"
                          // 暂时屏蔽掉通过业务流程对节点操作（无节点操作），只是暂时请勿删除
                          // onChange={this.businessChange}
                          getPopupContainer={triggerNode => triggerNode.parentNode}
                          placeholder="全部" >
                          {
                            businessArray.map((item, index)=>{
                              return(<Option value={item.value} key={index + 'business'} >{item.name}</Option>)
                            })
                          }
                        </Select>
                      )
                    }
                  </Item>
               }
             </Fragment>
            }
            {
              statusBarData.length !== 0  &&
                <Row>
                  <Col span={24}>
                    <Steps className="detail-step-horizontal" progressDot
                      current={stepsState} initial={1} >
                      {
                        statusBarData.map((item)=>{
                          return(<Step  key={Number(item.value)} title={item.name } onClick={()=>this.stepChage(item)}  />)
                        })
                      }
                    </Steps>
                  </Col>
                </Row>
            }
          </Form>
        </div>
        <div className="table-wrap">
          <div className="table-btn">
            <div className="left-btn">
              { hasAuth(logAlarmPermission.logManageOperateExport) && <Button type="primary" onClick={ (e)=>this.postData(e, 'load')}>导出</Button> }
            </div>
            <div className="right-btn">
              { hasAuth(logAlarmPermission.logManageOperateAudit) && <Button type="primary" style={{ margin: '0 20px' }} onClick={this.auditAll}>审计</Button> }
            </div>
          </div>
          <Table rowKey="stringId" rowSelection={rowSelection} columns={columns} dataSource={list.items} pagination={false} onChange={this.tableChange}></Table>
          {
            list.totalRecords > 0 &&
              <Pagination
                current={pagingParameter.currentPage}
                pageSize={pagingParameter.pageSize}
                className="table-pagination"
                defaultPageSize={10}
                onChange={this.pageChange}
                showSizeChanger ={list.totalRecords > 10}
                onShowSizeChange={ this.pageChange}
                total={list.totalRecords ? list.totalRecords : 0}  showTotal={(total) => `共 ${total} 条数据`} showQuickJumper={true} />
          }

        </div>
        <Audit auditAlert={this.childrens} success={this.uploadData} />
        {/* 导出 */}
        {
          exportVisible && <ExportModal
            exportModal={{
              exportVisible, //弹框显示
              searchValues, //搜索条件
              total: exportTotal, //数据总数
              threshold: 5000, //阈值
              url: '/api/v1/log/export/operation/logs' //下载地址
            }}
            handleCancelExport={() => this.setState({ exportVisible: false })} />
        }
      </article>
    )
  }
  //获取数据
  getLogHandleList = (params) =>{
    // 深拷贝不会改变 params
    const values = JSON.parse(JSON.stringify(params))
    delete values.currentPage
    delete values.pageSize
    delete params.sortedInfo
    cacheSearchParameter([{
      page: {
        currentPage: params.currentPage,
        pageSize: params.pageSize
      },
      parameter: {
        ...values,
        sortedInfo: this.state.sortedInfo
      }
    }], this.props.history, '0')
    this.props.dispatch({ type: 'Logs/getLogHandleList', payload: params  })
  }
  //组装提交数据
  postData=( e, param )=>{
    e.preventDefault()
    let { statusBar, pagingParameter, sortName } = this.state
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          search: values,
          pagingParameter: {
            currentPage: 1,
            pageSize: pagingParameter.pageSize
          }
        })
        if(values.writeTime) {
          values.createTimeBegin = ( values.writeTime[0]) && moment(values.writeTime[0].format('YYYY-MM-DD') + ' 00:00:00').valueOf()
        }
        if(values.writeTime) {
          values.createTimeEnd = ( values.writeTime[1]) && moment(values.writeTime[1].format('YYYY-MM-DD') + ' 23:59:59').valueOf()
        }
        if(values.auditTime) {
          values.auditTimeBegin = ( values.auditTime[0]) && moment(values.auditTime[0].format('YYYY-MM-DD') + ' 00:00:00').valueOf()
        }
        if(values.auditTime ) {
          values.auditTimeEnd = ( values.auditTime[1]) && moment(values.auditTime[1].format('YYYY-MM-DD') + ' 23:59:59').valueOf()
        }
        values.businessPhase = statusBar
        !values.businessPhase && delete values.businessPhase
        !values.moduleId && delete values.moduleId
        !values.isAudit && delete values.isAudit
        !values.manageObjBusCode && delete values.manageObjBusCode
        !values.oprIp && delete values.oprIp
        values.oprId === '0' && delete values.oprId
        values.auditorId === '0' && delete values.auditorId
        delete values.writeTime
        delete values.auditTime
        if(param === 'search'){
          //筛选
          this.getLogHandleList({ currentPage: 1, pageSize: pagingParameter.pageSize, ...values, sortName })
        }else{
          //文件导出时
          Api.getLogHandleList({ ...values, sortName }).then(data=>{
            const exportTotal = data.body.totalRecords
            if(exportTotal === 0 ){
              message.info('暂无数据导出')
              return false
            }else{
              this.setState({
                exportTotal,
                exportVisible: true,
                searchValues: values
              })
            }
          })
        }

      }
    })
  }
  //翻页
  pageChange = (currentPage, pageSize)=>{
    let { search, sortName } = this.state
    this.setState({
      pagingParameter: {
        currentPage,
        pageSize
      }
    })
    this.getLogHandleList({ currentPage, pageSize, ...search, sortName })
  }
  //审计成功调接口
  uploadData = (is = false)=>{
    let { pageSize } = this.state
    this.getLogHandleList({ currentPage: 1, pageSize })
    if(is)
      this.setState({ selectedRowKeys: [] })
  }

  //绑定子组件
  childrens=(now)=>{
    this.auditAlert = now
  }

  //审计
  audit =(now)=>{
    this.auditAlert.show(now)
  }
  auditAll=()=>{
    let { rowsSelectedList } = this.state
    if(!rowsSelectedList.length){
      message.info('未勾选数据！')
      return
    }else{
      this.auditAlert.show(rowsSelectedList.map(item=>item.stringId))
    }
  }
  stepChage=(item)=>{
    this.setState({ stepsState: item.key, statusBar: item.value })
  }
  //业务模型改变 显示状态栏改变
  businessChange=(v)=>{
    this.setState({ stepsState: null, statusBar: '' })
    let init = []
    switch ( v ){
      case '1':
        init = [{ key: 1, value: '1', name: '待登记' },
          { key: 2, value: '2', name: '待配置' },
          { key: 3, value: '3', name: '待验证' },
          { key: 4, value: '4', name: '待入网' },
          { key: 5, value: '5', name: '待检查' },
          { key: 6, value: '6', name: '已入网' },
          { key: 7, value: '7', name: '待退役' },
          { key: 8, value: '8', name: '已退役' },
          { key: 9, value: '9', name: '不予登记' }]
        break
      case '3':
        init = [{ key: 1, value: '1', name: '待登记' },
          { key: 2, value: '11', name: '待补丁分析' },
          { key: 3, value: '14', name: '可安装' },
          { key: 4, value: '15', name: '已注销' }]
        break
      case '2':
        init = [{ key: 1, value: '1', name: '待登记' },
          { key: 2, value: '10', name: '待漏洞分析' },
          { key: 3, value: '11', name: '待补丁分析' },
          { key: 4, value: '13', name: '可修复' }]
        break
      default:
        this.setState({ statusBar: null })
        break
    }
    this.setState({
      statusBarData: init
    })
  }
  //重置表单信息
  handleReset = ()=>{
    this.props.form.resetFields()
    this.resetKey = Math.random()
    this.setState({
      statusBar: null,
      statusBarData: [],
      stepsState: null,
      search: {},
      pagingParameter: {
        currentPage: 1,
        pageSize: 10
      },
      selectedRowKeys: [],
      rowsSelectedList: []
    })
    this.getLogHandleList({ currentPage: 1, pageSize: 10 })
  }
  //排序
  tableChange= (pagination, filters, sorter) =>{
    let sortName
    switch (sorter.columnKey) {
      case 'createTime':
        sortName = sorter.order === 'ascend' ? '1' : '0'
        break
      case 'auditTime':
        sortName = sorter.order === 'ascend' ? '3' : '2'
        break
      default:
        break
    }
    let { pagingParameter, search } = this.state
    this.setState({ sortedInfo: sorter, sortName })
    if(sortName){
      this.getLogHandleList({ sortName, currentPage: pagingParameter.currentPage, pageSize: pagingParameter.pageSize, ...search })
    }
  }
  pigeonholeChange = (value) => {
    this.setState({
      flag: value
    })
  }
}
const mapStateToProps = ({ Logs }) => {
  return {
    list: Logs.logHandleList
  }
}

const LogManagers = Form.create()(LogManager)

export default connect(mapStateToProps)(LogManagers)
