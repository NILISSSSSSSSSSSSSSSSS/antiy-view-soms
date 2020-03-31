import React from 'react'
import { shallow } from 'enzyme'
import { message } from 'antd'
import api from '@/services/api'
import CatgoryList from './index'

// jest.mock('@/utils/common')
// jest.mock('@/services/api')
jest.mock('react-router-dom')
const head = { code: '200' }
const props = {
  location: {
    search: ''
  },
  getCatgory: jest.fn()
}

describe('<CatgoryList />', () => {
  const wrapper = shallow(<CatgoryList {...props} />)
  const instance = wrapper.instance()
  it('render <CatgoryList />', () => {
    expect(wrapper.find('.bugPatch-content')).toHaveLength(1)
  })
  it('测试onConfirm', () => {
    const onConfirm = jest.spyOn(instance, 'onConfirm')
    wrapper.setState({
      allList: []
    })
    onConfirm([])
    expect(onConfirm).toHaveBeenCalled()
    expect(wrapper.state().addVisible).toEqual(false)
    expect(wrapper.state().selectedRowKeys).toEqual([])
  })
  it('测试deleteState', () => {
    const deleteState = jest.spyOn(instance, 'deleteState')
    const getCacheList = jest.spyOn(instance, 'getCacheList')
    wrapper.setState({
      allList: []
    })
    deleteState([])
    expect(deleteState).toHaveBeenCalled()
    expect(getCacheList).toHaveBeenCalled()
    expect(wrapper.state().currentStringId).toEqual(null)
    expect(wrapper.state().selectedRowKeys).toEqual([])
  })
  it('测试deleteConfirm', () => {
    const deleteConfirm = jest.spyOn(instance, 'deleteConfirm')
    deleteConfirm([])
    expect(deleteConfirm).toHaveBeenCalled()
  })
  it('测试changePage', () => {
    const instance = wrapper.instance()
    const changePage = jest.spyOn(instance, 'changePage')
    const getCacheList = jest.spyOn(instance, 'getCacheList')
    changePage(2, 20)
    expect(wrapper.state().pageSize).toEqual(20)
    expect(wrapper.state().currentPage).toEqual(2)
    expect(getCacheList).toHaveBeenCalled()
  })
  it('测试changeSize', () => {
    const instance = wrapper.instance()
    const changeSize = jest.spyOn(instance, 'changeSize')
    const changePage = jest.spyOn(instance, 'changePage')
    changeSize(2, 20)
    expect(wrapper.state().selectedRowKeys).toEqual([])
    expect(wrapper.state().selectedRows).toEqual([])
    expect(changePage).toHaveBeenCalled()
  })
  it('测试deleteBatch,无数据', () => {
    const instance = wrapper.instance()
    const deleteBatch = jest.spyOn(instance, 'deleteBatch')
    const spyMessage = jest.spyOn(message, 'info')
    wrapper.setState({
      selectedRowKeys: []
    })
    deleteBatch()
    expect(spyMessage).toHaveBeenCalledWith('请选择数据！')
  })
  it('测试deleteBatch,有勾选数据', () => {
    const instance = wrapper.instance()
    const deleteBatch = jest.spyOn(instance, 'deleteBatch')
    const deleteConfirm = jest.spyOn(instance, 'deleteConfirm')
    wrapper.setState({
      selectedRowKeys: [{}]
    })
    deleteBatch()
    expect(deleteBatch).toHaveBeenCalled()
    expect(deleteConfirm).toHaveBeenCalled()
  })
  it('测试deleteSigle', () => {
    const instance = wrapper.instance()
    const deleteSigle = jest.spyOn(instance, 'deleteSigle')
    const deleteConfirm = jest.spyOn(instance, 'deleteConfirm')
    deleteSigle(1)
    expect(deleteSigle).toHaveBeenCalled()
    expect(deleteConfirm).toHaveBeenCalled()
    expect(wrapper.state().currentStringId).toEqual(1)
  })
  it('测试getCacheList', () => {
    const instance = wrapper.instance()
    const getCacheList = jest.spyOn(instance, 'getCacheList')
    getCacheList([], 1, 10)
    expect(getCacheList).toHaveBeenCalled()
    expect(wrapper.state().body).toEqual({
      items: [],
      totalRecords: 0
    })
  })
  it('测试handleReset', () => {
    const instance = wrapper.instance()
    const handleReset = jest.spyOn(instance, 'handleReset')
    wrapper.setState({
      allList: []
    })
    handleReset()
    expect(wrapper.state().pageSize).toEqual(10)
    expect(wrapper.state().currentPage).toEqual(1)
    expect(wrapper.state().selectedRowKeys).toEqual([])
    expect(wrapper.state().selectedRows).toEqual([])
    expect(wrapper.state().body).toEqual({
      items: [],
      totalRecords: 0
    })
  })
})

