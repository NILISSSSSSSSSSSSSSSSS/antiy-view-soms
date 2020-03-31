import { Component } from 'react'
import { Table, Modal } from 'antd'
import Columnar from '@/components/ReportForm/Asset/Chart/columnar'
import Broken from '@/components/ReportForm/Asset/Chart/broken'
import TimeFiler from '@/components/common/TimeFiler'
import Tooltip from '@/components/common/CustomTooltip'
import '../List/style.less'
import moment from 'moment'
import api from '@/services/api'
import { withRouter } from 'dva/router'
import { download, cacheSearchParameter, evalSearchParam } from '@/utils/common'
const rowKey = 'classifyName'
moment.locale('zh-cn')

const  timeTypes = [
  { key: 'week', value: 'THIS_WEEK', label: '本周' },
  { key: 'month', value: 'THIS_MONTH', label: '本月' },
  { key: 'quarter', value: 'THIS_QUARTER', label: '本季度' },
  { key: 'year', value: 'THIS_YEAR', label: '本年' },
  { key: 'other', value: 'ASSIGN_TIME', label: '' }
]

@withRouter
class ReportFormAssetCategory extends Component{
  constructor (props){
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
      showTime: '',
      Parameter: {
        showCycleType: '',
        beginTime: '',
        endTime: ''
      },
      QuarterEnd: '',
      QuarterStart: '',
      mode: ['month', 'month'],
      exportVisible: false,
      timeRange: [],
      checkedValue: ''
    }
    this.titleText =  '本周 资产类型 总数'
  }

  componentDidMount (){
    const params = {
      showCycleType: 'THIS_WEEK',
      beginTime: moment().week(moment().week()).startOf('week').valueOf(),
      endTime: moment().valueOf()
    }
    const { list } = evalSearchParam(this, null, false) || {}
    if(sessionStorage.searchParameter && list){
      const { parameter } = list[0]
      const timeIndex = timeTypes.findIndex((e, i)=>e.value === parameter.showCycleType) + 1
      this.setState({
        checkedValue: timeIndex,
        showTime: moment(params.endTime).format('YYYY-MM-DD HH:mm'),
        timeRange: timeIndex === 5 ? [moment(parameter.beginTime).startOf('month'), moment(parameter.endTime).endOf('month')] : []
      })
      this.getTableData({ ...parameter })
      this.getChartData({ ...parameter })
    } else {
      this.getTableData(params)
      this.getChartData(params)
    }

    this.getQuarter()
  }

  /**
   * 时间变更时间
   * @param filter {Object} filter对象
   */

  timeFilterChange = (filter) =>{
    sessionStorage.removeItem('searchParameter')
    const timeType = (timeTypes.find(e=>e.key === filter.dateType) || {})
    const param = {
      showCycleType: timeType.value,
      beginTime: filter.startTime,
      endTime: filter.endTime
    }
    let rangeTime = moment(filter.startTime).format('YYYY-MM') + '~' + moment(filter.endTime).format('YYYY-MM')
    const title = `${timeType.label || rangeTime} 资产类型 总数`
    const columns = JSON.parse(JSON.stringify(this.state.columns))
    columns[0].title = this.titleText = title
    this.setState({
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
  handleReset = ()=>{
    this.props.form.resetFields()
  }
  //导出数据
  // downloadData =()=>{
  //   Modal.confirm({
  //     title: '是否导出数据？',
  //     content: '',
  //     okText: '确定',
  //     cancelText: '取消',
  //     onOk: ()=>{
  //       let { Parameter } = this.state
  //       download('/api/v1/asset/report/export/category/newAsset', Parameter)
  //     }
  //   })
  // }
  downloadData = () => {
    this.setState({ exportVisible: true })
  }
  onOk = () => {
    download('/api/v1/asset/report/export/category/newAsset', this.state.Parameter)
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
    if(endMonth < 10)
      endMonth = '0' + endMonth
    else
      endMonth += ''
    let endMonthDays = moment(currentYear + '-' + endMonth).daysInMonth() // 末尾月天数
    let endDays = currentYear + '-' + endMonth + '-' + endMonthDays //完整年月日整合
    this.setState({
      QuarterEnd: (moment(endDays).toDate()).valueOf()
    })
  }

  getTableData = (Paramet) =>{
    let init = {}
    init.title =  this.titleText
    // let tableEl = document.getElementById('asset-table-content')
    api.getAssetTables({ reportFormType: 'TABLE', ...Paramet }).then((data)=>{
      if(data.head && data.head.code === '200'){
        // if(data.body.children.length <= 6)
        //   tableEl.classList.add('asset-table-style')
        // else
        //   tableEl.classList.remove('asset-table-style')
        init.children = data.body.children.map((item)=>{
          return{
            title: item.name,
            dataIndex: item.key,
            className: 'next-title',
            key: item.key,
            render: (text)=>{
              if(item.key === rowKey){
                return <Tooltip title={text}>{text}</Tooltip>
              }else {
                return text
              }
            }
          }
        })
        this.setState({ columns: [init], iData: data.body.rows.map((item, i)=>{
          return{ order: i, ...item }
        }) })
      }
    })
  }

  //图表数据
  getChartData = (paramet)=>{
    let { chartData } = this.state
    api.getAssetCharts(paramet).then((data)=>{
      if(data.head && data.head.code === '200'){
        chartData.date = data.body.date
        chartData.title = [`{span|${this.titleText}}`].join('\n')
        chartData.list = data.body.list.map((item)=>{
          return {
            classify: item.classify,
            data: item.data,
            add: item.add
          }
        })
        this.setState({ chartData  })
      }
    })
  }
  render (){
    const {  columns, chartData, showTime, iData, exportVisible, checkedValue, timeRange } = this.state
    return(
      <div className="All">
        <header className="charts-header">
          <div className="container" >
            <TimeFiler onChange={this.timeFilterChange} type={checkedValue || undefined} defaultValue={timeRange}/>
            <div className="Patchtext">统计时间：截止为{ showTime }</div>
          </div>
        </header>
        <div id="chart-content" className='chart-content-one'>
          <section  className={ chartData.date.length > 6 ? 'whole' : 'topo' }>
            <Columnar iData={chartData} />
          </section>
          <section  className={ chartData.date.length > 6 ? 'whole' : 'topo' }>
            <Broken iData={chartData} />
          </section>
        </div>
        <div className="table-wrap">
          <div className="table-btn">
            <div  className='export-btn'>
              <a onClick={this.downloadData}><img src={require('@/assets/export.svg')} alt=""/>导出</a>
            </div>
          </div>
          <Table className="asset-table-style" size='small' rowKey={rowKey} columns={columns} dataSource={iData} bordered pagination={false} />
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

export default ReportFormAssetCategory
