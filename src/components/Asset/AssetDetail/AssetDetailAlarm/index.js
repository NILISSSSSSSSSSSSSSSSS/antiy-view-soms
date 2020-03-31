import React, { Component } from 'react'
import { Button, Form, Radio, Table } from 'antd'
import moment from 'moment'
import api from '@/services/api'
import { Link } from 'dva/router'
import DateRange from '@/components/common/DateRange'
import Tooltip from '@/components/common/CustomTooltip'
import { transliteration, emptyFilter, TooltipFn } from '@/utils/common'
import './index.less'
const { Group } = Radio
const { Item } = Form
const pageSize = 10
const tabKey = 'assetAlarm'
@Form.create()
export default class AssetDetailAlarm extends Component {
  constructor (props){
    super(props)
    const showType = sessionStorage.getItem(tabKey)
    this.state = {
      showType: showType || 'current', // 只能为 current 或者 history
      primaryKey: props.assetId, // 资产id
      current: {
        filter: {},
        items: [],
        currentPage: 1,
        pageSize,
        totalRecords: 0
      },
      history: {
        filter: {},
        items: [],
        currentPage: 1,
        pageSize,
        totalRecords: 0
      }
    }
  }
  componentDidMount () {
    const { showType } = this.state
    this[`${showType}List`]({}, 1, pageSize)
  }

  // 表的类型选择
  tableChange = (e) => {
    const showType = e.target.value
    this.setState({
      showType,
      [showType]: {
        items: [],
        currentPage: 1,
        pageSize,
        totalRecords: 0
      } }, ()=>{
      this[`${showType}List`]({}, 1, pageSize)
    })
    sessionStorage.setItem(tabKey, showType)
    this.timeResetKey = (this.timeResetKey || 0) + 1
  }
  // 获取当前列表
  currentList = (filter = {}, currentPage, pageSize) => {
    const { primaryKey, showType } = this.state
    api.getCurrentAlarmQueryId({ primaryKey, ...filter, currentPage, pageSize }).then((res)=>{
      if(res && res.head && res.head.code === '200'){
        this.setState({ [showType]: { ...this.state[showType], ...res.body } })
      }
    })
  }
  // 获取历史
  historyList = (filter = {}, currentPage, pageSize) => {
    const { primaryKey, showType } = this.state
    api.getHistoryAlarmQueryId({ primaryKey, ...filter, currentPage, pageSize }).then((res)=>{
      if(res && res.head && res.head.code === '200'){
        this.setState({ [showType]: { ...this.state[showType], ...res.body } })
      }
    })
  }
  onSearch = () => {
    const showType = this.state.showType
    this.props.form.validateFields((err, values)=>{
      const [ beginTime, endTime ] = values.time || []
      const filter = { beginTime: beginTime ? beginTime.valueOf() : null, endTime: endTime ? endTime.valueOf() : null }
      this.setState({
        showType,
        [showType]: {
          filter,
          items: [],
          currentPage: 1,
          pageSize,
          totalRecords: 0
        } })
      this[`${showType}List`](filter, 1, pageSize)
    })
  }
  pageChange = (currentPage, pageSize) => {
    const { showType } = this.state
    const data = this.state[showType]
    this.setState({ [showType]: { ...data, currentPage, pageSize } })
    this[`${showType}List`](data.filter, 1, pageSize)
  }
  goTo = (url) => {
    window.open(url)
  }
  render () {
    const { form: { getFieldDecorator } } = this.props
    const { showType } = this.state
    const data = this.state[showType]
    const columns = [
      {
        title: '告警名称',
        key: 'alarmName',
        dataIndex: 'alarmName',
        render: text=><Tooltip title={text}>{text}</Tooltip>
      }, {
        title: '告警编号',
        dataIndex: 'alarmNumber',
        key: 'alarmNumber',
        render: (text) => {
          return(<span>{emptyFilter(TooltipFn(text))}</span>)
        }
      }, {
        title: '告警等级',
        key: 'alarmLevel',
        dataIndex: 'alarmLevel',
        render: (alarmLevel)=>{
          switch(alarmLevel){
            case 1 : return('紧急')
            case 2 : return('重要')
            case 3 : return('次要')
            case 4 : return('提示')
            default: break

          }
        }
      }, {
        title: '原因',
        key: 'reason',
        dataIndex: 'reason',
        render: (text, record)=>{
          if(record.alarmType === 1){
            const _text = '资产存在漏洞，更多原因请点击[查看]'
            return <Tooltip title={_text}>{_text}</Tooltip>
          }else if(record.alarmType === 3){
            const _text = '资产存在配置异常，更多原因请点击[查看]'
            return <Tooltip title={_text}>{_text}</Tooltip>
          }else{
            return <Tooltip title={text}>{text}</Tooltip>
          }
        }
      }, {
        title: '状态',
        key: 'currentStatus',
        dataIndex: 'currentStatus',
        render: (alarmType)=>{
          const { showType } = this.state
          switch(alarmType){
            case 1 : return(showType === 'current' ? '未确认未清除' : '未确认已清除')
            case 2 : return(showType === 'current' ? '已确认未清除' : '已确认已清除')
            case 3 : return(showType === 'current' ? '' : '已恢复')
            default: break
          }
        }
      }, {
        title: '告警时间',
        key: 'createTime',
        dataIndex: 'createTime',
        width: 180,
        render: timestamp => timestamp <= 0 ? '' : moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
      }, {
        title: '操作',
        key: 'operate',
        width: 120,
        render: (record, scope) => (
          <div className="operate-wrap">
            <a onClick={()=>this.goTo(
              showType === 'current' ?
                `/#/logalarm/alarm/manage?stringId=${transliteration(scope.stringId)}`
                : `/#/logalarm/alarm/manage/details?id=${transliteration(scope.assetId)}&key=2&asset=${transliteration(scope.stringId)}`
            )}>查看</a>
          </div>
        )
      }
    ]
    return (
      <div className="main-table-content asset-detail-alarm table-wrap">
        <div className="table-btn radio-group-filter">
          <Group value={showType} onChange={this.tableChange}>
            <Radio.Button value="current">当前</Radio.Button>
            <Radio.Button value="history">历史</Radio.Button>
          </Group>
          <Form layout="inline">
            <Item label="选择时间" >
              {getFieldDecorator('time', {
              })(
                <DateRange format="YYYY-MM-DD" placeholder={['开始日期', '结束日期']} allowClear resetKey={this.timeResetKey}/>
              )}
            </Item>
            <Item>
              <Button type="primary" onClick={this.onSearch}>查询</Button>
            </Item>
          </Form>
        </div>
        <Table
          rowKey="stringId"
          columns={columns}
          dataSource={data.items}
          pagination={{
            current: data.currentPage,
            pageSize: data.pageSize,
            showSizeChanger: true,
            onShowSizeChange: this.pageChange,
            showQuickJumper: true,
            showTotal: () => `共 ${data.totalRecords ? data.totalRecords : 0} 条数据`,
            total: data.totalRecords || 0,
            onChange: this.pageChange
          }}
        />
      </div>
    )
  }
}
