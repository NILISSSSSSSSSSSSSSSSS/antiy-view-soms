import { Component } from 'react'
import { connect } from 'dva'
import { Form, Table, LocaleProvider, Pagination, Radio, Button, Tooltip } from 'antd'
import { Link, withRouter } from 'dva/router'
import zhCN from 'antd/lib/locale-provider/zh_CN'
import { transliteration, cacheSearchParameter, evalSearchParam, analysisUrl, timeStampToTime, TooltipFn, emptyFilter } from '@/utils/common'
import DateRange from '@/components/common/DateRange'
import Status from '@/components/common/Status'
import api from '@/services/api'
import moment from 'moment'
import hasAuth from '@/utils/auth'
import { logAlarmPermission } from '@a/permission'
import './style.less'
const { Group } = Radio
const { Item } = Form
// const { Option } = Select
// const auditRankArray = ['全部', '紧急', '重要', '次要', '提示']
// const auditRankArrayColor = [ '', '#FF426F', '#3B6CFF', '#05CC7F', '#F7CCC7']
// 只能查询最近多少天的数据
const recentlyDay = 182

class WarnDetail extends Component {
  constructor (props) {
    super(props)
    // 默认查询时间间隔, 7天
    this.initialTime = [moment().subtract(6, 'days'), moment()]
    this.state = {
      typeSet: 'current',
      currentBody: {},
      historyBody: {},
      assetId: analysisUrl(this.props.location.search).id,
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      beginTime: '',
      endTime: '',
      pageSize: 10,
      currentPage: 1,
      columns: [
        {
          title: '告警名称',
          dataIndex: 'alarmName',
          key: 'alarmName'
        }, {
          title: '告警编号',
          dataIndex: 'alarmNumber',
          key: 'alarmNumber',
          render: (text) => {
            return (<span>{emptyFilter(TooltipFn(text))}</span>)
          }
        },
        {
          title: '告警等级',
          dataIndex: 'alarmLevel',
          key: 'alarmLevel',
          render: (v) => {
            switch (v) {
              case 1: return <Status level={'1'} />
              case 2: return <Status level={'2'} />
              case 3: return <Status level={'3'} />
              case 4: return <Status level={'4'} />
              default: break
            }
          }
        },
        {
          title: '原因',
          dataIndex: 'reason',
          key: 'reason',
          render: (text, record) => {
            let title = text
            let _text = text
            if (record.alarmType === 1) {  //资产有漏洞时
              title = '资产存在漏洞，更多原因请点击[查看]'
              _text = '资产存在漏洞，更多原因请点击[查看]'
            } else if (record.alarmType === 3) { // 资产配置异常时
              title = '资产存在配置异常，更多原因请点击[查看]'
              _text = '资产存在配置异常，更多原因请点击[查看]'
            }
            return (
              <Tooltip title={title} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
                <span>{_text}</span>
              </Tooltip>
            )
          }
        },
        {
          title: '告警状态',
          dataIndex: 'currentStatus',
          key: 'currentStatus',
          render: (alarmType) => {
            switch (alarmType) {
              case 1: return (this.state.typeSet === 'current' ? '未确认未清除' : '未确认已清除')
              case 2: return (this.state.typeSet === 'current' ? '已确认未清除' : '已确认已清除')
              case 3: return (this.state.typeSet === 'current' ? '' : '已恢复')
              default: break

            }
          }
        },
        {
          title: '告警时间',
          dataIndex: 'createTime',
          key: 'createTime',
          render: timestamp => {
            return (<span className="tabTimeCss">{timestamp ? timeStampToTime(timestamp) : ''}</span>)
          }
        },
        {
          title: '操作',
          key: 'operate',
          render: (record) => {
            const typeSet = this.state.typeSet
            return (
              <div className="operate-wrap" >
                {
                  hasAuth(typeSet === 'current' ? logAlarmPermission.alarmMManageCurrentView : logAlarmPermission.alarmMManageHistoryView) ? <Link to={`/logalarm/alarm/manage/details?id=${transliteration(record.assetId)}&key=${typeSet === 'current' ? '1' : '2'}&asset=${transliteration(record.stringId)}`}>查看</Link> : null
                }
              </div>
            )
          }
        }
      ]
    }
  }
  componentDidMount () {
    const values = { time: [...this.initialTime] }
    const params = {
      beginTime: values.time && values.time[0] ? moment(values.time[0].format('YYYY-MM-DD') + ' 00:00:00').valueOf() + '' : null,
      endTime: values.time && values.time[1] ? moment(values.time[1].format('YYYY-MM-DD') + ' 23:59:59').valueOf() + '' : null
    }
    const caches = this.getCache()
    // 有缓存时
    if (caches && caches.length) {
      const { page, parameter } = caches[2] || {}
      const { typeSet, pagingParameter } = this.state
      const _param = { ...params, pagingParameter: { ...pagingParameter, ...page }, typeSet, ...parameter }
      // form表单的字段
      const formFields = { time: [parameter.beginTime ? moment(Number(parameter.beginTime)) : this.initialTime[0], parameter.endTime ? moment(Number(parameter.endTime)) : this.initialTime[1]] }
      this.setState({ ..._param })
      const obj = { ..._param, ...page }
      delete obj.pagingParameter
      if (_param.typeSet === 'current') {
        this.getCurrentList(obj, false)
      } else {
        this.getHistoryList(obj, false)
      }
      // 设置时间查询
      this.props.form.setFieldsValue(formFields)
    } else { // 没有缓存时
      const { typeSet } = this.state
      if (typeSet === 'current') {
        this.getCurrentList(params, false)
      } else {
        this.getHistoryList(params, false)
      }
      this.setState({ ...params })
    }
  }
  /**
   * 设置缓存
   */
  setCache = (value = {}) => {
    const { beginTime, endTime } = value
    const { pagingParameter: { currentPage, pageSize }, typeSet } = this.state
    const list = [{ page: { currentPage: value.currentPage || currentPage, pageSize: value.pageSize || pageSize }, parameter: { typeSet: typeSet, beginTime, endTime } }]
    cacheSearchParameter(list, this.props.history, 2)
  }
  /**
   * 获取缓存数据
   */
  getCache = () => {
    if (sessionStorage.searchParameter) {
      const cache = evalSearchParam(this, {}, false)
      return cache.list
    }
    return
  }
  //获取当前列表
  getCurrentList = (value = {}, isCache = true) => {
    const { assetId } = this.state
    // 进入缓存
    isCache && this.setCache(value)
    api.getCurrentAlarmQueryId({ primaryKey: assetId, ...value }).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          currentBody: response.body
        })
      }
    }).catch(err => { })
  }
  //获取历史列表
  getHistoryList = (value, isCache = true) => {
    const { assetId } = this.state
    // 进入缓存
    isCache && this.setCache(value)
    api.getHistoryAlarmQueryId({ primaryKey: assetId, ...value }).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          historyBody: response.body
        })
      }
    }).catch(err => { })
  }
  //分页
  pageModify = (pageSize, currentPage) => {
    this.setState({
      pagingParameter: {
        pageSize,
        currentPage
      }
    })
    let values = {
      currentPage,
      pageSize,
      beginTime: this.state.beginTime,
      endTime: this.state.endTime
    }
    if (this.state.beginTime === '') {
      delete values.beginTime
    }
    if (this.state.endTime === '') {
      delete values.endTime
    }
    this.state.typeSet === 'current' ? this.getCurrentList(values) : this.getHistoryList(values)
  }
  changePage = (currentPage) => {
    const pageSize = this.state.pagingParameter.pageSize
    this.pageModify(pageSize, currentPage)
  }
  changeShowSize = (currentPage, pageSize) => {
    this.pageModify(pageSize, currentPage)
  }
  //表单查询
  Submit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const params = {
          beginTime: values.time && values.time[0] ? moment(values.time[0].format('YYYY-MM-DD') + ' 00:00:00').valueOf() + '' : null,
          endTime: values.time && values.time[1] ? moment(values.time[1].format('YYYY-MM-DD') + ' 23:59:59').valueOf() + '' : null,
          pageSize: this.state.pageSize,
          currentPage: this.state.currentPage
        }
        this.setState({ ...params })
        this.state.typeSet === 'current' ? this.getCurrentList(params) : this.getHistoryList(params)
      }
    })
  }
  //当前、历史
  changeType = (e) => {
    this.setState({
      typeSet: e.target.value
    }, () => {
      const { beginTime, endTime, pagingParameter } = this.state
      const values = { beginTime, endTime, ...pagingParameter, currentPage: 1 }
      if (e.target.value === 'current') {
        this.getCurrentList(values)
      } else {
        this.getHistoryList(values)
      }
    })
  }
  render () {
    const { getFieldDecorator } = this.props.form
    const { currentBody, historyBody, columns, pagingParameter, typeSet } = this.state
    let currentList = []
    let currentTotal = 0
    if (currentBody) {
      currentList = currentBody.items
      currentTotal = currentBody.totalRecords
    }
    let historyList = []
    let historyTotal = 0
    if (historyBody) {
      historyList = historyBody.items
      historyTotal = historyBody.totalRecords
    }
    return (
      <div className="safe-details-warn">
        <div className="search-bar">
          <Form className="filter-form" layout="inline" onSubmit={this.Submit} onReset={this.Reset}>
            <div>
              <Item>
                <Group value={typeSet} className="radio-group-filter" onChange={this.changeType}>
                  <Radio.Button value="current">当前</Radio.Button>
                  <Radio.Button value="history">历史</Radio.Button>
                </Group>
              </Item>
            </div>
            <div className="safe-details-warn-search">
              <Item label='选择时间'>
                {getFieldDecorator('time', {
                  initialValue: this.initialTime
                })(
                  <DateRange recentlyDay={recentlyDay} allowClear={false} initialValue={this.initialTime} format="YYYY-MM-DD" placeholder={['请选择开始日期', '请选择结束日期']} resetKey={this.resetKey} />
                )}
              </Item>
              <Item className="search-item warn-search-item">
                <Button type="primary" htmlType="submit">查询</Button>
              </Item>
            </div>
          </Form>
        </div>
        <div className="table-wrap">
          <Table rowKey="stringId" columns={columns} dataSource={typeSet === 'current' ? currentList : historyList} pagination={false} />
          {
            (typeSet === 'current' ? currentTotal : historyTotal) > 10 && <Pagination
              className="table-pagination"
              total={typeSet === 'current' ? currentTotal : historyTotal} showTotal={(total) => `共 ${total || 0} 条数据`}
              showSizeChanger={true}
              showQuickJumper={true}
              onChange={this.changePage}
              onShowSizeChange={this.changeShowSize}
              pageSize={pagingParameter.pageSize}
              current={pagingParameter.currentPage} />
          }

        </div>
      </div>
    )
  }
}

const WarnDetailForm = Form.create()(WarnDetail)
export default connect()(withRouter(WarnDetailForm))
