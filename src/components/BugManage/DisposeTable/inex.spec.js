import React from 'react'
import { shallow } from 'enzyme'
import { message } from 'antd'
import api from '@/services/api'
import DisposeTable from './index'

// jest.mock('@/utils/common')
jest.mock('@/services/api')
jest.mock('dva/router')

const props = {
  location: {
    search: ''
  },
  diffItems: {
    name: {},
    number: {},
    type: {},
    level: {},
    comQuery: {},
    status: {}
  },
  userParam: {},
  listUrl: 'getList',
  backUrl: 'onBackSubmit',
  adviseUrl: 'getAdvise'
}

describe('<DisposeTable />', () => {
  const wrapper = shallow(<DisposeTable {...props} />)
  const instance = wrapper.instance()
  it('render <DisposeTable />', () => {
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
    expect(wrapper.state().pagingParameter.pageSize).toEqual(20)
  })
  it('测试getBugUsers', () => {
    const getBugUsers = jest.spyOn(instance, 'getBugUsers')
    const apiGetBugUsers = jest.spyOn(api, 'getBugUsers')
    getBugUsers()
    expect(apiGetBugUsers).toHaveBeenCalled()
    expect(getBugUsers).toHaveBeenCalled()
  })
  it('测试onBackSubmit', () => {
    const onBackSubmit = jest.spyOn(instance, 'onBackSubmit')
    onBackSubmit({})
    expect(onBackSubmit).toHaveBeenCalled()
  })
  it('测试autoRepair', () => {
    const autoRepair = jest.spyOn(instance, 'autoRepair')
    autoRepair([])
    expect(autoRepair).toHaveBeenCalled()
  })
  it('测试submitManualRepair', () => {
    const submitManualRepair = jest.spyOn(instance, 'submitManualRepair')
    submitManualRepair({})
    expect(submitManualRepair).toHaveBeenCalled()
  })
  it('测试changeRepair', () => {
    const changeRepair = jest.spyOn(instance, 'changeRepair')
    changeRepair(1, {})
    expect(changeRepair).toHaveBeenCalled()
  })
  it('测试changePlan', () => {
    const changePlan = jest.spyOn(instance, 'changePlan')
    changePlan(1, {})
    expect(changePlan).toHaveBeenCalled()
  })
  it('测试getPlan', () => {
    const getPlan = jest.spyOn(instance, 'getPlan')
    getPlan(1, {})
    expect(getPlan).toHaveBeenCalled()
  })
  it('测试isAllSelectShow', () => {
    const isAllSelectShow = jest.spyOn(instance, 'isAllSelectShow')
    isAllSelectShow()
    expect(isAllSelectShow).toHaveBeenCalled()
  })
  it('测试rowChange', () => {
    const rowChange = jest.spyOn(instance, 'rowChange')
    rowChange([], [])
    expect(rowChange).toHaveBeenCalled()
  })
  it('测试handleBatch,有数据', () => {
    const handleBatch = jest.spyOn(instance, 'handleBatch')
    wrapper.setState({
      selectedRows: [{}]
    })
    handleBatch('test')
    expect(handleBatch).toHaveBeenCalled()
    expect(wrapper.state().test).toEqual(true)
  })
  it('测试handleBatch,无数据', () => {
    const handleBatch = jest.spyOn(instance, 'handleBatch')
    const spyMessage = jest.spyOn(message, 'info')
    wrapper.setState({
      selectedRows: []
    })
    handleBatch('test')
    expect(handleBatch).toHaveBeenCalled()
    expect(spyMessage).toHaveBeenCalledWith('请选择数据！')
  })
  it('测试handleReset查询条件重置', () => {
    const instance = wrapper.instance()
    const handleReset = jest.spyOn(instance, 'handleReset')
    const getList = jest.spyOn(instance, 'getList')
    handleReset()
    expect(wrapper.state().pagingParameter.pageSize).toEqual(10)
    expect(wrapper.state().pagingParameter.currentPage).toEqual(1)
    expect(wrapper.state().values).toEqual({})
    expect(getList).toHaveBeenCalled()
  })
  it('测试handleSubmit提交表单，执行查询', () => {
    const instance = wrapper.instance()
    const handleSubmit = jest.spyOn(instance, 'handleSubmit')
    const getList = jest.spyOn(instance, 'getList')
    wrapper.setState({
      pagingParameter: {
        currentPage: 2,
        pageSize: 10
      }
    })
    handleSubmit({})
    expect(wrapper.state().pagingParameter.currentPage).toEqual(1)
    expect(getList).toHaveBeenCalled()
  })
  it('测试getBody', () => {
    const instance = wrapper.instance()
    const getBody = jest.spyOn(instance, 'getBody')
    wrapper.setState({
      selectedRows: [{}]
    })
    getBody({
      items: []
    })
    expect(getBody).toHaveBeenCalled()
  })
  it('测试setSolutionId', () => {
    const instance = wrapper.instance()
    const setSolutionId = jest.spyOn(instance, 'setSolutionId')
    setSolutionId({})
    expect(setSolutionId).toHaveBeenCalled()
  })
  it('测试getAdvise', () => {
    const getAdvise = jest.spyOn(instance, 'getAdvise')
    const spyFunction_getAdvise = jest.spyOn(api, 'getAdvise')
    getAdvise([])
    expect(getAdvise).toHaveBeenCalled()
    expect(spyFunction_getAdvise).toHaveBeenCalled()
    expect(wrapper.state().adviseData).toEqual({})
  })
  it('测试changePage翻页', () => {
    const instance = wrapper.instance()
    const changePage = jest.spyOn(instance, 'changePage')
    const getList = jest.spyOn(instance, 'getList')
    changePage(2, 20)
    expect(wrapper.state().pagingParameter.pageSize).toEqual(20)
    expect(wrapper.state().pagingParameter.currentPage).toEqual(2)
    expect(getList).toHaveBeenCalled()
  })
  it('测试changeSize翻页', () => {
    const instance = wrapper.instance()
    const changeSize = jest.spyOn(instance, 'changeSize')
    const getList = jest.spyOn(instance, 'getList')
    changeSize(2, 20)
    expect(wrapper.state().pagingParameter.pageSize).toEqual(20)
    expect(wrapper.state().pagingParameter.currentPage).toEqual(2)
    expect(wrapper.state().selectedRowKeys).toEqual([])
    expect(wrapper.state().selectedRows).toEqual([])
    expect(getList).toHaveBeenCalled()
  })
  it('测试claimTaskBatch', () => {
    const claimTaskBatch = jest.spyOn(instance, 'claimTaskBatch')
    claimTaskBatch()
    expect(claimTaskBatch).toHaveBeenCalled()
  })
})

