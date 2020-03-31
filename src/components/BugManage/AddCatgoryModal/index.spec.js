import React from 'react'
import { message } from 'antd'
import { shallow } from 'enzyme'
import api from '@/services/api'
import AddCatgoryModal from './index'

jest.mock('../../../services/api')
jest.mock('../../../utils/common')

describe('测试<AddCatgoryModal />', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallow(<AddCatgoryModal />)
  })
  it('测试render <AddCatgoryModal /> component', () => {
    expect(wrapper.find('.over-scroll-modal')).toHaveLength(1)
  })
  it('测试getList获取列表数据', () => {
    const instance = wrapper.instance()
    const getList = jest.spyOn(instance, 'getList')
    const list = jest.spyOn(api, 'getVulnCpe')
    getList({
      currentPage: 1,
      pageSize: 10
    })
    expect(list).toHaveBeenCalled()
    expect(wrapper.state().body).toEqual({
      items: [],
      totalRecords: 1
    })
  })
  it('测试onSearch提交表单，执行查询', () => {
    const instance = wrapper.instance()
    const onSearch = jest.spyOn(instance, 'onSearch')
    const getList = jest.spyOn(instance, 'getList')
    wrapper.setState({
      pageSize: 10,
      currentPage: 2
    })
    onSearch({})
    expect(wrapper.state().currentPage).toEqual(1)
    expect(wrapper.state().pageSize).toEqual(10)
    expect(getList).toHaveBeenCalled()
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
})