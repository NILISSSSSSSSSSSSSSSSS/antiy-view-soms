import { Component } from 'react'
import echarts from 'echarts/lib/echarts'
// 引入柱状图
import  'echarts/lib/chart/bar'
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'

class ReportFormAssetColumnar extends Component{
  constructor (props){
    super(props)
    this.state = {
      list: {},
      Date: '',
      custom: false,
      iData: props.iData
    }
  }

  componentDidMount (){
    this.init(this.state.iData)
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    if(JSON.stringify(nextProps.iData) !== '{}')
      this.setState({ iData: nextProps.iData }, ()=>{
        this.init(this.state.iData)
      })
  }
  render (){
    return(
      <div id="asset-chart-columnar" style={{ width: '100%', minHeight: 450 }}></div>
    )
  }
  init = (iData)=>{
    let init = echarts.init(document.getElementById('asset-chart-columnar'))
    init.setOption({
      title: {
        text: iData.title,
        x: iData.align,
        textStyle: {
          rich: {
            span: {
              fontWeight: 'bolder',
              fontSize: 14,
              color: '#fff',
              fontFamily: 'PingFangSC-Regular',
              padding: [0, 0, 0, 20]
            }
          }
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: iData.list.map(item=>item.classify),
        bottom: 0,
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 20,
        icon: 'circle',
        left: '3%',
        formatter: function (value) {
          return (value.length > 10 ? (value.slice(0, 6) + '...') : value )
        },
        selectedMode: false,
        textStyle: {
          color: '#ffffff'
        }
      },
      calculable: true,
      grid: {
        top: '13%',
        left: '3%',
        right: '3%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: iData.date,
        axisLine: {
          show: true,
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.2)'
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
            lineStyle: {
              type: 'solid',
              color: 'rgba(255, 255, 255, 0.2)'
            }
          }
        }
      ],
      series: iData.list.map((item, index)=>{
        return{
          name: item.classify,
          type: 'bar',
          data: item.data ? item.data : [],
          itemStyle: {
            color: ['#3b6cff', '#43bdff', '#f7ccc7', '#05cc7f', '#9d60ff'][index],
            barBorderRadius: 4
          },
          barWidth: 4,
          barGap: '200%'
        }
      })
    }, true)
    init.resize()
    window.addEventListener('resize', () => {
      init.resize()
    })
  }
}

export default ReportFormAssetColumnar
