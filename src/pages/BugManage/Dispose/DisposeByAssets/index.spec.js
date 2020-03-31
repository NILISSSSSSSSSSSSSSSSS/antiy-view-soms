import React from 'react'
import { shallow } from 'enzyme'
import { DisposeByAssets } from './index'

// jest.mock('../../../../services/api')
// jest.mock('../../../../utils/common')

describe('测试<DisposeByAssets />', () => {
  let wrapper
  const props = {
    location: {
      search: '?id=123'
    }
  }
  beforeEach(() => {
    wrapper = shallow(<DisposeByAssets {...props} />)
  })
  it('测试render <DisposeByAssets /> component', () => {
    expect(wrapper.find('.main-detail-content')).toHaveLength(1)
  })
})