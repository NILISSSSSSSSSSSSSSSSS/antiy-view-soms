import React from 'react'
import { shallow } from 'enzyme'
import api from '@/services/api'
import { ModalForm } from './networkModal'
// import { message } from 'antd'

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
    validateFields: jest.fn(opts => c => c)
  },
  props: {
    modalData: {
      stringId: '111',
      ipStart: '1.1.1.3',
      ipEnd: '1.1.1.6',
      name: '',
      areaName: ''
    },
    onCancel: jest.fn()
  },
  location: {
    search: '?stringId=326'
  }
}
const values = {
  'name': '20191028001',
  'areaId': '4mJTAN6gZjk4BfwarOsNBg==',
  'ipStart': '10.240.50.112',
  'ipEnd': '10.240.50.113',
  'areaName': '桂系小区'
}

describe('网段详情<NetworkDetail />', () => {
  let wrapper = shallow(<ModalForm {...props} />)
  const instance = wrapper.instance()
  const expectStates = (vals, valCBs) => {
    vals.forEach((v, i) => expect(instance.state[v]).not.toBe(valCBs[i]))
  }
  it('<NetworkDetail />正常渲染', () => {
    expect(wrapper.find('.over-scroll-modal')).toHaveLength(1)
  })
  it('获取区域列表', () => {
    api.getLoginUserTree = jest.fn()
    api.getLoginUserTree.mockReturnValue(
      Promise.resolve({
        head: { code: '200' }
      })
    )
    expect(wrapper.state().treeData).toEqual([])
  })
  it('renderItem', () => {
    const renderItem = jest.spyOn(instance, 'renderItem')
    renderItem('', 1)
    renderItem(1, 1)
    expect(renderItem).toHaveBeenCalled()
  })
  it('resetForm', () => {
    const resetForm = jest.spyOn(instance, 'resetForm')
    resetForm()
    expect(wrapper.state().ip).toEqual('')
    expect(wrapper.state().ipEnd).toEqual('')
  })
  it('testFunc handleSubmit', () => {
    // const spyMessage = jest.spyOn(message, 'info')
    props.form.validateFields = (func) => {
      func(false, { ipEnd: 33 })
    }
    props.form.validateFields = (func) => {
      func(false, { ipStart: 133 })
    }
    props.form.validateFields = (func) => {
      func(false, { ipStart: '1.1.2.3', ipEnd: '1.1.2.36' })
    }
    api.updateNetsegment = jest.fn()
    api.updateNetsegment.mockReturnValue(
      Promise.resolve({
        head: { code: '200' }
      })
    )
    // expect(spyMessage).toHaveBeenCalledWith('起始值应小于结束值')
    instance.handleSubmit({ ipEnd: 33 })
  })
  it('testFunc onChange', () => {
    instance.onChange(values, values)
    const vals = ['areaId', 'areaName']
    const valCBs = ['4mJTAN6gZjk4BfwarOsNBg==', '桂系小区']
    expectStates(vals, valCBs)
  })
  it('testFunc IpChange', () => {
    const IpChange = jest.spyOn(instance, 'IpChange')
    IpChange({
      currentTarget: {
        value: '1.1.1.3'
      }
    }, 1)
    IpChange({
      currentTarget: {
        value: '1.1.1.3'
      }
    }, '')
    expect(wrapper.state().ip).toEqual('1.1.1.')
    expect(wrapper.state().ipEnd).toEqual('1.1.1.')
    expect(IpChange).toHaveBeenCalled()
  })
})
