import React from 'react'
import { shallow } from 'enzyme'
import AssetsDetail from './index'

// jest.mock('../../../utils/common')

describe('<AssetsDetail />', () => {
  let wrapper
  const props = {
    detailData: {}
  }
  beforeEach(() => {
    wrapper = shallow(<AssetsDetail {...props} />)
  })
  it('测试render <Detail /> component', () => {
    // expect(wrapper.find('.bug-test')).toHaveLength(1)
  })

})