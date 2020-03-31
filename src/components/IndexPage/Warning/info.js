
import { Component } from 'react'
import { Link } from 'dva/router'
import api from '@/services/api'

export default class indexPageInWarningInfo extends Component {
  constructor (props) {
    super(props)
    this.state = {
      list: [],
      total: 0,
      title: ['紧急告警', '重要告警', '次要告警', '提示告警']
    }
  }
  componentDidMount () {
    this.getWarningData()
  }
  getAssetData = () =>{

  }
  //获取告警数据
  getWarningData = () => {
    api.getWarningData().then(response => {
      const data = response.body
      let total = data.noHandleCount + data.handedCount
      let list = [
        { value: data.urgentCount },
        { value: data.importantCount },
        { value: data.minorCount },
        { value: data.promptCount }
      ]
      this.setState({ total, list })
    }).catch(err => {})
  }
  render () {
    const { list, title, total } = this.state
    return(
      <div>
        <p className='block-header-title'>告警信息</p>
        <section className='info-containers-content1'>
          <header>
            <div>未处理数量</div>
            <div className='info-link'>
              <Link to='/logalarm/alarm/manage'>{total}</Link>
            </div>
          </header>
          <img src={require('@a/indexPage_warning.png')} alt="" />
        </section>
        <section className='info-containers-content1'>
          {
            title.map((item, i)=>(
              <div className='info-level-text' key={item + i}>
                <span>{item}</span>
                <span>{list[i] ? list[i].value : 0}</span>
              </div>
            ))
          }
        </section>
      </div>
    )
  }
}