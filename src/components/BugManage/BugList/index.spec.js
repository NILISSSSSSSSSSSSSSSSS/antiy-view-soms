import React from 'react'
import { shallow } from 'enzyme'
import { message } from 'antd'
import api from '@/services/api'
import BugList from './index'

// jest.mock('@/utils/common')
jest.mock('@/services/api')
jest.mock('react-router-dom')

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
  listApi: 'getList',
  backUrl: 'onBackSubmit',
  adviseUrl: 'getAdvise'
}

describe('<BugList />', () => {
  const wrapper = shallow(<BugList {...props} />)
  const instance = wrapper.instance()
  it('render <BugList />', () => {
    expect(wrapper.find('.table-wrap')).toHaveLength(1)
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
  it('测试onReset', () => {
    const instance = wrapper.instance()
    const onReset = jest.spyOn(instance, 'onReset')
    const getList = jest.spyOn(instance, 'getList')
    onReset()
    expect(wrapper.state().pagingParameter.pageSize).toEqual(10)
    expect(wrapper.state().pagingParameter.currentPage).toEqual(1)
    expect(wrapper.state().values).toEqual({})
    expect(getList).toHaveBeenCalled()
  })
  it('测试onSubmit', () => {
    const instance = wrapper.instance()
    const onSubmit = jest.spyOn(instance, 'onSubmit')
    const getList = jest.spyOn(instance, 'getList')
    wrapper.setState({
      currentPage: 2
    })
    onSubmit({})
    expect(wrapper.state().pagingParameter.currentPage).toEqual(1)
    expect(getList).toHaveBeenCalled()
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
})

