import React from 'react'
import { shallow } from 'enzyme'
import { DisposeList } from './index'

jest.mock('../../../../utils/common')

describe('测试<DisposeList />', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallow(<DisposeList />)
  })
  it('测试render <DisposeList /> component', () => {
    expect(wrapper.find('.bug-test')).toHaveLength(1)
  })
})