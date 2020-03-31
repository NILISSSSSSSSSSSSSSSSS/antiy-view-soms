import React from 'react'
import { message } from 'antd'
import { shallow } from 'enzyme'
import LinkDetailAndChange from './index'
import api from '@/services/api'

jest.mock('react-router-dom')

describe('测试<LinkDetailAndChange />', () => {
  const props = {
    body: {
      item: []
    },
    location: {
      search: ''
    }
  }
  let wrapper = shallow(<LinkDetailAndChange {...props} />)
  const instance = wrapper.instance()
  it('测试render <LinkDetailAndChange /> component', () => {
    expect(wrapper.find('.table-wrap')).toHaveLength(1)
  })
  it('测试getList', async () => {
    const getList = jest.spyOn(instance, 'getList')
    api.getBugLinkList = jest.fn()
    api.getBugLinkList.mockReturnValue(
      Promise.resolve({
        head: { code: '200' },
        body: {}
      })
    )
    await getList()
    expect(wrapper.state().body).toEqual({})
    expect(api.getBugLinkList).toHaveBeenCalled()
    expect(getList).toHaveBeenCalled()
  })
  it('测试onSubmit', () => {
    const instance = wrapper.instance()
    const getList = jest.spyOn(instance, 'getList')
    const onSubmit = jest.spyOn(instance, 'onSubmit')
    api.getBugPlanList = jest.fn()
    const spyFunction = jest.spyOn(api, 'AddBugLink')
    spyFunction.mockReturnValue(Promise.resolve({
      head: { code: '200' },
      body: []
    }))
    onSubmit({})
    expect(onSubmit).toHaveBeenCalled()
    expect(spyFunction).toHaveBeenCalled()
    expect(getList).toHaveBeenCalled()
    expect(wrapper.state().formVisible).toEqual(false)
    expect(wrapper.state().selectedRowKeys).toEqual([])
    expect(wrapper.state().currentPage).toEqual(1)
    expect(wrapper.state().pageSize).toEqual(10)
  })
  it('测试deletePost', async () => {
    const deletePost = jest.spyOn(instance, 'deletePost')
    const getList = jest.spyOn(instance, 'getList')
    api.deleteBugLink = jest.fn()
    api.deleteBugLink.mockReturnValue(
      Promise.resolve({
        head: { code: '200' },
        body: {}
      })
    )
    await deletePost()
    expect(api.deleteBugLink).toHaveBeenCalled()
    expect(deletePost).toHaveBeenCalled()
    expect(getList).toHaveBeenCalled()
    expect(wrapper.state().selectedRowKeys).toEqual([])
    expect(wrapper.state().currentStringId).toEqual(null)
  })
  it('测试confirm', () => {
    const confirm = jest.spyOn(instance, 'confirm')
    confirm()
    expect(confirm).toHaveBeenCalled()
  })
  it('测试pageChange', () => {
    const pageChange = jest.spyOn(instance, 'pageChange')
    const getList = jest.spyOn(instance, 'getList')
    pageChange(1, 10)
    expect(wrapper.state().currentPage).toEqual(1)
    expect(wrapper.state().pageSize).toEqual(10)
    expect(pageChange).toHaveBeenCalled()
    expect(getList).toHaveBeenCalled()
  })
  it('测试deleteBatch', () => {
    const deleteBatch = jest.spyOn(instance, 'deleteBatch')
    const spyMessage = jest.spyOn(message, 'info')
    wrapper.setState({
      selectedRowKeys: []
    })
    deleteBatch()
    expect(deleteBatch).toHaveBeenCalled()
    expect(spyMessage).toHaveBeenCalledWith('请选择数据！')
  })
  it('测试deleteBatch,有勾选数据', () => {
    const deleteBatch = jest.spyOn(instance, 'deleteBatch')
    const confirm = jest.spyOn(instance, 'confirm')
    wrapper.setState({
      selectedRowKeys: [{}]
    })
    deleteBatch()
    expect(deleteBatch).toHaveBeenCalled()
    expect(confirm).toHaveBeenCalled()
  })
})