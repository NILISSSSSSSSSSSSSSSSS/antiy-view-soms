import { Component } from 'react'
import { connect } from 'dva'
import { Tooltip  } from 'antd'
import moment from 'moment'
import PhotoChange from '@/components/PersonalCenter/PhotoChange'
import PersonalInfo from '@/components/PersonalCenter/PersonalInfo'
import PersonalPwdChange from '@/components/PersonalCenter/PersonalPwdChange'
import './style.less'

class PersonalCenter extends Component{
  constructor (props){
    super(props)
    this.state = {
      tabActiveKey: '1'
    }
  }
  tabChange = (key) => {
    this.setState({
      tabActiveKey: key
    })
  }
  onClick = (tabActiveKey) => {
    this.setState({ tabActiveKey })
  }
  render (){
    const { currentUserInfo = {} } = this.props
    const { tabActiveKey } = this.state
    const { username, img } = currentUserInfo
    return(
      <div className="personal">
        <h2 className="page-title">个人中心</h2>
        <div className="detail-content personal-container">
          <div className="personal-left-nav">
            <div className="personal-left-nav-info header">
              <img src={img || require('@/assets/头像1.png')} alt=""/>
              <Tooltip title={username}>
                <div className="text-ellipsis">
                  {username}
                </div>
              </Tooltip>
            </div>
            <div className={tabActiveKey === '1' ? 'personal-left-nav-item active' : 'personal-left-nav-item'} onClick={()=>this.onClick('1')}>个人中心</div>
            <div className={tabActiveKey === '0' ? 'personal-left-nav-item active' : 'personal-left-nav-item'} onClick={()=>this.onClick('0')}>修改密码</div>
          </div>
          <div className="personal-content">
            <div className="personal-lastLoginTime header">
              上次登录时间: <span className="personal-lastLoginTime-text">{ currentUserInfo.lastLoginTime ? moment(currentUserInfo.lastLoginTime).format('YYYY-MM-DD HH:mm:ss') : '' }</span>
            </div>
            <div className="personal-content-set">
              {
                tabActiveKey === '1' ? <div className="personal-content-info-box">
                  <div className="personal-content-info-box-left">
                    <PhotoChange user={ currentUserInfo } />
                  </div>
                  <div className="personal-content-info-right">
                    <PersonalInfo />
                  </div>
                </div> : <PersonalPwdChange />
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}
const mapStateToProps = ({ personalCenter }) => {
  return {
    currentUserInfo: personalCenter.currentUserInfo
  }
}

export default connect(mapStateToProps)(PersonalCenter)
