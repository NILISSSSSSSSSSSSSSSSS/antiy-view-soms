import React from 'react'
import { shallow } from 'enzyme'
import StorageDetail from './index'

describe('测试<StorageDetail />', () => {
  const wrapper = shallow(<StorageDetail />)

  it('render <StorageDetail />', () => {
    expect(wrapper.find('.detail-content')).toHaveLength(3)
  })
})