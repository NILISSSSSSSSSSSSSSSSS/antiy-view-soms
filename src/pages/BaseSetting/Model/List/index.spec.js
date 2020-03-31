import React from 'react'
import { shallow } from 'enzyme'
import sinon from 'sinon'
import BaseSettingComponent, { BaseSettingModelList } from './index'
import { Table, message } from 'antd'
import api from '../../../../services/api'

import PropTypes from 'prop-types'

const mocks = [
  '@/components/common/ModalConfirm',
  '@/components/common/Search'
]
mocks.forEach((el) => {
  jest.mock(el)
})
jest.mock('@/utils/auth', () => {
  return jest.fn((auth) => {
    const { configPermission } = require('@a/permission')
    return [configPermission.newBasetemplate, configPermission.editBasetemplate, configPermission.updownBasetemplate, configPermission.viewBasetemplate].includes(auth)
  })
})
const props = {
  form: {
    resetFields: jest.fn()
  },
  // dispatch: jest.fn(),
  history: {
    push: jest.fn()
  }
}
const store = {
  subscribe: () => ({}),
  dispatch: jest.fn(opts => c => c),
  getState: () => ({
    baseSetting: { osList: [] }
  })
}
const options = {
  context: { store },
  childContextTypes: { store: PropTypes.object.isRequired }
}
describe('<BaseSettingComponent />', () => {
  let wrapper, instance, spyGetBaseSettingManageList
  wrapper = shallow(<BaseSettingComponent {...props} />, options).dive().dive()
  // wrapperComponent = mount(<BaseSettingComponent {...props} />, options)
  instance = wrapper.instance()
  // console.log(instance, wrapper)
  spyGetBaseSettingManageList = jest.spyOn(instance, 'initPageList')
  it('render <BaseSettingComponent /> component', () => {
    expect(wrapper.find(Table)).toHaveLength(1)
  })
  it('UNSAFE_componentWillReceiveProps', () => {
    sinon.spy(BaseSettingModelList.prototype, 'UNSAFE_componentWillReceiveProps')
    wrapper.setProps({
      osList: []
    })
    expect(BaseSettingModelList.prototype.UNSAFE_componentWillReceiveProps.calledOnce).toBeTruthy()
  })
  it('getWorkOrderBtn权限显示操作按钮', () => {
    const getWorkOrderBtn = jest.spyOn(instance, 'getWorkOrderBtn')
    getWorkOrderBtn({
      isEnableName: '禁用'
    })
  })
  it('initPageList==>请求返回数据', () => {
    api.getConfigTemplateList = jest.fn()
    api.getConfigTemplateList.mockReturnValue(
      Promise.resolve({
        head: { code: '200' },
        body: { items: [], totalRecords: 10 }
      })
    )
    spyGetBaseSettingManageList({
      body: {
        items: [],
        totalRecords: 10
      }
    })
    expect(api.getConfigTemplateList).toHaveBeenCalled()
  })
  it('handleSubmit提交表单，执行查询', () => {
    const spyHandleSubmit = jest.spyOn(instance, 'handleSubmit')
    wrapper.setState({
      pagingParameter: {
        pageSize: 10,
        currentPage: 2
      }
    })
    spyHandleSubmit({
      name: '020100105'
    })
    expect(wrapper.state().pagingParameter.currentPage).toEqual(1)
    expect(wrapper.state().values).toEqual({
      name: '020100105'
    })
    expect(spyGetBaseSettingManageList).toHaveBeenCalled()
  })
  it('changePage分页', () => {
    const changePage = jest.spyOn(instance, 'changeShowSize')
    changePage(1, 10)
    expect(wrapper.state().pagingParameter).toEqual({
      pageSize: 10,
      currentPage: 1
    })
    expect(spyGetBaseSettingManageList).toHaveBeenCalled()
  })
  it('handleReset重置', () => {
    const spyHandleReset = jest.spyOn(instance, 'resetFormFileds')
    spyHandleReset()
    expect(wrapper.state().pagingParameter).toEqual({
      pageSize: 10,
      currentPage: 1
    })
    expect(wrapper.state().values).toEqual({})
    expect(spyGetBaseSettingManageList).toHaveBeenCalled()
  })
  it('selectOs选择适用系统', () => {
    const spyselectOs = jest.spyOn(instance, 'selectOs')
    spyselectOs('1')
  })
  it('TooltipFn', () => {
    return undefined
  })
  it('changeStatus启用模板', () => {
    const changeStatus = jest.spyOn(instance, 'changeStatus')
    const spyalertOk = jest.spyOn(instance, 'alertOk')
    changeStatus({ stringId: '11' })
    expect(wrapper.state().alertCont).toEqual({
      stringId: '11'
    })
    expect(spyalertOk).toHaveBeenCalled()
  })
  it('alertOk启用模板', async () => {
    const alertOk = jest.spyOn(instance, 'alertOk')
    const spyMessage = jest.spyOn(message, 'success')
    api.disableTemplate = jest.fn()
    api.disableTemplate.mockReturnValue(
      Promise.resolve({
        head: { code: '200' }
      })
    )
    await alertOk()
    expect(wrapper.state().showAlert).toEqual(false)
    expect(spyMessage).toHaveBeenCalledWith('操作成功！')
  })
  it('showAlert禁用模板', () => {
    const showAlert = jest.spyOn(instance, 'showAlert')
    showAlert({
      stringId: '111'
    })
    expect(wrapper.state().showAlert).toEqual(true)
    expect(wrapper.state().alertCont).toEqual({
      stringId: '111'
    })
  })
  it('handleCancel弹框关闭', () => {
    const handleCancel = jest.spyOn(instance, 'handleCancel')
    handleCancel()
    expect(wrapper.state().showAlert).toEqual(false)
  })
})