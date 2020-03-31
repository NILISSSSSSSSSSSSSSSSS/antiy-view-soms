import React from 'react'
import { shallow } from 'enzyme'
import BugRepair  from './index'

// jest.mock('../../../utils/common')

describe('测试<BugRepair />', () => {
  let wrapper, instance
  const props = {
    location: {
      search: '?status=1'
    },
    history: {
      push: jest.fn()
    }
  }
  beforeEach(() => {
    wrapper = shallow(<BugRepair {...props} />)
    instance = wrapper.instance()
  })
  it('测试render <BugRepair /> component', () => {
    expect(wrapper.find('.main-table-content')).toHaveLength(1)
  })
  it('测试tabChange', () => {
    const tabChange = jest.spyOn(instance, 'tabChange')
    tabChange('1')
    expect(tabChange).toHaveBeenCalled()
  })
})