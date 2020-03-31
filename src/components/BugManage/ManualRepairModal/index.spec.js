import React from 'react'
import { message } from 'antd'
import { shallow } from 'enzyme'
import ManualRepairModal from './index'

describe('测试<ManualRepairModal />', () => {
  const props = {
    form: {
      resetFields: jest.fn(),
      validateFields: jest.fn(),
      getFieldDecorator: () => {
        return jest.fn()
      }
    },
    onsubmit: jest.fn(),
    onCancel: jest.fn()
  }
  let wrapper = shallow(<ManualRepairModal {...props} />).dive()
  const instance = wrapper.instance()
  it('测试render <ManualRepairModal />', () => {
    expect(wrapper.find('.over-scroll-modal')).toHaveLength(1)
  })
  it('测试handleSubmit',  ()=> {
    const handleSubmit = jest.spyOn(instance, 'handleSubmit')
    handleSubmit()
    expect(handleSubmit).toHaveBeenCalled()
  })
  it('测试handleCancel',  ()=> {
    const handleCancel = jest.spyOn(instance, 'handleCancel')
    handleCancel()
    expect(handleCancel).toHaveBeenCalled()
    expect(wrapper.state().vulStatus).toEqual('5')
  })
})