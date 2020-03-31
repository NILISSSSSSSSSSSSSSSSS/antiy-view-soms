import { PureComponent } from 'react'
import { connect } from 'dva'
import { NavLink } from 'dva/router'
import { Table, Tooltip } from 'antd'
import './style.less'
// 引入 ECharts 主模块
import Echarts from 'echarts/lib/echarts'
// 引入柱状图
import  'echarts/lib/chart/bar'
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import api from '@/services/api'
import { transliteration, emptyFilter } from '@/utils/common'
import './style.less'
// import hasAuth from '@/utils/auth'
import AssetModal from '@/components/Asset/AssetModal'

class AssetStatus extends PureComponent {
  state = {
    PrefixCls: 'AssetStatus',
    visible: false,
    body: null,
    pagingParameter: {
      pageSize: 10,
      currentPage: 1
    },
    assetType: 'hard',
    assetList: []
  }

  //获取图表数据
  getAssetData = (type) => {
    // const url = type === 'hard' ? 'assetCountManuStatus' : 'assetCountManuStatusSoftware'
    api.assetCountManuStatus().then(response => {
      if(response && response.head && response.head.code === '200' ){
        const data = response.body
        let dataList = [], typeList = [], assetList = []
        data.forEach(item => {
          const { number, msg, code } = item
          dataList.push(number)
          typeList.push(msg)
          assetList.push({
            name: msg,
            id: code
          })
        })
        this.setState({
          assetList
        })
        this.initCharts(dataList, typeList)
      }
    }).catch(err => {console.log(err)})
  }

  //绘图
  initCharts = (dataList, typeList) => {
    let myChart = Echarts.init(document.getElementById('asset-status-main'))
    const options = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}'
      },
      calculable: true,
      grid: {
        top: '22%',
        left: '3%',
        right: '3%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: typeList,
        axisLine: {
          show: true,
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        axisLabel: {
          rotate: -36,
          formatter: (params)=>{
            return '{marginLeft|' + params + '}'
          },
          rich: {
            marginLeft: {
              // padding: [0, -20, 32, 0],
              color: '#98ACD9',
              fontSize: 10,
              interval: 0
            }
          }
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
      series: [
        {
          name: '资产状态统计',
          smooth: true,
          type: 'bar',
          data: dataList,
          itemStyle: {
            color: '#4B62FF',
            barBorderRadius: 4
          },
          barGap: '300%',
          barWidth: 5
        }
      ]
    }
    myChart.setOption(options)
    myChart.on('click', this.chartsClick)
  }

  //图表点击
  chartsClick = (data) => {
    const { assetList } = this.state
    const current = assetList.filter(item => item.name === data.name)[0]
    this.setState({
      visible: true,
      assetStatus: current.id[0],
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      }
    }, () => {
      this.getList({
        ...this.state.pagingParameter
      })
    })
  }

  //获取列表
  getList = (param) => {
    let url = ''
    this.setState({
      pagingParameter: {
        pageSize: param.pageSize,
        currentPage: param.currentPage
      }
    })
    if(this.state.assetType === 'hard'){
      url = 'getAssetList'
      param.assetStatus = this.state.assetStatus
    }
    // else {
    //   url = 'getSoftwareList'
    //   param.softwareStatus = this.state.assetStatus
    // }
    api[url](param).then(response => {
      if(response && response.head && response.head.code === '200' ){
        this.setState({
          body: response.body
        })
      }
    }).catch(err => {})
  }

  //改变当前页显示数量
  changeShowSize = (currentPage, pageSize) => {
    this.pageModify(pageSize, currentPage)
  }

  //当前页码改变
  changePage = (currentPage) => {
    const pageSize = this.state.pagingParameter.pageSize
    this.pageModify( pageSize, currentPage)
  }

  //页面修改
  pageModify = ( pageSize, currentPage) => {
    let values = {
      currentPage,
      pageSize
    }
    this.getList(values)
  }

  //类型切换
  getAsset = (e) => {
    this.setState({
      assetType: e.target.value,
      visible: false,
      assetStatus: null
    })
    this.getAssetData(e.target.value)
  }

  render () {
    const { visible, body, pagingParameter, PrefixCls } = this.state
    const TooltipFn = text=>{
      return (
        <Tooltip getPopupContainer={triggerNode => triggerNode.parentNode} placement="topLeft" title={text}>
          {emptyFilter(text)}
        </Tooltip>
      )
    }
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        width: '14%',
        render: text=>TooltipFn(text)
      },
      {
        title: '编号',
        dataIndex: 'number',
        width: '12%',
        render: text=>TooltipFn(text)
      },
      {
        title: '类型',
        dataIndex: 'categoryModelName',
        width: '10%',
        render: text=>TooltipFn(text)
      },
      {
        title: '厂商',
        dataIndex: 'manufacturer',
        width: '12%',
        render: text=>TooltipFn(text)
      },
      {
        title: 'IP',
        dataIndex: 'ips',
        width: '12%',
        render: text=>TooltipFn(text)
      },
      {
        title: 'MAC',
        dataIndex: 'macs',
        width: '14%',
        render: text=>TooltipFn(text)
      },
      {
        title: '资产组',
        width: '14%',
        dataIndex: 'assetGroup',
        render: text=>TooltipFn(text)
      },
      {
        title: '状态',
        width: '8%',
        dataIndex: 'assetStatus',
        render: (status)=>{
          switch (status) {
            case(1): return (<span >待登记</span>)
            case(2): return (<span >不予登记</span>)
            case(3): return (<span >待实施</span>)
            case(4): return (<span >待验证</span>)
            case(5): return (<span >待入网</span>)
            case(6): return (<span >已入网</span>)
            case(7): return (<span >待检查</span>)
            case(8): return (<span >待整改</span>)
            case(9): return (<span >变更中</span>)
            case(10): return (<span >待退役</span>)
            case(11): return (<span >已退役</span>)
            default:
              break
          }
        }
      },
      // {
      //   title: '首次发现时间',
      //   dataIndex: 'gmtCreate',
      //   width: 160, //这里写了固定宽度
      //   render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss')
      // },
      {
        title: '操作',
        key: 'operate',
        width: '14%',
        render: (record) => {
          return (
            <div className="operate-wrap">
              <NavLink to={`/asset/manage/detail?id=${transliteration(record.stringId)}`}>
                查看
              </NavLink>
            </div>
          )
        }
      }
    ]
    let list  = []
    let total =  0
    if (body){
      list = body.items
      total =  body.totalRecords
    }

    const statusTable = (
      <Table
        rowKey="stringId"
        columns={columns}
        dataSource={list}
        pagination={{
          current: pagingParameter.currentPage,
          pageSize: pagingParameter.pageSize,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total || 0} 条数据`,
          total: total,
          onChange: this.changePage
        }}
      />
    )

    const statusModal = {
      title: '资产状态统计',
      visible: visible,
      width: 1100,
      onOk: ()=>{this.setState({ visible: false })},
      onCancel: ()=>{this.setState({ visible: false })},
      children: statusTable,
      isFooter: false
    }

    return (
      <div className={PrefixCls}>
        <div className="asset-overview-title">
          <span>资产状态统计</span>
        </div>
        <div className="content-box">
          <div id="asset-status-main"  style={{ width: '100%', height: 300 }} />
        </div>
        <AssetModal data={statusModal}/>
      </div>
    )
  }

  componentDidMount () {
    this.getAssetData('hard')
  }

}
export default connect()(AssetStatus)
