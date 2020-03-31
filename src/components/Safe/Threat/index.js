import { Component } from 'react'
import { connect } from 'dva'
import { withRouter, NavLink } from 'dva/router'
import { Tabs, Table } from 'antd'
import Tooltip from '@/components/common/CustomTooltip'
import moment from 'moment'
import api from '@/services/api'
import { transliteration } from '@/utils/common'
import './style.less'

const { TabPane } = Tabs
const timeFormat = 'YYYY-MM-DD HH:mm:ss'
class SafeThreat extends Component {
  constructor (props) {
    super(props)
    this.state = {
      list: [],
      tanhaiList: [],
      activeKey: '1'
    }
    this.ZhiJianColumns = [
      { title: '名称',
        dataIndex: 'threatName',
        render: (threatName) => {
          return <Tooltip placement="topLeft" title={threatName}>
            {threatName}
          </Tooltip>
        }
      },
      {
        title: 'IP',
        dataIndex: 'sourceIp',
        render: (sourceIp) => {
          return <Tooltip placement="top" title={sourceIp}>
            <span className="ip-adress">{sourceIp}</span>
          </Tooltip>
        }
      },
      {
        title: '时间',
        dataIndex: 'threatEventTime',
        render: (threatEventTime) => {
          const time = moment(threatEventTime).format(timeFormat)
          return (
            <Tooltip placement="top" title={time}>
              {time}
            </Tooltip>
          )
        }
      }
    ]
    this.TanHaiColumns = [
      { title: '名称',
        dataIndex: 'threatName',
        render: (threatName) => {
          return (
            <Tooltip placement="topLeft" title={threatName}>
              {threatName}
            </Tooltip>
          )
        }
      },
      {
        title: '源IP',
        dataIndex: 'sourceIp',
        render: (sourceIp) => {
          return (
            <Tooltip placement="top" title={sourceIp}>
              <span className="ip-adress">{sourceIp}</span>
            </Tooltip>
          )
        }
      },
      {
        title: '目标IP',
        dataIndex: 'distinationIp',
        render: (distinationIp) => {
          return (
            <Tooltip placement="top" title={distinationIp}>
              <span className="ip-adress">{distinationIp}</span>
            </Tooltip>
          )
        }

      },
      {
        title: '时间',
        dataIndex: 'threatEventTime',
        render: (threatEventTime) => {
          const time = moment(threatEventTime).format(timeFormat)
          return (
            <Tooltip placement="top" title={time}>
              {time}
            </Tooltip>
          )
        }
      }
    ]
  }
  componentDidMount () {
    this.getList('ZHIJIA')
    this.getList('TANHAI')
  }
  // tab切换事件
  tabChange = (activeKey) => {
    this.setState({ activeKey })
  }

  getList = (safetyEnum) => {
    api.topThreatEvent({
      safetyEnum
    }).then(response => {
      if(response && response.head && response.head.code === '200' ){
        response.body.forEach((e, i)=>{e.key = i})
        const state = safetyEnum === 'ZHIJIA' ? { list: response.body } : { tanhaiList: response.body }
        this.setState(state)
      }
    }).catch(err => {})
  }

  renderZhiJia = (list = []) => {
    return (
      <div className="threat-content">
        <div className="threat-title">
          <div>名称</div>
          <div>IP</div>
          <div>时间</div>
        </div>
        <div className="threat-list">
          {
            list.map((item, index) => {
              return (
                <div key={index}>
                  <Tooltip placement="top" title={item.threatName}>
                    <span>{item.threatName}</span>
                  </Tooltip>
                  <span className="list-item-ip">{item.sourceIp}</span>
                  <Tooltip placement="top" title={moment(item.threatEventTime).format(timeFormat)}>
                    <span>{moment(item.threatEventTime).format(timeFormat)}</span>
                  </Tooltip>
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }

  renderTanHai = (list = []) => {
    return (
      <div className="threat-content">
        <div className="threat-title">
          <div>名称</div>
          <div>源IP</div>
          <div>目标IP</div>
          <div>时间</div>
        </div>
        <div className="threat-list">
          {
            list.map((item, index) => {
              return (
                <div key={index}>
                  <Tooltip placement="top" title={item.threatName}>
                    <span>{item.threatName}</span>
                  </Tooltip>
                  <span className="list-item-ip">{item.sourceIp}</span>
                  <span className="list-item-ip">{item.distinationIp}</span>
                  <Tooltip placement="top" title={moment(item.threatEventTime).format(timeFormat)}>
                    <span>{moment(item.threatEventTime).format(timeFormat)}</span>
                  </Tooltip>
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }
  /**
   * 跳转智甲威胁详情
   * @param record
   */
  zhijianRowClick = (record) => ({
    onClick: ()=>{
      const { history } = this.props
      history.push(`/safe/threat/ZhiJiaDetail?id=${transliteration(record.assetId)}&primaryKey=${transliteration(record.id)}&status=1`)
    }
  })
  /**
   * 跳转探海威胁详情
   * @param record
   */
  tanhaiRowClick = (record) => ({
    onClick: ()=>{
      const { history } = this.props
      history.push(`/safe/threat/TanHaiDetail?id=${transliteration(record.assetId)}&primaryKey=${transliteration(record.id)}&status=1`)
    }
  })
  render () {
    const { list, tanhaiList, activeKey } = this.state
    const status = activeKey === '1' ? '0' : '1'
    return (
      <div className="threat">
        <div className="safe-overview-title">
          <span>最新威胁</span>
          <NavLink to={`/safe/threat?status=${status}`} className="link-color">更多</NavLink>
        </div>
        <Tabs activeKey={activeKey} onChange={this.tabChange}>
          <TabPane key="1" tab='智甲'>
            <div className="table-wrap threat-table-wrap">
              <Table pagination={false} columns={this.ZhiJianColumns} dataSource={ list } onRow={this.zhijianRowClick}/>
            </div>
          </TabPane>
          <TabPane key="2" tab='探海'>
            <div className="table-wrap threat-table-wrap">
              <Table pagination={false} columns={this.TanHaiColumns} dataSource={ tanhaiList } onRow={this.tanhaiRowClick}/>
            </div>
          </TabPane>
        </Tabs>
      </div>
    )
  }

}
export default withRouter(connect()(SafeThreat))
