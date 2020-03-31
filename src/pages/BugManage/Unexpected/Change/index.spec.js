import React from 'react'
import { shallow } from 'enzyme'
import Change from './index'

// jest.mock('@u/common')
const props = {
  location: {
    search: '?id=123'
  }
}
describe('测试<Change />', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallow(<Change {...props} />)
  })
  it('测试render <Change /> component', () => {
    expect(wrapper.find('section')).toHaveLength(1)
  })
  it('测试扫描', () => {
    const instance = wrapper.instance()
    const scaning = jest.spyOn(instance, 'scaning')
    scaning()
    expect(wrapper.state().scanVisible).toBeTruthy()
  })
})