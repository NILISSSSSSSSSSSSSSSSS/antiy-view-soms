import { Component } from 'react'
import { connect } from 'dva'
import { NavLink } from 'dva/router'
import {  Table, Tabs  } from 'antd'
import Tooltip from '@/components/common/CustomTooltip'
import api from '@/services/api'
import { transliteration } from '@/utils/common'
import { safetyPermission } from '@a/permission'
import { withRouter } from 'dva/router'
import hasAuth from '@/utils/auth'

const { TabPane } = Tabs
class SafePerformance extends Component {
  constructor (props) {
    super(props)
    this.state = {
      performanceFilterType: 'MEMORY',
      cpuConfig: {},
      diskConfig: {},
      memoryConfig: {},
      list: [],
      active: '1',
      columns: [{
        title: '名称',
        dataIndex: 'assetName',
        render: (assetName) => {
          return (
            <Tooltip placement="topLeft" title={assetName}>{assetName}</Tooltip>
          )}
      }, {
        title: 'IP',
        dataIndex: 'ip',
        render: (ip)=> <Tooltip title={ip}>{ip}</Tooltip>
      }]
    }
  }
  componentDidMount () {
    this.getList()
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
      console.log('性能', response)
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
  //tabs 切换
  activeChange=(active)=>{
    this.setState({ active }, this.getList)
  }
  onChange = (val) => {
    this.setState({
      performanceFilterType: val
    }, () => {
      
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
    let { list, active, columns } = this.state
    if(active === '1'){
      columns[2] = {
        title: 'CPU使用率',
        sorter: true,
        dataIndex: 'cpuOccupyRate'
      }
    }else if(active === '2'){
      columns[2] = {
        title: '硬盘使用率',
        sorter: true,
        dataIndex: 'diskOccupyRate'
      }
    }else{
      columns[2] = {
        title: '内存使用率',
        sorter: true,
        dataIndex: 'memoryOccupyRate'
      }
    }
    return (
      <div className="performance">
        <NavLink to="/safe/performance"  className="link-color">更多</NavLink>
        <div className="performance-content">
          <Tabs activeKey={active} onChange={this.activeChange}>
            <TabPane tab='CPU' key="1">
              <Table rowKey="assetName"
                columns={columns}
                pagination={false}
                dataSource={list}
                onRow={this.onRowClick}/>
            </TabPane>
            <TabPane  tab='硬盘' key="2">
              <Table rowKey="assetName"
                columns={columns}
                pagination={false}
                dataSource={list}
                onRow={this.onRowClick}/>
            </TabPane>
            <TabPane  tab='内存' key="3">
              <Table rowKey="assetName"
                columns={columns}
                pagination={false}
                dataSource={list}
                onRow={this.onRowClick}/>
            </TabPane>
          </Tabs>
        </div>
      </div>
    )
  }
}
export default withRouter(connect()(SafePerformance))
