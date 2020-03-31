import React from 'react'
import { shallow } from 'enzyme'
import InformationList from './index'

describe('测试<Information />', () => {
  let wrapper
  const props = {
    location: {
      search: '?id=123'
    }
  }
  beforeEach(() => {
    wrapper = shallow(<InformationList {...props} />)
  })
  it('测试render <InformationList /> component', () => {
    expect(wrapper.find('.bug-test')).toHaveLength(1)
  })
})