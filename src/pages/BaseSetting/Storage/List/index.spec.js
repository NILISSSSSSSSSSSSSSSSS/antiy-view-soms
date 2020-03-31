import React from 'react'
import { shallow } from 'enzyme'
import sinon from 'sinon'
import ConfigComponent, { SettingInformations } from './index'
import { Table } from 'antd'
import api from '../../../../services/api'
import PropTypes from 'prop-types'

const props = {
  form: {
    resetFields: jest.fn()
  },
  dispatch: jest.fn(),
  history: {
    push: jest.fn()
  }
}
const store = {
  subscribe: () => ({}),
  dispatch: jest.fn(opts => c => c),
  getState: () => ({
    baseSetting: { osList: [] }
  })
}
const options = {
  context: { store },
  childContextTypes: { store: PropTypes.object.isRequired }
}
describe('<ConfigComponent />', () => {
  let wrapper = shallow(<ConfigComponent {...props} />, options).dive().dive()
  const instance = wrapper.instance()
  const spyGetBaseSettingManageList = jest.spyOn(instance, 'getList')
  it('render <ConfigComponent /> component', () => {
    expect(wrapper.find(Table)).toHaveLength(1)
  })
  it('UNSAFE_componentWillReceiveProps', () => {
    let wrapper = shallow(<SettingInformations {...props} />)
    sinon.spy(SettingInformations.prototype, 'UNSAFE_componentWillReceiveProps')
    wrapper.setProps({
      osList: []
    })
    expect(SettingInformations.prototype.UNSAFE_componentWillReceiveProps.calledOnce).toBeTruthy()
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
      multiply: '020100105'
    })
    expect(wrapper.state().pagingParameter.currentPage).toEqual(1)
    expect(wrapper.state().values).toEqual({
      multiply: '020100105'
    })
    expect(spyGetBaseSettingManageList).toHaveBeenCalled()
  })
  it('changePage分页', () => {
    const changePage = jest.spyOn(instance, 'changePage')
    changePage(1, 10)
    expect(wrapper.state().pagingParameter).toEqual({
      pageSize: 10,
      currentPage: 1
    })
    expect(spyGetBaseSettingManageList).toHaveBeenCalled()
  })
  it('handleReset重置', () => {
    const spyHandleReset = jest.spyOn(instance, 'handleReset')
    spyHandleReset()
    expect(wrapper.state().pagingParameter).toEqual({
      pageSize: 10,
      currentPage: 1
    })
    expect(wrapper.state().sorter.sortOrder).toEqual('')
    expect(wrapper.state().values).toEqual({})
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
  it('selectOs选择适用系统', () => {
    const spyselectOs = jest.spyOn(instance, 'selectOs')
    spyselectOs('1')
  })
  it('checkValid查看', () => {
    const checkValid = jest.spyOn(instance, 'checkValid')
    checkValid(1, 1, { stringId: '11' })
  })
  it('TooltipFn', () => {
    return undefined
  })
})