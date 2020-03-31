import { Component } from 'react'
import { connect } from 'dva'
import { Table, Modal, message } from 'antd'
import './style.less'
import Echarts from 'echarts/lib/echarts'
// 引入柱状图
import 'echarts/lib/chart/pie'
import 'echarts/lib/chart/line'
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import moment from 'moment'
import { download, cacheSearchParameter, evalSearchParam } from '@/utils/common'
import api from '@/services/api'
import TimeFiler from '@/components/common/TimeFiler'
import hasAuth from '@/utils/auth'
import { reportPermission } from '@a/permission'
moment.locale('zh-cn')
const timeTypes = [
  { key: 'week', value: '1', label: '本周' },
  { key: 'month', value: '2', label: '本月' },
  { key: 'quarter', value: '3', label: '本季度' },
  { key: 'year', value: '4', label: '本年' },
  { key: 'other', value: '5', label: '' }]
class ReportFormVul extends Component {
  constructor (props) {
    super(props)
    this.state = {
      tabData: [],
      Parameter: {
        type: 1,
        startTime: '',
        endTime: ''
      },
      xAxis: [],
      columns: [{
        title: '漏洞报表',
        className: 'first-title',
        children: [
          {
            title: '',
            className: 'next-title',
            children: [{
              className: 'next-title',
              dataIndex: 'scale',
              key: 'scale',
              width: 100,
              fixed: 'left'
            }]
          },
          {
            title: '低危',
            className: 'next-title',
            children: [{
              title: '资产关联漏洞数量',
              className: 'next-title',
              dataIndex: 'lowVulCount',
              key: 'lowVulCount'
            }, {
              title: '漏洞影响资产数量',
              className: 'next-title',
              dataIndex: 'lowAssetCount',
              key: 'lowAssetCount'
            }]
          },
          {
            title: '中危',
            className: 'next-title',
            children: [{
              title: '资产关联漏洞数量',
              className: 'next-title',
              dataIndex: 'middleVulCount',
              key: 'middleVulCount'
            }, {
              title: '漏洞影响资产数量',
              className: 'next-title',
              dataIndex: 'middleAssetCount',
              key: 'middleAssetCount'
            }]
          },
          {
            title: '高危',
            className: 'next-title',
            children: [{
              title: '资产关联漏洞数量',
              className: 'next-title',
              dataIndex: 'highVulCount',
              key: 'highVulCount'
            }, {
              title: '漏洞影响资产数量',
              className: 'next-title',
              dataIndex: 'highAssetCount',
              key: 'highAssetCount'
            }]
          }, {
            title: '超危',
            className: 'next-title',
            children: [{
              title: '资产关联漏洞数量',
              className: 'next-title',
              dataIndex: 'superVulCount',
              key: 'superVulCount'
            }, {
              title: '漏洞影响资产数量',
              className: 'next-title',
              dataIndex: 'superAssetCount',
              key: 'superAssetCount'
            }]
          }
        ]
      }],
      startTime: new Date(),
      endTime: new Date(),
      exportVisible: false,
      showData: false,
      total: 0,
      checkedValue: '',
      timeRange: []
    }
  }
  componentDidMount () {
    let params = {
      type: '1',
      startTime: moment().week(moment().week()).startOf('week').valueOf(),
      endTime: moment().valueOf()
    }
    const { list } = evalSearchParam(this, null, false) || {}
    if (sessionStorage.searchParameter && list) {
      const { parameter } = list[0]
      this.setState({
        checkedValue: parameter.type,
        timeRange: parameter.type === '5' ? [moment(parameter.startTime).startOf('month'), moment(parameter.endTime).endOf('month')] : []
      })
      this.getData({ ...parameter })
    } else {
      this.getData(params)
    }
  }
  // 生成图形、表格的标题
  generateTitle = (param) => {
    const { type, startTime, endTime } = param
    const { label } = timeTypes.find((e) => e.value === type) || {}
    const title = label || `${moment(startTime).format('YYYY-MM')}~${moment(endTime).format('YYYY-MM')}`
    return title
  }
  // 获取数据
  getData = (params = {}) => {
    this.titleText = this.generateTitle(params)
    const showTime = moment(params.endTime).format('YYYY-MM-DD HH:mm')
    this.getBugData(params)
    this.getTableData(params)
    // this.getPatchData(params)
    this.setState({ Parameter: params, showTime })
  }
  /**
   * 时间变更时间
   * @param filter {Object} filter对象
   */
  timeFilterChange = (filter) => {
    sessionStorage.removeItem('searchParameter')
    const timeType = (timeTypes.find(e => e.key === filter.dateType) || {})
    const param = {
      type: timeType.value,
      startTime: filter.startTime,
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
  downloadData = () => {
    this.setState({
      exportVisible: true
    })
  }
  onOk = () => {
    download('/api/v1/vul/report/exportDataTable', this.state.Parameter)
    this.setState({
      exportVisible: false
    })
  }
  //取消
  onCancel = () => {
    this.setState({ exportVisible: false })
  }
  getBugData = (param) => {
    api.vulEffectAsset(param).then(response => {
      if (response && response.head && response.head.code === '200') {
        const data = response.body
        this.initBugCharts('asset-main', data.name, data.data)
      }
    })
    api.assetEffetVul(param).then(response => {
      if (response && response.head && response.head.code === '200') {
        const data = response.body
        this.initBugCharts('bug-main', data.name, data.data)
      }
    })
  }
  getTableData = (param) => {
    const { columns } = this.state
    // 更新title
    const _columns = columns.map(e => ({
      ...e,
      title: `漏洞${this.titleText}未修复情况`
    }))
    this.setState({ columns: _columns })
    api.getVulReport(param).then(response => {
      if (response && response.head && response.head.code === '200') {
        const data = response.body
        this.setState({
          tabData: data
        })
      }
    })
  }
  // getPatchData = (param) => {
  //   api.vulGradeReport(param).then(response => {
  //     if(response && response.head && response.head.code === '200' ){
  //       const data = response.body
  //       let dataList = [], total = 0
  //       data.data.forEach((item, index) => {
  //         dataList.unshift({
  //           value: item,
  //           name: data.name[index]
  //         })
  //         total += item
  //       })
  //       this.setState({
  //         showData: true,
  //         total
  //       })
  //       this.initPatchCharts('patch-main', data.name.reverse(), dataList, total)
  //     }
  //   })
  // }
  // initPatchCharts = (id, typeList, dataList, total) => {
  //   let myChart = Echarts.init(document.getElementById(id))
  //   let options = {
  //     title: {
  //       text: this.titleText + '漏洞威胁程度分布',
  //       left: '2%',
  //       top: '3%',
  //       textStyle: {
  //         color: '#333',
  //         fontSize: 16,
  //         fontFamily: 'PingFangSC-Regular'
  //       }
  //     },
  //     tooltip: {
  //       trigger: 'item',
  //       formatter: '{a} <br/>{b}: {c} ({d}%)'
  //     },
  //     color: ['#ff426f', '#3b6cff', '#05cc7f', '#f7ccc7'],
  //     legend: {
  //       orient: 'vertical',
  //       bottom: 'center',
  //       right: '20%',
  //       data: typeList,
  //       selectedMode: false
  //     },
  //     series: [
  //       {
  //         name: this.titleText + '漏洞威胁程度分布',
  //         type: 'pie',
  //         //位置
  //         center: ['center', 'center'],
  //         radius: ['30%', '50%'],
  //         avoidLabelOverlap: false,
  //         label: {
  //           normal: {
  //             show: true,
  //             position: 'center',
  //             formatter: function (argument) {
  //               return ''
  //             },
  //             textStyle: {
  //               fontSize: '28',
  //               color: '#333'
  //             }
  //           }
  //         },
  //         data: dataList
  //       }
  //     ]
  //   }
  //   window.addEventListener('resize', () => {
  //     myChart.resize()
  //   })
  //   myChart.setOption(options)
  // }

  initBugCharts = (id, typeList, dataList) => {
    this.setState({
      xAxis: typeList
    })
    let myChart = Echarts.init(document.getElementById(id))
    myChart.resize()
    let options = {
      title: {
        left: '2%',
        textStyle: {
          color: '#fff',
          fontSize: 14,
          fontFamily: 'PingFangSC-Regular'
        },
        top: '3%',
        text: this.titleText + (id === 'asset-main' ? '漏洞影响资产数量（未修复）' : '资产关联漏洞数量（未修复）')
      },
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        top: '18%',
        left: '5%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: true,
        data: typeList,
        axisTick: {
          alignWithLabel: true
        },
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
      yAxis: {
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
        axisLabel: {
          formatter: '{value}'
        },
        splitLine: {
          lineStyle: {
            type: 'solid',
            color: 'rgba(255, 255, 255, 0.2)'
          }
        }
      },
      series: [{
        name: '',
        type: 'line',
        showSymbol: true,
        data: dataList,
        smooth: true,
        itemStyle: {
          normal: {
            color: '#98ACD9',
            // fontWeight: id === 'asset-main' ? 'bold' : '#bold',
            label: {
              show: true, //开启显示
              position: 'top' //在上方显示
            }
          }
        }
      }]
    }
    window.addEventListener('resize', () => {
      myChart.resize()
    })
    myChart.setOption(options)
  }
  render () {
    const { columns, tabData, showTime, exportVisible, checkedValue, timeRange } = this.state
    return (
      <div className="vulReport-page main-table-content">
        <div className="charts-container">
          <div className="bottom-box"  style={{ paddingTop: 10 }}>
            <TimeFiler onChange={this.timeFilterChange} type={checkedValue || undefined} defaultValue={timeRange} />
            <div className="Patchtext">统计时间：截止为{showTime}</div>
          </div>
          <div className="top-box">
            <div className="charts-box" style={{ flex: this.state.xAxis.length > 6 ? '1 1 100%' : '1 1 50%', width: this.state.xAxis.length > 6 ? '100%' : '50%' }}>
              <div id="bug-main" style={{ width: '100%', height: 338 }}></div>
            </div>
            <div className="charts-box" style={{ flex: this.state.xAxis.length > 6 ? '1 1 100%' : '1 1 50%', width: this.state.xAxis.length > 6 ? '100%' : '50%' }}>
              <div id="asset-main" style={{ width: '100%', height: 338, borderLeft: this.state.xAxis.length > 6 ? '' : 'none' }}></div>
            </div>
          </div>
          {/* <div className="top-box-two">
            <div className="charts-box">
              {showData && <div className="bug-total">{total}</div>}
              <div id="patch-main" style={{ width: '100%', height: 338 }}></div>
            </div>
          </div> */}
        </div>
        <div className="table-wrap warnBox">
          <div className="table-btn">
            <div className='export-btn'>
              {hasAuth(reportPermission.REPORT_VUL_DC) && <a onClick={this.downloadData}><img src={require('@/assets/export.svg')} alt="" />导出 </a>}
            </div>
          </div>
          <Table rowKey="scale" className="Vultable" columns={columns} dataSource={tabData} pagination={false} bordered size='small'></Table>
        </div>
        <Modal
          title="导出Excel"
          width={650}
          visible={exportVisible}
          onCancel={this.onCancel}
          onOk={this.onOk}>
          <p>请确认是否导出当前数据？</p>
        </Modal>
      </div>
    )
  }
}
export default connect()(ReportFormVul)
