import React from 'react'
import { shallow } from 'enzyme'
import InformationDispose from './index'

describe('测试<InformationDispose />', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallow(<InformationDispose />)
  })
  it('测试render <InformationDispose /> component', () => {
    expect(wrapper.find('.bug-test')).toHaveLength(1)
  })
})