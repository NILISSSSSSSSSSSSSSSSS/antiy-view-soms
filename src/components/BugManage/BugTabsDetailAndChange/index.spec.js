import React from 'react'
import { shallow } from 'enzyme'
import BugTabsDetailAndChange from './index'

// jest.mock('../../../services/api')
// jest.mock('../../../utils/common')

describe('测试<BugTabsDetailAndChange />', () => {
  const wrapper = shallow(<BugTabsDetailAndChange />)

  it('render <BugTabsDetailAndChange />', () => {
    expect(wrapper.find('#bug-tabs')).toHaveLength(1)
  })
  it('测试onReset', () => {
    BugTabsDetailAndChange({
      type: '',
      from: '',
      id: ''
    })

    // expect(BugTabsDetailAndChange({
    //   type: '',
    //   from: '',
    //   id: ''
    // })).toEqual()
  })
})