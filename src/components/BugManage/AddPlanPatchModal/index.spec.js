import React from 'react'
import { message } from 'antd'
import { shallow } from 'enzyme'
import api from '@/services/api'
import AddPlanPatchModal from './index'

// jest.mock('../../../services/api')
// jest.mock('../../../utils/common')

describe('测试<AddPlanPatchModal />', () => {
  let wrapper
  const head = { code: '200' }
  const props = {
    onConfirm: () => {}
  }
  beforeEach(() => {
    wrapper = shallow(<AddPlanPatchModal {...props} />)
  })
  it('测试render <AddPlanPatchModal /> component', () => {
    expect(wrapper.find('.main-table-content')).toHaveLength(1)
  })
  it('测试getList获取列表数据', () => {
    const instance = wrapper.instance()
    const getList = jest.spyOn(instance, 'getList')
    api.bugQueryPatch = jest.fn()
    const spyFunction_getList = jest.spyOn(api, 'bugQueryPatch')
    spyFunction_getList.mockReturnValue(Promise.resolve({
      head,
      body: {
        items: [],
        totalRecords: 1
      }
    }))
    getList({
      currentPage: 1,
      pageSize: 10
    })
    expect(getList).toHaveBeenCalled()
    expect(spyFunction_getList).toHaveBeenCalled()
  })
  it('测试onReset查询条件重置', () => {
    const instance = wrapper.instance()
    const onReset = jest.spyOn(instance, 'onReset')
    const getList = jest.spyOn(instance, 'getList')
    onReset()
    expect(wrapper.state().pageSize).toEqual(10)
    expect(wrapper.state().currentPage).toEqual(1)
    expect(wrapper.state().values).toEqual({})
    expect(getList).toHaveBeenCalled()
  })
  it('测试onSearch提交表单，执行查询', () => {
    const instance = wrapper.instance()
    const onSearch = jest.spyOn(instance, 'onSearch')
    const getList = jest.spyOn(instance, 'getList')
    wrapper.setState({
      currentPage: 2
    })
    onSearch({})
    expect(wrapper.state().currentPage).toEqual(1)
    expect(getList).toHaveBeenCalled()
  })
  it('测试changePage翻页', () => {
    const instance = wrapper.instance()
    const changePage = jest.spyOn(instance, 'changePage')
    const getList = jest.spyOn(instance, 'getList')
    changePage(2, 20)
    expect(wrapper.state().pageSize).toEqual(20)
    expect(wrapper.state().currentPage).toEqual(2)
    expect(getList).toHaveBeenCalled()
  })
  it('测试onConfirm', () => {
    const instance = wrapper.instance()
    const onConfirm = jest.spyOn(instance, 'onConfirm')
    const spyMessage = jest.spyOn(message, 'info')
    wrapper.setState({
      selectedRowKeys: []
    })
    onConfirm()
    expect(spyMessage).toHaveBeenCalledWith('请选择数据！')
  })
  it('测试confirm,有勾选数据', () => {
    const instance = wrapper.instance()
    const onConfirm = jest.spyOn(instance, 'onConfirm')
    wrapper.setState({
      selectedRowKeys: [{}]
    })
    onConfirm()
    expect(onConfirm).toHaveBeenCalled()
  })
})