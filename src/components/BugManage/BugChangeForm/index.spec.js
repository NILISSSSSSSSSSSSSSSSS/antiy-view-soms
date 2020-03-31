import React from 'react'
import { shallow } from 'enzyme'
import { message } from 'antd'
import api from '@/services/api'
import BugChangeForm from './index'

jest.mock('dva/router')
const head = { code: '200' }
const props = {
  location: {
    search: ''
  },
  form: {
    resetFields: jest.fn(),
    validateFields: jest.fn(),
    setFieldsValue: jest.fn(),
    getFieldValue: () => [],
    getFieldsValue: () => {
      return {
        cvssSelect: []
      }
    },
    getFieldDecorator: () => {
      return jest.fn()
    }
  },
  history: {
    push: jest.fn()
  }
}

describe('<BugChangeForm />', () => {
  const wrapper = shallow(<BugChangeForm {...props} />).dive()
  const instance = wrapper.instance()
  it('render <BugChangeForm />', () => {
    expect(wrapper.find('.edit-form-content')).toHaveLength(1)
  })
  it('测试getListVulType', () => {
    const getListVulType = jest.spyOn(instance, 'getListVulType')
    api.getListVulType = jest.fn()
    const spyFunction_getListVulType = jest.spyOn(api, 'getListVulType')
    spyFunction_getListVulType.mockReturnValue(Promise.resolve({
      head,
      body: []
    }))
    getListVulType()
    expect(getListVulType).toHaveBeenCalled()
    expect(spyFunction_getListVulType).toHaveBeenCalled()
    expect(wrapper.state().bugTypeList).toEqual([])
  })
  it('测试handleSubmit',  ()=> {
    const handleSubmit = jest.spyOn(instance, 'handleSubmit')
    handleSubmit()
    expect(handleSubmit).toHaveBeenCalled()
  })
  it('测试getValues',  ()=> {
    const getValues = jest.spyOn(instance, 'getValues')
    getValues({})
    expect(getValues).toHaveBeenCalled()
  })
  it('测试editPost', () => {
    const editPost = jest.spyOn(instance, 'editPost')
    api.editVulnInfo = jest.fn()
    const spyFunction_editVulnInfo = jest.spyOn(api, 'editVulnInfo')
    spyFunction_editVulnInfo.mockReturnValue(Promise.resolve({
      head,
      body: []
    }))
    editPost({})
    expect(editPost).toHaveBeenCalled()
    expect(spyFunction_editVulnInfo).toHaveBeenCalled()
  })
  it('测试registerPost', () => {
    const registerPost = jest.spyOn(instance, 'registerPost')
    api.vulnRegister = jest.fn()
    const spyFunction_vulnRegister = jest.spyOn(api, 'vulnRegister')
    spyFunction_vulnRegister.mockReturnValue(Promise.resolve({
      head,
      body: {}
    }))
    registerPost({})
    expect(registerPost).toHaveBeenCalled()
    expect(spyFunction_vulnRegister).toHaveBeenCalled()
  })
  it('测试getVulNumbers', () => {
    const getVulNumbers = jest.spyOn(instance, 'getVulNumbers')
    getVulNumbers(jest.fn(), [])
    expect(getVulNumbers).toHaveBeenCalled()
  })
  it('测试getCvss', () => {
    const getCvss = jest.spyOn(instance, 'getCvss')
    getCvss(jest.fn(), [])
    expect(getCvss).toHaveBeenCalled()
  })
  it('测试getBtn', () => {
    const getBtn = jest.spyOn(instance, 'getBtn')
    getBtn({})
    expect(getBtn).toHaveBeenCalled()
  })
  it('测试handleChange', () => {
    const handleChange = jest.spyOn(instance, 'handleChange')
    wrapper.setState({
      test: []
    })
    handleChange('1', 'test')
    expect(handleChange).toHaveBeenCalled()
  })
  it('测试handleDelete', () => {
    const handleDelete = jest.spyOn(instance, 'handleDelete')
    handleDelete('1', '1')
    expect(handleDelete).toHaveBeenCalled()
  })
  it('测试handleAdd', () => {
    const handleAdd = jest.spyOn(instance, 'handleAdd')
    handleAdd('1', '1')
    expect(handleAdd).toHaveBeenCalled()
  })
  it('测试getCatgory', () => {
    const getCatgory = jest.spyOn(instance, 'getCatgory')
    getCatgory([])
    expect(getCatgory).toHaveBeenCalled()
    expect(wrapper.state().businessIds).toEqual([])
  })
  it('测试renderNumbers', () => {
    const renderNumbers = jest.spyOn(instance, 'renderNumbers')
    renderNumbers({})
    expect(renderNumbers).toHaveBeenCalled()
  })
  it('测试renderCvss', () => {
    const renderCvss = jest.spyOn(instance, 'renderCvss')
    renderCvss({
      cvss: []
    })
    expect(renderCvss).toHaveBeenCalled()
  })
  it('测试getDetail', () => {
    const getDetail = jest.spyOn(instance, 'getDetail')
    const renderNumbers = jest.spyOn(instance, 'renderNumbers')
    const renderCvss = jest.spyOn(instance, 'renderCvss')
    api.vulnDetail = jest.fn()
    const spyFunction = jest.spyOn(api, 'vulnDetail')
    spyFunction.mockReturnValue(Promise.resolve({
      head,
      body: {
        vulnCpeResponseList: []
      }
    }))
    getDetail()
    expect(getDetail).toHaveBeenCalled()
    expect(spyFunction).toHaveBeenCalled()
    expect(wrapper.state().businessIds).toEqual([])
    expect(wrapper.state().detailData).toEqual({})
    expect(renderNumbers).toHaveBeenCalled()
    expect(renderCvss).toHaveBeenCalled()
  })
})

