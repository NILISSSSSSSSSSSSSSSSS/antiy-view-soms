import React from 'react'
import { shallow } from 'enzyme'
import Detail from './index'

describe('测试<Detail />', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallow(<Detail />)
  })
  it('测试render <Detail /> component', () => {
    expect(wrapper.find('.bug-test')).toHaveLength(1)
  })
})