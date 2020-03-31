import { Component } from 'react'
import { connect } from 'dva'
import { NavLink } from 'dva/router'
import { Modal, Table, Pagination, Tag } from 'antd'
import Tooltip from '@/components/common/CustomTooltip'
import moment from 'moment'
import Status from '@/components/common/Status'
import { emptyFilter } from '@/utils/common'
import './style.less'
// 引入 ECharts 主模块
import Echarts from 'echarts/lib/echarts'
import color from '@/them/them'
// 引入柱状图
import  'echarts/lib/chart/pie'
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import api from '@/services/api'
// import hasAuth from '@/utils/auth'
// import { transliteration } from '@/utils/common'
const { categoryColor, canvasLegendStyle } = color
class SafeEquipment extends Component {
  constructor (props) {
    super(props)
    this.columns = [
      {
        title: '名称',
        dataIndex: 'name',
        render: (text)=>{
          return (
            <Tooltip title={ text } placement="top">
              { text }
            </Tooltip>
          )
        }
      },
      {
        title: '编号',
        dataIndex: 'number',
        key: 'number',
        render: (text)=>{
          return (
            <Tooltip title={ text } placement="top">
              { text }
            </Tooltip>
          )
        }
      },
      {
        title: '资产类型',
        dataIndex: 'categoryModelName',
        key: 'categoryModelName',
        render: (text)=>{
          return (
            <Tooltip title={ text } placement="top">
              { text }
            </Tooltip>
          )
        }
      },
      {
        title: 'IP',
        dataIndex: 'ip',
        key: 'ip',
        width: 135,
        render: (text)=>{
          return (
            <Tooltip title={ text } placement="top">
              { text }
            </Tooltip>
          )
        }
      },
      {
        title: '网络连接',
        dataIndex: 'networkState',
        key: 'networkState',
        width: 100,
        render: (v) => {
          return <Status level={ v === '1' ? '0' : '5'}/>
        }
      },
      {
        title: '状态',
        dataIndex: 'manage',
        key: 'manage',
        width: 80,
        render: (text)=>{
          return(
            text ?  '已管理' : '未管理'
          )
        }
      },
      {
        title: '首次入网时间',
        width: 170,
        dataIndex: 'firstEnterNett',
        key: 'firstEnterNett',
        render: (timestamp) => {
          const text = timestamp <= 0 ? '' : moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
          return <span className="tabTimeCss">{ emptyFilter(text) }</span>

        }
      }
    ]
    this.state = {
      visible: false,
      body: null,
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      equipmentsInfo: {},
      categoryModels: null,
      //所有资产类型标签
      tagsList: [],
      //当前展示的标签
      tags: [],
      equipmentTotal: 0 // 设备总数
    }
  }
  componentDidMount () {
    this.getData()
    this.getEquipmentsInfo()
  }
  //获取设备数
  getEquipmentsInfo = () => {
    api.safetyequipmentEquipments().then(response => {
      if(response && response.head && response.head.code === '200' ){
        let data = response.body
        // data.assetSafetyManagedEquipment = 10
        // data.assetSafetyEquipment = 30
        // data.assetSafetyUnmanageEquipment = 20
        data.manage = (data.assetSafetyManagedEquipment / data.assetSafetyEquipment * 100 ).toFixed(2)
        data.unManage = (data.assetSafetyUnmanageEquipment / data.assetSafetyEquipment * 100).toFixed(2)
        console.log(data)
        this.setState({
          equipmentsInfo: data || {}
        })
      }
    }).catch(err => {})
  }

  //获取图表数据
  getData = () => {
    api.safetyequipmentQueryCategory().then(response => {
      if(response && response.head && response.head.code === '200' ){
        const data = response.body
        let total = 0, list = [], typeList = [], tagsList = []
        data.forEach(item => {
          total += item.categoryNumber
          list.push({
            name: item.categoryName,
            value: item.categoryNumber
          })
          typeList.push(item.categoryName)
          tagsList.push({
            id: item.categoryId[0],
            children: item.categoryId,
            name: item.categoryName
          })
        })
        this.setState({
          tagsList,
          equipmentTotal: total
        })
        this.initCharts(list, typeList, total)
      }
    }).catch(err => {})
  }

  //绘图
  initCharts = (data, typeList, total) => {
    let myChart = Echarts.init(document.getElementById('equipment-main'))
    let options = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      color: categoryColor,
      legend: {
        selectedMode: false,
        orient: 'vertical',
        bottom: 'center',
        right: '30%',
        textStyle: canvasLegendStyle,
        data: typeList
      },
      series: [
        {
          name: '设备总览',
          type: 'pie',
          //位置
          center: ['30%', 'center'],
          radius: ['30%', '50%'],
          avoidLabelOverlap: false,
          label: {
            normal: {
              show: false,
              position: 'center'
            }
          },
          data
        }
      ]
    }
    myChart.setOption(options)
    myChart.on('click', this.chartsClick)
  }

  //图表点击
  chartsClick = (data) => {
    const current = this.state.tagsList.filter(item => item.name === data.name)
    this.setState({
      visible: true,
      tags: [data.name],
      categoryModels: current[0].children || []
    }, () => {
      this.getList({
        ...this.state.pagingParameter
      })
    })
  }

  //筛选所有
  getAllList = ()=> {
    this.setState({
      tags: [],
      categoryModels: null
    }, () => {
      this.getList({
        ...this.state.pagingParameter
      })
    })
  }

  //获取列表
  getList = (param) => {
    this.setState({
      pagingParameter: {
        pageSize: param.pageSize,
        currentPage: param.currentPage
      }
    })
    if (this.state.categoryModels) {
      param.categoryModels = this.state.categoryModels
    }
    api.equipmentQueryList(param).then(response => {
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

  hideModal = () => {
    this.setState({
      visible: false,
      body: null
    })
  }
  render () {
    const { visible, body, pagingParameter, tags, equipmentsInfo, equipmentTotal } = this.state
    let list  = []
    let total =  0
    let { assetSafetyEquipment = 0, assetSafetyManagedEquipment = 0, assetSafetyUnmanageEquipment = 0, manage = 0, unManage = 0 } = equipmentsInfo
    if (body){
      list = body.items
      total =  body.totalRecords
    }
    return (
      <div className="equipment">
        <div className="safe-overview-title">
          <span>设备总览</span>
          <NavLink to="/safe/equipment" className="link-color">更多</NavLink>
        </div>
        <div className="content-box">
          <p className="sub-title">设备总数：{assetSafetyEquipment}</p>
          <div className="progress-box">
            {
              !assetSafetyManagedEquipment  && !assetSafetyUnmanageEquipment && (<div className="progress-placeholder">{/*没有数据时，占位*/}</div>)
            }
            {
              typeof assetSafetyManagedEquipment === 'number' && assetSafetyManagedEquipment !== 0 ? <div className="left-progress" style={{ width: `${manage}%` }}>{assetSafetyManagedEquipment}</div> : null
            }
            {
              typeof assetSafetyUnmanageEquipment === 'number' && assetSafetyUnmanageEquipment !== 0 ? <div className="right-progress"  style={{ width: `${unManage}%` }}>{assetSafetyUnmanageEquipment}</div> : null
            }
          </div>
          <div className="text-box clearfix">
            <span className="float-l">已纳入管理设备数：{assetSafetyManagedEquipment}</span>
            <span className="float-r">未管理设备数：{assetSafetyUnmanageEquipment}</span>
          </div>
          <div className="bugTotal">{equipmentTotal}</div>
          <div id="equipment-main"  style={{ width: '100%', height: 400 }} />
        </div>
        {/* 列表弹框 */}
        <Modal
          className="equipment-modal"
          width={1200}
          title="设备总览"
          visible={visible}
          onOk={this.hideModal}
          onCancel={this.hideModal}
          footer={null}
          okText="确认"
          cancelText="取消"
        >
          <div className="table-wrap">
            <div className="tags-box">
              {
                tags.map(item => {
                  return (
                    <Tag
                      key={item}
                      closable
                      onClose={this.getAllList}
                    >
                      {item}
                    </Tag>
                  )
                })
              }
            </div>
            <Table rowKey="assetId" columns={this.columns} dataSource={list} pagination={false} />
            {
              total
                ? <Pagination
                  className="table-pagination"
                  total={total} showTotal={(total) => `共 ${total || 0} 条数据`}
                  showSizeChanger={false}
                  showQuickJumper={true}
                  onChange={this.changePage}
                  onShowSizeChange={this.changeShowSize}
                  pageSize={pagingParameter.pageSize}
                  current={pagingParameter.currentPage} />
                : null
            }
          </div>
        </Modal>
      </div>
    )
  }

}
export default connect()(SafeEquipment)
