import { Component } from 'react'
// 引入 ECharts 主模块
import Echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/bar'
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import api from '@/services/api'

class Warning extends Component {
  constructor (props) {
    super(props)
    this.state = {
      body: {
        currentCount: [],
        historyCount: [],
        date: []
      }
    }
  }
  componentDidMount () {
    this.getWarningData()
  }

  render () {
    let { body } = this.state
    return (
      <div className="charts-box">
        <div className='block-header-title'>
          告警处理变化趋势(近7天)
        </div>
        {body.date.length ? <div id="warnings-main" ></div> :
          <div className="empty-content"><img src={require('@/assets/noData.png')} alt="" /><p className="nodataTextCss">暂无内容</p></div>
        }
      </div>
    )
  }

  //获取告警数据
  getWarningData = () => {
    api.getAlarmChange().then(response => {
      if(response.body.length){
        let { currentCount, historyCount, date } = this.state.body
        response.body.forEach(item=>{
          currentCount.push(item.currentCount)
          historyCount.push(item.historyCount)
          date.push(item.date)
        })
        this.setState({
          body: {
            currentCount, historyCount, date
          }
        }, this.initWarningCharts)
      }
    }).catch(err => { })
  }

  //告警绘图
  initWarningCharts = () => {
    const { screen } = this.props
    let { currentCount, historyCount, date } = this.state.body
    let myChart = Echarts.init(document.getElementById('warnings-main'))
    let options = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { // 坐标轴指示器，坐标轴触发有效
          type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      legend: {
        data: ['已处理', '未处理'],
        icon: 'circle',
        align: 'left',
        left: '20px',
        bottom: '30px',
        itemGap: 20,
        textStyle: {
          color: '#fff'
        }
      },
      grid: {
        width: '95%',
        top: '30px',
        left: '2.5%',
        right: '2.5%',
        bottom: '80px',
        containLabel: true
      },
      xAxis: {
        data: date,
        axisLine: {
          show: false,
          lineStyle: {
            color: 'rgba(255,255,255,0)'
          }
        },
        axisLabel: {
          color: '#fff',
          fontSize: 10
        },
        splitLine: {
          show: false
        }
      },
      yAxis: {
        nameTextStyle: {
          color: '#fff',
          fontSize: 10
        },
        axisLine: {
          show: false,
          lineStyle: {
            color: '#151B30'
          }
        },
        axisLabel: {
          show: true,
          color: '#fff',
          fontSize: 10
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(255,255,255,0.2)'
          }
        }
      },
      series: [{
        name: '已处理',
        type: 'bar',
        barWidth: 18,
        showSymbol: false,
        itemStyle: {
          normal: {
            color: '#4083FF'
          }
        },
        data: historyCount
      }, {
        name: '未处理',
        type: 'bar',
        showSymbol: false,
        barWidth: 18,
        itemStyle: {
          normal: {
            color: '#22B37A'
          }
        },
        data: currentCount
      }]
    }
    myChart.setOption(options)
    myChart.resize()
    window.addEventListener('resize', () => {
      myChart.resize()
    })
    //链接跳转
    // myChart.on('click', this.goToAlarm)
  }

  //告警跳转
  goToAlarm = (param) => {
    let type
    ['漏洞告警', '', '配置告警', '威胁事件告警', '安全设备性能告警', '安全运维服务性能告警', '异常资产告警'].forEach((item, i) => {
      if (param.name === item) type = i + 1
    })
    this.props.history.push(`/logalarm/alarm/manage?alarmType=${type}`)
  }
}

export default Warning
