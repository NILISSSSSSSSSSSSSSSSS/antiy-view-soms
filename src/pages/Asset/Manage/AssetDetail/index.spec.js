import React from 'react'
import { shallow } from 'enzyme'
import AssetDetail from './index'
import api from '../../../../services/api'
// import api from '@/services/api'
// jest.mock('../../../../utils/common.js')
jest.mock('../../../../services/api')
const mocks = [
  '../../../../components/Asset/AssetDetail/BasicsInfo',
  '../../../../components/Asset/AssetDetail/AssetConfigInfo',
  '../../../../components/Asset/AssetDetail/AssetDetailBug',
  '../../../../components/Asset/AssetDetail/AssetDetailPatch',
  '../../../../components/Asset/AssetDetail/AssetDetailAlarm'
]
mocks.forEach((el) => {
  jest.mock(el)
})

const props = {
  location: {
    search: '?id=asPTSbUoE0fZbilfBaL15w%3D%3D'
  }
}
describe('资产详情<AssetDetail />', () => {
  let wrapper = shallow(<AssetDetail { ...props }/>)
  it('资产详情的正常渲染', () => {
    expect(wrapper.find('.asset-detail-container')).toHaveLength(1)
  })
  it('getAssetDetail==>请求返回数据', () => {
    const result = {
      head: { code: '200' },
      body: { asset: { stringId: '-------------' } }
    }
    expect(api.getAssetHardWareById()).resolves.toEqual(result)
    const state = {
      activeKey: '1',
      baseInfo: { ...result.body.asset },
      assetData: { ...result.body }
    }
    expect(wrapper.state()).toEqual(state)
  })
  it('tabsChange ===>tabs切换', () => {
    const instance = wrapper.instance()
    const spyFunction = jest.spyOn(instance, 'tabsChange')
    spyFunction('1')
    expect(spyFunction).toHaveBeenCalled()
    expect(wrapper.state().activeKey).toEqual('1')
  })
})
