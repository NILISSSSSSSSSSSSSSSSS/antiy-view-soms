import { shallow } from 'enzyme'
import React from 'react'
// import api from '@/services/api'
import { TemplateDetail } from './index'

// jest.mock('../../../../services/api')
const props = {
  location: {
    search: 'JhLbOb5lPQs9fbep/UIXzw=='
  },
  form: {
    validateFields: jest.fn()
  }
}

describe('渲染 <TemplateDetail />', () => {
  const wrapper = shallow(<TemplateDetail {...props}/>)
  const instance = wrapper.instance()
  it('render', () => {
    expect(wrapper.find('.main-detail-content')).toHaveLength(1)
  })
  it('获取数据测试', () => {
    const spygetData = jest.spyOn(instance, 'getData')
    spygetData()
  })

  it('测试softPageChange翻页', () => {
    const spySoftPageChange = jest.spyOn(instance, 'softPageChange')
    const spyGetSoftList = jest.spyOn(instance, 'getSoftList')
    spySoftPageChange(2, 20)
    expect(wrapper.state().softPagingParameter).toEqual({
      currentPage: 2,
      pageSize: 20
    })
    expect(spyGetSoftList).toHaveBeenCalled()
  })
  it('测试onSubmit提交表单，执行提交表单信息', () => {
    const spyonSubmit = jest.spyOn(instance, 'onSubmit')
    spyonSubmit({
      result: 1,
      advice: 'wfeh'
    })
  })
  it('测试是否展示拒绝原因', () => {
    const spyShowAdvice = jest.spyOn(instance, 'showAdvice')
    spyShowAdvice()
  })
})