import { Component } from 'react'
import { withRouter } from 'dva/router'
import authConfig from '@/utils/authConfig'
import api from '@/services/api'
import GupComponent from '../Common/GupComponent'

@withRouter
export default class AssetMange extends Component {
  constructor (props) {
    super(props)
    this.state = {
      workList: []
    }
    this.components = []
  }

  componentDidMount () {
    let undoList = [
      // 此次硬件登记  必须站位第一个，后面步骤有用
      { key: 'assetRetireTask', name: '资产登记', value: 0 },
      { key: 'assetDetectTask', name: '资产探测', value: 0 },
      { key: 'templateImplement', name: '模板实施', value: 0 },
      { key: 'resultCheck', name: '结果验证', value: 0 },
      { key: 'netImplement', name: '入网实施', value: 0 },
      { key: 'safetyCheck', name: '安全检查', value: 0 },
      { key: 'safetyChange', name: '安全整改', value: 0 },
      { key: 'assetRetireTask', name: '退役实施', value: 0 }

    ]
    this.getWaitWork(undoList).then((workList) => {
      this.getAssetDetectWaitWork(workList)
      this.getAssetWaitWork(workList).then(() => {
        this.components = this.generateData()
        this.setState({ key: Math.random() })
      })
    })
    // this.getWaitWork()
    // this.getAssetWaitWork()
    // this.components = this.generateData()
    // this.setState({ key: Math.random() })
  }
  // 生成flow流程图
  generateData = () => {
    // const { changeShowType } = this.props
    // 备注：空对象，必须要，站位用
    return (
      [
        [
          { name: '资产探测', url: '/asset/manage?status=2&assetSource=1&work=true&conditionShow=true', auth: authConfig.assetFind, type: 'square', img: require('@/assets/images/workbench/assets-zctc.svg'), disabledImg: require('@/assets/images/workbench/assets-zctc-disabled.svg') },
          { name: '', type: 'line', img: require('@/assets/images/workbench/xx_y.svg'), render: this.renderLine },
          { name: '资产登记', auth: authConfig.assetRegistration, url: '/asset/manage?assetStatusList=1&work=true&conditionShow=true', type: 'square', img: require('@/assets/images/workbench/assets-zcdj.svg'), disabledImg: require('@/assets/images/workbench/assets-zcdj-disabled.svg') },
          { name: '', type: 'line', img: require('@/assets/images/workbench/sxzx_yx.svg'), style: { marginTop: '45px' } },
          { name: '模板实施', type: 'square', auth: authConfig.assetImpl, url: '/asset/manage?assetStatusList=3&work=true&conditionShow=true', img: require('@/assets/images/workbench/assets-mbss.svg'), disabledImg: require('@/assets/images/workbench/assets-mbss-disabled.svg') },
          { name: '', type: 'line', img: require('@/assets/images/workbench/sx_y.svg'), render: this.renderLine },
          { name: '结果验证', type: 'square', auth: authConfig.assetValid, url: '/asset/manage?assetStatusList=4&work=true&conditionShow=true', img: require('@/assets/images/workbench/assets-jgyz.svg'), disabledImg: require('@/assets/images/workbench/assets-jgyz-disabled.svg') },
          { name: '', type: 'line', img: require('@/assets/images/workbench/sx_y.svg'), render: this.renderLine },
          { name: '入网实施', type: 'square', auth: authConfig.assetNetworking, url: '/asset/manage?assetStatusList=5&work=true&conditionShow=true', img: require('@/assets/images/workbench/assets-rwss.svg'), disabledImg: require('@/assets/images/workbench/assets-rwss-disabled.svg') }
        ],
        [
          {}, // 空对象，必须要，站位用
          {},
          {},
          { name: '', type: 'line', img: require('@/assets/images/workbench/sx_shu.svg'), style: { height: '65px' } },
          {},
          {},
          {},
          {},
          { name: '', type: 'line', img: require('@/assets/images/workbench/sx_s.svg'), style: { transform: 'rotate(180deg)' } }
        ],
        [
          {},
          {},
          {},
          { name: '', type: 'line', img: require('@/assets/images/workbench/sxzx_y.svg'), style: { height: '65px', margin: '-44px -32px 0 0' } },
          { name: '安全检查', type: 'square', auth: authConfig.assetCheck, url: '/asset/manage?assetStatusList=7&work=true&conditionShow=true', img: require('@/assets/images/workbench/assets-aqjc.svg'), disabledImg: require('@/assets/images/workbench/assets-aqjc-disabled.svg') },
          { name: '', type: 'line', img: require('@/assets/images/workbench/sx_duan.svg'), style: { width: '89px' } },
          { name: '', type: 'line', img: require('@/assets/images/workbench/sx_chang.svg') },
          { name: '', type: 'line', img: require('@/assets/images/workbench/sx_y.svg'), render: this.renderLine },
          { name: '通联设置', type: 'square', auth: authConfig.assetTLsee, url: '/asset/relation', img: require('@/assets/images/workbench/assets-tlsz.svg'), disabledImg: require('@/assets/images/workbench/assets-tlsz-disabled.svg') },
          { name: '', type: 'line', img: require('@/assets/images/workbench/xx_y.svg'), style: { transform: 'rotate(180deg)' } },
          { name: '变更', type: 'square', auth: authConfig.assetUpdate, url: '/asset/manage?assetStatusList=6&work=true&conditionShow=true', img: require('@/assets/images/workbench/assets-bg.svg'), disabledImg: require('@/assets/images/workbench/assets-bg-disabled.svg') }
        ],
        [
          {}, // 空对象，必须要，站位用
          {},
          {},
          {},
          { name: '', type: 'line', img: require('@/assets/images/workbench/xx_sx.svg') },
          {},
          {},
          {},
          { name: '', type: 'line', img: require('@/assets/images/workbench/sx_s.svg') }
        ],
        [
          {},
          {},
          {},
          {},
          { name: '安全整改', type: 'square', auth: authConfig.assetChange, url: '/asset/manage?assetStatusList=8&work=true&conditionShow=true', img: require('@/assets/images/workbench/assets-aqzg.svg'), disabledImg: require('@/assets/images/workbench/assets-aqzg-disabled.svg') },
          {},
          { name: '退役发起', type: 'square', auth: authConfig.assetNty, url: '/asset/manage?assetStatusList=6&work=true&conditionShow=true', img: require('@/assets/images/workbench/assets-tyfq.svg'), disabledImg: require('@/assets/images/workbench/assets-tyfq-disabled.svg') },
          { name: '', type: 'line', img: require('@/assets/images/workbench/sx_y.svg'), render: this.renderLine },
          { name: '退役实施', type: 'square', auth: authConfig.assetTy, url: '/asset/manage?assetStatusList=10&work=true&conditionShow=true', img: require('@/assets/images/workbench/assets-tyss.svg'), disabledImg: require('@/assets/images/workbench/assets-tyss-disabled.svg') }
        ]
      ]
    )
  }
  /**
   * 获取我的待办
   */
  getWaitWork = (undoList) => {
    return api.getMyUndoCount().then((res) => {
      if (res && res.head && res.head.code === '200') {
        //待办事务统计
        if (res.body) {
          let body = res.body
          undoList = undoList.map(e => {
            // 此次没有获取的硬件待办的结果值，硬件登记待办单独接口返回
            if (e.name === '硬件登记') {
              return e
            }
            if (body[e.key]) {
              return { ...e, value: body[e.key] }
            }
            return e
          })
        }
        this.setState({ workList: undoList })
        return undoList
      }
    })

  }
  /**
   * 获取我硬件资产登记的待办
   */
  getAssetWaitWork = (undoList = []) => {
    return api.getMyWaitRegistCount().then((res) => {
      if (res && res.head && res.head.code === '200') {
        let assetRegister = { key: 'assetRetireTask', name: '资产登记', value: 0 }
        //待办事务统计
        assetRegister.value = res.body || 0
        const _undoList = undoList
        _undoList[0] = assetRegister
        this.setState({ workList: _undoList })
        return _undoList
      }
    })
  }
  // 获取探测资产任务数
  getAssetDetectWaitWork = (undoList = []) => {
    return api.getMyWaitDetectCount().then((res) => {
      if (res && res.head && res.head.code === '200') {
        const assetDetectTask =  { key: 'assetDetectTask', name: '资产探测', value: 0 }
        //待办事务统计
        assetDetectTask.value = res.body || 0
        const index = undoList.findIndex(e=>e.key === assetDetectTask.key)
        const _undoList = undoList
        _undoList[index] = assetDetectTask
        this.setState({ workList: _undoList })
        return _undoList
      }
    })
  }
  render () {
    const { workList = [] } = this.state
    return (
      <GupComponent workList={workList} fields={this.components} />
    )
  }
}
