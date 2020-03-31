import { Component } from 'react'
import { withRouter } from 'dva/router'
import { bugPermission } from '@a/permission'
import api from '@/services/api'
import GupComponent from '../Common/GupComponent'

@withRouter
export default class PatchMange extends Component {
  constructor (props) {
    super(props)
    this.state = {
      workList: []
    }
    this.components = []
  }
  componentDidMount () {
    this.getWaitWork()
    this.components = this.generateData()
    this.setState({ key: Math.random() })
    // this.getWaitWork().then(()=>{
    //   this.components = this.generateData()
    //   this.setState({ key: Math.random() })
    // })
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
          { name: '突发漏洞登记', auth: bugPermission.burstCheckin, url: '/bugpatch/bugmanage/unexpected/register', type: 'square', img: require('@/assets/images/workbench/patch-tflddj.svg'), disabledImg: require('@/assets/images/workbench/patch-tflddj-disabled.svg') },
          { name: '', type: 'line', img: require('@/assets/images/workbench/xx_y.svg') },
          { name: '突发漏洞处置', auth: bugPermission.burstManage, url: '/bugpatch/bugmanage/unexpected', type: 'square', img: require('@/assets/images/workbench/patch-tfldcz.svg'), disabledImg: require('@/assets/images/workbench/patch-tfldcz-disabled.svg') },
          { name: '', type: 'line', img: require('@/assets/images/workbench/zxx_ys.svg'), style: { width: '61px', margin: '47px 0 0 -57px' } },
          { name: '配置基准', url: '/asset/manage?status=2&softwareStatusList=3&work=true', type: 'square', onClick: ()=>{ changeShowType && changeShowType('1')}, img: require('@/assets/baseSetting.svg'), disabledImg: require('@/assets/baseSetting.svg') },
          { },
          { }
        ],
        [
          { },
          { },
          { },
          { },
          { },
          { name: '', type: 'line', img: require('@/assets/images/workbench/xx_shu.svg'), style: { height: '70px' } },
          { name: '', type: 'line', img: require('@/assets/images/workbench/sx_sx.svg'), style: { height: '70px' } },
          { },
          { }
        ],
        [
          { },
          { },
          { name: '漏洞扫描', type: 'square', img: require('@/assets/images/workbench/patch-ldsm.svg'), disabledImg: require('@/assets/images/workbench/patch-ldsm-disabled.svg') },
          { name: '', type: 'line', img: require('@/assets/images/workbench/sx_y.svg'), render: this.renderLine },
          //展示小红点数
          { name: '漏洞信息', value: 23, auth: bugPermission.vulInfo, url: '/bugpatch/bugmanage/information', type: 'square', img: require('@/assets/images/workbench/patch-ldxf.svg'), disabledImg: require('@/assets/images/workbench/patch-ldxf-disabled.svg') },
          { name: '', type: 'line', img: require('@/assets/images/workbench/xxsx_y.svg'), style: { margin: '-45px 0 0 -2px' } },
          //展示小红点数
          { name: '漏洞处置', value: 12, auth: bugPermission.vulHandleManage, url: '/bugpatch/bugmanage/dispose', type: 'square', img: require('@/assets/images/workbench/patch-ldcz.svg'), disabledImg: require('@/assets/images/workbench/patch-ldcz-disabled.svg') },
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
    //漏洞处置数量
    api.workbenchVulHandle().then(res => {
      if(res && res.head && res.head.code === '200' ){
        const body = res.body
        let undoList = [
          { key: 'e45b7279-901b-4edd-9f9a-98ba9db2289e', name: '漏洞处置', value: body.vulRepairCount || 0 },
          { key: '_720c74a4-ab88-40be-bb2e-a2eaae81b1dd', name: '漏洞信息', value: body.vulHandleCount || 0 }
        ]
        this.setState({ workList: undoList })
        return undoList
      }
    })
  }

  render () {
    const { workList = [] } = this.state
    return (
      <div>
        <GupComponent workList={workList} fields={this.components} />
      </div>

    )
  }
}
