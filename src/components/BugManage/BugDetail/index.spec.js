import React from 'react'
import { shallow } from 'enzyme'
import Detail from './index'

describe('<Detail />', () => {
  let wrapper
  const props = {
    detailData: {},
    isShowTitle: true
  }
  beforeEach(() => {
    wrapper = shallow(<Detail {...props} />)
  })
  it('测试render <Detail /> component', () => {
    expect(wrapper.find('.detail-title')).toHaveLength(1)
  })
})