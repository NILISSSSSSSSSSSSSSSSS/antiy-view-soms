import React from 'react'
import { shallow } from 'enzyme'
import api from '@/services/api'
import RepairByAssets  from './index'

jest.mock('react-router-dom')
jest.mock('@/services/api')

const props = {
  location: {
    search: ''
  },
  listUrl: 'getList'
}

describe('测试<RepairByAssets />', () => {
  let wrapper =  shallow(<RepairByAssets {...props} />)
  const instance = wrapper.instance()
  it('测试render <RepairByAssets /> component', () => {
    expect(wrapper.find('.search-bar')).toHaveLength(1)
  })
  it('测试getList', () => {
    const getList = jest.spyOn(instance, 'getList')
    const spyFunction_getList = jest.spyOn(api, 'getList')
    getList({
      pageSize: 20,
      currentPage: 1
    })
    expect(getList).toHaveBeenCalled()
    expect(spyFunction_getList).toHaveBeenCalled()
    expect(wrapper.state().body).toEqual({
      items: [{}],
      totalRecords: 1
    })
  })
  it('测试onSubmit提交表单，执行查询', () => {
    const instance = wrapper.instance()
    const onSubmit = jest.spyOn(instance, 'onSubmit')
    const getList = jest.spyOn(instance, 'getList')
    wrapper.setState({
      pagingParameter: {
        pageSize: 10,
        currentPage: 2
      }
    })
    onSubmit({})
    expect(wrapper.state().pagingParameter.currentPage).toEqual(1)
    expect(getList).toHaveBeenCalled()
  })
  it('测试onReset查询条件重置', () => {
    const instance = wrapper.instance()
    const onReset = jest.spyOn(instance, 'onReset')
    const getList = jest.spyOn(instance, 'getList')
    onReset()
    expect(wrapper.state().pagingParameter).toEqual({
      pageSize: 10,
      currentPage: 1
    })
    expect(wrapper.state().values).toEqual({})
    expect(getList).toHaveBeenCalled()
  })
  it('测试changePage翻页', () => {
    const instance = wrapper.instance()
    const changePage = jest.spyOn(instance, 'changePage')
    const getList = jest.spyOn(instance, 'getList')
    changePage(2, 20)
    expect(wrapper.state().pagingParameter).toEqual({
      currentPage: 2,
      pageSize: 20
    })
    expect(getList).toHaveBeenCalled()
  })
  it('测试handleTableSort排序', () => {
    const instance = wrapper.instance()
    const handleTableSort = jest.spyOn(instance, 'handleTableSort')
    const getList = jest.spyOn(instance, 'getList')
    handleTableSort(null, null, {})
    expect(getList).toHaveBeenCalled()
  })
})