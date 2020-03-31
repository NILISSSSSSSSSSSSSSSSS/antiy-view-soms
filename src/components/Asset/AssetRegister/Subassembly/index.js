import { Component } from 'react'
import RelateSubassembly from '@c/common/RelateSubassembly'
import api from '@/services/api'

export default class Subassembly extends Component {
  static defaultProps = {
    data: {} // 资产数据
  }
  removeList = [] // 被移除的组件列表
  addList = [] // 添加的组件列表
  changeList = [] // 变更的组件列表
  queryConfig = {
    params: {
      assetId: this.props.data.stringId
    },
    // 资产已经关联组件列表
    getList: ()=>{
      const { stringId: primaryKey } = this.props.data
      if(primaryKey){
        return api.getAssetAssemblyInfo({ primaryKey }).then((res)=>{
          const { onChange } = this.props
          const list = (res.body || []).map(e=>({ ...e, amount: e.amount || 1, originalAmount: e.amount || 1 }))
          // 获取到的组件信息返回给父组件
          onChange && onChange(list, [], void 0, void 0, list)
          return res
        })
      }
      return Promise.reject()
    }
  }
  UNSAFE_componentWillReceiveProps (nextProps, nextContext) {
    const { data = {} } = nextProps || {}
    this.queryConfig.params.assetId = data.stringId
  }
  /**
   * 组件内容发生改变时产生的回调
   * @param list
   * @param add { Array} 添加的列表
   * @param remove { Object } 移除的项
   * @param change { Object } 变更的项
   * @param originalList { Array } 原始的数据列表
   */
  onChange = (list, add, remove, change, originalList) => {
    this.generateAddList(add, originalList)
    this.generateRemoveList(remove, originalList)
    this.generateChangeList(change)
    const { onChange } = this.props
    onChange && onChange(list, this.addList, this.removeList, this.changeList, originalList)
  }
  /**
   * 合并添加的列表
   * @param addList
   * @param originalList
   * @return {[]}
   */
  generateAddList = (addList = [], originalList = []) => {
    if(!addList.length){
      return
    }
    addList.forEach(obj => {
      const findObj  = this.addList.find(e=>e.businessId === obj.businessId)
      if(!findObj){
        this.addList.push(obj)
      }
    })
    // 处理添加与（删除、变更）的关系
    for(let i = 0, len = this.addList.length; i < len; ++i){
      const add = this.addList[i]
      const has = originalList.find(e=>e.businessId === add.businessId)
      // 被移除之后，再次添加时
      if(has){
        // 从移除列表中删除该组件
        this.removeList = this.removeList.filter(e=>e.businessId !== add.businessId)
        // 是否修改过数量
        const index = this.changeList.findIndex(e=>e.businessId === add.businessId)
        // 如果被移除之前被修改过数量
        if(index >= 0){
          this.changeList[index] = { ...add, amount: 1 }
        }else {
          this.changeList.push(add)
        }
        // 删除该数据
        this.addList.splice(i, 1)
        if(len > 1){
          // 重新从该位置循环
          --i
        }
      }
    }
  }
  /**
   * 合并移除的列表
   * @param remove
   * @param originalList
   * @return {[]}
   */
  generateRemoveList = (remove, originalList = [] ) => {
    if(!remove){
      return
    }
    const has = this.removeList.find(e=>e.businessId === remove.businessId)
    // 是否在原始列表中，不在的话，不计入删除列表中
    const hasOriginal = originalList.find(e=>e.businessId === remove.businessId)
    if(!has && hasOriginal){
      this.removeList.push(remove)
    }
    // 是否在改变列表中，在改变列表中，要把改变列表中的该数据剔除
    this.changeList = this.changeList.filter(e=>e.businessId !== remove.businessId)
    // 是否在添加列表中，在添加列表中，要把添加列表中的该数据剔除
    this.addList = this.addList.filter(e=>e.businessId !== remove.businessId)
  }
  /**
   * 合并变更的列表
   * @param change
   * @return {[]}
   */
  generateChangeList = (change) => {
    if(!change){
      return
    }
    // 是否在添加列表中，在添加列表中，则不进行改变
    const find = this.addList.find(e=>e.businessId !== change.businessId)
    if(find){
      return
    }
    const index = this.changeList.findIndex(e=>e.businessId === change.businessId)
    // 之前没有变更过，则加入变更列表
    if(index === -1){
      this.changeList.push(change)
    }else { // 之前变更过，则替换
      this.changeList[index] = change
    }
  }
  render () {
    const { defaultList } = this.props
    return (
      <div>
        <RelateSubassembly defaultList={defaultList} resetKey={this.resetKey} queryConfig={this.queryConfig} page={false} onChange={this.onChange} maxCount={999}/>
      </div>
    )
  }
}
