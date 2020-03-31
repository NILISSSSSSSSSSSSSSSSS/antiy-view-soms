import React from 'react'
import { shallow } from 'enzyme'
import api from '@/services/api'
import { ModelEditTable } from './index'

// jest.mock('../../../../services/api')
jest.mock('lodash', () => ({
  uniqBy: jest.fn((fn => fn)),
  map: jest.fn((fn => fn))
}))

const mocks = [
  '@/components/common/ModalConfirm',
  '@/components/common/SoftModal',
  '@/utils/common'
]
mocks.forEach((el) => {
  jest.mock(el)
})

const props = {
  children: jest.fn(),
  props: {
    blankType: 1,
    stringId: '111',
    os: '3444'
  },
  onChange: jest.fn(),
  form: {
    getFieldValue: jest.fn()
  },
  location: {
    search: '?stringId=326'
  }
}
describe('基准项组件<BaseDetail />', () => {
  let wrapper = shallow(<ModelEditTable {...props} />)
  const instance = wrapper.instance()
  const spyGetBaseSettingManageList = jest.spyOn(instance, 'getCacheList')
  it('正常渲染', () => {
    expect(wrapper.find('.config-model-table')).toHaveLength(1)
  })
  it('getSoftList==>请求返回数据', () => {
    const spyToConfigItem = jest.spyOn(instance, 'getSoftList')
    api.listSoftwareForTemplate = jest.fn()
    api.listSoftwareForTemplate.mockReturnValue(
      Promise.resolve({
        head: { code: '200' }
      })
    )
    spyToConfigItem({
      origData: [],
      removeBusinessIds: [11, 33]
    })
    expect(api.listSoftwareForTemplate).toHaveBeenCalled()
  })
  it('testFunc onCancel', () => {
    instance.onCancel()
    expect(wrapper.state().removeModal).toEqual(false)
  })
  it('testFunc closeAlerts', () => {
    instance.closeAlerts()
    expect(wrapper.state().blankAlertShow).toEqual(false)
  })
  it('testFunc showSoftList', () => {
    instance.showSoftList([])
    expect(wrapper.state().blankLists).toEqual([])
    expect(wrapper.state().blankTotal).toEqual(0)
    expect(wrapper.state().blankAlertShow).toEqual(false)
    expect(wrapper.state().storeData).toEqual([])
    expect(wrapper.state().values).toEqual({
      addSoftwareList: []
    })
    expect(wrapper.state().blankPagingParameter).toEqual({
      currentPage: 1,
      pageSize: 10
    })
  })
  it('testFunc saveAlerts', () => {
    instance.saveAlerts([])
    expect(wrapper.state().removeBusinessIds).toEqual([])
  })
  it('testFunc removeIt', () => {
    instance.removeIt(11)
    expect(wrapper.state().removeItemId).toEqual(11)
    expect(wrapper.state().removeModal).toEqual(true)
  })
  it('testFunc getCacheList', () => {
    instance.getCacheList([], 1, 10)
    expect(wrapper.state().blankLists).toEqual([])
    expect(wrapper.state().blankTotal).toEqual(0)
  })
  it('changePage分页', () => {
    const changePage = jest.spyOn(instance, 'changePage')
    changePage(2, 10)
    expect(wrapper.state().blankPagingParameter).toEqual({
      pageSize: 10,
      currentPage: 2
    })
    expect(spyGetBaseSettingManageList).toHaveBeenCalled()
  })
  it('testFunc deleteState', () => {
    instance.deleteState()
    expect(wrapper.state().storeData).toEqual([])
    expect(wrapper.state().currentPage).toEqual(1)
    expect(wrapper.state().removeBusinessIds).toEqual([])
    expect(wrapper.state().removeModal).toEqual(false)
  })
})
