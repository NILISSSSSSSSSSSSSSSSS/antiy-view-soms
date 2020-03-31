import { Component } from 'react'
import { connect } from 'dva'
import Doughnut from '@/components/IndexPage/doughnut'
import Warning from '@/components/IndexPage/Warning'
import TabTables from '@/components/IndexPage/TabTables'
import Asset from '@/components/IndexPage/Asset'
import Message from '@/components/IndexPage/Message'
import Safe from '@/components/IndexPage/Safe'
import { Tabs } from 'antd'
import './style.less'
import { onRow, filterType, doughnutChart, CharRegroup } from './common'
import { thousandsSwitch } from '@/utils/common'

import api from '@/services/api'
import { Link } from 'dva/router'

const { TabPane } = Tabs

//系统首页
class IndexPage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      active: '1',
      iData1: [],
      iData2: [],
      iData3: [],
      workN: 0,
      workOrderN: 0,
      // screen: 0,
      assetInfo: [0, 0, 0],
      patchBug: [0, 0, 0],
      risk: 0,
      monitoring: 0
    }
  }
  componentDidMount () {
    // this.onResize()
    // window.addEventListener('resize', this.onResize.bind(this))
    this.getRequest('1')
    this.getRequest('2')
    this.getBugAndPatch()
    this.getAssetInfo()
    this.getRiskAsset()
    this.getViolateAlarm()
    this.getRiskAssetTotal()
    this.getMonitoringDay()
  }

  //屏幕改变时
  onResize = (e = false)=> {
    let { minShow } = this.state
    const init = e === false ? document.querySelector('body').offsetWidth : e.target.innerWidth
    // if(init < 1700) {
    //   if(minShow) return
    //   this.setState({ minShow: true, screen: init })
    // }else{
    //   if( !minShow ) return
    //   this.setState({ minShow: false, screen: init })
    // }
  }
  //tabs 切换
  activeChange=(active)=>{
    this.setState({ active })
    this.getRequest(active)
  }
  getRequest = (active)=>{
    let url = active === '1' ? 'getBacklogWork' : 'getTodoList'
    let params = [ {}, {
      user: window.app._store.getState().system.id,
      currentPage: 1,
      pageSize: 5
    }, {
      currentPage: 1,
      orderStatus: '0',
      orderType: '0',
      pageSize: 5,
      workLevel: '0'
    }]
    api[url](params[Number(active)]).then(data=>{
      if(active === '1') this.setState({ workN: data.body.totalRecords })
      else this.setState({ workOrderN: data.body.totalRecords })
      if(data.body.items.length){
        data.body.items = data.body.items.sort((a, b)=>b.createTime - a.createTime)
        data.body.items = data.body.items.filter((item, i)=> i <= 4)
        if(active === '1'){
          data.body.items = filterType(data.body.items)
        }
      }
      this.setState({ [active === '1' ? 'iData1' : 'iData2']: data.body.items })
    })
  }
  //获取监控天数
  getMonitoringDay = ()=>{
    api.getMonitoringDay().then(data=>{
      console.log(data )
      // if(data.body.length){
      //   this.setState({ iData3: data.body })
      // }
    })
  }
  //获取高风险资产
  getRiskAsset = ()=>{
    api.getRiskAsset().then(data=>{
      if(data.body.length){
        this.setState({ iData3: data.body })
      }
    })
  }
  //获取违规告警
  getViolateAlarm = ()=>{
    api.getViolateAlarm().then(data=>{
      let { patchBug } = this.state
      patchBug[0] = CharRegroup(data.body)
      this.setState({ patchBug })
    })
  }
  //风险资产总数
  getRiskAssetTotal = ()=>{
    api.getRiskAssetTotal().then(data=>{
      let { assetInfo } = this.state
      assetInfo[2] = CharRegroup(data.body)
      this.setState({ assetInfo })
    })
  }
  renderTabTitle = (key, text)=>{
    return(
      <div>
        <span className='tabs-title-number'>{key}</span>
        <span className='tabs-title-text'>{text}</span>
      </div>
    )
  }
  //获取未修复漏洞补丁
  getBugAndPatch = ()=>{
    let { patchBug } = this.state
    api.getBugNumber().then(data=>{
      patchBug[2] = CharRegroup(data.body.noHandleNum)
      this.setState({ patchBug })
    }).catch(err=>console.log(err))
    api.getHomePatchNumber().then(data=>{
      console.log(data.body)
      patchBug[1] = CharRegroup(data.body.noHandleNum)
      this.setState({ patchBug })
    }).catch(err=>console.log(err))
  }
  //获取资产 信息
  getAssetInfo = ()=>{
    api.getAssetInfos().then(data=>{
      if(data.body){
        let { assetInfo } = this.state
        assetInfo[0] = CharRegroup(data.body.includeAmount)
        assetInfo[1] = CharRegroup(data.body.unIncludeAmount)
      }
    })
  }
  //代办工作 行点击事件
  onRow = (record)=>{
    onRow(this.props.history, record)
  }
  //跳转告警详情
  onAlarm=(ob)=>{
    // this.props.history.push(`/logalarm/alarm/manage/details?id=0&key=1&asset=0`)
  }
  //回显 未处理告警数
  callBackRisk=(v)=>{
    this.setState({ risk: v })
  }

  render () {
    const { active, risk, monitoring, workN, workOrderN, iData1, iData2, iData3, screen, assetInfo, patchBug } = this.state
    let url = active === '1' ? '/backlog' : '/routine/workorder/todo'
    let { Dchart1, Dchart2, Dchart3, Dchart4   } = doughnutChart
    Dchart1.fun = (param) => {
      let type
      ['计算设备', '网络设备', '安全设备', '存储设备', '其它设备'].forEach((item, i) => {
        if (item === param.name) type = i + 1
      })
      this.props.history.push(`/asset/manage?assetType=${type}`)
    }
    Dchart3.callBackRisk = this.callBackRisk
    return (
      <div className="index-page">
        <article className='home-page-visualization'>
          <section className='visualization-top'>
            <p className='box-title'>
              <img src={require('@/assets/icon_title_1.svg')} alt=''></img>
              总览</p>
            <div className='container-show'>
              <div className='box-content'>
                {
                  assetInfo.map((item, i)=>{
                    return(
                      <div>
                        <span>{item}</span>
                        <span>{['纳入管理资产数', '未纳入管控资产数', '存在安全风险资产数'][i]}</span>
                      </div>
                    )
                  })
                }
              </div>
              <div className='box-content'>
                {
                  patchBug.map((item, i)=>{
                    return(
                      <div className={`info-show-${i}`}>
                        <span>{item}</span>
                        <span>{['待处理违规基线数', '待安装补丁数', '待修复漏洞数'][i]}</span>
                      </div>
                    )
                  })
                }
              </div>
            </div>
          </section>
          <section className='main-content'>
            <div className='visualization-chart'>
              <div className='chart-content container-pack'>
                <p className='box-title'>
                  <span>
                    <img src={require('@/assets/icon_title_2.svg')} alt=''></img>
                    资产统计
                  </span>
                </p>
                <div className='chart-main'>
                  <div className='chart-containers border-decorate m-right'>
                    <Doughnut {...Dchart1}></Doughnut>
                  </div>
                  <div className='chart-containers border-decorate'>
                    <Doughnut {...Dchart2}></Doughnut>
                  </div>
                </div>
              </div>
              <div className='chart-content container-pack'>
                <p className='box-title alarm-risk'>
                  <span>
                    <img src={require('@/assets/icon_title_4.svg')} alt=''></img>
                    安全风险统计</span>
                  <span><strong>{CharRegroup(risk)}</strong>&nbsp;&nbsp;未处理告警数</span>
                </p>
                <div className='chart-main'>
                  <div className='chart-containers border-decorate m-right'>
                    <Doughnut {...Dchart3}></Doughnut>
                  </div>
                  <div className='chart-containers border-decorate'>
                    <Doughnut {...Dchart4}></Doughnut>
                  </div>
                </div>
              </div>
              <div className='chart-content'>
                <p className='box-title'>
                  <span>
                    <img src={require('@/assets/icon_title_1.svg')} alt=''></img>
                    安全运营</span>
                  <span><strong>{CharRegroup(monitoring)}</strong>&nbsp;&nbsp;持续监控天数</span>
                </p>
                <div className='chart-containers-row'>
                  <Asset history={this.props.history}  />
                </div>
                <div className='chart-containers-row'>
                  <Warning history={this.props.history}  />
                </div>
              </div>
            </div>
            <div  className="message-containers max-screen-show">
              <div className='home-page-table border-decorate'>
                {/* <p className='block-header-title'>工作任务</p> */}
                {/* <div className='table-header-link'>
                  <Link to={url}>更多</Link></div> */}
                <Tabs activeKey={active} onChange={this.activeChange}>
                  <TabPane tab={this.renderTabTitle(workN, '待办工作')} key="1">
                    <TabTables iData = {iData1} detail='1' onRow={this.onRow}></TabTables>
                  </TabPane>
                  <TabPane tab={this.renderTabTitle(workOrderN, '待办工单')} key="2">
                    <TabTables iData = {iData2} detail='2'></TabTables>
                  </TabPane>
                </Tabs>
              </div>
              <Message history={this.props.history} />
              <div className='alarm-risk'>
                <p className='block-header-title'>
                  <img src={require('@/assets/icon_title_3.svg')} alt=''></img>
                  高风险资产TOP5</p>
                <TabTables iData = {iData3} onRow={this.onAlarm}></TabTables>
              </div>
              <div className='asset-property'>
                <p className='block-header-title'>
                  <img src={require('@/assets/icon_title_4.svg')} alt=''></img>
                  安全设备性能TOP10</p>
                <Safe></Safe>
              </div>
            </div>
          </section>
        </article>
      </div>
    )
  }

}
export default connect()(IndexPage)
