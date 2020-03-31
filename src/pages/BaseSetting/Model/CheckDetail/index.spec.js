import React from 'react'
import { shallow } from 'enzyme'
import api from '../../../../services/api'
import { ModelDetails } from './index'

// jest.mock('../../../../services/api')
const mocks = [
  './checkTable/index',
  'dva/router',
  '@/utils/common'
]
mocks.forEach((el) => {
  jest.mock(el)
})

const props = {
  location: {
    search: '?stringId=326'
  }
}
describe('<ModelDetails />', () => {
  let wrapper = shallow(<ModelDetails {...props} />)
  it('<ModelDetails />正常渲染', () => {
    expect(wrapper.find('.main-detail-content')).toHaveLength(1)
  })
  it('initIdata==>请求返回数据', () => {
    const instance = wrapper.instance()
    const spyToConfigItem = jest.spyOn(instance, 'initIdata')
    api.getConfigTemplateById = jest.fn()
    api.getConfigTemplateById.mockReturnValue(
      Promise.resolve({
        head: { code: '200' }
      })
    )
    spyToConfigItem({
      DetailModel: {
        name: '123456'
      }
    })
    expect(api.getConfigTemplateById).toHaveBeenCalled()
  })
})
