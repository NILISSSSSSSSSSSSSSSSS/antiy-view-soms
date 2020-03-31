import React from 'react'
import { shallow, mount } from 'enzyme'
import { Knowledge } from '../index'
import sinon from 'sinon'
import api from '@/services/api'

jest.mock('../../../../../services/api')

const props = {
  form: {
    getFieldDecorator: jest.fn(opt=>c=>c),
    resetFields: jest.fn()
  }
}

describe('补丁知识库列表页 <Knowledge>', () => {
  let wrapper, loginComponent

  wrapper = shallow(<Knowledge {...props} />)
  it('render 补丁知识库列表页 component', () => {
    
    expect(wrapper.find('.main-table-content')).toHaveLength(1)
  })
  it('初始列表数据', ()=>{
    console.log('数据结果', wrapper)
    sinon.spy(Knowledge.prototype, 'componentDidMount')
    expect(Knowledge.prototype.componentDidMount).toBeTruthy()
  })
  it('测试 获取列表数据', ()=>{
    const instance = wrapper.instance()
    const getPatchKnowledgeListss = jest.spyOn(api, 'getPatchKnowledgeLists')
    const iData = jest.spyOn(api, 'getPatchKnowledgeLists')
    getPatchKnowledgeListss()
    expect(wrapper.state().body).toEqual({
      body: {}
    })
    expect(iData).toHaveBeenCalled()
  })
  it('测试 表单搜索功能', ()=>{
    const instance = wrapper.instance()
    wrapper.find('form').simulate('submit')
    // const spyHandleSubmit = jest.spyOn(instance, 'handleSubmit')
    // const spySubmit = jest.spyOn(api, 'getPatchKnowledgeLists')
    // wrapper.setState({
    //   page: {
    //     currentPage: 1,
    //     pageSize: 10
    //   }
    // })
    // spyHandleSubmit()
    // expect(wrapper.state().page.currentPage).toEqual(1)
    // expect(wrapper.state().values).toEqual({
    //   patchName: 'admin'
    // })
    // expect(spySubmit).toHaveBeenCalled()
  })
  it('测试翻页功能', ()=>{
    const instance = wrapper.instance()
    const spyPageChange = jest.spyOn(instance, 'pageChange')
    const spyPageChanges = jest.spyOn(api, 'getPatchKnowledgeLists')
    spyPageChange(2, 10)
    expect(wrapper.state().page).toEqual({
      currentPage: 2,
      pageSize: 10
    })
    expect(spyPageChanges).toHaveBeenCalled()
  })
})