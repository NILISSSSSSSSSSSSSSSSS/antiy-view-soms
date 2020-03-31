
import { Component } from 'react'
import { connect } from 'dva'
import { Button, Form, Table, Select, Pagination, Input, Tooltip } from 'antd'
import { transliteration, emptyFilter, cache, TooltipFn } from '@/utils/common'
import PigeonholeTab from '@/components/common/PigeonholeTab'
import moment from 'moment'
import { Link } from 'dva/router'
import hasAuth from '@/utils/auth'
import api from '@/services/api'
import Status from '@/components/common/Status'
import { logAlarmPermission } from '@a/permission'
import { analysisUrl } from '@u/common'
import '../style.less'

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
  {  value: '1', name: '紧急' },
  { value: '2', name: '重要' },
  { value: '3', name: '次要' },
  { value: '4', name: '提示' }
]
class HistoryAlarm extends Component{
  constructor (props){
    super(props)
    this.state = {
      columns: [
        {
          title: '告警名称',
          dataIndex: 'alarmName',
          key: 'alarmName',
          render: (text)=>{
            return(
              <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
                <span>{emptyFilter(text)}</span>
              </Tooltip>
            )
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
          render: (v) => {
            switch (v){
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
            return(
              <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
                <span>{emptyFilter(text)}</span>
              </Tooltip>
            )
          }
        }, {
          title: '告警原因',
          dataIndex: 'reason',
          key: 'reason',
          render: (text, record )=>{
            let paramText = text
            if( record.alarmType === 1){
              paramText = '资产存在漏洞，更多原因请点击[查看]'
            }
            if( record.alarmType === 3){
              paramText = '资产存在配置异常，更多原因请点击[查看]'
            }
            return(
              <Tooltip title={paramText} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
                <span>{paramText}</span>
              </Tooltip>
            )
          }
        }, {
          title: '工单编号',
          dataIndex: 'workOrderCode',
          key: 'workOrderCode',
          width: 180,
          render: (text, record)=>{
            if(text.length > 1)
              return(
                <div className="operate-wrap">
                  {text}
                  {/* <Link to={`/workOrder/detail?workOrderId=${transliteration(record.workOrderId)}`}>{text}</Link> */}
                </div>
              )
            else
              return(<span>{emptyFilter(text)}</span>)
          }
        }, {
          title: '告警清除时间',
          dataIndex: 'clearTime',
          key: 'clearTime',
          width: 180,
          render: (text)=>{
            const v = text ? <span className="tabTimeCss">{text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : emptyFilter(text)}</span> : null
            return <span className="tabTimeCss">{emptyFilter(v)}</span>
          }
        }, {
          title: '清除人员',
          dataIndex: 'clearUserName',
          key: 'clearUserName'
        }, {
          title: '当前状态',
          dataIndex: 'currentStatus',
          width: 120,
          key: 'currentStatus',
          render: (text)=>{
            return(<span>{ ['', '未确认已清除', '已确认已清除'][text] }</span>)
          }
        }, {
          title: '操作',
          width: 150,
          render: (text, scope)=>{
            return (
              <div className="operate-wrap">
                {
                  hasAuth(logAlarmPermission.alarmMManageHistoryView) ?
                    <Link to={`/logalarm/alarm/manage/details?id=${transliteration(scope.assetId)}&key=2&asset=${transliteration(scope.stringId)}`}>查看</Link> : null
                }
              </div>
            )
          }
        }],
      historyList: this.props.historyList,
      search: {},
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
      this.getAlarmList({ currentPage: 1, pageSize: 10 } )
    }
  }
  render (){
    let { historyList, columns, pagingParameter } = this.state
    let { getFieldDecorator } = this.props.form
    let list = []
    if(historyList){
      list = historyList.items
    }
    return(
      <div>
        <PigeonholeTab onChange={ (value) =>this.pigeonholeChange(value)}/>
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
                    className="filter-form-item"
                    getPopupContainer={triggerNode => triggerNode.parentNode}
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
                getFieldDecorator('alarmNumber'
                )(
                  <Input autoComplete="off" className="filter-form-item" placeholder="请输入" maxLength={30}/>
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
          <div className="alarm-table-box">
            <Table className="alarm-table" rowKey="stringId"  columns={columns} dataSource={list} pagination={false}></Table>
          </div>
          {
            historyList.totalRecords > 0 &&
            <Pagination
              current={pagingParameter.currentPage}
              className="table-pagination"
              defaultPageSize={10}
              pageSize={pagingParameter.pageSize}
              onChange={this.pageChange}
              showSizeChanger ={historyList.totalRecords > 10 && true}
              onShowSizeChange={ this.pageChange}
              total={historyList.totalRecords ? historyList.totalRecords : 0}
              showTotal={(total) => `共 ${total} 条数据`}
              showQuickJumper={true} />
          }
        </div>
      </div>
    )
  }
    //获取列表数据
    getAlarmList = (param) =>{

      api.getAlarmManagerHistoryList( param ).then((data)=>{
        this.setState({
          historyList: data.body
        }) })

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
      }], this.props.history, 1, '1')
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
    //提交表单
    onSubmit = (e) => {
      e.preventDefault()
      let { pagingParameter } = this.state
      this.props.form.validateFields(['alarmName', 'alarmLevel', 'alarmType', 'alarmNumber', 'alarmSource'], (err, values) => {
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
          }], this.props.history, 2, '2')
          this.setState({
            search: values,
            pagingParameter: {
              currentPage: 1,
              pageSize: pagingParameter.pageSize
            }
          }, ()=>{
            this.getAlarmList({ currentPage: 1, ...values })
          })
        }
      })
    }
  //重置表单信息
  handleReset = ()=>{
    this.props.form.resetFields()
    this.setState({ search: {}, pagingParameter: { currentPage: 1, pageSize: 10 }, selectedRowKeys: [], rowsSelectedList: [] }, () => this.getAlarmList({ currentPage: 1, pageSize: 10 }))
  }
  pigeonholeChange = (value) => {
    this.setState({
      flag: value
    })
  }
}
const mapStateToProps = ({ Alarms }) => {
  return {
    historyList: Alarms.historyList
  }
}
const HistoryAlarms = Form.create()(HistoryAlarm)

export default connect(mapStateToProps)(HistoryAlarms)
