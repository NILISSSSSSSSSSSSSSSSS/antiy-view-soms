import React from 'react'
import { shallow } from 'enzyme'
import { message } from 'antd'
import sinon from 'sinon'
import api from '@/services/api'
import { Dispose }  from './index'

// jest.mock('../../../../services/api')
jest.mock('dva/router')
const head = { code: '200' }
const props = {
  location: {
    search: ''
  },
  dispatch: jest.fn(),
  form: {
    resetFields: jest.fn()
  },
  history: {
    push: ()=>{}
  }
}
describe('测试<Dispose />', () => {
  const wrapper = shallow(<Dispose {...props} />)
  const instance = wrapper.instance()
  it('测试render <Dispose /> component', () => {
    expect(wrapper.find('.main-detail-content')).toHaveLength(1)
  })
  it('UNSAFE_componentWillReceiveProps', () => {
    sinon.spy(Dispose.prototype, 'UNSAFE_componentWillReceiveProps')
    wrapper.setProps({
      treeData: []
    })
    expect(Dispose.prototype.UNSAFE_componentWillReceiveProps.calledOnce).toBeTruthy()
  })
  it('测试handleSubmit提交表单，执行查询', () => {
    const handleSubmit = jest.spyOn(instance, 'handleSubmit')
    const getList = jest.spyOn(instance, 'getList')
    wrapper.setState({
      pagingParameter: {
        pageSize: 10,
        currentPage: 2
      }
    })
    handleSubmit({})
    expect(wrapper.state().pagingParameter.currentPage).toEqual(1)
    expect(wrapper.state().selectedRowKeys).toEqual([])
    expect(wrapper.state().values).toEqual({})
    expect(getList).toHaveBeenCalled()
    expect(handleSubmit).toHaveBeenCalled()
  })
  it('测试handleReset查询条件重置', () => {
    const handleReset = jest.spyOn(instance, 'handleReset')
    const getList = jest.spyOn(instance, 'getList')
    handleReset()
    expect(wrapper.state().pagingParameter).toEqual({
      pageSize: 10,
      currentPage: 1
    })
    expect(wrapper.state().values).toEqual({})
    expect(wrapper.state().selectedRowKeys).toEqual([])
    expect(wrapper.state().selectedRows).toEqual([])
    expect(handleReset).toHaveBeenCalled()
    expect(getList).toHaveBeenCalled()
  })
  it('测试changePage', () => {
    const changePage = jest.spyOn(instance, 'changePage')
    const getList = jest.spyOn(instance, 'getList')
    changePage(2, 20)
    expect(wrapper.state().pagingParameter).toEqual({
      currentPage: 2,
      pageSize: 20
    })
    expect(changePage).toHaveBeenCalled()
    expect(getList).toHaveBeenCalled()
  })
  it('测试changeSize', () => {
    const changePage = jest.spyOn(instance, 'changeSize')
    const getList = jest.spyOn(instance, 'getList')
    changePage(2, 20)
    expect(wrapper.state().selectedRowKeys).toEqual([])
    expect(wrapper.state().selectedRows).toEqual([])
    expect(changePage).toHaveBeenCalled()
    expect(getList).toHaveBeenCalled()
  })
  it('测试neglect', () => {
    const neglect = jest.spyOn(instance, 'neglect')
    const claimTaskBatch = jest.spyOn(instance, 'claimTaskBatch')
    neglect({})
    expect(neglect).toHaveBeenCalled()
    expect(claimTaskBatch).toHaveBeenCalled()
  })
  it('测试onSubmit', () => {
    const instance = wrapper.instance()
    const onSubmit = jest.spyOn(instance, 'onSubmit')
    const getList = jest.spyOn(instance, 'getList')
    const claimTaskBatch = jest.spyOn(instance, 'claimTaskBatch')
    api.vulRepaireSubmit = jest.fn()
    api.vulRepaireSubmit.mockReturnValue(
      Promise.resolve({
        head: { code: '200' }
      })
    )
    onSubmit({})
    expect(onSubmit).toHaveBeenCalled()
    expect(api.vulRepaireSubmit).toHaveBeenCalled()
    expect(claimTaskBatch).toHaveBeenCalled()
    expect(getList).toHaveBeenCalled()
    expect(wrapper.state().devVisible).toEqual(false)
    expect(wrapper.state().currentData).toEqual(null)
    expect(wrapper.state().selectedRowKeys).toEqual([])
    expect(wrapper.state().selectedRows).toEqual([])
  })
  it('测试submitToDev', () => {
    const neglect = jest.spyOn(instance, 'submitToDev')
    neglect({})
    expect(wrapper.state().devVisible).toEqual(true)
    expect(wrapper.state().currentData).toEqual({})
    expect(neglect).toHaveBeenCalled()
  })
  it('测试rowChange', () => {
    const rowChange = jest.spyOn(instance, 'rowChange')
    rowChange([], [])
    expect(wrapper.state().selectedRowKeys).toEqual([])
    expect(wrapper.state().selectedRows).toEqual([])
    expect(rowChange).toHaveBeenCalled()
  })
  it('测试handleBatch,无勾选数据', () => {
    const handleBatch = jest.spyOn(instance, 'handleBatch')
    const spyMessage = jest.spyOn(message, 'info')
    wrapper.setState({
      selectedRowKeys: []
    })
    handleBatch()
    expect(handleBatch).toHaveBeenCalled()
    expect(spyMessage).toHaveBeenCalledWith('请选择数据！')
  })
  it('测试handleBatch,有勾选数据', () => {
    const handleBatch = jest.spyOn(instance, 'handleBatch')
    const neglect = jest.spyOn(instance, 'neglect')
    wrapper.setState({
      selectedRowKeys: [{}]
    })
    handleBatch('neglect')
    expect(handleBatch).toHaveBeenCalled()
    expect(neglect).toHaveBeenCalled()
  })
  it('测试handleBatch分支', () => {
    const handleBatch = jest.spyOn(instance, 'handleBatch')
    wrapper.setState({
      selectedRowKeys: [{}]
    })
    handleBatch('')
    expect(wrapper.state().devVisible).toEqual(true)
    expect(handleBatch).toHaveBeenCalled()
  })
  it('测试getList', () => {
    const instance = wrapper.instance()
    const getList = jest.spyOn(instance, 'getList')
    api.listAssetByVulId = jest.fn()
    const spyFunction = jest.spyOn(api, 'listAssetByVulId')
    spyFunction.mockReturnValue(Promise.resolve({
      head,
      body: {
        items: [],
        totalRecords: 0
      }
    }))
    getList({
      pageSize: 10,
      currentPage: 1
    })
    expect(getList).toHaveBeenCalled()
    expect(spyFunction).toHaveBeenCalled()
    expect(wrapper.state().pagingParameter.pageSize).toEqual(10)
    expect(wrapper.state().pagingParameter.currentPage).toEqual(1)
  })
  it('测试getResult', () => {
    const instance = wrapper.instance()
    const getResult = jest.spyOn(instance, 'getResult')
    api.findHisFormDataByTaskDefKey = jest.fn()
    const spyFunction = jest.spyOn(api, 'findHisFormDataByTaskDefKey')
    spyFunction.mockReturnValue(Promise.resolve({
      head,
      body: []
    }))
    getResult(1)
    expect(getResult).toHaveBeenCalled()
    expect(spyFunction).toHaveBeenCalled()
    expect(wrapper.state().backVisible).toEqual(false)
    expect(wrapper.state().result).toEqual('')
  })
  it('测试getDetail', () => {
    const instance = wrapper.instance()
    const getDetail = jest.spyOn(instance, 'getDetail')
    api.vulnDetail = jest.fn()
    const spyFunction = jest.spyOn(api, 'vulnDetail')
    spyFunction.mockReturnValue(Promise.resolve({
      head,
      body: {}
    }))
    getDetail()
    expect(getDetail).toHaveBeenCalled()
    expect(spyFunction).toHaveBeenCalled()
    expect(wrapper.state().detailData).toEqual({})
  })
  it('测试getBugUsers', () => {
    const instance = wrapper.instance()
    const getBugUsers = jest.spyOn(instance, 'getBugUsers')
    api.getBugUsers = jest.fn()
    const spyFunction = jest.spyOn(api, 'getBugUsers')
    spyFunction.mockReturnValue(Promise.resolve({
      head,
      body: []
    }))
    getBugUsers()
    expect(getBugUsers).toHaveBeenCalled()
    expect(spyFunction).toHaveBeenCalled()
    expect(wrapper.state().userList).toEqual([])
  })
  it('测试claimTaskBatch', () => {
    const instance = wrapper.instance()
    const claimTaskBatch = jest.spyOn(instance, 'claimTaskBatch')
    api.claimTaskBatch = jest.fn()
    const spyFunction = jest.spyOn(api, 'claimTaskBatch')
    spyFunction.mockReturnValue(Promise.resolve({
      head
    }))
    claimTaskBatch([], jest.fn())
    expect(claimTaskBatch).toHaveBeenCalled()
  })
})