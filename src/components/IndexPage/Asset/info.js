
import { Component } from 'react'
import { Link } from 'dva/router'
import api from '@/services/api'

export default class indexPageInfoAsset extends Component {
  constructor (props) {
    super(props)
    this.state = {
      bug: {
        total: 0,
        body: []
      },
      patch: {
        total: 0,
        body: []
      },
      title: ['核心', '重要', '一般']
    }
  }
  componentDidMount () {
    this.getAssetData()
  }
  getAssetData = () =>{
    let { bug, patch } = this.state
    api.getBugNumber().then(data=>{
      for(let item in data.body){
        bug.total += data.body[item]
        bug.body.push(data.body[item])
      }
      this.setState({ bug })
    }).catch(err=>console.log(err))
    api.getHomePatchNumber().then(data=>{
      for(let item in data.body){
        patch.total += data.body[item]
        patch.body.push(data.body[item])
      }
      this.setState({ patch })
    }).catch(err=>console.log(err))

  }
  render () {
    const { bug, patch, title } = this.state
    return(
      <div>
        <p className='block-header-title'>资产信息</p>
        <section className='info-containers-content'>
          <header>
            <div>未修复漏洞资产数量</div>
            <div className='info-link'>
              <Link to='/bugpatch/bugmanage/dispose'>{bug.total}</Link>
            </div>
          </header>
          {
            title.map((item, i)=>(
              <div className='info-level-text' key={item + i}>
                <span>{item}</span>
                <span>{bug.body[i] ? bug.body[i] : 0}</span>
              </div>
            ))
          }
        </section>
        <section className='info-border'></section>
        <section className='info-containers-content'>
          <header>
            <div>未安装补丁资产数量</div>
            <div className='info-link'>
              <Link to='/bugpatch/patchmanage/install'>{patch.total}</Link>
            </div>
          </header>
          {
            title.map((item, i)=>(
              <div className='info-level-text' key={item + i}>
                <span>{item}</span>
                <span>{patch.body[i] ? patch.body[i] : 0}</span>
              </div>
            ))
          }
        </section>
      </div>
    )
  }
}