
import { Component } from 'react'
import { Link } from 'dva/router'
import api from '@/services/api'

export default class indexPageInfoBug extends Component {
  constructor (props) {
    super(props)
    this.state = {
      list: [],
      total: 0,
      title: ['超危漏洞', '高危漏洞', '中危漏洞', '低危漏洞']
    }
  }
  componentDidMount () {
    this.getBugData()
  }
  //获取漏洞数据
  getBugData = () => {
    api.getVulCountOnAsset().then(data => {
      const { superThreatNum,
        highThreatNum,
        middleThreatNum,
        lowThreatNum  } = data.body
      let  { list, total } = this.state
      list = [superThreatNum, highThreatNum, middleThreatNum, lowThreatNum ]
      list.forEach(item=> total += Number(item) )
      this.setState({ total, list })
    }).catch(err => {})
  }
  render () {
    const { list, title, total } = this.state
    return(
      <div>
        <p className='block-header-title'>漏洞信息</p>
        <section className='info-containers-content1'>
          <header>
            <div>未处理数量</div>
            <div className='info-link'>
              <Link to='/bugpatch/bugmanage/information'>{total}</Link>
            </div>
          </header>
          <img src={require('@a/indexPage_Bug.png')} alt='' />
        </section>
        <section className='info-containers-content1 '>
          {
            title.map((item, i)=>(
              <div className='info-level-text' key={ item + i }>
                <span>{item}</span>
                <span>{list[i] ? list[i] : 0}</span>
              </div>
            ))
          }
        </section>
      </div>
    )
  }
}