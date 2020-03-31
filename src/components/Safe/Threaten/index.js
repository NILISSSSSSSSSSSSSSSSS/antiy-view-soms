import { Component } from 'react'
import { connect } from 'dva'
import { NavLink } from 'dva/router'
import { Modal, Table, Pagination, Tag, Select } from 'antd'
import moment from 'moment'
// 引入 ECharts 主模块
import Echarts from 'echarts/lib/echarts'
// 引入柱状图
import  'echarts/lib/chart/pie'
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip'
import color from '@/them/them'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import api from '@/services/api'
// import { transliteration } from '@/utils/common'
import './style.less'
const Option = Select.Option
const { categoryColor, canvasLegendStyle } = color
class SafeThreaten extends Component {
  constructor (props) {
    super(props)
    this.state = {
      visible: false,
      columns: [
        {
          title: '最后活跃时间',
          dataIndex: 'registTime',
          render: timestamp => timestamp <= 0 ? '' : moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
        },
        {
          title: '描述',
          dataIndex: 'number'
        },
        {
          title: '备注',
          dataIndex: 'name'
        }
        // {
        //   title: '操作',
        //   key: 'operate',
        //   render: (record) => {
        //     return (
        //       <Fragment>
        //         <NavLink style={{ 'marginRight': '20px' }} to={`/safe/equipment/detail?id=${transliteration(record.assetId)}`}>详情</NavLink>
        //       </Fragment>
        //     )
        //   }
        // }
      ],
      body: null,
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      threatenTotal: 0,
      tags: [],
      condition: '1'
    }
  }
  componentDidMount () {
    this.getData()
  }

  UNSAFE_componentWillReceiveProps (nextProps) {

  }

  render () {
    const { visible, columns, body, pagingParameter, tags, threatenTotal } = this.state
    let list  = []
    let total =  0
    if (body){
      list = body.items
      total =  body.totalRecords
    }
    return (
      <div className="threaten">
        <div className="safe-overview-title">
          <span>威胁总览</span>
          <div>
            <Select
              placeholder="请选择"
              style={{ width: 120 }}
              getPopupContainer={triggerNode => triggerNode.parentNode}
              defaultValue="1"
              onChange={this.onChange}
            >
              <Option value="1">最近24小时</Option>
              <Option value="7">最近7天</Option>
              <Option value="30">最近30天</Option>
            </Select>
            <NavLink to="/safe/threat" className="link-color">更多</NavLink>
          </div>
        </div>
        <div className="content-box">
          <p className="sub-title">威胁次数统计：{threatenTotal}</p>
          <div className="bugTotal">{threatenTotal}</div>
          <div id="threaten-main"  style={{ width: '100%', height: 400 }}></div>
        </div>
        <Modal
          className="equipment-modal"
          width={1200}
          title="威胁总览"
          visible={visible}
          onOk={this.hideModal}
          onCancel={this.hideModal}
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
            <Table rowKey="safetyId" columns={columns} dataSource={list} pagination={false} />
            <Pagination
              className="table-pagination"
              total={total} showTotal={(total) => `共 ${total || 0} 条数据`}
              showSizeChanger={true}
              showQuickJumper={true}
              onChange={this.changePage}
              onShowSizeChange={this.changeShowSize}
              pageSize={pagingParameter.pageSize}
              current={pagingParameter.currentPage} />
          </div>
        </Modal>
      </div>
    )
  }

  //时间查询
  onChange = (val) => {
    this.setState({
      condition: val
    }, () => {
      this.getData()
    })
  }
  //获取数据
  getData = () => {
    const { condition } = this.state
    api.safetyequipmentThreat({
      condition
    }).then(response => {
      if(response && response.head && response.head.code === '200' ){
        const data = response.body
        let dataList = [], typeList = [], total = 0
        data.forEach(item => {
          let { number, msg } = item
          msg = msg === '' ? '威胁次数统计' : msg
          dataList.push({
            value: number,
            name: msg
          })
          total += number
          typeList.push(msg)
        })
        this.setState({
          threatenTotal: total
        })
        this.initCharts(dataList, typeList, total)
      }
    }).catch(err => {})
  }

  //绘图
  initCharts = (data, typeList, total) => {
    let myChart = Echarts.init(document.getElementById('threaten-main'))
    let options = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      color: categoryColor,
      legend: {
        selectedMode: false,
        orient: 'vertical',
        bottom: '45%',
        right: '30%',
        textStyle: canvasLegendStyle,
        data: typeList
      },
      series: [
        {
          name: '威胁总览',
          type: 'pie',
          //位置
          center: ['30%', 'center'],
          radius: ['30%', '50%'],
          avoidLabelOverlap: false,
          label: {
            normal: {
              show: false
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
    // this.setState({
    //   visible: true,
    //   tags: [data.name]
    // }, () => {
    //   this.getList({
    //     ...this.state.pagingParameter,
    //     type: this.state.tags[0]
    //   })
    // })
  }

  //筛选所有
  getAllList = ()=> {
    this.setState({
      tags: []
    }, () => {
      this.getList({
        ...this.state.pagingParameter,
        type: null
      })
    })
  }

  //获取列表
  getList = (param) => {
    this.setState({
      pagingParameter: {
        pageSize: param.pageSize,
        currentPage: param.currentPage,
        type: param.type
      }
    })
    api.safetyEquipmentList(param).then(response => {
      if(response && response.head && response.head.code === '200' ){
        this.setState({
          body: response.body
        })
      }
    }).catch(err => {})
  }

  //改变当前页显示数量
  changeShowSize = (currentPage, pageSize) => {
    this.pageModify(pageSize, 1)
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
      visible: false
    })
  }
}
export default connect()(SafeThreaten)
