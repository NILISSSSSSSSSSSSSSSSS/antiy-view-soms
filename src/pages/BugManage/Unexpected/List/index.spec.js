import React from 'react'
import { shallow } from 'enzyme'
import api from '@/services/api'
import Unexpected  from './index'

jest.mock('../../../../services/api')
jest.mock('../../../../utils/auth')
jest.mock('../../../../utils/common')

describe('测试<Unexpected />', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallow(<Unexpected />)
  })
  it('测试render <Unexpected /> component', () => {
    expect(wrapper.find('.main-table-content')).toHaveLength(1)
  })
  it('测试getList获取列表数据', () => {
    const instance = wrapper.instance()
    const getList = jest.spyOn(instance, 'getList')
    const list = jest.spyOn(api, 'querySuddenList')
    getList()
    expect(list).toHaveBeenCalled()
    expect(wrapper.state().body).toEqual({
      items: [
        {
          antiyVulnId: '12345'
        }
      ],
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
  it('测试delete删除', () => {
    // const instance = wrapper.instance()
    // const getList = jest.spyOn(instance, 'getList')
    // wrapper.setState({
    //   body: {
    //     totalRecords: 11
    //   }
    // })
    // const deleteFn = jest.spyOn(instance, 'delete')
    // api.deleteVul = jest.fn()
    // api.deleteVul.mockReturnValue(
    //   Promise.resolve({
    //     head: { code: '200' }
    //   })
    // )
    // deleteFn('1')
    // expect(wrapper.state().pagingParameter).toEqual({
    //   currentPage: 1,
    //   pageSize: 10
    // })
    // expect(api.deleteVul).toHaveBeenCalled()
    // expect(getList).toHaveBeenCalled()
  })
  it('测试handleTableSort排序', () => {
    const instance = wrapper.instance()
    const handleTableSort = jest.spyOn(instance, 'handleTableSort')
    const getList = jest.spyOn(instance, 'getList')
    handleTableSort(null, null, {})
    expect(wrapper.state().pagingParameter).toEqual({
      currentPage: 1,
      pageSize: 10
    })
    expect(getList).toHaveBeenCalled()
  })
})