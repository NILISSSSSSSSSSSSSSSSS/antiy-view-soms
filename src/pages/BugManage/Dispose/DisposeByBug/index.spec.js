import React from 'react'
import { shallow } from 'enzyme'
import api from '@/services/api'
import { DisposeByBug } from './index'

// jest.mock('../../../../services/api')
// jest.mock('../../../../utils/common')

describe('测试<DisposeByBug />', () => {
  let wrapper
  const props = {
    location: {
      search: '?id=123&number=123'
    }
  }
  beforeEach(() => {
    wrapper = shallow(<DisposeByBug {...props} />)
  })
  it('测试render <DisposeByBug /> component', () => {
    expect(wrapper.find('.main-detail-content')).toHaveLength(1)
  })
  // it('测试getDetail获取详情', () => {
  //   const instance = wrapper.instance()
  //   const getDetail = jest.spyOn(instance, 'getDetail')
  //   api.vulnDetail = jest.fn()
  //   api.vulnDetail.mockReturnValue(
  //     Promise.resolve({
  //       head: { code: '200' }
  //     })
  //   )
  //   getDetail()
  //   expect(api.vulnDetail).toHaveBeenCalled()
  // })
})