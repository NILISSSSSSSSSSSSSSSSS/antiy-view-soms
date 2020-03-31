import { Component, Fragment  } from 'react'
import { Form, DatePicker, Tag, Tooltip } from 'antd'
import moment from 'moment'
// 引入 ECharts 主模块
import Echarts from 'echarts/lib/echarts'
// 引入柱状图
import  'echarts/lib/chart/line'
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/dataZoom'
import './style.less'
// const { Item } = Form
const list = [
  {
    title: 'CPU',
    count: 7,
    data: 2.68
  },
  {
    title: '内存',
    count: 7,
    data: 2.68
  },
  {
    title: '磁盘',
    count: 7,
    data: 2.68
  }
]
class SystemCharts extends Component {
  constructor (props) {
    super(props)
    this.state = {
      currentIndex: 0,
      echartsData: {},
      iTitle: 'CPU',
      time: this.props.time
    }
  }
  componentDidMount () {
    this.resetTime()
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    if (JSON.stringify(this.state.echartsData) !== JSON.stringify(nextProps.echartsData)) {
      this.setState({
        echartsData: nextProps.echartsData,
        time: nextProps.time
      }, () => {
        this.initBarEcharts(nextProps.echartsData)
      })
    }
    // if (this.props.type !== nextProps.type) {
    //   this.setState({
    //     currentIndex: nextProps.type
    //   }, () => {
    //     this.initBarEcharts()
    //   })
    // }
  }

  render () {
    const { currentIndex, echartsData, iTitle, time } = this.state
    // let iTitle =
    // ['cpuMonitorStatus', 'memoryMonitorStatus', 'diskMonitorStatus'].forEach((el, i) => {
    //   if(echartsData[`${el}`] < 2)
    //     iTitle = ['CPU', '内存', '磁盘'][i]
    // })
    // let diskTotal = 0
    // if(echartsData.diskDetail && echartsData.diskDetail.length){
    //   echartsData.diskDetail.forEach(el => {
    //     if(el.includes('资源利用率:')){
    //       let init = el.split('资源利用率:')[1].replace('%', '')
    //       diskTotal += Number(init)
    //     }
    //   })
    // }
    // diskTotal += '%'
    return (
      <div className="sytem-chartss">
        <div className="charts-box">
          <div className="select-box">
            {
              list.map((item, index) => {
                return (
                  <span
                    className={currentIndex === index ? 'current-color' : ''}
                    key={index}
                    onClick={() => this.select(item, index)}>
                    {item.title}
                    {/* <span>{item.count}%</span>
                    <span>{item.data}GHZ</span> */}
                  </span>
                )
              })
            }
          </div>
          <div className="top-box">
            <div className="title">
              <span>{iTitle}</span>
              <Tag style={{ marginLeft: '10px' }}>{!(echartsData.cpuMonitorStatus || echartsData.memoryMonitorStatus || echartsData.diskMonitorStatus) ? '未启用' : '启用'}</Tag>
            </div>
            <div>
              <DatePicker
                allowClear={false}
                showToday={false}
                value= {time}
                disabledDate = {(current)=>{
                  return current && current > moment(new Date())
                }}
                onChange={d => {
                  this.setState({ time: d })
                  const { echartsData, currentIndex } = this.state
                  this.props.getEcharts(echartsData.stringId, currentIndex + 1, d)
                }} />
            </div>
          </div>
          <div id="main" style={{ width: '100%', height: 300 }}></div>
          <div className="data-box" style={{ width: currentIndex === 2 ? 'auto' : '990px' }}>
            {
              currentIndex === 0 ? <Fragment>
                <div>
                  <span>
                    <span>CPU型号: </span>
                    <Tooltip title={echartsData.cpuModel} placement="topLeft">
                      {echartsData.cpuModel}
                    </Tooltip>
                  </span>
                </div>
                <div>
                  <span>CPU空闲率(%): {echartsData.cpuFreeUsed}</span>
                </div>
                <div>
                  <span>CPU系统使用率(%): {echartsData.cpuSystemUsed}</span>
                </div>
                <div>
                  <span>CPU用户使用率(%): {echartsData.cpuUserUsed}</span>
                </div>
                <div className="border"></div>
                {/* <div>
                  <span>CPU使用率(%): {echartsData.cpuUsed}</span>
                </div>
                <div className="border"></div> */}
                <div>
                  <span>进程个数(个): {echartsData.process}</span>
                </div>
                <div className="border"></div>
              </Fragment> : currentIndex === 1 ? <Fragment>
                <div>
                  <span>内存总量(GB): {echartsData.memoryTotal && (echartsData.memoryTotal / 1048576).toFixed(2)}</span>
                </div>
                <div>
                  <span>内存使用量(GB): {echartsData.memoryUsed && (echartsData.memoryUsed / 1048576).toFixed(2)}</span>
                </div>
                <div>
                  <span>内存剩余量(GB): {echartsData.memoryFree && (echartsData.memoryFree / 1048576).toFixed(2)}</span>
                </div>
                <div>
                  <span>内存交换区总量(GB): {echartsData.memoryExchangeTotal && (echartsData.memoryExchangeTotal / 1048576).toFixed(2)}</span>
                </div>
                <div className="border"></div>
                <div>
                  <span>内存交换区使用量(GB): {echartsData.memoryExchangeUsed && (echartsData.memoryExchangeUsed / 1048576).toFixed(2)}</span>
                </div>
                <div className="border"></div>
                <div>
                  <span>内存交换区剩余量(GB): {echartsData.memoryExchangeFree && (echartsData.memoryExchangeFree / 1048576).toFixed(2)}</span>
                </div>
                <div className="border"></div>
              </Fragment> : currentIndex === 2 ? <Fragment>
                <div>
                  <span>磁盘总量(GB): {echartsData.diskTotal && (echartsData.diskTotal / 1048576).toFixed(2)}</span>
                </div>
                <div>
                  <span>磁盘个数(个): {echartsData.diskNum}</span>
                </div>
                <div>
                  <span>磁盘总利用率(%): {echartsData.value ? echartsData.value : '0'} </span>
                </div>
                <div className="disk-box">
                  <span>盘符数: </span>
                  <span>
                    {
                      echartsData.diskDetail && echartsData.diskDetail.map((item, index) => {
                        return <p key={index}>{item}</p>
                      })
                    }
                  </span>
                </div>
              </Fragment> : null
            }
          </div>
        </div>
      </div>
    )
  }

  //绘制图表
  initBarEcharts = (item) => {
    const { valueList, time, value } = item
    const { currentIndex } = this.state
    const name = currentIndex === 0 ? 'CPU' : currentIndex === 1 ? '内存' : '磁盘'
    let myChart = Echarts.init(document.getElementById('main'))
    let options = {
      title: {
        text: `利用率${value || 0}%`,
        textStyle: {
          fontWeight: 'normal',
          fontSize: 14,
          color: '#333'
        },
        left: '20px'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: ['10%'],
          data: time
        }
      ],
      dataZoom: [{
        type: 'inside',
        start: 90,
        end: 100
      }, {
        show: true,
        realtime: false,
        start: 90,
        end: 100,
        left: '10%',
        right: '10%'
      }],
      yAxis: [
        {
          type: 'value',
          splitLine: { show: false },
          axisLine: {
            show: false
          },
          axisTick: {
            length: 0
          }
        }
      ],
      series: [
        {
          name: `${name}利用率`,
          type: 'line',
          stack: '总量',
          areaStyle: {},
          smooth: true,
          data: valueList,
          itemStyle: {
            normal: {
              color: '#f1f6fa',
              lineStyle: {
                color: '#3b6cff'
              }
            }
          }
        }
      ]
    }
    myChart.setOption(options, true)
    myChart.resize()
    window.addEventListener('resize', () => {
      myChart.resize()
    })
  }

  //左侧类型选择
  select = (item, index) => {
    const { echartsData, time, currentIndex } = this.state
    if (index === currentIndex) {
      return false
    }
    this.setState({
      currentIndex: index,
      iTitle: list[index].title
    })
    this.props.getEcharts(echartsData.stringId, index + 1, time)
  }

  //时间重置
  resetTime = () => {
    this.setState({
      time: moment()
    })
  }

}
const SystemChartsForm = Form.create()(SystemCharts)
export default SystemChartsForm

