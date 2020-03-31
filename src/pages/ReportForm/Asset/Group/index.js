
import { Component } from 'react'
import { Table, Modal } from 'antd'
import Columnar from '@/components/ReportForm/Asset/Chart/columnar'
import Broken from '@/components/ReportForm/Asset/Chart/broken'
import TimeFiler from '@/components/common/TimeFiler'
import Tooltip from '@/components/common/CustomTooltip'
import '../List/style.less'
import moment from 'moment'
import api from '@/services/api'
import { download, cacheSearchParameter, evalSearchParam } from '@/utils/common'
import hasAuth from '@/utils/auth'
import { reportPermission } from '@a/permission'
moment.locale('zh-cn')
const rowKey = 'classifyName'
class ReportFormAssetGroup extends Component {
  constructor (props) {
    super(props)
    this.state = {
      dateType: '',
      columns: [],
      iData: [],
      chartData: {
        align: 'left',
        title: '',
        date: [],
        list: []
      },
      value: [],
      showTime: new Date().toLocaleDateString(),
      Parameter: {},
      QuarterEnd: '',
      QuarterStart: '',
      mode: ['month', 'month'],
      exportVisible: false,
      timeRange: [],
      checkedValue: ''
    }
    this.titleText = '本周 资产组TOP5 资产总数'
    this.tableTitle = '本周 资产组资产总数'
  }

  componentDidMount () {
    const params = {
      timeType: '1',
      startTime: moment().week(moment().week()).startOf('week').valueOf(),
      endTime: moment().valueOf()
    }

    // 进入页面时默认导出参数为本周数据
    this.setState({
      Parameter: params
    })

    const { list } = evalSearchParam(this, null, false) || {}
    if (sessionStorage.searchParameter && list) {
      const { parameter } = list[0]
      this.setState({
        checkedValue: Number(parameter.timeType),
        showTime: moment(params.endTime).format('YYYY-MM-DD HH:mm'),
        timeRange: parameter.timeType === '5' ? [moment(parameter.startTime).startOf('month'), moment(parameter.endTime).endOf('month')] : []
      })
      this.getTableData({ ...parameter })
      this.getChartData({ ...parameter })
    } else {
      this.getTableData(params)
      this.getChartData(params)
    }

    // this.setState({ Parameter, showTime: moment(Parameter.endTime).format('YYYY-MM-DD HH:mm') })
    // this.getTableData(Parameter)
    // this.getChartData(Parameter)
    this.getQuarter()
  }
  /**
   * 时间变更时间
   * @param filter {Object} filter对象
   */
  timeFilterChange = (filter) => {
    const timeTypes = [
      { key: 'week', value: '1', label: '本周' },
      { key: 'month', value: '2', label: '本月' },
      { key: 'quarter', value: '3', label: '本季度' },
      { key: 'year', value: '4', label: '本年' },
      { key: 'other', value: '5', label: '' }]
    const timeType = (timeTypes.find(e => e.key === filter.dateType) || {})
    const param = {
      timeType: timeType.value,
      startTime: filter.startTime,
      endTime: filter.endTime
    }
    let rangeTime = moment(filter.startTime).format('YYYY-MM') + '~' + moment(filter.endTime).format('YYYY-MM')
    const title = `${timeType.label || rangeTime} 资产组 TOP5资产总数`
    const columns = JSON.parse(JSON.stringify(this.state.columns))
    columns[0].title = this.tableTitle = `${timeType.label || rangeTime} 资产组资产总数`
    this.titleText = title
    this.setState({
      columns,
      Parameter: param,
      checkedValue: '',
      timeRange: [],
      showTime: moment(filter.endTime).format('YYYY-MM-DD HH:mm')
    })
    cacheSearchParameter([{
      parameter: param
    }], this.props.history)

    this.getChartData(param)
    this.getTableData(param)
  }

  //提交表单
  onSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
      }
    })
  }
  //重置表单信息
  handleReset = () => {
    this.props.form.resetFields()
  }
  // //导出数据
  // downloadData =()=>{
  //   Modal.confirm({
  //     title: '是否导出数据？',
  //     content: '',
  //     okText: '确定',
  //     cancelText: '取消',
  //     onOk: ()=>{
  //       let { Parameter } = this.state
  //       download('/api/v1/asset/report/query/exportAssetGroupTable', Parameter)
  //     }
  //   })
  // }

  downloadData = () => {
    this.setState({ exportVisible: true })
  }
  onOk = () => {
    download('/api/v1/asset/report/query/exportAssetGroupTable', this.state.Parameter)
    this.setState({ exportVisible: false })
  }
  //取消
  onCancel = () => {
    this.setState({ exportVisible: false })
  }
  //初始化季度时间
  getQuarter = () => {
    let currentQuarter = moment().quarter() // 当前是第几季度
    let currentYear = moment().year() // 当前年
    this.setState({
      QuarterStart: (moment(moment(currentYear + '-01-01').toDate()).quarter(currentQuarter)).unix() * 1000
    })
    let endMonth = 3 * parseInt(currentQuarter, 0) //当季度最后一个月
    /* 对月数进行格式化 */
    if (endMonth < 10)
      endMonth = '0' + endMonth
    else
      endMonth += ''
    let endMonthDays = moment(currentYear + '-' + endMonth).daysInMonth() // 末尾月天数
    let endDays = currentYear + '-' + endMonth + '-' + endMonthDays //完整年月日整合
    this.setState({
      QuarterEnd: (moment(endDays).toDate()).valueOf()
    })
  }
  getTableData = (Paramet) => {
    let init = {}
    init.title = this.tableTitle
    // let tableEl = document.getElementById('asset-table-content')
    api.getAssetGroupTables({ ...Paramet }).then((data) => {
      if (data.head && data.head.code === '200') {
        // if(data.body.children.length < 6)
        //   tableEl.classList.add('asset-table-style')
        // else
        //   tableEl.classList.remove('asset-table-style')
        init.children = data.body.children.map((item) => {
          return {
            title: item.name,
            className: 'next-title',
            dataIndex: item.key,
            key: item.key,
            render: (text) => {
              if (item.key === rowKey) {
                return <Tooltip title={text}>{text}</Tooltip>
              } else {
                return text
              }
            }
          }
        })
        this.setState({
          columns: [init], iData: data.body.rows.map((item, i) => {
            return { order: i, ...item }
          })
        })
      }
    })
  }
  //图表数据
  getChartData = (paramet) => {
    let { chartData } = this.state
    api.getAssetGroupCharts(paramet).then((data) => {
      if (data.head && data.head.code === '200') {
        chartData.date = data.body.date
        chartData.title = [`{span|${this.titleText}}`].join('\n')
        chartData.list = data.body.list.map((item) => {
          return {
            classify: item.classify,
            data: item.data,
            add: item.add
          }
        })
        this.setState({ chartData })
      }
    })
  }
  render () {
    let { columns, chartData, showTime, iData, exportVisible, checkedValue, timeRange } = this.state
    return (
      <div className="All">
        <header className="charts-header">
          <div className="container" >
            <TimeFiler onChange={this.timeFilterChange} type={checkedValue || undefined} defaultValue={timeRange} />
          </div>
        </header>
        <div className="Patchtext">统计时间：截止为{showTime}</div>
        <div id="chart-content" className="chart-content-one">
          <section className={chartData.date.length > 6 ? 'whole' : 'topo'}>
            <Columnar iData={chartData} />
          </section>
          <section className={chartData.date.length > 6 ? 'whole' : 'topo'}>
            <Broken iData={chartData} />
          </section>
        </div>
        <div className="table-wrap" id="asset-table-content">
          <div className="table-btn">
            <div className='export-btn'>
              {hasAuth(reportPermission.REPORT_ASSET_DC) && <a onClick={this.downloadData}><img src={require('@/assets/export.svg')} alt="" />导出</a>}
            </div>
          </div>
          <Table rowClassName="asset-table-style" rowKey={rowKey} className='asset-table-style' columns={columns} dataSource={iData} pagination={false} bordered size='small'/>
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

export default ReportFormAssetGroup
