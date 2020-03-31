import React from 'react'
import { shallow } from 'enzyme'
import AssetRegister from './index'
import api from '@/services/api'
import {
  COMPUTING_DEVICE,
  STORAGE_DEVICE,
  NETWORK_DEVICE,
  SAFETY_DEVICE,
  OTHER_DEVICE
} from '@a/js/enume'
// jest.mock('@/services/api')
const head = { code: '200' }
const body = {
  asset: {},
  assetNetworkEquipment: {},
  assetSafetyEquipment: {},
  assetStorageMedium: {}
}
api.getAssetHardWareById = jest.fn()
api.getAssetHardWareById.mockReturnValue(Promise.resolve({
  head,
  body
}))
describe('资产新登记页面 <AssetRegister />', () => {
  let wrapper
  const props = {
    location: {
      search: '?source=register&register=new'
    },
    form: {
      validateFields: (func) => {
        func()
      }
    },
    history: {
      push: jest.fn()
    }
  }
  beforeEach(() => {
    wrapper = shallow(<AssetRegister { ...props } />).dive()
  })
  // it('快照', ()=>{
  //   const app = wrapper.debug()
  //   expect(app).toMatchSnapshot()
  // })
  it('AssetRegister页面的正常渲染', () => {
    expect(wrapper.find('.asset-register-container')).toHaveLength(1)
  })
  it('baseChange  ===> 资产基础信息设备类型变化时', () => {
    const instance = wrapper.instance()
    const spy_baseChange = jest.spyOn(instance, 'baseChange')
    /**
     * 登记资产为计算设备时
     */
    // 原始数据
    wrapper.setState({ baseInfo: { operationSystem: '1', categoryModel: COMPUTING_DEVICE.value } })
    spy_baseChange({ operationSystem: '1', categoryModel: COMPUTING_DEVICE.value })
    // 需走配置流程
    expect(instance.isShowNextStep.categoryModel).toBeTruthy()
    // 重置state
    // wrapper.restore()
    /**
     * 登记资产时，一但切换资产类型，则认为模板、软件、组件都为选择，
     * 并且情况相应数据
     */
    // 原始数据
    wrapper.setState({ baseInfo: { operationSystem: '1', categoryModel: COMPUTING_DEVICE.value } })
    spy_baseChange({ operationSystem: '1', categoryModel: NETWORK_DEVICE.value })
    // 判断为非计算设备
    expect(instance.isShowNextStep.categoryModel).toBeFalsy()
    expect(instance.isShowNextStep.baseTemplate).toBeFalsy()
    expect(instance.isShowNextStep.software).toBeFalsy()
    expect(instance.isShowNextStep.disk).toBeFalsy()
    expect(instance.templateVerificationFuc).toBeNull()
    expect(instance.subassemblyList).toEqual([])
    expect(wrapper.state().baseInfo.categoryModel).toEqual(NETWORK_DEVICE.value)
    expect(wrapper.state().baseInfo.templates).toEqual([])
    // 重置state
    // wrapper.restore()
    /**
     * 切换资产版本时
     */
    const spy_getCPEAssemblyList = jest.spyOn(instance, 'getCPEAssemblyList')
    // 原始数据
    wrapper.setState({ baseInfo: { businessId: '1' } })
    spy_baseChange({ businessId: '2' })
    expect(spy_getCPEAssemblyList).toHaveBeenCalled()
    spy_baseChange({ businessId: null })
    expect(wrapper.state().defaultValueSubassemblyList).toEqual([])
  })
  it('templateChange ===》模板改变事件', () => {
    const instance = wrapper.instance()
    const spy_templateChange = jest.spyOn(instance, 'templateChange')
    /**
     * 选择模板时，这会出现下一步步骤
     */
    let temps = [{}]
    spy_templateChange(temps)
    expect(instance.isShowNextStep.baseTemplate).toBeTruthy()
    /**
     * 没有选择模板时，则不显示下一步骤
     */
    temps = []
    spy_templateChange(temps)
    expect(instance.isShowNextStep.baseTemplate).toBeFalsy()
  })
  it('renderFrontStep ===》渲染上一步的驳回信息', () => {
    const instance = wrapper.instance()
    const spy_renderFrontStep = jest.spyOn(instance, 'renderFrontStep')
    /**
     * 没有驳回信息时
     */
    wrapper.setState({ preNodeInfo: {} })
    let dom = spy_renderFrontStep()
    expect(dom).toBeNull()
    /**
     * 有驳回信息时
     */
    const fileInfo = JSON.stringify([{ fileName: '测试' }])
    wrapper.setState({ preNodeInfo: { note: '通过', fileInfo, originStatus: 8 } })
    dom = spy_renderFrontStep()
    expect(dom).toMatchSnapshot()
  })
  it('generatorDisabled ===》模板是否被禁用', () => {
    const instance = wrapper.instance()
    const spy_renderFrontStep = jest.spyOn(instance, 'generatorDisabled')
    // 安全设备
    let flag = spy_renderFrontStep(SAFETY_DEVICE.value)
    expect(flag).toBeFalsy()
    // 计算设备
    flag = spy_renderFrontStep(COMPUTING_DEVICE.value, '1')
    expect(flag).toBeFalsy()
    // 网络设备
    flag = spy_renderFrontStep(NETWORK_DEVICE.value)
    expect(flag).toBeFalsy()
    // 存储设备
    flag = spy_renderFrontStep(STORAGE_DEVICE.value)
    expect(flag).toBeFalsy()
    // 其他设备
    flag = spy_renderFrontStep(OTHER_DEVICE.value)
    expect(flag).toBeFalsy()
  })
  it('collapseOnChange ===》展开collapse事件', () => {
    const instance = wrapper.instance()
    const spy_collapseOnChange = jest.spyOn(instance, 'collapseOnChange')
    // 默认展开基础信息、模板信息
    expect(wrapper.state().activeKey).toEqual(['1', '2'])
    // 收起模板
    spy_collapseOnChange('2')
    expect(wrapper.state().activeKey.includes('2')).toBeFalsy()
    //展开组件信息
    spy_collapseOnChange('3')
    expect(wrapper.state().activeKey.includes('3')).toBeTruthy()
  })
  it('subassemblyChange  ===> 新登记时资产组件变化时', () => {
    const instance = wrapper.instance()
    const spy_subassemblyChange = jest.spyOn(instance, 'subassemblyChange')
    const DISK1 = { type: 'DISK', businessId: '1', amount: 1 }
    let addList = [DISK1]
    let list = [DISK1]
    /**
     * 新登记时任何资产类型，改变了任何组件都不会显示下一步骤
     */
    wrapper.setState({ baseInfo: { categoryModel: 1 } })
    // 添加了硬盘
    spy_subassemblyChange(list, addList, [], [], [])
    // 显示下一步操作
    expect(instance.isShowNextStep.disk).toBeFalsy()
  })
  it('getCPEAssemblyList  ===> 资产切换版本时', () => {
    const instance = wrapper.instance()
    api.getCPEAssemblyList = jest.fn()
    api.getCPEAssemblyList.mockReturnValue(Promise.resolve({ head, body: [] }))
    const spy_getCPEAssemblyList = jest.spyOn(instance, 'getCPEAssemblyList')
    spy_getCPEAssemblyList()
  })
  it('onSubmit  ===> 点击提交按钮事件', () => {
    const nextStep = {
      nextStep: 'nextStep',
      nextExecutor: []
    }
    const instance = wrapper.instance()
    const spy_onSubmit = jest.spyOn(instance, 'onSubmit')
    const spy_templateChange = jest.spyOn(instance, 'templateChange')
    // 表单验证未通过
    props.form.validateFields = (func)=>{
      func(true, { })
    }
    spy_onSubmit(nextStep)
    // 表单验证通过
    props.form.validateFields = (func)=>{
      func(false, { })
    }
    /**
     * 提交计算设备，没有选择模板时,展开模板的选项
     */
    wrapper.setState({ baseInfo: { categoryModel: COMPUTING_DEVICE.value } })
    spy_onSubmit(nextStep)
    expect(wrapper.state().activeKey.includes('2')).toBeTruthy()
    /**
     * 模拟选择了模板
     */
    spy_templateChange([{}], ()=>false)
    spy_onSubmit(nextStep)

    /**
     * 依次验证其他资产类型的设备
     */
    wrapper.setState({ baseInfo: { categoryModel: 2 } })
    spy_onSubmit(nextStep)
    wrapper.setState({ baseInfo: { categoryModel: 3 } })
    spy_onSubmit(nextStep)
    wrapper.setState({ baseInfo: { categoryModel: 4 } })
    spy_onSubmit(nextStep)
    wrapper.setState({ baseInfo: { categoryModel: 5 } })
    spy_onSubmit(nextStep)
  })
  it('assetRegister  ===> 新登记请求提交', () => {
    const instance = wrapper.instance()
    const spy_assetRegister = jest.spyOn(instance, 'assetRegister')
    api.saveAsset = jest.fn()
    api.saveAsset.mockReturnValue(Promise.resolve({ head, body: '后台提示' }))
    spy_assetRegister({ asset: { nextStep: 'safetyCheck' } })

    api.saveAsset.mockReturnValue(Promise.resolve({ head }))
    spy_assetRegister({ asset: { nextStep: 'safetyCheck' } })
  })
})
describe('资产再次登记页面 <AssetRegister />', () => {
  const props = {
    location: {
      search: '?source=register&id=4bDspg871efwNHvK6%2FmuOg%3D%3D&register=again'
    },
    form: {
      validateFields: (func) => {
        func()
      }
    },
    history: {
      push: jest.fn()
    }
  }
  let wrapper
  beforeEach(() => {
    wrapper = shallow(<AssetRegister { ...props } />).dive()
  })
  // it('快照', ()=>{
  //   const app = wrapper.debug()
  //   expect(app).toMatchSnapshot()
  // })
  it('AssetRegister页面的正常渲染', () => {
    expect(wrapper.find('.asset-register-container')).toHaveLength(1)
  })
  it('subassemblyChange  ===> 资产组件变化时', () => {
    const instance = wrapper.instance()
    const spy_subassemblyChange = jest.spyOn(instance, 'subassemblyChange')
    const DISK1 = { type: 'DISK', businessId: '1', amount: 1 }
    const DISK2 = { type: 'DISK', businessId: '1', amount: 2 }
    const CPU = { type: 'CPU', amount: 2 }
    let addList = [DISK1]
    let list = [DISK1]
    /**
     * 资产类型为计算设备时并且包含硬盘时
     */
    wrapper.setState({ baseInfo: { categoryModel: 1 } })
    // 添加了硬盘
    spy_subassemblyChange(list, addList, [], [], [])
    // 显示下一步操作
    expect(instance.isShowNextStep.disk).toBeTruthy()
    /**
     * 资产类型为计算设备时并且包含硬盘时，数量不一致时
     */
    const changeList = [DISK2]
    const originalList = [DISK1]
    wrapper.setState({ baseInfo: { categoryModel: 1 } })
    // 添加了硬盘
    spy_subassemblyChange(changeList, [], [], changeList, originalList)
    // 显示下一步操作
    expect(instance.isShowNextStep.disk).toBeTruthy()
    /**
     * 资产类型为计算设备时不包含硬盘时
     */
    addList = [CPU]
    list = [CPU]
    wrapper.setState({ baseInfo: { categoryModel: 1 } })
    // 添加了硬盘
    spy_subassemblyChange(list, addList, [], [], [])
    // 显示下一步操作
    expect(instance.isShowNextStep.disk).toBeFalsy()
    /**
     * 资产类型为非计算设备时包含硬盘时
     */
    addList = [DISK1]
    list = [DISK1]
    wrapper.setState({ baseInfo: { categoryModel: 2 } })
    // 添加了硬盘
    spy_subassemblyChange(list, addList)
    // 不显示下一步操作
    expect(instance.isShowNextStep.disk).toBeFalsy()
    /**
     * 资产类型为非计算设备时不包含硬盘时
     */
    addList = [CPU]
    list = [CPU]
    wrapper.setState({ baseInfo: { categoryModel: 2 } })
    // 添加了硬盘
    spy_subassemblyChange(list, addList)
    // 不显示下一步操作
    expect(instance.isShowNextStep.disk).toBeFalsy()
  })
  it('assetRegister  ===> 再次登记请求提交', () => {
    const instance = wrapper.instance()
    const spy_assetRegister = jest.spyOn(instance, 'assetRegister')
    // 默认是自己的代办任务
    wrapper.setState({ assetData: { asset: { waitingTaskReponse: {} } } })
    const params = { asset: { nextStep: 'safetyCheck' }, manualStartActivityRequest: {} }
    api.changAsset = jest.fn()
    api.changAsset.mockReturnValue(Promise.resolve({ head, body: '后台提示' }))
    spy_assetRegister(params)

    api.changAsset.mockReturnValue(Promise.resolve({ head }))
    spy_assetRegister(params)
  })
})
describe('未知资产再次登记页面 <AssetRegister />', () => {
  const props = {
    location: {
      search: '?source=appear&id=4bDspg871efwNHvK6%2FmuOg%3D%3D&register=new'
    },
    form: {
      validateFields: (func) => {
        func()
      }
    },
    history: {
      push: jest.fn()
    }
  }
  let wrapper
  beforeEach(() => {
    wrapper = shallow(<AssetRegister { ...props } />).dive()
  })
  // it('快照', ()=>{
  //   const app = wrapper.debug()
  //   expect(app).toMatchSnapshot()
  // })
  it('AssetRegister页面的正常渲染', () => {
    expect(wrapper.find('.asset-register-container')).toHaveLength(1)
  })
})
