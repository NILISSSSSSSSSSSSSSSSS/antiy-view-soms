import { Component } from 'react'
import { connect } from 'dva'
import { NavLink } from 'dva/router'
import { Select, Table  } from 'antd'
import Tooltip from '@/components/common/CustomTooltip'
import './style.less'
import api from '@/services/api'
import { emptyFilter, transliteration } from '@/utils/common'
import { safetyPermission } from '@a/permission'
import { withRouter } from 'dva/router'
import hasAuth from '@/utils/auth'

// import Status from '@/components/common/Status'
const Option = Select.Option

class SafePerformance extends Component {
  constructor (props) {
    super(props)
    this.state = {
      performanceFilterType: 'MEMORY',
      cpuConfig: {},
      diskConfig: {},
      memoryConfig: {},
      list: []
    }
    this.generateColumns = () => {
      const { performanceFilterType, cpuConfig = {}, diskConfig = {}, memoryConfig = {} } = this.state
      return (
        [
          { title: '名称', dataIndex: 'assetName', render: (assetName) => {
            return (
              <Tooltip placement="topLeft" title={assetName}>{assetName}</Tooltip>
            )} },
          { title: 'IP', dataIndex: 'ip', render: (ip)=> <Tooltip title={ip}>{ip}</Tooltip> },
          { title: <Select
            className="performance-select"
            placeholder="请选择"
            getPopupContainer={triggerNode => triggerNode.parentNode}
            width={{ width: 70 }}
            defaultValue={performanceFilterType}
            onChange={this.onChange}
          >
            <Option value="MEMORY">内存</Option>
            <Option value="CPU">CPU</Option>
            <Option value="DISK">硬盘</Option>
          </Select>,
          dataIndex: 'rate',
          render: (rate) => {
            let color = ''
            const num = rate ? parseInt(rate, 10) : null
            if(performanceFilterType === 'CPU' && parseInt(cpuConfig.threshold, 10) <= num || performanceFilterType === 'DISK' && parseInt(diskConfig.threshold, 10) <= num || performanceFilterType === 'MEMORY' && parseInt(memoryConfig.threshold, 10) <= num) {
              color = 'red'
            }
            return (
              <span className="rate" style={{ color }}>
                { rate ? rate + '%' : emptyFilter() }
              </span>
            )
          }
          }
        ]
      )
    }
  }
  componentDidMount () {
    this.getList()
    this.getPerList()
    // this.interValGetList()
  }
  componentWillUnmount () {
    if(window.performanceTimerInterval){
      clearInterval(window.performanceTimerInterval)
    }
  }
  /**
   * 请示刷新性能数据
   */
  interValGetList = () => {
    if(window.performanceTimerInterval){
      clearInterval(window.performanceTimerInterval)
    }
    window.performanceTimerInterval =  window.setInterval(()=>{
      this.getList()
    }, 5000)
  }
  // 获取告警规则列表
  getPerList = () => {
    api.getAlarmPerSafetyList().then((data)=>{
      if(data.head && data.head.code === '200'){
        this.setState({
          cpuConfig: (data.body || []).find((el)=>{
            return el.typeName.indexOf('CPU') >= 0 || el.typeName.indexOf('cpu') >= 0
          }) || {},
          diskConfig: (data.body || []).find((el)=>{
            return el.typeName.indexOf('磁盘') >= 0 || el.typeName.indexOf('DISK') >= 0
          }) || {},
          memoryConfig: (data.body || []).find((el)=>{
            return el.typeName.indexOf('内存') >= 0 || el.typeName.indexOf('memory') >= 0
          }) || {}
        })
      }
    })
  }
  // 获取最新性能列表数据
  getList = () => {
    const { performanceFilterType } = this.state
    api.safetyequipmentPerformanceindex({
      performanceFilterType,
      queryCurrent: true
    }).then(response => {
      if(response && response.head && response.head.code === '200' ){
        let list = response.body.items
        list.forEach(item => {
          item.rate = performanceFilterType === 'CPU' ? item.cpuOccupyRate : performanceFilterType === 'DISK' ? item.diskOccupyRate : item.memoryOccupyRate
        })
        this.setState({
          list
        })
      }
    }).catch(err => {})
  }
  onChange = (val) => {
    this.setState({
      performanceFilterType: val
    }, () => {
      this.getList()
    })
  }
  onRowClick = (row) => ({
    onClick: (e) => {
      e.stopPropagation()
      const { history } = this.props
      // 跳转至性能详情
      if(hasAuth(safetyPermission.SAFETY_XN_CK)) {
        history.push(`/safe/performance/detail?id=${ transliteration(row.assetId) }`)
      }
    }
  })
  render () {
    const { list } = this.state
    return (
      <div className="performance">
        <div className="safe-overview-title">
          <span>最新性能</span>
          <NavLink to="/safe/performance"  className="link-color">更多</NavLink>
        </div>
        <div className="table-wrap performance-content">
          <Table rowKey="assetName" columns={this.generateColumns()} pagination={false} dataSource={list} onRow={this.onRowClick}/>
        </div>
      </div>
    )
  }
}
export default withRouter(connect()(SafePerformance))
