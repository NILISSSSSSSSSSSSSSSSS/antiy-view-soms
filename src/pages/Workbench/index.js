import { Component } from 'react'
import { Button } from 'antd'
import { withRouter } from 'dva/router'
import AssetMange from'@/components/Workbench/AssetMange'
import ConfigurationMange from'@/components/Workbench/ConfigurationMange'
import PatchMange from'@/components/Workbench/PatchMange'
import ValMange from'@/components/Workbench/ValMange'
import { cacheSearchParameter, getCaches } from '@/utils/common'
import './index.less'

const initShowType = '0'
const searchIndex = 0
const ICON_S = ['asset-ico_s.svg', 'config-ico_s.svg', 'ld-ico_s.svg', 'bd-ico_s.svg']
const ICON_N = ['asset-ico_n.svg', 'config-ico_n.svg', 'ld-ico_n.svg', 'bd-ico_n.svg']
@withRouter
export default class Workbench extends Component {
  constructor (props){
    super(props)
    // 获取缓存
    const cache = getCaches(this, false, searchIndex)
    let showType = initShowType
    if(cache){
      showType = cache.parameter.showType
    }
    this.state = {
      showType
    }

    this.types = [
      { img: '', text: '资产管理', ico: require('@/assets/images/workbench/asset-ico_n.svg'), showType: '0', onClick: ()=>this.onClick( '0'), Component: AssetMange },
      { img: '', text: '配置管理', ico: require('@/assets/images/workbench/config-ico_n.svg'), showType: '1', onClick: ()=>this.onClick( '1'), Component: ConfigurationMange },
      { img: '', text: '漏洞管理', ico: require('@/assets/images/workbench/ld-ico_n.svg'), showType: '2', onClick: ()=>this.onClick('2'), Component: PatchMange },
      { img: '', text: '补丁管理', ico: require('@/assets/images/workbench/bd-ico_n.svg'), showType: '3', onClick: ()=>this.onClick('3'), Component: ValMange }
    ]
  }
  /**
   * 改变模块显示
   * @param showType
   */
  changeShowType = (showType) => {
    this.setState({ showType  })
  }
  /**
   * 管理模块的点击事件
   * @param showType {String} 要显示的模块
   */
  onClick = (showType) =>{
    cacheSearchParameter([{ page: { }, parameter: { showType } }], this.props.history)
    this.types.forEach((item, i)=>{
      if(Number(showType) !== i) {
        item.ico = require(`@/assets/images/workbench/${ICON_N[i]}`)
      }else{
        item.ico = require(`@/assets/images/workbench/${ICON_S[i]}`)
      }
    })
    this.setState({ showType })
  }
  /**
   * 根据类型找到对应的组件
   * @param showType
   * @return {*}
   */
  findComponent = (showType) => {
    return this.types.find((e)=>e.showType === showType) || {}
  }
  back = () => {
    const { goBack } = this.props.history
    goBack()
  }
  render () {
    const { showType } = this.state
    const ShowComponent = this.findComponent(showType).Component
    return (
      <div className="workbench-panel">
        {/*<div className="workbench-panel-title"><span className="workbench-title-square" />工作台</div>*/}
        <div className="workbench-panel-content">
          <div className="workbench-panel-header">
            {this.types.map((e)=>{
              const className = 'workbench-panel-header-item ' + (showType === e.showType ? 'selected-type' : '')
              return (
                <div key={e.text} onClick={e.onClick} className= { className }>
                  <div>{e.text}</div>
                  <img src={e.ico} alt=""/>
                </div>
              )
            })}
          </div>
          <div className="workbench-panel-work-flow">
            <ShowComponent changeShowType={this.changeShowType}/>
          </div>
        </div>
        <div className="workbench-panel-back">
          <Button onClick={this.back}>返回</Button>
        </div>
      </div>
    )
  }
}
