import { Component } from 'react'
import { Link } from 'dva/router'
import moment from 'moment'
import api from '@/services/api'
import { Tooltip } from 'antd'
//系统首页
class Message extends Component {
  constructor (props) {
    super(props)
    this.state = {
      msgList: [],
      lastTime: 0,
      addNumber: undefined
    }
  }
  componentDidMount () {
    this.getMessageListOfIndexs()
    this.timing = setInterval(()=>this.getMessageListOfIndexs(), 10000)
  }
  componentWillUnmount () {
    clearInterval(this.timing )
  }
  //获取消息列表
  getMessageListOfIndexs = (time = false) => {
    let { msgList } = this.state
    //time ? { createTime: lastTime } : {} ，与后端沟通，无需传入当前时间，每次返回前100条数据即可
    api.getMessageListOfIndex({}).then(response => {
      if (response.body.length) {
        if (time) msgList = msgList.concat(response.body)
        else msgList = response.body
        if (JSON.stringify(this.state.msgList) !== JSON.stringify((response.body))) {
          this.setState({
            lastTime: response.body[0].createTime,
            msgList,
            addNumber: !time ? response.body.length : undefined
          }, () => {
            this.onAnimation()
          })
        }
      }
    }).catch(err => { })
  }
  //符合条件 执行动画
  onAnimation = () => {
    let { msgList, addNumber, lastTime } = this.state
    let Nu = null
    if (addNumber) {
      msgList = msgList.map((item, i) => {
        if (item.createTime > lastTime ){
          item.show = true
          Nu = i
        } else{
          item.show = false
        }
        return item
      })
      const el = document.querySelectorAll('.msg-content-block')
      el.forEach(item => item.classList.remove('init-animation'))
      this.setState({
        msgList
      }, () => {
        setTimeout(() => {
          el.forEach((item, i) => {
            if( Nu !== null && i <= Nu) item.classList.add('init-animation')
          })
        }, 0)
      })
    }
  }
  clickLink = (id) => {
    this.props.history.push(`/logalarm/alarm/manage?stringId=${id}`)
  }
  render () {
    const { msgList } = this.state
    const className = 'msg-content-block init-animation'
    return (
      <div className="msg-box">
        <div className="msg-header">
          <span>
            <img src={require('@/assets/icon_title_2.svg')} alt=''></img>
            最近告警消息</span>
          {/* <Link to='/logalarm/alarm/manage'>更多</Link> */}
        </div>
        <div className="msg-content">
          {
            msgList.length ? msgList.map((item, index) => {
              let init = item.alarmSource.split('(')
              let text =  init[0] !== '' ? `IP:${init[0]}` : ''
              if (init.length > 1) {
                init[1] = init[1].replace('mac', '').replace(')', '')
                text += `    MAC${init[1]}`
              }
              return (<div key={index} onClick={() => this.clickLink(item.stringId)} className={item.show === true ? className : 'msg-content-block'}>
                <p>
                  <span>{item.alarmName}</span>
                  <time>{moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')}</time>
                </p>
                <div className='message-hint'>
                  <span className={'label message-hint-content ' + ['level1', 'level2', 'level3', 'level4'][Number(item.alarmLevel) - 1]}>
                    {['紧急', '重要', '次要', '提示'][Number(item.alarmLevel) - 1]}
                  </span>
                  <span className='text-content'>
                    <Tooltip title={text} placement="topLeft" key={index + text}>
                      {text}
                    </Tooltip>
                  </span>
                </div>
              </div>)
            }) : <div className="empty-image"><img src={require('@/assets/noMessage.svg')} alt="" /><div className="nodataTextCss">暂无消息</div></div>
          }
        </div>
      </div>
    )
  }
}

export default Message
