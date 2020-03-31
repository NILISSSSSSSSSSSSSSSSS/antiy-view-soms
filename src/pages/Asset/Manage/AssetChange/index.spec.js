import React from 'react'
import { shallow } from 'enzyme'
import AssetChange from './index'
import api from '@/services/api'
// jest.mock('@/services/api')
const props = {
  location: {
    search: '?source=register&id=4bDspg871efwNHvK6%2FmuOg%3D%3D&categoryModel=1'
  },
  form: {
    validateFields: (func)=>{
      func()
    }
  },
  history: {
    push: jest.fn()
  }
}
const head = { code: '200' }
const body = {
  asset: {},
  assetNetworkEquipment: {},
  assetSafetyEquipment: {},
  assetStorageMedium: {}
}

describe('资产变更页面 <AssetChange />', () => {
  let wrapper
  beforeEach(()=>{
    // wrapper = shallow(<Router><Unknown { ...props }/></Router>)
    wrapper = shallow(<AssetChange {...props} />).dive()
  })
  // it('快照', ()=>{
  //   const app = wrapper.debug()
  //   expect(app).toMatchSnapshot()
  // })
  it('AssetChange页面的正常渲染', () => {
    expect(wrapper.find('.asset-change')).toHaveLength(1)
  })
  it('softwareQueryConfig  ===> 关联软件组件内部的封装请求', () => {
    const instance = wrapper.instance()
    const spy_getList = jest.spyOn(instance.softwareQueryConfig, 'getList')
    api.getSoftList = jest.fn(c=>c=>c)
    api.getSoftList.mockReturnValue(Promise.resolve(
      { head, body: [] }
    ))
    spy_getList().then((res)=>expect(res).toEqual({ head, body: [] }))
  })
  it('getAssetData  ===> 获取资产信息请求', () => {
    const instance = wrapper.instance()
    const spy_getAssetData = jest.spyOn(instance, 'getAssetData')
    api.getAssetHardWareById = jest.fn(c=>c=>c)
    api.getAssetHardWareById.mockReturnValue(Promise.resolve(
      { head, body }
    ))
    spy_getAssetData()
  })
  it('onSubmit  ===> 资产变更提交', () => {
    const instance = wrapper.instance()
    const spy_onSubmit = jest.spyOn(instance, 'onSubmit')
    props.form.validateFields = (func)=>{
      func(true, { })
    }
    spy_onSubmit()
    props.form.validateFields = (func)=>{
      func(false, { })
    }
    wrapper.setState({ baseInfo: { categoryModel: 1 } })
    spy_onSubmit()
    wrapper.setState({ baseInfo: { categoryModel: 2 } })
    spy_onSubmit()
    wrapper.setState({ baseInfo: { categoryModel: 3 } })
    spy_onSubmit()
    wrapper.setState({ baseInfo: { categoryModel: 4 } })
    spy_onSubmit()
    wrapper.setState({ baseInfo: { categoryModel: 5 } })
    spy_onSubmit()
  })
  it('assetChangeSubmit  ===> 资产变更请求', () => {
    const instance = wrapper.instance()
    const spy_assetChangeSubmit = jest.spyOn(instance, 'assetChangeSubmit')
    api.changAsset = jest.fn()
    api.changAsset.mockReturnValue(Promise.resolve({
      head
    }))
    spy_assetChangeSubmit()
    api.changAsset.mockReturnValue(Promise.resolve({
      head,
      body: '后台返回的提示'
    }))
    spy_assetChangeSubmit()
  })
  it('subassemblyChange  ===> 资产组件变化时', () => {
    const instance = wrapper.instance()
    const spy_subassemblyChange = jest.spyOn(instance, 'subassemblyChange')
    const DISK1 = { type: 'DISK', amount: 1 }
    const DISK2 = { type: 'DISK', amount: 2 }
    const addList = [DISK1]
    const list = [DISK1]
    console.log(instance.isShowNextStep)
    /**
     * 资产类型为计算设备时
     */
    wrapper.setState({ baseInfo: { categoryModel: 1 } })
    // 添加了硬盘
    spy_subassemblyChange(list, addList, [], [], [])
    // 显示下一步操作
    expect(instance.isShowNextStep.disk).toBeTruthy()
    // 需扫描
    expect(instance.needScan.disk).toBeTruthy()
    /**
     * 资产类型为非计算设备时
     */
    wrapper.setState({ baseInfo: { categoryModel: 2 } })
    // 添加了硬盘
    spy_subassemblyChange(list, addList)
    // 不显示下一步操作
    expect(instance.isShowNextStep.disk).toBeFalsy()
    // 需扫描
    expect(instance.needScan.disk).toBeTruthy()
  })
  it('softChange  ===> 资产软件变化时', () => {
    const instance = wrapper.instance()
    const spy_softChange = jest.spyOn(instance, 'softChange')
    const SOFT1 = { softwareId: 1 }
    const SOFT2 = { softwareId: 2 }
    let originalList = [SOFT1]
    let list = [SOFT1, SOFT2]
    /**
     * 关联软件数量不一致时，直接触发配置流程
     */
    spy_softChange(list, originalList)
    // 显示下一步操作
    expect(instance.isShowNextStep.software).toBeTruthy()
    /**
     * 关联软件数量一致时，则进行比对，查看是否进行了变更，变更了则走而配置流程
     */
    list = [SOFT2]
    spy_softChange(list, originalList)
    // 不显示下一步操作
    expect(instance.isShowNextStep.software).toBeTruthy()
  })
  it('baseChange  ===> 资产基础信息变化时', () => {
    const instance = wrapper.instance()
    const spy_baseChange = jest.spyOn(instance, 'baseChange')
    const ASSET_DATA = { asset: { operationSystem: '1', categoryModel: 1 } }
    /**
     * 计算设备操作系统变更了，要走配置流程
     */
    wrapper.setState({ baseInfo: { operationSystem: '1' }, assetData: ASSET_DATA })
    spy_baseChange({ operationSystem: '2' })
    // 需走配置流程
    expect(instance.isShowNextStep.baseTemplate).toBeTruthy()
    /**
     * 安全设备变更了操作系统，须触发漏洞扫描
     */
    wrapper.setState({ baseInfo: { operationSystem: '1' }, assetData: { asset: { ...ASSET_DATA, categoryModel: 3 } } })
    spy_baseChange({ operationSystem: '2' })
    expect(instance.needScan.operationSystem).toBeTruthy()
  })
})
