import React from 'react'
import { shallow } from 'enzyme'
import { ModalForm } from './index'
import api from '@/services/api'

const mocks = [
  '@/utils/regExp'
]
mocks.forEach((el) => {
  jest.mock(el)
})

const props = {
  form: {
    getFieldDecorator: jest.fn(opts => c => c),
    resetFields: jest.fn(opts => c => c),
    validateFields: jest.fn(opts => c => c),
    getFieldValue: jest.fn(opts => c => c)
  },
  props: {
    modalData: {
      primaryKey: '11',
      portDetail: '111',
      title: '新增端口'
    },
    onCancel: jest.fn()
  },
  location: {
    search: '?stringId=326'
  }
}

describe('端口详情', () => {
  let wrapper = shallow(<ModalForm {...props} />)
  const instance = wrapper.instance()
  const resetForm = jest.spyOn(instance, 'resetForm')
  it('正常渲染', () => {
    expect(wrapper.find('.over-scroll-modal')).toHaveLength(1)
  })
  it('resetForm', () => {
    resetForm()
  })
  it('testFunc handleSubmit', async () => {
    props.form.validateFields = (func) => {
      func(false, { portDetail: [33, 66] })
    }
    api.eitPortGroup = jest.fn()
    api.eitPortGroup.mockReturnValue(
      Promise.resolve({
        head: { code: '200' }
      })
    )
    await instance.handleSubmit({
      portDetail: [33, 66]
    })
    resetForm()
  })
  it('checkValid', () => {
    const checkValid = jest.spyOn(instance, 'checkValid')
    checkValid(55)
    checkValid('5-55')
    checkValid(66666)
  })
  it('checkCode', () => {
    const checkCode = jest.spyOn(instance, 'checkCode')
    checkCode('dafafaf')
    expect(wrapper.state().result).toEqual(false)
    checkCode('2-44')
    expect(wrapper.state().result).toEqual(false)
  })
})
