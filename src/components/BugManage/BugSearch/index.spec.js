import React from 'react'
import { shallow } from 'enzyme'
import BugSearch from './index'

const props = {
  location: {
    search: ''
  },
  form: {
    resetFields: jest.fn()
  },
  searchItems: {

  },
  onSubmit: jest.fn(),
  onReset: jest.fn()
}
describe('测试<BugSearch />', () => {
  const wrapper = shallow(<BugSearch {...props}/>).dive()
  const instance = wrapper.instance()
  it('测试render <BugSearch />', () => {
    expect(wrapper.find('.search-bar')).toHaveLength(1)
  })
  it('测试handleReset',  ()=> {
    const handleReset = jest.spyOn(instance, 'handleReset')
    handleReset()
    expect(handleReset).toHaveBeenCalled()
  })
})