import React from 'react'
import { shallow } from 'enzyme'
import api from '@/services/api'
import { message } from 'antd'
import { BASE_SOURCE, BLANK_LIST, CONFIG_STATUS } from '@a/js/enume'
import { BaseSettingManageSetting } from './index'

const props = {
  location: {
    search: '?waitingConfigId=123'
  }
}
describe('测试<BaseSettingManageSetting />', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallow(<BaseSettingManageSetting {...props} />)
  })
  it('测试render <BaseSettingManageSetting /> component', () => {
    expect(wrapper.find('.main-detail-content')).toHaveLength(1)
  })
  it('测试getAssetsList, 获取配置的资产列表，只有一条资产时，应该获取资产的模板信息getTempletInfo', async () => {
    wrapper.setState({
      waitingConfigId: ['123']
    })
    const instance = wrapper.instance()
    const spy_getAssetsList = jest.spyOn(instance, 'getAssetsList')
    const spy_getTempletInfo = jest.spyOn(instance, 'getTempletInfo')
    api.getConfigAssetsListById = jest.fn()
    api.getConfigAssetsListById.mockReturnValue(
      Promise.resolve({
        head: { code: '200' },
        body: [{
          waitingConfigId: '123',
          name: '资产1',
          configStatus: CONFIG_STATUS.fastenBack,
          tpId: '12345'
        }]
      })
    )
    await spy_getAssetsList()
    expect(api.getConfigAssetsListById).toHaveBeenCalled()
    expect(wrapper.state().assetsList).toEqual([{
      waitingConfigId: '123',
      name: '资产1',
      configStatus: CONFIG_STATUS.fastenBack,
      tpId: '12345'
    }])
    expect(wrapper.state().assetsTotal).toEqual(1)
    expect(wrapper.state().templateId).toEqual('12345')
    expect(spy_getTempletInfo).toHaveBeenCalled()
  })
  it('测试getTempletInfo, 获取模板信息', async () => {
    wrapper.setState({
      templateId: '123'
    })
    const instance = wrapper.instance()
    const spy_getTempletInfo = jest.spyOn(instance, 'getTempletInfo')
    api.getConfigTemplateById = jest.fn()
    api.getConfigTemplateById.mockReturnValue(
      Promise.resolve({
        head: { code: '200' },
        body: {
          id: '123',
          name: '模板名称'
        }
      })
    )
    await spy_getTempletInfo()
    expect(api.getConfigAssetsListById).toHaveBeenCalled()
    expect(wrapper.state().templetInfo).toEqual({
      id: '123',
      name: '模板名称'
    })
  })
  it('测试getBenchmarkList, 获取基准项信息列表', async () => {
    wrapper.setState({
      baselinePagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      chooseTempletId: '123'
    })
    const instance = wrapper.instance()
    const spy_getBenchmarkList = jest.spyOn(instance, 'getBenchmarkList')
    api.listConfigForTemplateByPage = jest.fn()
    api.listConfigForTemplateByPage.mockReturnValue(
      Promise.resolve({
        head: { code: '200' },
        body: {
          items: ['123'],
          totalRecords: 1
        }
      })
    )
    await spy_getBenchmarkList()
    expect(api.listConfigForTemplateByPage).toHaveBeenCalled()
    expect(wrapper.state().baselineList).toEqual(['123'])
    expect(wrapper.state().baselineTotal).toEqual(1)
  })
  it('测试getBlackList, 获取黑名单列表', async () => {
    wrapper.setState({
      blackPagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      chooseTempletId: '123'
    })
    const instance = wrapper.instance()
    const spy_getBlackList = jest.spyOn(instance, 'getBlackList')
    api.listSoftwareForTemplateByPage = jest.fn()
    api.listSoftwareForTemplateByPage.mockReturnValue(
      Promise.resolve({
        head: { code: '200' },
        body: {
          items: ['123'],
          totalRecords: 1
        }
      })
    )
    await spy_getBlackList()
    expect(api.listSoftwareForTemplateByPage).toHaveBeenCalled()
    expect(wrapper.state().blackList).toEqual(['123'])
    expect(wrapper.state().blackTotal).toEqual(1)
  })
  it('测试removeIt, 移除资产项', () => {
    const instance = wrapper.instance()
    const spy_removeIt = jest.spyOn(instance, 'removeIt')
    spy_removeIt('123', 1)
    expect(wrapper.state().removeItemId).toEqual('123')
    expect(wrapper.state().removeIndex).toEqual(1)
    expect(wrapper.state().removeModal).toEqual(true)
  })
  it('测试removeItem, 确认移除资产项', () => {
    wrapper.setState({
      removeItemId: '1',
      removedList: ['2', '3'],
      assetsList: [{
        waitingConfigId: '1',
        name: '资产1'
      }, {
        waitingConfigId: '4',
        name: '资产4'
      }],
      assetsTotal: 2
    })
    const instance = wrapper.instance()
    const spy_removeItem = jest.spyOn(instance, 'removeItem')
    spy_removeItem()
    expect(wrapper.state().assetsList).toEqual([{
      waitingConfigId: '4',
      name: '资产4'
    }])
    expect(wrapper.state().assetsTotal).toEqual(1)
    expect(wrapper.state().removeModal).toEqual(false)
    expect(wrapper.state().removedList).toEqual(['2', '3', '1'])
  })
  it('测试selectTemplet, 确认选择模板', () => {
    wrapper.setState({
      baselinePagingParameter: {
        pageSize: 10,
        currentPage: 2
      }
    })
    const instance = wrapper.instance()
    const spy_selectTemplet = jest.spyOn(instance, 'selectTemplet')
    spy_selectTemplet('1')
    expect(wrapper.state().chooseTempletModal).toEqual(false)
    expect(wrapper.state().chooseTempletId).toEqual('1')
    expect(wrapper.state().baselinePagingParameter).toEqual({
      pageSize: 10,
      currentPage: 1
    })
  })
  it('测试beforeSubmit, 如果没有选择模板', () => {
    wrapper.setState({
      templetInfo: {}
    })
    const instance = wrapper.instance()
    const spy_beforeSubmit = jest.spyOn(instance, 'beforeSubmit')
    const spy_message = jest.spyOn(message, 'error')
    spy_beforeSubmit()
    expect(spy_message).toHaveBeenCalledWith('请至少选择一个模板！')
  })
  it('测试beforeSubmit, 当资产模板都没有发生修改， 并且所有的资产都来自其它来源', () => {
    wrapper.setState({
      templetInfo: {
        name: '模板名称'
      },
      chooseTempletId: '123',
      assetsList: [{
        tpId: '123',
        configStatus: 4
      }]
    })
    const instance = wrapper.instance()
    const spy_beforeSubmit = jest.spyOn(instance, 'beforeSubmit')
    instance.configSubmit = jest.fn()
    spy_beforeSubmit()
    expect(wrapper.state().isChangeTemplet).toEqual(false)
  })
  it('测试beforeSubmit, 如果有资产的模板没有修改，并且是来自配置加固返回', () => {
    wrapper.setState({
      templetInfo: {
        name: '模板名称'
      },
      chooseTempletId: '12345',
      assetsList: [{
        tpId: '123',
        configStatus: CONFIG_STATUS.fastenBack
      }],
      backList: [{
        tpId: '12345',
        configStatus: CONFIG_STATUS.fastenBack
      }, {
        tpId: '345',
        configStatus: CONFIG_STATUS.fastenBack
      }]
    })
    const instance = wrapper.instance()
    const spy_beforeSubmit = jest.spyOn(instance, 'beforeSubmit')
    spy_beforeSubmit()
    expect(wrapper.state().backList).toEqual([{
      tpId: '12345',
      configStatus: CONFIG_STATUS.fastenBack
    }])
    expect(wrapper.state().reinforceModalVisible).toEqual(true)
  })
  it('测试beforeSubmit, 如果有资产修改了模板，并且没有配置加固返回且没有修改模板的资产，弹窗promptModal', () => {
    wrapper.setState({
      templetInfo: {
        name: '模板名称'
      },
      chooseTempletId: '12345',
      assetsList: [{
        tpId: '123',
        configStatus: CONFIG_STATUS.fastenBack
      }, {
        tpId: '123',
        configStatus: CONFIG_STATUS.fastenBack
      }],
      backList: [{
        tpId: '23',
        configStatus: CONFIG_STATUS.fastenBack
      }]
    })
    const instance = wrapper.instance()
    const spy_beforeSubmit = jest.spyOn(instance, 'beforeSubmit')
    spy_beforeSubmit()
    expect(wrapper.state().promptModal).toEqual(true)
  })
})