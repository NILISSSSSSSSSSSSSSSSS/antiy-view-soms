import { Component } from 'react'
import { connect } from 'dva'
import { NavLink } from 'dva/router'
import Tooltip from '@/components/common/CustomTooltip'
import moment from 'moment'
import api from '@/services/api'
import './style.less'
class SafeWarning extends Component {
  constructor (props) {
    super(props)
    this.state = {
      list: []
    }
  }
  componentDidMount () {
    this.getList()
  }
  render () {
    const { list } = this.state
    return (
      <div className="warning">
        <div className="safe-overview-title">
          <span>最新告警</span>
          <NavLink to="/logalarm/alarm/manage" className="link-color">更多</NavLink>
        </div>
        <div className="warning-content">
          <div className="warning-title">
            <div>告警名称</div>
            <div>告警等级</div>
            <div>状态</div>
            <div>告警时间</div>
          </div>
          <div className="warning-list">
            {
              list.map((item, index) => {
                return (
                  <div key={index}>
                    <Tooltip placement="top" title={item.alarmName}>
                      {item.alarmName}
                    </Tooltip>
                    <span>{item.alarmLevel === 4 ? '紧急' : item.alarmLevel === 4 ? '重要' : item.alarmLevel === 4 ? '次要' : '提示'}</span>
                    <span>{item.currentStatus === 1 ? '未确认' : '已确认'}</span>
                    <Tooltip placement="top" title={moment(item.createTime).format('YYYY-MM-DD hh:mm:ss')}>
                      {moment(item.createTime).format('YYYY-MM-DD hh:mm:ss')}
                    </Tooltip>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    )
  }

  getList = () => {
    api.getAlarmManagerNowList({
      pageSize: 10,
      currentPage: 1
    }).then(response => {
      if(response && response.head && response.head.code === '200' ){
        this.setState({
          list: response.body.items
        })
      }
    }).catch(err => {})
  }
}
export default connect()(SafeWarning)
