import React from 'react'
import { shallow } from 'enzyme'
import api from '@/services/api'
import BugDetailPage from './index'
jest.mock('react-router-dom')
const head = { code: '200' }
const props = {
  location: {
    search: ''
  }
}

describe('<BugDetailPage />', () => {
  const wrapper = shallow(<BugDetailPage {...props} />)
  it('render <BugDetailPage />', () => {
    expect(wrapper.find('.main-detail-content')).toHaveLength(1)
  })
  it('测试getBugPlanList', () => {
    const instance = wrapper.instance()
    const getDetail = jest.spyOn(instance, 'getDetail')
    api.vulnDetail = jest.fn()
    const spyFunction = jest.spyOn(api, 'vulnDetail')
    spyFunction.mockReturnValue(Promise.resolve({
      head,
      body: {}
    }))
    getDetail()
    expect(getDetail).toHaveBeenCalled()
    expect(spyFunction).toHaveBeenCalled()
    expect(wrapper.state().detailData).toEqual({})
  })
})

