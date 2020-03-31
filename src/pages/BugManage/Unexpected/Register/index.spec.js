import React from 'react'
import { shallow } from 'enzyme'
import { Register } from './index'

describe('测试<Register />', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallow(<Register />)
  })
  it('测试render <Register /> component', () => {
    expect(wrapper.find('section')).toHaveLength(1)
  })
})