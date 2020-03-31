import React from 'react'
import { shallow } from 'enzyme'
import { UnexpectedDispose } from './index'

jest.mock('../../../../utils/auth')
jest.mock('../../../../assets/permission/index')
jest.mock('../../../../utils/common')

describe('测试<UnexpectedDispose />', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallow(<UnexpectedDispose />)
  })
  it('测试render <UnexpectedDispose /> component', () => {
    expect(wrapper.find('.bug-test')).toHaveLength(1)
  })
})