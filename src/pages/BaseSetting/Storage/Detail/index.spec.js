import React from 'react'
import { shallow } from 'enzyme'
import api from '../../../../services/api'
import { BaseDetail } from './index'

// jest.mock('../../../../services/api')
const mocks = [
  '@/components/BaseSetting/StorageDetail'
]
mocks.forEach((el) => {
  jest.mock(el)
})

const props = {
  location: {
    search: '?stringId=326'
  }
}
describe('基准项详情<BaseDetail />', () => {
  let wrapper = shallow(<BaseDetail {...props} />)
  it('<BaseDetail />正常渲染', () => {
    expect(wrapper.find('.main-detail-content')).toHaveLength(1)
  })
  it('getDetail==>请求返回数据', () => {
    const instance = wrapper.instance()
    const spyToConfigItem = jest.spyOn(instance, 'getDetail')
    api.baselineItemById = jest.fn()
    api.baselineItemById.mockReturnValue(
      Promise.resolve({
        head: { code: '200' }
      })
    )
    spyToConfigItem({
      detailData: {
        name: '123456'
      }
    })
    expect(api.baselineItemById).toHaveBeenCalled()
  })
})
