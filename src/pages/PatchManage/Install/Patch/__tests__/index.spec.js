import React from 'react'
import { shallow, mount } from 'enzyme'
import { InstallPatch } from '../index'
import { InstallPatchInstall } from '../install'
import sinon from 'sinon'
import { message } from 'antd'
import api from '@/services/api'

jest.mock('../../../../../services/api')

const props = {
  form: {
    getFieldDecorator: jest.fn(opt=>c=>c),
    resetFields: jest.fn()
  }
}

const installProps = {
  location: {
    search: '?idr=123'
  },
  form: {
    getFieldDecorator: jest.fn(opt=>c=>c),
    resetFields: jest.fn()
  }
}

describe('补丁维度安装 列表页 <InstallPatch>', () => {
  let wrapper, loginComponent
  // beforeEach(() => {
    
  //   console.log('实列执行前', wrapper)
  // })
  wrapper = shallow(<InstallPatch {...props} />)
  it('render 应急管理列表页 component', () => {
    
    expect(wrapper.find('.main-table-content')).toHaveLength(1)
  })
  it('初始列表数据', ()=>{
    sinon.spy(InstallPatch.prototype, 'componentDidMount')
    expect(InstallPatch.prototype.componentDidMount).toBeTruthy()
  })
  it('测试 获取列表数据', ()=>{
    // const instance = wrapper.instance()
    const getPatchKnowledgeLists = jest.spyOn(api, 'getInstallManagePatchtList')
    const iData = jest.spyOn(api, 'getInstallManagePatchtList')
    getPatchKnowledgeLists()
    expect(wrapper.state().body).toEqual({
      body: {}
    })
    expect(iData).toHaveBeenCalled()
  })
  it('测试 表单搜索功能', ()=>{
    // const instance = wrapper.instance()
    const spyHandleSubmit = jest.spyOn(api, 'handleSubmit')
    const spySubmit = jest.spyOn(api, 'getInstallManagePatchtList')
    wrapper.setState({
      page: {
        currentPage: 1,
        pageSize: 10
      }
    })
    spyHandleSubmit({ patchName: 'admin' })
    expect(wrapper.state().page.currentPage).toEqual(1)
    expect(wrapper.state().values).toEqual({
      patchName: 'admin'
    })
    expect(spySubmit).toHaveBeenCalled()
  })
  it('测试翻页功能', ()=>{
    const instance = wrapper.instance()
    const spyPageChange = jest.spyOn(instance, 'pageChange')
    const spyPageChanges = jest.spyOn(api, 'getInstallManagePatchtList')
    spyPageChange(2, 10)
    expect(wrapper.state().page).toEqual({
      currentPage: 2,
      pageSize: 10
    })
    expect(spyPageChanges).toHaveBeenCalled()
  })
})

describe('补丁维度安装 安装页面 <InstallPatchInstall>', () => {
  let wrapper
  wrapper = shallow(<InstallPatchInstall {...installProps} />)
  it('render 补丁维度安装页面 component', () => {
    expect(wrapper.find('.main-table-content')).toHaveLength(1)
  })
  it('初始列表数据', ()=>{
    sinon.spy(InstallPatchInstall.prototype, 'componentDidMount')
    expect(InstallPatchInstall.prototype.componentDidMount).toBeTruthy()
  })
  it('测试 获取列表数据', ()=>{
    // const instance = wrapper.instance()
    const getPatchKnowledgeLists = jest.spyOn(api, 'getInstallManagePatchtListInfo')
    const iData = jest.spyOn(api, 'getInstallManagePatchtListInfo')
    getPatchKnowledgeLists()
    expect(wrapper.state().body).toEqual({
      body: {}
    })
    expect(iData).toHaveBeenCalled()
  })
  it('测试 表单搜索功能', ()=>{
    // const instance = wrapper.instance()
    const spyHandleSubmit = jest.spyOn(api, 'handleSubmit')
    const spySubmit = jest.spyOn(api, 'getInstallManagePatchtListInfo')
    wrapper.setState({
      page: {
        currentPage: 1,
        pageSize: 10
      }
    })
    spyHandleSubmit({ comprehensiveQuery: 'admin' })
    expect(wrapper.state().page.currentPage).toEqual(1)
    expect(wrapper.state().values).toEqual({
      comprehensiveQuery: 'admin'
    })
    expect(spySubmit).toHaveBeenCalled()
  })
  it('测试 获取补丁详情', ()=>{
    const instance = wrapper.instance()
    const spyDetail = jest.spyOn(instance, 'getPatchDetail')
    const spyPageChanges = jest.spyOn(api, 'getInstallManagePatchList_detail')
    spyDetail()
    expect(spyPageChanges).toHaveBeenCalled()
  })
  it('测试 翻页功能', ()=>{
    const instance = wrapper.instance()
    const spyPageChange = jest.spyOn(instance, 'pageChange')
    const spyPageChanges = jest.spyOn(api, 'getInstallManagePatchtListInfo')
    spyPageChange(2, 10)
    expect(wrapper.state().page).toEqual({
      currentPage: 2,
      pageSize: 10
    })
    expect(spyPageChanges).toHaveBeenCalled()
  })
})