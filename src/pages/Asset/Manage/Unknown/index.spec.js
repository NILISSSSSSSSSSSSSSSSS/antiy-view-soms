import React from 'react'
import { shallow } from 'enzyme'
import Unknown from './index'
import api from '@/services/api'
import { BrowserRouter }    from 'react-router-dom'
import PropTypes from 'prop-types'
// jest.mock('@/services/api')
const router = {
  history: new BrowserRouter().history,
  route: {
    location: {
      search: '?id=asPTSbUoE0fZbilfBaL15w%3D%3D'
    },
    match: {}
  }
}

const createContext = {
  context: { router },
  childContextTypes: { router: PropTypes.object.isRequired }
}

const head = { code: '200' }
describe('未知资产列表 <Unknown />', () => {
  let wrapper
  beforeEach(()=>{
    // wrapper = shallow(<Router><Unknown { ...props }/></Router>)
    wrapper = shallow(<Unknown />, createContext).dive().dive()
  })
  it('未知资产列表的正常渲染', () => {
    expect(wrapper.find('.unknown-containar')).toHaveLength(1)
  })
  it('onSearch ==>查询条件的查询事件', () => {
    const instance = wrapper.instance()
    const spyFunction_onSearch = jest.spyOn(instance, 'onSearch')
    spyFunction_onSearch({ name: '查询' })
    expect(spyFunction_onSearch).toHaveBeenCalled()
    const state = wrapper.state()
    expect(state.filter.name).toEqual('查询')
  })
  it('getList ==>获取资产列表', () => {
    const instance = wrapper.instance()
    const spyFunction_getList = jest.spyOn(instance, 'getList')
    api.getAssetList = jest.fn()
    const spyFunction_getAssetList = jest.spyOn(api, 'getAssetList')
    spyFunction_getAssetList.mockReturnValue(Promise.resolve({
      head,
      body: {
        items: [],
        totalRecords: 0
      }
    }))
    // 调用getList
    const result = spyFunction_getList({ name: '查询', sortOrder: { columnKey: 'key', order: 'ascend' } }, 1, 10)
    result.then(()=>{})
    expect(spyFunction_getList).toHaveBeenCalled()
    expect(spyFunction_getAssetList).toHaveBeenCalled()
  })
  it('onChange ==> 表格翻页事件', ()=>{
    const spyFunction_onChange = jest.spyOn(wrapper.instance(), 'onChange')
    const pagination = { current: 2, pageSize: 10 }
    spyFunction_onChange(pagination, {}, { columnKey: 'keyName', order: 'ascend' })
    expect(spyFunction_onChange).toHaveBeenCalled()
    const state = wrapper.state()
    expect(state.currentPage).toEqual(2)
    expect(state.filter.sortOrder).toEqual({ columnKey: 'keyName', order: 'ascend' })
  })
  it('notRegisterSingle ==> 单个不予登记', ()=>{
    const spyFunction_notRegisterSingle = jest.spyOn(wrapper.instance(), 'notRegisterSingle')
    const spyFunction_notRegisterSubmit = jest.spyOn(wrapper.instance(), 'notRegisterSubmit')
    spyFunction_notRegisterSingle({})
    expect(spyFunction_notRegisterSubmit).toHaveBeenCalled()
  })
  it('notRegisterBatch ==> 批量不予登记', ()=>{
    const spyFunction_notRegisterBatch = jest.spyOn(wrapper.instance(), 'notRegisterBatch')
    const spyFunction_notRegisterSubmit = jest.spyOn(wrapper.instance(), 'notRegisterSubmit')
    spyFunction_notRegisterBatch([])
    expect(spyFunction_notRegisterSubmit).toHaveBeenCalled()
  })
  it('notRegisterSubmit ==> 不予登记提交', ()=>{
    const spyFunction_notRegisterSubmit = jest.spyOn(wrapper.instance(), 'notRegisterSubmit')
    api.assetNoRegister = jest.fn(c=>c=>c)
    api.assetNoRegister.mockReturnValue(Promise.resolve({
      head
    }))
    wrapper.setState({
      selectedRowKeys: ['2']
    })
    spyFunction_notRegisterSubmit('1')
    expect(wrapper.state().selectedRowKeys).toEqual(['2'])

    api.assetNoRegister('1').then((res)=>{
      if(res.head.code === '200'){
        wrapper.setState({
          selectedRowKeys: []
        })
        expect(wrapper.state().selectedRowKeys).toEqual([])
      }
    })
  })
  it('onSubmitScan ==> 探测弹窗提交事件', ()=>{
    const spyFunction_onSubmitScan = jest.spyOn(wrapper.instance(), 'onSubmitScan')
    spyFunction_onSubmitScan({ alarm: 1 })
    spyFunction_onSubmitScan({ alarm: 2 })
  })
  it('onSubmitAssetDetect ==> 提交弹窗请求', ()=>{
    const spyFunction_onSubmitAssetDetect = jest.spyOn(wrapper.instance(), 'onSubmitAssetDetect')
    api.submitAssetDetect = jest.fn()
    api.submitAssetDetect.mockReturnValue(Promise.resolve({}))
    spyFunction_onSubmitAssetDetect({ alarm: true })
    expect(spyFunction_onSubmitAssetDetect).toHaveBeenCalled()
  })
  it('assetDetectPrecondition ==> 资产探测前提', ()=>{
    const spyFunction_assetDetectPrecondition = jest.spyOn(wrapper.instance(), 'assetDetectPrecondition')
    api.getAssetDetect = jest.fn()
    api.getAssetDetect.mockReturnValue(Promise.resolve({ head, body: null }))
    spyFunction_assetDetectPrecondition({ alarm: true })
    api.getAssetDetect.mockReturnValue(Promise.resolve({ head, body: {} }))
    spyFunction_assetDetectPrecondition({ alarm: true })
  })
  it('exportExcel ==> 导出事件', ()=>{
    const spyFunction_exportExcel = jest.spyOn(wrapper.instance(), 'exportExcel')
    const spyFunction_getList = jest.spyOn(wrapper.instance(), 'getList')
    spyFunction_getList.mockReturnValue(Promise.resolve({ head, body: { totalRecords: 0 } }))
    spyFunction_exportExcel()
    spyFunction_getList.mockReturnValue(Promise.resolve({ head, body: { totalRecords: 1 } }))
    spyFunction_exportExcel()
  })
  it('快照', ()=>{
    const app = wrapper.debug()
    expect(app).toMatchSnapshot()
  })
})
