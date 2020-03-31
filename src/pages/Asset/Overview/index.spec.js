import React from 'react'
import { shallow } from 'enzyme'
import AssetOverview from './index'

describe('资产概览 <AssetOverview />', () => {
  let wrapper
  beforeEach(()=>{
    wrapper = shallow(<AssetOverview />)
  })
  it('未知资产列表的正常渲染', () => {
    expect(wrapper.find('.asset-overview')).toHaveLength(1)
  })
  it('快照', ()=>{
    const app = wrapper.debug()
    expect(app).toMatchSnapshot()
  })
})
