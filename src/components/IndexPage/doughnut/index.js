import { Component } from 'react'
// 引入 ECharts 主模块
import Echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/pie'
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'

import api from '@/services/api'

export default class DoughnutChart extends Component {
  constructor (props) {
    super(props)
    this.state = {
      order: props.order,
      chartTitle: props.title || '',
      elId: props.id, //图表的dom ID
      data: {}, //图表数据
      fun: props.fun || null, //点击图表执行的方法
      location: props.location || {},
      background: props.background || 'rgb(0,0,0,0)',
      chartLength: props.size || 6, // 多少字符换行
      colors: props.color
    }
  }
  componentDidMount () {
    // this.props.onDoughnutChart(this)
    if(this.props.service) this.getData()
  }
  //请求数据
  getData= () => {
    api[this.props.service]().then(data=>{
      this.setState({ data: this.changeData(data) }, ()=>this.initAassetCharts())
    })
  }
  //调整数据结构
  changeData = (data)=>{
    if(!(data.body || data.body.length)) return void (0)
    let init = {
      body: [],
      total: 0
    }
    switch(this.state.order){
      case 1:
      case 2:
        data.body.forEach(item => {
          const { number, msg } = item
          init.body.push({
            value: number,
            name: msg
          })
          init.total += number
        })
        break
      case 3:
        let V = data.body
        init.body = [
          { value: V.emergentCount, name: '紧急告警' },
          { value: V.importantCount, name: '重要告警' },
          { value: V.secondaryCount, name: '次要告警' },
          { value: V.promptCount, name: '提示告警' }
        ]
        init.body.forEach(item=>{
          init.total += item.value
        })
        this.props.callBackRisk(init.total)
        break
      case 4:
        for (let item in data.body) {
          init.total += data.body[`${item}`]
        }
        init.body = [
          { value: data.body.vulAlarmCount, name: '漏洞告警' },
          { value: data.body.configAlarmCount, name: '配置告警' },
          { value: data.body.abnormalAssetAlarmCount, name: '异常资产告警' },
          { value: data.body.threatEvenAlarmCount, name: '威胁事件告警' },
          { value: data.body.safetyPerformanceAlarmCount, name: '安全设备性能告警' },
          { value: data.body.systemMonitorAlarmCount, name: '安全运维服务性能告警' }
        ]
        break
      default:
        break
    }
    return init
  }
  //环形图
  initAassetCharts = () => {
    const wordBreak = true
    const { fun, elId, data, background, colors, chartTitle } = this.state
    const { screen = 1700 } = this.props
    const radius = ['30%', '50%']
    if (!(data.body && data.body.length)) return void (0)
    let myChart = Echarts.init(document.getElementById(elId))
    let options = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      title: [{
        text: data.total,
        textStyle: {
          fontSize: 22,
          color: '#FFFFFF',
          lineHeight: 32
        },
        textAlign: 'center',
        x: '30.5%',
        y: '36%'
      }],
      color: colors,
      legend: {
        selectedMode: false,
        orient: 'vertical',
        top: screen < 1700 ? '0px' : '50px',
        left: '65%',
        itemWidth: 12,
        itemHeight: 12,
        icon: 'rect',
        itemGap: 20,
        textStyle: {
          color: '#FFFFFF',
          fontSize: 12
        },
        data: data.body.map(item=>item.name)
      },
      series: [
        {
          name: chartTitle,
          type: 'pie',
          //位置
          center: ['31.5%', '40%'],
          radius: ['30%', '50%'],
          avoidLabelOverlap: false,
          label: {
            normal: {
              show: true,
              position: 'center',
              formatter: () => '',
              textStyle: {
                fontSize: '28',
                color: '#333'
              }
            }
          },
          data: data.body
        }
      ]
    }
    myChart.setOption(options)
    myChart.resize()
    window.addEventListener('resize', () => {
      myChart.resize()
    })
    if (fun) myChart.on('click', fun)
  }
  render () {
    const { elId, data, chartTitle } = this.state
    return (
      <div className='charts-box'>
        <div className='block-header-title'>
          {chartTitle}
        </div>
        {/* {!!(data.body && data.body.length) ? <div className="asset-total">{data.total}</div> : null} */}
        {!!(data.body && data.body.length)
          ? <div id={elId} className='chart-show' style={{ }}></div>
          :  (<div className="empty-content"><img src={require('@/assets/noData.png')} alt="" />
            <p className="nodataTextCss">暂无内容</p></div>)
        }
      </div>
    )
  }
}
