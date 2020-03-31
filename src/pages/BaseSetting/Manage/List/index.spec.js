import React from 'react'
import { shallow } from 'enzyme'
import { message } from 'antd'
import sinon from 'sinon'
import api from '@/services/api'
import { BaseSettingManageForm } from './index'

// jest.mock('../../../../services/api')

const props = {
  location: {
    search: '?businessId=123'
  },
  dispatch: jest.fn(),
  form: {
    resetFields: jest.fn()
  },
  history: {
    push: ()=>{}
  }
}
describe('测试<BaseSettingManageForm />', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallow(<BaseSettingManageForm {...props} />)
  })
  it('测试render <BaseSettingManageForm /> component', () => {
    expect(wrapper.find('.main-table-content')).toHaveLength(1)
  })
  it('UNSAFE_componentWillReceiveProps', () => {
    sinon.spy(BaseSettingManageForm.prototype, 'UNSAFE_componentWillReceiveProps')
    wrapper.setProps({
      osList: []
    })
    expect(BaseSettingManageForm.prototype.UNSAFE_componentWillReceiveProps.calledOnce).toBeTruthy()
  })
  it('测试getBaseSettingManageList获取列表数据', async () => {
    const instance = wrapper.instance()
    const spyGetBaseSettingManageList = jest.spyOn(instance, 'getBaseSettingManageList')
    api.getConfigAssetsList = jest.fn()
    api.getConfigAssetsList.mockReturnValue(
      Promise.resolve({
        head: { code: '200' },
        body: {
          items: [{
            systemName: '系统1'
          }]
        }
      })
    )
    await spyGetBaseSettingManageList()
    expect(wrapper.state().list).toEqual({
      items: [{
        systemName: '系统1'
      }]
    })
    expect(api.getConfigAssetsList).toHaveBeenCalled()
    expect(wrapper.state().systemList).toEqual(['系统1'])
    expect(wrapper.state().isAllCanCheck).toEqual(true)
  })
  // it('测试getBaseSettingManageList没有返回正确数据', async () => {
  //   const instance = wrapper.instance()
  //   const spyGetBaseSettingManageList = jest.spyOn(instance, 'getBaseSettingManageList')
  //   api.getConfigAssetsList = jest.fn()
  //   api.getConfigAssetsList.mockReturnValue(
  //     Promise.resolve({
  //       head: { code: '400' },
  //       body: {}
  //     })
  //   )
  //   await spyGetBaseSettingManageList()
  //   expect(wrapper.state().list).toEqual({})
  //   expect(wrapper.state().isAllCanCheck).toEqual(false)
  // })
  it('测试handleSubmit提交表单，执行查询', () => {
    const instance = wrapper.instance()
    const spyHandleSubmit = jest.spyOn(instance, 'handleSubmit')
    const spyGetBaseSettingManageList = jest.spyOn(instance, 'getBaseSettingManageList')
    wrapper.setState({
      pagingParameter: {
        pageSize: 10,
        currentPage: 2
      }
    })
    spyHandleSubmit({
      name: 'admin'
    })
    expect(wrapper.state().pagingParameter.currentPage).toEqual(1)
    expect(wrapper.state().seekTerm).toEqual({
      name: 'admin'
    })
    expect(spyGetBaseSettingManageList).toHaveBeenCalled()
  })
  it('测试handleReset查询条件重置', () => {
    const instance = wrapper.instance()
    const spyHandleReset = jest.spyOn(instance, 'handleReset')
    const spyGetBaseSettingManageList = jest.spyOn(instance, 'getBaseSettingManageList')
    spyHandleReset()
    expect(wrapper.state().selectedRowKeys).toEqual([])
    expect(wrapper.state().rowsSelectedList).toEqual([])
    expect(wrapper.state().pagingParameter).toEqual({
      pageSize: 10,
      currentPage: 1
    })
    expect(wrapper.state().seekTerm).toEqual({})
    expect(spyGetBaseSettingManageList).toHaveBeenCalled()
  })
  it('测试pageChange翻页', () => {
    const instance = wrapper.instance()
    const spyPageChange = jest.spyOn(instance, 'pageChange')
    const spyGetBaseSettingManageList = jest.spyOn(instance, 'getBaseSettingManageList')
    spyPageChange(2, 20)
    expect(wrapper.state().pagingParameter).toEqual({
      currentPage: 2,
      pageSize: 20
    })
    expect(spyGetBaseSettingManageList).toHaveBeenCalled()
  })
  it('测试toConfigItem单个资产配置,应该先调起认领任务接口', () => {
    const instance = wrapper.instance()
    const spyToConfigItem = jest.spyOn(instance, 'toConfigItem')
    api.recieveTask = jest.fn()
    api.recieveTask.mockReturnValue(
      Promise.resolve({
        head: { code: '200' }
      })
    )
    spyToConfigItem({
      waitingTaskReponse: {
        taskId: '123456'
      }
    })
    expect(api.recieveTask).toHaveBeenCalled()
  })
  it('测试toConfig批量配置, 当selectedRowKeys为空时，应message提示', () => {
    const instance = wrapper.instance()
    const spyToConfig = jest.spyOn(instance, 'toConfig')
    const spyMessage = jest.spyOn(message, 'info')
    wrapper.setState({ 
      selectedRowKeys: []
    })
    spyToConfig()
    expect(spyMessage).toHaveBeenCalledWith('请先勾选要批量配置的资产！')
  })
  it('测试toConfig批量配置, 当selectedRowKeys不为空时，message不会提示', () => {
    const instance = wrapper.instance()
    const spyToConfig = jest.spyOn(instance, 'toConfig')
    const spyMessage = jest.spyOn(message, 'info')
    const spyClaimTaskBatch = jest.spyOn(api, 'claimTaskBatch')
    wrapper.setState({ 
      selectedRowKeys: [{
        key: 'name'
      }]
    })
    spyToConfig()
    expect(spyMessage).not.toHaveBeenCalledWith()
    expect(spyClaimTaskBatch).toHaveBeenCalled()
  })
})