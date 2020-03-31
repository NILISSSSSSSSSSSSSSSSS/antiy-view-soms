import { PureComponent } from 'react'
import { connect } from 'dva'
import { NavLink } from 'dva/router'
import { Table, Tooltip } from 'antd'
import './style.less'
// 引入 ECharts 主模块
import Echarts from 'echarts/lib/echarts'
import  'echarts/lib/chart/pie'
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
// import moment from 'moment'
import api from '@/services/api'
import { transliteration, emptyFilter } from '@/utils/common'
import './style.less'
// import hasAuth from '@/utils/auth'
import AssetModal from '@/components/Asset/AssetModal'

class AssetManufacturer extends PureComponent {
  state = {
    PrefixCls: 'AssetManufacturer',
    visible: false,
    body: null,
    pagingParameter: {
      pageSize: 10,
      currentPage: 1
    },
    // assetType: 'hard',
    assetList: [],
    isOthers: false,
    // assetStatusList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // 新增必带参数
    assetStatusList: [6, 10],
    manufacturers: null,
    manufacturerTotal: 0 // 总数
  }

  //获取图表数据
  getAssetData = (type) => {
    // const url = type === 'hard' ? 'assetCountManufacturer' : 'assetCountManufacturerSoftware'
    const text = type === 'hard' ? '硬件' : '软件'
    api.assetCountManufacturer().then(response => {
      if(response && response.head && response.head.code === '200' ){
        const data = response.body
        let dataList = [], typeList = [], assetList = [], total = 0
        data.forEach(item => {
          let { number, msg, code } = item
          msg = msg === '' ? text : msg
          dataList.push({
            value: number,
            name: msg
          })
          assetList.push({
            name: msg,
            id: code
          })
          total += number
          typeList.push(msg)
        })
        this.setState({
          assetList,
          manufacturerTotal: total
        })
        this.initCharts(dataList, typeList, total)
      }
    }).catch(err => {console.log(err)})
  }

  //绘图
  initCharts = (data, typeList, total) => {
    let myChart = Echarts.init(document.getElementById('asset-manufacturers-main'))
    let options = {
      tooltip: {
        // show: true,
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      color: ['#3B6CFF', '#5BCDFF', '#AD7AFF', '#05CC7F', '#FFC438', '#FF9973'],
      legend: {
        selectedMode: false,
        orient: 'vertical',
        bottom: 'center',
        left: '72%',
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 20,
        icon: 'rect',
        data: typeList,
        textStyle: {
          color: '#ffffff'
        }
      },
      series: [
        {
          name: '厂商统计',
          type: 'pie',
          //位置
          center: ['40%', 'center'],
          radius: ['30%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center',
            formatter: ()=>'',
            textStyle: {
              fontSize: '28',
              color: '#333'
            }
          },
          data
        }
      ]
    }
    window.addEventListener('resize', () => {
      myChart.resize()
    })
    myChart.resize()
    myChart.setOption(options, true)
    myChart.on('click', this.chartsClick)
  }

  //图表点击
  chartsClick = (data) => {
    const { assetList } = this.state
    let currentId, isOthers
    if (data.name === '其它') {
      isOthers = true
      //id为除开其它以外全部id的集合
      currentId = assetList.filter(item => item.name !== data.name).map(item => item.id && item.id[0] ? item.id[0] : null)
    } else {
      isOthers = false
      currentId = assetList.filter(item => item.name === data.name)[0]
      currentId = currentId && currentId.id && currentId.id[0] ? currentId.id[0] : null
    }
    this.setState({
      visible: true,
      isOthers,
      manufacturers: currentId,
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      }
    }, () => {
      this.getList({ ...this.state.pagingParameter })
    })
  }

  //获取列表
  getList = (param) => {
    const { manufacturers, isOthers, assetStatusList } = this.state
    // const url = assetType === 'hard' ? 'getAssetList' : 'getSoftwareList'
    this.setState({
      pagingParameter: {
        pageSize: param.pageSize,
        currentPage: param.currentPage
      }
    })
    //查询其他时需要传的参数
    if (isOthers) {
      param.removeManufacturers = manufacturers
    }else{
      param.manufacturers = [manufacturers]
    }
    // assetType === 'hard' && (param.assetStatusList = assetStatusList)

    param.assetStatusList = assetStatusList
    api.getAssetList(param).then(response => {
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

  render () {
    const { visible, body, pagingParameter, PrefixCls, manufacturerTotal } = this.state
    const TooltipFn = text=>{
      return (
        <Tooltip getPopupContainer={triggerNode => triggerNode.parentNode} placement="topLeft" title={text}>
          {emptyFilter(text)}
        </Tooltip>
      )
    }
    const hardColumns = [
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
        title: '资产类型',
        dataIndex: 'categoryModelName',
        width: '10%',
        render: text=>TooltipFn(text)
      },
      {
        title: '厂商',
        dataIndex: 'manufacturer',
        width: '14%',
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
        dataIndex: 'assetGroup',
        width: '14%',
        render: text=>TooltipFn(text)
      },
      {
        title: '状态',
        dataIndex: 'assetStatus',
        width: '8%',
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
          // const url = this.state.assetType === 'hard' ? 'hardware' : 'software'
          // return hasAuth('asset:hard:ckxq') ?
          // : null
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

    const manufacturersTable = (
      <Table
        rowKey="stringId"
        columns={hardColumns}
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

    const manufacturersModal = {
      title: '厂商统计',
      visible: visible,
      width: 1100,
      onOk: ()=>{this.setState({ visible: false })},
      onCancel: ()=>{this.setState({ visible: false })},
      children: manufacturersTable,
      isFooter: false
    }

    return (
      <div className={PrefixCls}>
        <div className="asset-overview-title">
          <span>厂商统计</span>
        </div>
        <div className="content-box">
          <div className="bugTotal">{manufacturerTotal}</div>
          <div id="asset-manufacturers-main"  style={{ width: '90%', height: 400 }} />
        </div>

        <AssetModal data={manufacturersModal}/>
      </div>
    )
  }

  componentDidMount () {
    this.getAssetData('hard')
  }

}
export default connect()(AssetManufacturer)
