import { Component } from 'react'
import { withRouter } from 'dva/router'
import authConfig from '@/utils/authConfig'
import api from '@/services/api'
import GupComponent from '../Common/GupComponent'
let undoList = [
  { key: 'baselineConfigTask', name: '配置基准', value: 0 },
  { key: 'baselineCheck', name: '配置核查', value: 0 },
  { key: 'baselineFix', name: '配置加固', value: 0 }
]
@withRouter
export default class ConfigurationMange extends Component {
  constructor (props) {
    super(props)
    this.state = {
      workList: []
    }
    this.components = []
  }
  async componentDidMount () {
    await Promise.all([
      this.getCheck(),
      this.getFix(),
      this.getWaitWork().then(() => {
        this.components = this.generateData()
        this.setState({ key: Math.random() })
      })
    ])
  }
  // 生成flow流程图
  generateData = () => {
    // 备注：空对象，必须要，站位用
    return (
      [
        [
          { name: '新建模板', auth: authConfig.configNew, url: '/basesetting/model/edit?work=true', type: 'square', img: require('@/assets/images/workbench/new-template.svg'), disabledImg: require('@/assets/images/workbench/new-template-disabled.svg') },
          { name: '', type: 'line', img: require('@/assets/images/workbench/sx_y.svg'), render: this.renderLine },
          { name: '配置基准', auth: authConfig.configConfig, url: '/basesetting/manage?work=true', type: 'square', img: require('@/assets/images/workbench/baseSetting-operation.svg'), disabledImg: require('@/assets/images/workbench/baseSetting-operation-disabled.svg') },
          { name: '', type: 'line', img: require('@/assets/images/workbench/sx_y.svg'), render: this.renderLine },
          { name: '配置核查', auth: authConfig.configVerify, url: '/basesetting/list/enforcement?check=true', type: 'square', img: require('@/assets/images/workbench/config-pzjc.svg'), disabledImg: require('@/assets/images/workbench/config-pzjc-disabled.svg') },
          { name: '', type: 'line', img: require('@/assets/images/workbench/sx_y.svg'), render: this.renderLine },
          { name: '配置加固', auth: authConfig.configFixed, url: '/basesetting/list/validation?fix=true', type: 'square', img: require('@/assets/images/workbench/config-pzjg.svg'), disabledImg: require('@/assets/images/workbench/config-pzjg-disabled.svg') },
          {},
          {}
        ],
        [
          { name: '', type: 'line', img: require('@/assets/images/workbench/xx_x.svg') },
          {},
          {},
          {},
          { name: '', type: 'line', img: require('@/assets/images/workbench/sx_s.svg') },
          {},
          {},
          {},
          {}
        ],
        [
          { name: '编辑模板', auth: authConfig.configEdit, url: '/basesetting/model?work=true', type: 'square', img: require('@/assets/images/workbench/config-bjmb.svg'), disabledImg: require('@/assets/images/workbench/config-bjmb-disabled.svg') }, // 空对象，必须要，站位用
          { name: '', type: 'line', img: require('@/assets/images/workbench/sx_duan.svg'), style: { width: '89px' } },
          { name: '', type: 'line', img: require('@/assets/images/workbench/sx_chang.svg') },
          { name: '', type: 'line', img: require('@/assets/images/workbench/sx_duan.svg'), style: { width: '89px' } },
          { name: 'asd', type: 'line', img: require('@/assets/images/workbench/zx_zs.svg'), style: { width: '52px', margin: '-46px 0 0 -48px' } },
          {},
          {},
          {},
          {}
        ]
      ]
    )
  }
  /**
   * 获取我的配置待办
   */
  getWaitWork = () => {
    return api.getMyUndoCount().then((res) => {
      //待办事务统计
      if (res.body) {
        let body = res.body
        undoList = undoList.map(e => {
          if (e.key === 'baselineConfigTask') {
            return { ...e, value: body[e.key] }
          }
          return e
        })
      }
      this.setState({ workList: undoList })
      return undoList
    })
  }
  //核查
  getCheck = () => {
    return api.getCheckList({ 'configStatusList': [2, 5, 6, 4] }).then((res) => {
      //待办事务统计
      if (res.body) {
        let body = res.body
        undoList = undoList.map(e => {
          if (e.key === 'baselineCheck') {
            return { ...e, value: body.totalRecords }
          }
          return e
        })
      }
      this.setState({ workList: undoList })
      return undoList
    })
  }
  //加固
  getFix = () => {
    return api.getReinforceList({ 'configStatusList': [7, 10, 11, 9] }).then((res) => {
      //待办事务统计
      if (res.body) {
        let body = res.body
        undoList = undoList.map(e => {
          if (e.key === 'baselineFix') {
            return { ...e, value: body.totalRecords }
          }
          return e
        })
      }
      this.setState({ workList: undoList })
      return undoList
    })
  }
  render () {
    const { workList = [] } = this.state
    return (
      <GupComponent workList={workList} fields={this.components} />
    )
  }
}
