import { Component } from 'react'
import { connect } from 'dva'
import { Form, Table } from 'antd'
import api from '@/services/api'
import moment from 'moment'
import echarts from 'echarts/lib/echarts'
import TimeFiler from '@/components/common/TimeFiler'
// 引入柱状图
import 'echarts/lib/chart/bar'
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import './style.less'
import ExportModal from '@/components/common/ExportModal'
import { evalSearchParam, cacheSearchParameter } from '@/utils/common'
import hasAuth from '@/utils/auth'
import { reportPermission } from '@a/permission'

moment.locale('zh-cn')
const timeTypes = [
  { key: 'week', value: '0', label: '本周' },
  { key: 'month', value: '1', label: '本月' },
  { key: 'quarter', value: '2', label: '本季度' },
  { key: 'year', value: '3', label: '本年' },
  { key: 'other', value: '4', label: '' }]
class ReportFormWarn extends Component {
  constructor (props) {
    super(props)
    this.state = {
      listBody: {},
      echartsData: [],
      echartsList: [],
      checkedValue: '',
      timeRange: [],
      flag: '0',
      listTitleParms: '0',
      echartsTitleParms: '0',
      custom: false,
      format: '',
      show: false,
      mode: ['month', 'month'],
      seekTerm: {}, //保留搜索条件
      //导出框显示
      exportVisible: false,
      //导出查询条件
      searchValues: {},
      //导出数据总数
      exportTotal: 0
      // value: []

    }
  }
  componentDidMount () {
    const { flag } = this.state
    const param = {
      flag,
      beginTime: moment().week(moment().week()).startOf('week').valueOf(),
      endTime: moment().valueOf()
    }
    if (sessionStorage.searchParameter) {
      let { list } = evalSearchParam(this, null, false) || {}
      this.setState({
        checkedValue: parseInt(list[0].parameter.flag, 10) + 1,
        timeRange: (parseInt(list[0].parameter.flag, 10) + 1) + '' === '5' ? [moment(list[0].parameter.beginTime).startOf('month'), moment(list[0].parameter.endTime).endOf('month')] : []
      })
      this.getData({ ...list[0].parameter })
    }
    else
      this.getData(param)
  }
  //获取列表数据
  getList = (param) => {
    api.alarmReportList(param).then(response => {
      if (response && response.head && response.head.code === '200') {
        let data = response.body
        data.items.forEach((item, index) => {
          item.id = index
        })
        this.setState({
          listBody: data
        })
      }
    })
    this.setState({ listTitleParms: this.state.flag })
  }
  //获取echarts数据
  getEchart = (param = {}) => {
    api.alarmReportEcharts(param).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          echartsData: response.body.date,
          echartsList: response.body.list
        }, this.init)
      }
    })
    this.setState({ echartsTitleParms: param.flag })
  }
  getData = (param = {}) => {
    const { beginTime, endTime, flag } = param
    let timeValue = {
      beginTime,
      endTime,
      flag
    }
    this.titleText = this.generateTitle(timeValue)
    const showTime = moment(timeValue.endTime).format('YYYY-MM-DD HH:mm')
    this.setState({ ...timeValue, showTime })
    // 获取图形数据并且更新
    this.getEchart({ ...timeValue })
    // 获取表格数据
    this.getList({ ...timeValue })
  }
  // 生成图形、表格的标题
  generateTitle = (param) => {
    const { flag, beginTime, endTime } = param
    const { label } = timeTypes.find((e) => e.value === flag) || {}
    const title = label || `${moment(beginTime).format('YYYY-MM')}~${moment(endTime).format('YYYY-MM')}`
    return title
  }

  columns = () => {
    let columns = [
      {
        title: `${this.titleText}告警处理情况`,
        dataIndex: 'condition',
        key: 'condition',
        className: 'first-title',
        children: [
          {
            title: '',
            className: 'next-title',
            children: [{
              className: 'next-title',
              dataIndex: 'rowTitle',
              key: 'rowTitle',
              width: 100,
              fixed: 'left'
            }]
          },
          {
            title: '漏洞告警',
            className: 'next-title',
            children: [{
              title: '告警总数',
              className: 'next-title',
              dataIndex: 'zulAlarmTotalNum',
              key: 'zulAlarmTotalNum'
            },
            {
              title: '未处理告警',
              className: 'next-title',
              dataIndex: 'zulAlarmUnhandleNum',
              key: 'zulAlarmUnhandleNum'
            }]
          },
          {
            title: '配置告警',
            className: 'next-title',
            children: [{
              title: '告警总数',
              className: 'next-title',
              dataIndex: 'configAlarmTotalNum',
              key: 'configAlarmTotalNum'
            },
            {
              title: '未处理告警',
              className: 'next-title',
              dataIndex: 'configAlarmUnproNumber',
              key: 'configAlarmUnproNumber'
            }]
          },
          // {
          //   title: '威胁事件告警',
          //   className: 'next-title',
          //   children: [{
          //     title: '告警总数',
          //     className: 'next-title',
          //     dataIndex: 'threatAlarmTotalNum',
          //     key: 'threatAlarmTotalNum'
          //   },
          //   {
          //     title: '未处理告警',
          //     className: 'next-title',
          //     dataIndex: 'threatAlarmUnproNumber',
          //     key: 'threatAlarmUnproNumber'
          //   }]
          // },
          {
            title: '安全设备性能告警',
            className: 'next-title',
            children: [{
              title: '告警总数',
              className: 'next-title',
              dataIndex: 'safetyAlarmTotalNum',
              key: 'safetyAlarmTotalNum'
            },
            {
              title: '未处理告警',
              className: 'next-title',
              dataIndex: 'safetyAlarmUnproNumber',
              key: 'safetyAlarmUnproNumber'
            }]
          },
          {
            title: '安全运维服务性能告警',
            className: 'next-title',
            children: [{
              title: '告警总数',
              className: 'next-title',
              dataIndex: 'systemAlarmTotalNum',
              key: 'systemAlarmTotalNum'
            },
            {
              title: '未处理告警',
              className: 'next-title',
              dataIndex: 'systemAlarmUnproNumber',
              key: 'systemAlarmUnproNumber'
            }]
          },
          {
            title: '异常资产告警',
            className: 'next-title',
            children: [{
              title: '告警总数',
              className: 'next-title',
              dataIndex: 'exAssetAlarmTotalNum',
              key: 'exAssetAlarmTotalNum'
            },
            {
              title: '未处理告警',
              className: 'next-title',
              dataIndex: 'exAssetAlarmUnproNumber',
              key: 'exAssetAlarmUnproNumber'
            }]
          },
          {
            title: '补丁告警',
            className: 'next-title',
            children: [{
              title: '告警总数',
              className: 'next-title',
              dataIndex: 'patchAlarmTotalNum',
              key: 'patchAlarmTotalNum'
            },
            {
              title: '未处理告警',
              className: 'next-title',
              dataIndex: 'patchAlarmUnproNumber',
              key: 'patchAlarmUnproNumber'
            }]
          },
          {
            title: '资产状态监控告警',
            className: 'next-title',
            children: [{
              title: '告警总数',
              className: 'next-title',
              dataIndex: 'assetMonitorAlarmTotalNum',
              key: 'assetMonitorAlarmTotalNum'
            },
            {
              title: '未处理告警',
              className: 'next-title',
              dataIndex: 'assetMonitorAlarmUnproNumber',
              key: 'assetMonitorAlarmUnproNumber'
            }]
          }
        ]
      }]
    return (columns)
  }
  //文件导出
  Download = () => {
    let { seekTerm, pageIndex, pageSize } = this.state
    seekTerm.currentPage = pageIndex
    seekTerm.pageSize = pageSize
    api.alarmReportList({ flag: this.state.flag, beginTime: this.state.beginTime.valueOf(), endTime: this.state.endTime.valueOf() }).then(data => {
      if (data.head && data.head.code === '200' && data.body.items.length) {
        seekTerm.flag = this.state.flag
        seekTerm.beginTime = this.state.flag === '4' ? this.state.beginTime.valueOf() : ''
        seekTerm.endTime = this.state.flag === '4' ? this.state.endTime.valueOf() : ''
        const exportTotal = data.body.totalRecords
        this.setState({
          exportTotal,
          exportVisible: true,
          searchValues: seekTerm
        })
      }
    })
  }
  init = () => {
    const { echartsData, echartsList } = this.state
    let myChart = echarts.init(document.getElementById('asset-chart-columnar'))
    window.addEventListener('resize', () => {
      myChart.resize()
    })
    myChart.setOption({
      calculable: true,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line'
        }
      },
      title: {
        text: `${this.titleText}告警处理情况`,
        top: 20,
        bottom: 20,
        left: 20,
        textStyle: {
          color: '#fff',
          fontSize: 14,
          fontFamily: 'PingFangSC-Regular'
        }
      },
      legend: {
        data: echartsList.map(Item => Item.classify),
        bottom: 10,
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 36,
        icon: 'circle',
        selectedMode: false,
        textStyle: {
          color: '#ffffff'
        }
      },
      grid: {
        top: '15%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: echartsData,
        axisLine: {
          show: true,
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        axisLabel: {
          fontSize: 10,
          color: '#98ACD9'
        }
      },
      yAxis: [
        {
          type: 'value',
          axisLine: {
            show: false,
            lineStyle: {
              color: '#98ACD9'
            }
          },
          axisTick: {
            show: false
          },
          splitLine: {
            color: '#98ACD9',
            lineStyle: {
              type: 'solid',
              color: 'rgba(255, 255, 255, 0.2)'
            }
          }
        }
      ],
      series: echartsList.map((item, index) => ({
        name: item.classify,
        smooth: true,
        type: 'bar',
        data: item.data ? item.data : [],
        itemStyle: {
          color: ['#3b6cff', '#43bdff'][index],
          barBorderRadius: 4
        },
        barGap: '300%',
        barWidth: 4
      })
      )
    })
  }
  /**
   * 时间变更时间
   * @param filter {Object} filter对象
   */
  timeFilterChange = (filter) => {
    sessionStorage.removeItem('searchParameter')
    const timeType = (timeTypes.find(e => e.key === filter.dateType) || {})
    const param = {
      flag: timeType.value,
      beginTime: filter.startTime,
      endTime: filter.endTime
    }
    this.setState({
      checkedValue: '',
      timeRange: []
    }, () => {
      cacheSearchParameter([{
        parameter: param
      }], this.props.history)
      this.getData(param)
    })
  }
  render () {
    let { iData, listBody, exportVisible, searchValues, exportTotal, showTime, checkedValue, timeRange } = this.state

    let list = []
    if (listBody) {
      list = listBody.items
    }
    return (
      <div className="warn-wrap main-table-content" >
        <div className="bottom-box title-box" style={{ paddingTop: 10 }}>
          <TimeFiler onChange={this.timeFilterChange} type={checkedValue || undefined} defaultValue={timeRange} />
        </div>
        <div className="Patchtext">统计时间：截止为{showTime}</div>
        {/* echarts */}
        <div className="warnBox">
          <div id="asset-chart-columnar" className="warningChart" idata={iData} style={{ width: '100%', minHeight: 387 }}></div>
        </div>
        <div className="table-wrap warnBox">
          <div className="table-btn">
            <div className='export-btn'>
              {hasAuth(reportPermission.REPORT_ALARM_DC) && <a onClick={this.Download}><img src={require('@/assets/export.svg')} alt="" /><span>导出</span></a>}
            </div>
          </div>
          <Table rowKey='id' bordered columns={this.columns()} dataSource={list} pagination={false} size='small' className="warningTable" />
        </div>
        {/* 导出 */}
        {
          exportVisible && <ExportModal
            exportModal={{
              //弹框显示
              exportVisible,
              //搜索条件
              searchValues,
              //数据总数
              total: exportTotal,
              //阈值
              threshold: 5000,
              //下载地址
              url: '/api/v1/alarm/report/statistics/detail/export'
            }}
            handleCancelExport={() => this.setState({ exportVisible: false })} />
        }
      </div>
    )
  }
}
const ReportFormWarnFrom = Form.create()(ReportFormWarn)
export default connect()(ReportFormWarnFrom)
