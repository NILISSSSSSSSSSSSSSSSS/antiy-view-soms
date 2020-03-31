import React from 'react'
import { shallow } from 'enzyme'
import { DisposetList } from './index'

jest.mock('../../../../utils/common')

describe('测试<DisposetList />', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallow(<DisposetList />)
  })
  it('测试render <DisposetList /> component', () => {
    expect(wrapper.find('.bug-test')).toHaveLength(1)
  })
})