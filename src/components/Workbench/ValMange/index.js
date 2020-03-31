import { Component } from 'react'
import { withRouter } from 'dva/router'
import authConfig from '@/utils/authConfig'
import api from '@/services/api'
import GupComponent from '../Common/GupComponent'

@withRouter
export default class ValMange extends Component {
  constructor (props) {
    super(props)
    this.state = {
      workList: []
    }
    this.components = []
  }
  componentDidMount () {
    // this.getWaitWork().then(()=>{
    //   this.components = this.generateData()
    //   this.setState({ key: Math.random() })
    // })
    this.getWaitWork()
    this.components = this.generateData()
    this.setState({ key: Math.random() })
  }
  // 生成flow流程图
  generateData = () => {
    const { changeShowType } = this.props
    // 备注：空对象，必须要，站位用
    return (
      [
        [
          { },
          { },
          { name: '应急补丁登记', type: 'square', url: '/bugpatch/patchmanage/emergency/register?from=regsiter', auth: authConfig.patchRegistration, img: require('@/assets/images/workbench/val-yjbddj.svg'), disabledImg: require('@/assets/images/workbench/val-yjbddj-disabled.svg') },
          { name: '', type: 'line', img: require('@/assets/images/workbench/xx_heng.svg'), style: { width: '79px' } },
          { name: '', type: 'line', img: require('@/assets/images/workbench/zxx_ys.svg'), style: { width: '60px', margin: '47px 0 0 -58px' } },
          { },
          { name: '配置基准', type: 'square', img: require('@/assets/images/workbench/val-pzjz.svg'), disabledImg: require('@/assets/images/workbench/val-pzjz.svg'), onClick: () => {changeShowType && changeShowType('1')} },
          { },
          { }
        ],
        [
          { }, // 空对象，必须要，站位用
          { },
          { },
          { },
          { name: '', type: 'line', img: require('@/assets/images/workbench/xx_x.svg'), style: { marginLeft: '-2px' } },
          { },
          { name: '', type: 'line', img: require('@/assets/images/workbench/sx_sx.svg') },
          {  },
          {  }
        ],
        [
          {  },
          {  },
          { name: '补丁扫描', type: 'square', url: '/bugpatch/patchmanage/patchinformation?status=1&work=true', img: require('@/assets/images/workbench/val-bdsm.svg'), disabledImg: require('@/assets/images/workbench/val-bdsm-disabled.svg') },
          { name: '', type: 'line', img: require('@/assets/images/workbench/sx_y.svg'), render: this.renderLine },
          { name: '补丁处置', type: 'square', auth: authConfig.patchHandle, url: '/bugpatch/patchmanage/information', img: require('@/assets/images/workbench/val-bdcz.svg'), disabledImg: require('@/assets/images/workbench/val-bdcz-disabled.svg') },
          { name: '', type: 'line', img: require('@/assets/images/workbench/sx_y.svg'), render: this.renderLine },
          { name: '补丁安装', type: 'square', auth: authConfig.patchInstall, url: '/bugpatch/patchmanage/install', img: require('@/assets/images/workbench/val-bdaz.svg'), disabledImg: require('@/assets/images/workbench/val-bdaz-disabled.svg') },
          { },
          { }
        ]
      ]
    )
  }
  /**
   * 获取我的待办
   */
  getWaitWork = () => {
    api.findWaitingTaskNums({
      user: sessionStorage.getItem('id')
    }).then((res) => {
      if (res && res.head && res.head.code === '200') {
        //补丁处置数量
        api.workbenchPatchHandle().then((now) => {
          if (now && now.head && now.head.code === '200') {
            let undoList = [
              { key: '_103145ba-13db-4a92-96b0-b0ecfe3f5ac7', name: '补丁安装', value: now.body.patchInstallCount || 0 },
              { key: 'cb32ceff-11aa-4d10-8d2f-d8e2072e8680', name: '补丁处置', value: now.body.patchHandleCount || 0 }  //待办事务统计
            ]
            this.setState({ workList: undoList })
            return undoList
          }
        })
      }
    })
    // return api.getMyBugPatchUndoCount().then((res)=>{
    //   if(res && res.head && res.head.code === '200'){
    //     let undoList = [
    //       { key: '_103145ba-13db-4a92-96b0-b0ecfe3f5ac7', name: '应急补丁登记', value: 0 },
    //       { key: 'cb32ceff-11aa-4d10-8d2f-d8e2072e8680', name: '补丁处置', value: 0 }  //待办事务统计
    //     ]
    //     //待办事务统计
    //     if (res.body) {
    //       let body = res.body
    //       undoList = undoList.map(e => {
    //         if (body[e.key]) {
    //           return { ...e, value: body[e.key] }
    //         }
    //         return e
    //       })
    //     }
    //     this.setState({ workList: undoList })
    //     return undoList
    //   }
    // })
  }

  render () {
    const { workList = [] } = this.state
    return (
      <GupComponent workList={workList} fields={this.components}/>
    )
  }
}
