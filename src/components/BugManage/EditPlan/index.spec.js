import React from 'react'
import { shallow } from 'enzyme'
import { message } from 'antd'
import EditPlan from './index'
import api from '@/services/api'

jest.mock('react-router-dom')

const props = {
  location: {
    search: ''
  },
  form: {
    resetFields: jest.fn(),
    validateFields: jest.fn(),
    getFieldDecorator: () => {
      return jest.fn()
    }
  },
  data: {},
  onSubmit: jest.fn(),
  savePatchs: jest.fn()
}

describe('<EditPlan />', () => {
  const wrapper = shallow(<EditPlan {...props} />).dive()
  const instance = wrapper.instance()
  it('render <EditPlan />', () => {
    expect(wrapper.find('.add-plan')).toHaveLength(1)
  })
  it('测试getBaseSettingManageList获取列表数据', async () => {
    const instance = wrapper.instance()
    const getList = jest.spyOn(instance, 'getList')
    const getCacheList = jest.spyOn(instance, 'getCacheList')
    api.queryBugPatchPageAll = jest.fn()
    api.queryBugPatchPageAll.mockReturnValue(
      Promise.resolve({
        head: { code: '200' },
        body: []
      })
    )
    await getList()
    expect(wrapper.state().patchs).toEqual([])
    expect(api.queryBugPatchPageAll).toHaveBeenCalled()
    expect(getCacheList).toHaveBeenCalled()
    expect(getList).toHaveBeenCalled()
  })
  it('测试handleSubmit',  ()=> {
    const handleSubmit = jest.spyOn(instance, 'handleSubmit')
    handleSubmit()
    expect(handleSubmit).toHaveBeenCalled()
  })
  it('测试changePage', () => {
    const changePage = jest.spyOn(instance, 'changePage')
    const getCacheList = jest.spyOn(instance, 'getCacheList')
    changePage(2, 20)
    expect(wrapper.state().pageSize).toEqual(20)
    expect(wrapper.state().currentPage).toEqual(2)
    expect(getCacheList).toHaveBeenCalled()
  })
  it('测试onConfirm', () => {
    const onConfirm = jest.spyOn(instance, 'onConfirm')
    wrapper.setState({
      patchs: []
    })
    onConfirm([])
    expect(wrapper.state().pageSize).toEqual(10)
    expect(wrapper.state().currentPage).toEqual(1)
    expect(wrapper.state().selectedRowKeys).toEqual([])
    expect(wrapper.state().patchs).toEqual([])
    expect(wrapper.state().addVisible).toEqual(false)
    expect(onConfirm).toHaveBeenCalled()
  })
  it('测试deleteState', () => {
    const deleteState = jest.spyOn(instance, 'deleteState')
    wrapper.setState({
      patchs: []
    })
    deleteState()
    expect(wrapper.state().patchs).toEqual([])
    expect(wrapper.state().selectedRowKeys).toEqual([])
    expect(wrapper.state().currentStringId).toEqual(null)
    expect(deleteState).toHaveBeenCalled()
  })
  it('测试deleteConfirm', () => {
    const deleteConfirm = jest.spyOn(instance, 'deleteConfirm')
    deleteConfirm()
    expect(deleteConfirm).toHaveBeenCalled()
  })
  it('测试deleteBatch,有数据', () => {
    const handleBatch = jest.spyOn(instance, 'deleteBatch')
    const deleteConfirm = jest.spyOn(instance, 'deleteConfirm')
    wrapper.setState({
      selectedRows: [{}]
    })
    handleBatch()
    expect(handleBatch).toHaveBeenCalled()
    expect(deleteConfirm).toHaveBeenCalled()
  })
  it('测试deleteBatch,无数据', () => {
    const deleteBatch = jest.spyOn(instance, 'deleteBatch')
    const spyMessage = jest.spyOn(message, 'info')
    wrapper.setState({
      selectedRows: []
    })
    deleteBatch()
    expect(deleteBatch).toHaveBeenCalled()
    expect(spyMessage).toHaveBeenCalledWith('请选择数据！')
  })
  it('测试deleteSigle', () => {
    const deleteSigle = jest.spyOn(instance, 'deleteSigle')
    deleteSigle(1)
    expect(deleteSigle).toHaveBeenCalled()
    expect(wrapper.state().currentStringId).toEqual(1)
  })
  it('测试getCacheList', () => {
    const getCacheList = jest.spyOn(instance, 'getCacheList')
    getCacheList([], 1, 10)
    expect(getCacheList).toHaveBeenCalled()
    expect(wrapper.state().body).toEqual({
      items: [],
      totalRecords: 0
    })
  })
  it('测试checkAlive', () => {
    const checkAlive = jest.spyOn(instance, 'checkAlive')
    checkAlive()
    expect(checkAlive).toHaveBeenCalled()
  })
})

