import { shallow } from 'enzyme'
import React from 'react'
import { SoftTable } from './index'

const props = {
  location: {
    search: 'JhLbOb5lPQs9fbep/UIXzw=='
  },
  form: {
    validateFields: jest.fn()
  },
  children: jest.fn()
}

describe('渲染 <SoftTable />', () => {
  const wrapper = shallow(<SoftTable {...props}/>)
  const instance = wrapper.instance()
  const spygetSoftData = jest.spyOn(instance, 'getSoftData')
  it('render', () => {
    expect(wrapper.find('.table-wrap')).toHaveLength(1)
  })
  it('saveSoft', () => {
    const spyshowAdd = jest.spyOn(instance, 'showAdd')
    spyshowAdd()
    expect(spygetSoftData).toHaveBeenCalled()
  })
  it('获取数据测试', () => {
    spygetSoftData()
  })

  it('保存到前端', () => {
    const spysaveSoft = jest.spyOn(instance, 'saveSoft')
    spysaveSoft()
    expect(spygetSoftData).toHaveBeenCalled()
  })
  it( '关闭弹窗', () => {
    const spycloseSoft = jest.spyOn(instance, 'closeSoft')
    spycloseSoft()
    expect(spygetSoftData).toHaveBeenCalled()
  })
})