import { shallow } from 'enzyme'
import React from 'react'
import { Create } from './index'

const props = {
  location: {
    search: 'JhLbOb5lPQs9fbep/UIXzw=='
  },
  form: {
    validateFields: jest.fn()
  }
}

describe('渲染 <Create />', () => {
  const wrapper = shallow(<Create {...props}/>)
  const instance = wrapper.instance()
  it('render', () => {
    expect(wrapper.find('.main-detail-content')).toHaveLength(1)
  })
  it('获取数据测试', () => {
    const spygetInstallTemplateOs = jest.spyOn(instance, 'getInstallTemplateOs')
    spygetInstallTemplateOs()
  })

  it('测试onSubmit提交表单，执行提交表单信息', () => {
    const spyonSubmit = jest.spyOn(instance, 'onSubmit')
    spyonSubmit()
  })
  it( '选择适用系统', () => {
    const spyonIsSysem = jest.spyOn(instance, 'onIsSysem')
    spyonIsSysem('614120989948641281')
  })
})