import { shallow } from 'enzyme'
import React from 'react'
import { PatchAlert } from './index'

const props = {
  location: {
    search: 'JhLbOb5lPQs9fbep/UIXzw=='
  },
  form: {
    validateFields: jest.fn(opts => c => c),
    resetFields: jest.fn(opts => c => c),
    getFieldDecorator: jest.fn(opts => c => c)
  },
  children: jest.fn()
}

describe('渲染 <PatchAlert />', () => {
  const wrapper = shallow(<PatchAlert {...props}/>)
  const instance = wrapper.instance()
  const spygetList = jest.spyOn(instance, 'getList')
  it('render', () => {
    expect(wrapper.find('.table-modal')).toHaveLength(1)
  })
  it('获取数据测试', () => {
    spygetList()
  })
  it('PageChange', () => {
    const spypageChange = jest.spyOn(instance, 'pageChange')
    spypageChange(2, 20)
    expect(wrapper.state().pagingParameter).toEqual({
      currentPage: 2,
      pageSize: 20
    })
    expect(spygetList).toHaveBeenCalled()
  })
  it('测试onSubmit提交表单，执行提交表单信息', () => {
    const spyonSubmitPatch = jest.spyOn(instance, 'onSubmitPatch')
    spyonSubmitPatch({ preventDefault: jest.fn() })
    expect(spygetList).toHaveBeenCalled()
  })
  it('保存弹窗内容', () => {
    const spysaveModal = jest.spyOn(instance, 'saveModal')
    spysaveModal()
    expect(spygetList).toHaveBeenCalled()
  })
  it( '关闭弹窗', () => {
    const spycloseModal = jest.spyOn(instance, 'closeModal')
    spycloseModal()
    expect(spygetList).toHaveBeenCalled()
  })
  it( '重置', () => {
    const spyHandleReset = jest.spyOn(instance, 'handleReset')
    spyHandleReset()
    expect(wrapper.state().pagingParameter).toEqual({
      pageSize: 10,
      currentPage: 1
    })
    expect(wrapper.state().search).toEqual({})
    expect(spygetList).toHaveBeenCalled()
  })
})