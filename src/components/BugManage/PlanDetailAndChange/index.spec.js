import React from 'react'
import { shallow } from 'enzyme'
import { message } from 'antd'
import api from '@/services/api'
import PlanDetail from './index'

// jest.mock('@/utils/common')
// jest.mock('@/services/api')
jest.mock('react-router-dom')
const head = { code: '200' }
const props = {
  location: {
    search: ''
  }
}

describe('<PlanDetail />', () => {
  const wrapper = shallow(<PlanDetail {...props} />)
  const instance = wrapper.instance()
  it('render <PlanDetail />', () => {
    expect(wrapper.find('.bug-plan')).toHaveLength(1)
  })
  it('测试handleSubmit', () => {
    const handleSubmit = jest.spyOn(instance, 'handleSubmit')
    handleSubmit({})
    expect(handleSubmit).toHaveBeenCalled()
  })
  it('测试planSuccess', () => {
    const instance = wrapper.instance()
    const planSuccess = jest.spyOn(instance, 'planSuccess')
    const spyMessage = jest.spyOn(message, 'success')
    planSuccess('test')
    expect(spyMessage).toHaveBeenCalledWith('test成功！')
    expect(wrapper.state().addPlanVisible).toEqual(false)
    expect(wrapper.state().isAddPlan).toEqual(false)
  })
  it('测试deletePlanPost', () => {
    const instance = wrapper.instance()
    const deletePlanPost = jest.spyOn(instance, 'deletePlanPost')
    deletePlanPost()
    expect(deletePlanPost).toHaveBeenCalled()
    expect(wrapper.state().addPlanVisible).toEqual(false)
  })
  it('测试getBugPlanList', () => {
    const instance = wrapper.instance()
    const getBugPlanList = jest.spyOn(instance, 'getBugPlanList')
    api.getBugPlanList = jest.fn()
    const spyFunction_getBugPlanList = jest.spyOn(api, 'getBugPlanList')
    spyFunction_getBugPlanList.mockReturnValue(Promise.resolve({
      head,
      body: []
    }))
    getBugPlanList()
    expect(getBugPlanList).toHaveBeenCalled()
    expect(spyFunction_getBugPlanList).toHaveBeenCalled()
    expect(wrapper.state().AllPlanData).toEqual([])
  })
  it('测试getPatchList', () => {
    const instance = wrapper.instance()
    const getPatchList = jest.spyOn(instance, 'getPatchList')
    api.getBugPlanList = jest.fn()
    const spyFunction_queryBugPatchPage = jest.spyOn(api, 'queryBugPatchPage')
    spyFunction_queryBugPatchPage.mockReturnValue(Promise.resolve({
      head,
      body: []
    }))
    getPatchList()
    expect(getPatchList).toHaveBeenCalled()
    expect(spyFunction_queryBugPatchPage).toHaveBeenCalled()
    expect(wrapper.state().AllPlanData).toEqual([])
  })
  it('测试savePatchs', () => {
    const savePatchs = jest.spyOn(instance, 'savePatchs')
    savePatchs([])
    expect(savePatchs).toHaveBeenCalled()
  })
  it('测试checkAddPlan', () => {
    const checkAddPlan = jest.spyOn(instance, 'checkAddPlan')
    checkAddPlan([])
    expect(checkAddPlan).toHaveBeenCalled()
  })
  it('测试getTable', () => {
    const getTable = jest.spyOn(instance, 'getTable')
    getTable({
      patchList: {}
    })
    expect(getTable).toHaveBeenCalled()
  })
  it('测试checkEditPlan', () => {
    const checkEditPlan = jest.spyOn(instance, 'checkEditPlan')
    checkEditPlan()
    expect(checkEditPlan).toHaveBeenCalled()
  })
  it('测试addPlan', () => {
    const addPlan = jest.spyOn(instance, 'addPlan')
    addPlan()
    expect(addPlan).toHaveBeenCalled()
    expect(wrapper.state().addPlanVisible).toEqual(true)
  })
  it('测试closeEditPlan', () => {
    const closeEditPlan = jest.spyOn(instance, 'closeEditPlan')
    closeEditPlan()
    expect(closeEditPlan).toHaveBeenCalled()
  })
  it('测试cancelAddPlan', () => {
    const cancelAddPlan = jest.spyOn(instance, 'cancelAddPlan')
    cancelAddPlan()
    expect(cancelAddPlan).toHaveBeenCalled()
    expect(wrapper.state().addPlanVisible).toEqual(false)
  })
  it('测试cancelEditPlan', () => {
    const cancelEditPlan = jest.spyOn(instance, 'cancelEditPlan')
    const getPatchList = jest.spyOn(instance, 'getPatchList')
    cancelEditPlan({})
    expect(cancelEditPlan).toHaveBeenCalled()
    expect(getPatchList).toHaveBeenCalled()
  })
  it('测试checkAlive', () => {
    const checkAlive = jest.spyOn(instance, 'checkAlive')
    api.checkPatch = jest.fn()
    const spyFunction = jest.spyOn(api, 'checkPatch')
    spyFunction.mockReturnValue(Promise.resolve({
      head,
      body: 1
    }))
    checkAlive()
    expect(checkAlive).toHaveBeenCalled()
    expect(spyFunction).toHaveBeenCalled()
  })
})

