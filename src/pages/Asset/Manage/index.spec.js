import React from 'react'
import { shallow } from 'enzyme'
import AssetManage from './index'

const props = {
  location: {
    search: '?status=1'
  },
  history: {
    push: jest.fn()
  }
}
jest.mock('@/utils/auth', ()=>{
  return jest.fn((auth)=>{
    const { assetsPermission } = require('@a/permission')
    return  [ assetsPermission.ASSET_INFO_LIST, assetsPermission.ASSET_UNKNOWN_INFO ].includes(auth)
  })
})
describe('资产信息管理 <AssetManage />', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallow(<AssetManage { ...props}/>)
  })
  it('快照', () => {
    const app = wrapper.debug()
    expect(app).toMatchSnapshot()
  })
  it('资产详情的正常渲染', () => {
    expect(wrapper.find('.main-table-content')).toHaveLength(1)
  })
  it('tabChange ==> 切换tabs', () => {
    const instance = wrapper.instance()
    const spy_tabChange = jest.spyOn(instance, 'tabChange')
    spy_tabChange('1')
    spy_tabChange('2')
  })
})
