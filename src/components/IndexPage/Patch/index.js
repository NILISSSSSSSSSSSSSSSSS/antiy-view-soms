import { Component } from 'react'
import { NavLink } from 'dva/router'
// 引入 ECharts 主模块
import Echarts from 'echarts/lib/echarts'
import  'echarts/lib/chart/pie'
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import api from '@/services/api'

class Patch extends Component {
  constructor (props) {
    super(props)
    this.state = {
      total: '',
      showData: false
    }
  }
  componentDidMount () {
    this.getPatchData()
  }

  UNSAFE_componentWillReceiveProps (nextProps) {

  }

  render () {
    let { total, showData } = this.state
    return (
      <div className="charts-box">
        <div className="charts-box-title">
          <span>未安装补丁</span>
          <NavLink to="/bugpatch/patchmanage/patchinstall">更多</NavLink>
        </div>
        {showData ? <div className="bugTotal">{total}</div> : null}
        {showData ? <div id="patch-main" style={{ width: '100%', height: '100%' }}></div> :
          <div className="empty-content"><img src={require('@/assets/noData.png')} alt="" /><p className="nodataTextCss">暂无内容</p></div>
        }
      </div>
    )
  }

  //获取补丁数据
  getPatchData = () => {
    api.getPatchCount({}).then(response => {
      if(response && response.head && response.head.code === '200' ){
        const data = response.body
        const nameList = [ '严重', '重要', '中等'].reverse()
        const color = []
        let dataList = [], total = 0
        data.forEach(item => {
          const { patchCount, grade } = item
          dataList.push({
            value: patchCount,
            name: nameList[grade - 1]
          })
          color.push(['#ff426f', '#3b6cff', '#05cc7f'][grade - 1])
          total += patchCount
        })
        this.setState({ total })
        if (dataList.length)
          this.setState({
            showData: true
          }, ()=> {
            this.initPatchCharts(dataList, total, color)})
        else
          this.setState({
            showData: false
          })
      }
    }).catch(err => {})
  }

  //补丁绘图
  initPatchCharts = (data, total, color) => {
    let title = data.filter(now=>now.value >= 0)
    let myChart = Echarts.init(document.getElementById('patch-main'))
    let options = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      color: color.reverse(),
      legend: {
        selectedMode: false,
        orient: 'vertical',
        bottom: 'center',
        right: '10%',
        data: title
      },
      series: [
        {
          name: '未安装补丁',
          type: 'pie',
          //位置
          center: ['30%', 'center'],
          radius: ['30%', '50%'],
          avoidLabelOverlap: false,
          label: {
            normal: {
              show: true,
              position: 'center',
              formatter: ()=> ''
            }
          },
          data
        }
      ]
    }
    myChart.setOption(options)
    myChart.resize()
    window.addEventListener('resize', () => {
      myChart.resize()
    })
    // myChart.on('click', this.goToPatch)
  }

  //补丁跳转
  // goToPatch= (param) => {
  //   const type = param.name === '严重' ? 3 : param.name === '中等' ? 1 : 2
  //   if(param.event.target.style.textFill !== '#333')
  //     this.props.history.push(`/bugpatch/patchmanage/patchinstall?grade=${type}`)
  // }

}

export default Patch
