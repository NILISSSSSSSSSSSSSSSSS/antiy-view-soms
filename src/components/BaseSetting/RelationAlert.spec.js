import React from 'react'
import { shallow } from 'enzyme'
import sinon from 'sinon'
import { RelationAlert } from './RelationAlert'
import { Table } from 'antd'
import api from '@/services/api'

const props = {
  form: {
    resetFields: jest.fn()
  },
  saveAlerts: jest.fn(),
  closeAlerts: jest.fn(),
  dispatch: jest.fn(),
  history: {
    push: jest.fn()
  }
}

describe('<StorageList />', () => {
  let wrapper = shallow(<RelationAlert {...props} />)
  const instance = wrapper.instance()
  const spyGetBaseSettingManageList = jest.spyOn(instance, 'initPageList')
  it('render <StorageList /> component', () => {
    expect(wrapper.find(Table)).toHaveLength(1)
  })
  it('UNSAFE_componentWillReceiveProps', () => {
    let wrapper = shallow(<RelationAlert {...props} />)
    sinon.spy(RelationAlert.prototype, 'UNSAFE_componentWillReceiveProps')
    wrapper.setProps({
      visible: true
    })
    expect(RelationAlert.prototype.UNSAFE_componentWillReceiveProps.calledOnce).toBeTruthy()
  })
  it('getList==>请求返回数据', () => {
    api.baselineItemQuery = jest.fn()
    api.baselineItemQuery.mockReturnValue(
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
    expect(api.baselineItemQuery).toHaveBeenCalled()
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
  it('handleTableChange排序', () => {
    const handleTableChange = jest.spyOn(instance, 'handleTableChange')
    handleTableChange({}, {}, {
      columnKey: 'gmtCreate',
      order: ''
    })
    expect(wrapper.state().sorter.sortName).toEqual('gmt_create')
    expect(spyGetBaseSettingManageList).toHaveBeenCalled()
  })
  it('testFunc cancel', () => {
    instance.cancel(1)
    expect(wrapper.state().pagingParameter).toEqual({
      pageSize: 10,
      currentPage: 1
    })
    expect(wrapper.state().sorter).toEqual({
      sortName: '',
      sortOrder: ''
    })
    expect(wrapper.state().values).toEqual({})
  })
  it('testFunc save', () => {
    instance.save()
    expect(wrapper.state().pagingParameter).toEqual({
      pageSize: 10,
      currentPage: 1
    })
    expect(wrapper.state().sorter).toEqual({
      sortName: '',
      sortOrder: ''
    })
    expect(wrapper.state().values).toEqual({})
  })
})