import React from 'react'
import { shallow } from 'enzyme'
import sinon from 'sinon'
import { SoftModal } from './index'
import { Table } from 'antd'
import api from '@/services/api'

const props = {
  form: {
    resetFields: jest.fn()
  },
  isTemplate: '',
  saveAlerts: jest.fn(),
  closeAlerts: jest.fn(),
  dispatch: jest.fn(),
  history: {
    push: jest.fn()
  }
}

describe('<StorageList />', () => {
  let wrapper = shallow(<SoftModal {...props} />)
  const instance = wrapper.instance()
  const spyGetBaseSettingManageList = jest.spyOn(instance, 'initPageList')
  it('render <StorageList /> component', () => {
    expect(wrapper.find(Table)).toHaveLength(1)
  })
  it('UNSAFE_componentWillReceiveProps', () => {
    let wrapper = shallow(<SoftModal {...props} />)
    sinon.spy(SoftModal.prototype, 'UNSAFE_componentWillReceiveProps')
    wrapper.setProps({
      visible: true
    })
    expect(SoftModal.prototype.UNSAFE_componentWillReceiveProps.calledOnce).toBeTruthy()
  })
  it('getList==>请求返回数据', () => {
    api.getListSoftware = jest.fn()
    api.getListSoftware.mockReturnValue(
      Promise.resolve({
        head: { code: '200' },
        body: { items: [], totalRecords: 10 }
      })
    )
    spyGetBaseSettingManageList({
      body: {
        items: [],
        totalRecords: 10
      }
    })
    expect(api.getListSoftware).toHaveBeenCalled()
  })
  it('handleSubmit提交表单，执行查询', () => {
    const spyHandleSubmit = jest.spyOn(instance, 'handleSubmit')
    wrapper.setState({
      pagingParameter: {
        pageSize: 10,
        currentPage: 2
      }
    })
    spyHandleSubmit({
      name: '020100105'
    })
    expect(wrapper.state().pagingParameter).toEqual({
      pageSize: 10,
      currentPage: 1
    })
    expect(wrapper.state().values).toEqual({
      name: '020100105'
    })
    expect(wrapper.state().selectedRowKeys).toEqual([])
    expect(spyGetBaseSettingManageList).toHaveBeenCalled()
  })
  it('changePage分页', () => {
    const changePage = jest.spyOn(instance, 'pageChange')
    changePage(1, 10)
    expect(wrapper.state().pagingParameter).toEqual({
      pageSize: 10,
      currentPage: 1
    })
    expect(spyGetBaseSettingManageList).toHaveBeenCalled()
  })
  it('testFunc cancel', () => {
    instance.cancel()
    expect(wrapper.state().pagingParameter).toEqual({
      pageSize: 10,
      currentPage: 1
    })
    expect(wrapper.state().values).toEqual({})
  })
  it('testFunc save', () => {
    instance.save()
    expect(wrapper.state().pagingParameter).toEqual({
      pageSize: 10,
      currentPage: 1
    })
    expect(wrapper.state().selectedRowKeys).toEqual([])
    expect(wrapper.state().values).toEqual({})
  })
})