import React, { Component } from 'react'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import { Form, Select } from 'antd'
import moment from 'moment'
import api from '@/services/api'
import { emptyFilter, cacheSearchParameter, getCaches } from '@/utils/common'
// 引入 ECharts 主模块
import Echarts from 'echarts/lib/echarts'
// 引入柱状图
import 'echarts/lib/chart/line'
import 'echarts/lib/component/legend'
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import color from '@/them/them.js'

import './style.less'
const { Item } = Form
const { categoryColor } = color
const { Option } = Select
const MEMORY = { value: 'MEMORY', label: '内存' }
const DISK = { value: 'DISK', label: '磁盘' }
const CPU = { value: 'CPU', label: 'CPU' }
const ALL = { value: 'ALL', label: '全部' }
const types = [ALL, MEMORY, DISK, CPU]

class SystemCharts extends Component {
  constructor (props) {
    super(props)
    this.state = {
      time: moment(new Date().getTime()).format('YYYY-MM-DD')
    }
    this.chartRef = React.createRef()
    this.chartOpts = { showCycleType: 'MINUTE', performanceFilterType: types.filter((e) => e.value !== ALL.value).map((e) => e.value) }
  }
  componentDidMount () {
    const { searchIndex } = this.props
    const cache = getCaches(this, true, searchIndex)
    if (cache) {
      let performanceFilterType = cache.parameter.performanceFilterType
      // 如果为ALL时，则统计所有类型
      this.chartOpts = { ...this.chartOpts, performanceFilterType: performanceFilterType === ALL.value ? types.filter((e) => e.value !== ALL.value).map((e) => e.value) : [performanceFilterType] }
      this.getEcharts(false)
    } else {
      this.getEcharts(false)
    }
    this.setIntervalData()
  }

  componentWillUnmount () {
    clearInterval(this.timer)
  }
  //echarts数据
  getEcharts = (isCache = true) => {
    const { showCycleType, performanceFilterType = [] } = this.chartOpts
    const { searchIndex } = this.props
    const values = {
      assetId: this.props.id,
      showCycleType,
      performanceFilterType
    }
    // 缓存数据
    let _performanceFilterType = performanceFilterType[0]
    // 包含内存、磁盘、CPU时，就默认为全部
    if (performanceFilterType.length >= 3) {
      _performanceFilterType = ALL.value
    }
    isCache && cacheSearchParameter([{ page: {}, parameter: { performanceFilterType: _performanceFilterType } }], this.props.history, searchIndex)
    api.getPerformanceLineChart(values).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.initBarEcharts(response.body)
      }
    })
  }
  timeOnChange = (performanceFilterType) => {
    this.chartOpts = { ...this.chartOpts, performanceFilterType: performanceFilterType === ALL.value ? types.filter((e) => e.value !== ALL.value).map((e) => e.value) : [performanceFilterType] }
    this.getEcharts()
  }
  render () {
    const { getFieldDecorator } = this.props.form
    return (
      <div className="sytem-charts">
        <div className="charts-box">
          <div className="top-box">
            <div>
              <p className="title">服务器监控</p>
            </div>
            <div>
              <Form layout="inline">
                <Item label="性能指标">
                  {getFieldDecorator('performanceFilterType', {
                    initialValue: ALL.value
                  })(
                    <Select style={{ width: 102 }} placeholder="全部" optionFilterProp="label" onChange={this.timeOnChange} getPopupContainer={triggerNode => triggerNode.parentNode}>
                      {
                        types.map((e) => {
                          return <Option key={e.value} label={e.label}>{e.label}</Option>
                        })
                      }
                    </Select>
                  )}
                </Item>
                <Item label="展示周期">
                  <span>分钟</span>
                </Item>
              </Form>
            </div>
          </div>
          <div ref={this.chartRef} style={{ width: '100%', height: 400 }} />
        </div>
      </div>
    )
  }

  /**
   * 生成折线图数据
   * @param list CPU 或者 DISK 或者 MEMORY 的数据列表
   * @param maxLen
   * @returns {{time: Array, value: Array}}
   */
  generateChartData = (list = [], maxLen = Infinity) => {
    let time = []
    let value = []
    if (!list.length) {
      return { time, value }
    }
    for (let i = 0, len = list.length; i < len; i++) {
      const item = list[i]
      time.unshift(item.name)
      value.unshift(item.value)
      if (i > maxLen) {
        break
      }
      // value.unshift(Math.ceil(Math.random() * 100))
    }
    return { time, value }
  }
  setIntervalData = () => {
    this.timer = setInterval(() => {
      this.getEcharts(false)
    }, 1000 * 60)
  }
  //绘制图表
  initBarEcharts = (data) => {
    // todo: 注意 拿不到元素时，停止绘制echart图形
    // 原因：页面离开时，数据才返回，这时是拿不到chartRef， chartRef.current为  null，
    if (!this.chartRef.current) {
      return
    }
    let time = []
    const CPULine = this.generateChartData(data.CPU)
    time = CPULine.time
    let value1 = CPULine.value
    const diskLine = this.generateChartData(data.DISK)
    !time.length && (time = diskLine.time)
    let value2 = diskLine.value
    const memoryLine = this.generateChartData(data.MEMORY)
    !time.length && (time = memoryLine.time)
    let value3 = memoryLine.value
    let myChart = Echarts.init(this.chartRef.current)
    const names = []
    if (value1.length) {
      names.push(CPU.label)
    }
    if (value2.length) {
      names.push(DISK.label)
    }
    if (value3.length) {
      names.push(MEMORY.label)
    }
    const CPUData = []
    const DISKata = []
    const MEMORYata = []
    time.forEach((e, i) => {
      // const name = time.toString()
      const name = moment(e).format('YYYY-MM-DD HH:mm:ss')
      // const label = time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds()
      const label = name
      const cpuValue = [label, value1[i]]
      const DiskValue = [label, value2[i]]
      const MemoryValue = [label, value3[i]]
      CPUData.push({ name: label, value: cpuValue })
      DISKata.push({ name: label, value: DiskValue })
      MEMORYata.push({ name: label, value: MemoryValue })
    })
    let options = {
      grid: { left: 100 },
      tooltip: {
        trigger: 'axis',
        formatter: (param) => {
          let titleArr = param[0].data.name.split(' ')
          const dom = param.map((el) => {
            const valueText = (typeof el.data.value[1] === 'number' || typeof el.data.value[1] === 'string') ? `${el.data.value[1]}%` : null
            return (
              `<div>${el.marker} ${el.seriesName}: ${emptyFilter(valueText)}</div>`
            )
          }).join('')
          return `<div>${titleArr[1] || ''} ${dom}</div>`
        }
      },
      // color: categoryColor,
      legend: {
        top: 80,
        orient: 'vertical',
        left: 'left',
        data: names.map((e) => ({ name: e, icon: 'line' }))
      },
      xAxis: {
        splitNumber: 6,
        // interval: 10,
        splitLine: {
          show: false
        },
        axisLabel: {
          show: true,
          formatter: (value, index) => {
            return moment(value).format('HH:mm:ss')
          }
        },
        type: 'time'
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: CPUData,
        type: 'line',
        name: CPU.label,
        itemStyle: {
          color: categoryColor[0]
          // barBorderRadius: 4
        },
        _label: CPU.value,
        smooth: true
      },
      {
        data: DISKata,
        type: 'line',
        name: DISK.label,
        itemStyle: {
          color: categoryColor[1]
          // barBorderRadius: 4
        },
        _label: DISK.value,
        smooth: true
      },
      {
        data: MEMORYata,
        type: 'line',
        name: MEMORY.label,
        itemStyle: {
          color: categoryColor[2]
          // barBorderRadius: 4
        },
        _label: MEMORY.value,
        smooth: true
      }].filter((e) => this.chartOpts.performanceFilterType.includes(e._label))
    }
    myChart.setOption(options, true)
  }
}
const SystemChartsForm = Form.create()(SystemCharts)
export default connect()(withRouter(SystemChartsForm))

