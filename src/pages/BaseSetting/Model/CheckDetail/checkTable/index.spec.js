import React from 'react'
import { shallow } from 'enzyme'
import { ModelEditTable } from './index'
import api from '@/services/api'

const props = {
  form: {
    getFieldDecorator: jest.fn(opts => c => c),
    resetFields: jest.fn(opts => c => c),
    validateFields: jest.fn(opts => c => c),
    getFieldValue: jest.fn(opts => c => c)
  },
  props: {
    title: 'soft'
  },
  location: {
    search: '?stringId=326'
  }
}

describe('模板详情', () => {
  let wrapper = shallow(<ModelEditTable {...props} />)
  const instance = wrapper.instance()
  const spyToConfigItem = jest.spyOn(instance, 'getSoftListById')
  const spyGetBaseSettingManageList = jest.spyOn(instance, 'getRelationById')
  it('getSoftListById==>请求返回数据', () => {
    api.listSoftwareForTemplateByPage = jest.fn()
    api.listSoftwareForTemplateByPage.mockReturnValue(
      Promise.resolve({
        head: { code: '200' }
      })
    )
    spyToConfigItem({
      softTabData: []
    })
    expect(api.listSoftwareForTemplateByPage).toHaveBeenCalled()
  })
  it('handleReset', () => {
    const handleReset = jest.spyOn(instance, 'handleReset')
    handleReset()
    expect(wrapper.state().softValues).toEqual({})
    expect(wrapper.state().softCurrentPage).toEqual(1)
    expect(spyToConfigItem).toHaveBeenCalled()
  })
  it('testFunc handleSubmit', () => {
    const handleSubmit = jest.spyOn(instance, 'handleSubmit')
    const values = {
      manufacturer: '11',
      softwareName: '11',
      name: '11',
      ruleId: 'WRW',
      os: '333',
      level: '1'
    }
    handleSubmit(values)
    expect(wrapper.state().softCurrentPage).toEqual(1)
    expect(wrapper.state().softValues).not.toEqual(values)
    expect(spyToConfigItem).toHaveBeenCalled()
  })
  it('changePage分页', () => {
    const changePage = jest.spyOn(instance, 'changePage')
    changePage(1, 10)
    expect(wrapper.state().softCurrentPage).toEqual(1)
    expect(spyToConfigItem).toHaveBeenCalled()
  })
  it('handleTableChange排序', () => {
    const handleTableChange = jest.spyOn(instance, 'handleTableChange')
    handleTableChange({}, {}, {
      columnKey: 'gmtCreate',
      order: ''
    })
    expect(wrapper.state().sorter.sortName).toEqual('gmt_create')
    expect(spyGetBaseSettingManageList).toHaveBeenCalled()
  })
})
