import { Component } from 'react'
// 引入 ECharts 主模块
import Echarts from 'echarts/lib/echarts'
import  'echarts/lib/chart/line'
import api from '@/services/api'

class Asset extends Component {
  constructor (props) {
    super(props)
    this.state = {
      data: {
        name: '',
        body: []
      }
    }
  }
  componentDidMount () {
    this.getAssetData()
  }
  render () {
    const { data } = this.state
    return (
      <div className="charts-box">
        <div className='block-header-title'>
          资产在线情况
        </div>
        {data.body.length ? (<div id="asset-on-line" ></div> ) :
          (<div className="empty-content"><img src={require('@/assets/noData.png')} alt="" />
            <p className="nodataTextCss">暂无内容</p></div>)
        }
      </div>
    )
  }

  //获取资产数据
  getAssetData = () => {
    let { data } = this.state
    api['getAssetOnLine']().then(response => {
      data.name = response.body.coordinate.name
      data.body = response.body.coordinate.data
      this.setState({ data }, ()=>this.initAassetCharts())
    }).catch(err => { console.log(err) })
  }

  //资产绘图
  initAassetCharts = () => {
    let { data } = this.state
    const { screen } = this.props
    let myChart = Echarts.init(document.getElementById('asset-on-line'))
    let options = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { // 坐标轴指示器，坐标轴触发有效
          type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      grid: {
        width: '95%',
        top: '10%',
        left: '2.5%',
        right: '2.5%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.body.map(item=>item.name),
        boundaryGap: false,
        axisTick: {
          show: true
        },
        axisLabel: {
          textStyle: {
            color: 'rgba(255,255,255,0.8)',
            fontSize: 10
          },
          formatter: function (params) {
            return params.split(' ')[0]
          }
        },
        axisLine: {
          show: false,
          lineStyle: {
            color: 'rgba(255,255,255,0)'
          }
        },
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false,
          lineStyle: {
            color: 'rgba(255,255,255,0.3)'
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255,255,255,0.2)'
          }
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: 'rgba(255,255,255,0.8)',
            fontSize: 10
          },
          formatter: function (value) {
            return value
          }
        }
      },
      series: [{
        name: data.name,
        type: 'line',
        color: '#4083FF',
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        showSymbol: false,
        areaStyle: {
          normal: {
            color: '#4083FF'
          }
        },
        data: data.body.map(item=>item.value)
      }]
    }
    myChart.setOption(options)
    myChart.resize()
    window.addEventListener('resize', () => {
      myChart.resize()
    })
    // myChart.on('click', this.goToAsset)
  }

  //资产总计
  getAsset = (param) => {
    // let type
    // ['计算设备', '网络设备', '安全设备', '存储设备', '其它设备'].forEach((item, i) => {
    //   if (item === param.name) type = i + 1
    // })
    // this.props.history.push(`/asset/manage?assetType=${type}`)
  }
}

export default Asset
