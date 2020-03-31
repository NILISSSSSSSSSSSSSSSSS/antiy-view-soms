import React from 'react'
import { shallow } from 'enzyme'
import { Steps, message } from 'antd'
import sinon from 'sinon'
import api from '@/services/api'
import { CONFIG_STATUS, BASELINE_OPERATE_TYPE } from '@a/js/enume'
import OperateModal from './index'

jest.mock('../../common/Modal/index.js')

const ANALYSIS_STATUS = {
  INANALYSIS: 1,
  SUCCSSS: 2,
  FAILD: 3
}
window.open = jest.fn()
const props = {
  onClose: jest.fn(),
  getList: jest.fn(),
  configSubmit: jest.fn()
}
describe('<OperateModal />', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallow(<OperateModal {...props} />)
  })
  it('render <OperateModal /> component', () => {
    expect(wrapper.find('.operate-modal')).toHaveLength(1)
    expect(wrapper.find(Steps)).toHaveLength(1)
  })
  it('初始化时status', () => {
    expect(wrapper.state().status).toEqual(undefined)
    expect(wrapper.state().loading).toEqual(true)
  })
  it('UNSAFE_componentWillReceiveProps', () => {
    sinon.spy(OperateModal.prototype, 'UNSAFE_componentWillReceiveProps')
    wrapper.setProps({
      status: 123,
      visible: true
    })
    expect(OperateModal.prototype.UNSAFE_componentWillReceiveProps.calledOnce).toBeTruthy()
    expect(wrapper.state().status).toEqual(123)
    expect(wrapper.state().reportAnalysisSuccess).toEqual(false)
    expect(wrapper.state().fileList).toEqual([])
  })
  it('测试getResult, 当props中state为基准配置时， 不执行getCheckResult', () => {
    wrapper.setProps({
      state: BASELINE_OPERATE_TYPE.CONFIG
    })
    const instance = wrapper.instance()
    const spyGetResult = jest.spyOn(instance, 'getResult')
    const spyGetCheckResult = jest.spyOn(instance, 'getCheckResult')
    spyGetResult()
    expect(spyGetCheckResult).not.toHaveBeenCalled()
    expect(wrapper.state().loading).toEqual(false)
  })
  it('测试getResult, 当props中state为基准核查时， 执行getCheckResult', () => {
    wrapper.setProps({
      state: BASELINE_OPERATE_TYPE.CHECK
    })
    const instance = wrapper.instance()
    const spyGetResult = jest.spyOn(instance, 'getResult')
    const spyGetCheckResult = jest.spyOn(instance, 'getCheckResult')
    spyGetResult()
    expect(spyGetCheckResult).toHaveBeenCalled()
  })
  it('测试getResult, 当props中state为基准加固时， 执行getReinfoceResult', () => {
    wrapper.setProps({
      state: BASELINE_OPERATE_TYPE.REINFORCE
    })
    const instance = wrapper.instance()
    const spyGetResult = jest.spyOn(instance, 'getResult')
    const spyGetReinfoceResult = jest.spyOn(instance, 'getReinfoceResult')
    spyGetResult()
    expect(spyGetReinfoceResult).toHaveBeenCalled()
  })
  it('测试getCheckResult, 获取核查结果相关信息,当返回了信息，应该进行相应的状态更新', async () => {
    wrapper.setProps({
      waitingConfigId: '123456'
    })
    const instance = wrapper.instance()
    const spyGetCheckResult = jest.spyOn(instance, 'getCheckResult')
    api.getCheckResult = jest.fn()
    api.getCheckResult.mockReturnValue(
      Promise.resolve({
        head: { code: '200' },
        body: {
          checkUrl: '123456',
          checkUrlName: '123456',
          checkRemark: '123456',
          reportUrl: '123456',
          failReason: '123456',
          parseStatus: ANALYSIS_STATUS.SUCCSSS
        }
      })
    )
    await spyGetCheckResult()
    expect(api.getCheckResult).toHaveBeenCalled()
    expect(wrapper.state().checkResult).toEqual({
      checkUrl: '123456',
      checkUrlName: '123456',
      checkRemark: '123456',
      reportUrl: '123456',
      failReason: '123456'
    })
    expect(wrapper.state().reportAnalysisSuccess).toEqual(true)
    expect(wrapper.state().reportAnalysisFaild).toEqual(false)
    expect(wrapper.state().loading).toEqual(false)
  })
  it('测试getReinfoceResult, 获取加固结果相关信息,当没有返回信息', async () => {
    wrapper.setProps({
      waitingConfigId: '123456'
    })
    const instance = wrapper.instance()
    const spyGetReinfoceResult = jest.spyOn(instance, 'getReinfoceResult')
    api.getReinforceResult = jest.fn()
    api.getReinforceResult.mockReturnValue(
      Promise.resolve({
        head: { code: '200' },
        body: null
      })
    )
    await spyGetReinfoceResult()
    expect(api.getReinforceResult).toHaveBeenCalled()
    expect(wrapper.state().loading).toEqual(false)
    expect(wrapper.state().reinforceResult).toEqual({
      fixUrl: [],
      fixUrlName: [],
      fixRemark: '',
      reportUrl: '',
      failReason: ''
    })
  })
  it('测试automaticCheck，重新自动核查,成功后应该message提示', async () => {
    wrapper.setProps({
      waitingConfigId: '123456'
    })
    const instance = wrapper.instance()
    const spyAutomaticCheck = jest.spyOn(instance, 'automaticCheck')
    const spyGetNewList = jest.spyOn(instance, 'getNewList')
    const spyMessage = jest.spyOn(message, 'success')
    api.automaticCheck = jest.fn()
    api.automaticCheck.mockReturnValue(
      Promise.resolve({
        head: { code: '200' }
      })
    )
    await spyAutomaticCheck()
    expect(spyMessage).toHaveBeenCalledWith('操作成功！')
    expect(spyGetNewList).toHaveBeenCalled()
  })
  it('测试automaticReinforce，重新自动加固,成功后应该message提示', async () => {
    wrapper.setProps({
      waitingConfigId: '123456'
    })
    const instance = wrapper.instance()
    const spyAutomaticReinforce = jest.spyOn(instance, 'automaticReinforce')
    const spyGetNewList = jest.spyOn(instance, 'getNewList')
    const spyMessage = jest.spyOn(message, 'success')
    api.automaticReinforce = jest.fn()
    api.automaticReinforce.mockReturnValue(
      Promise.resolve({
        head: { code: '200' }
      })
    )
    await spyAutomaticReinforce()
    expect(spyMessage).toHaveBeenCalledWith('操作成功！')
    expect(spyGetNewList).toHaveBeenCalled()
  })
  it('测试getNewList', () => {
    const instance = wrapper.instance()
    const spyGetNewList = jest.spyOn(instance, 'getNewList')
    const spyGetList = jest.spyOn(instance.props, 'getList')
    spyGetNewList()
    expect(spyGetList).toHaveBeenCalled()
  })
  it('测试人工核查handCheck', () => {
    const instance = wrapper.instance()
    const spyHandCheck = jest.spyOn(instance, 'handCheck')
    spyHandCheck()
    expect(wrapper.state().status).toEqual(CONFIG_STATUS.checkFailedByManual)
  })
  it('测试configSubmit', () => {
    const instance = wrapper.instance()
    const spyConfigSubmit = jest.spyOn(instance, 'configSubmit')
    const spyPropsConfigSubmit = jest.spyOn(instance.props, 'configSubmit')
    spyConfigSubmit({
      name: '123'
    })
    expect(spyPropsConfigSubmit).toHaveBeenCalledWith({
      name: '123'
    })
  })
  it('测试checkStatusChange状态变更', () => {
    wrapper.setProps({
      waitingConfigId: '123456'
    })
    const instance = wrapper.instance()
    const spyCheckStatusChange = jest.spyOn(instance, 'checkStatusChange')
    api.checkStatusChange = jest.fn()
    spyCheckStatusChange()
    expect(api.checkStatusChange).toHaveBeenCalledWith({
      primaryKey: '123456'
    })
  })
  it('测试reinforceStatusChange状态变更', () => {
    wrapper.setProps({
      waitingConfigId: '123456'
    })
    const instance = wrapper.instance()
    const spyReinforceStatusChange = jest.spyOn(instance, 'reinforceStatusChange')
    api.reinforceStatusChange = jest.fn()
    spyReinforceStatusChange()
    expect(api.reinforceStatusChange).toHaveBeenCalledWith({
      primaryKey: '123456'
    })
  })
  it('测试getReport获取报告', () => {
    wrapper.setProps({
      waitingConfigId: '123456',
      state: BASELINE_OPERATE_TYPE.CHECK
    })
    const instance = wrapper.instance()
    const spyGetReport = jest.spyOn(instance, 'getReport')
    api.getCheckReport = jest.fn()
    api.getReinforceReport = jest.fn()
    api.getCheckReport.mockReturnValue(
      Promise.resolve({
        head: { code: '200' }
      })
    )
    spyGetReport()
    expect(api.getCheckReport).toHaveBeenCalled()
    expect(api.getReinforceReport).not.toHaveBeenCalled()
  })
  it('测试uploadChange文件上传,文件上传失败应该message提示', () => {
    const instance = wrapper.instance()
    const spyUploadChange = jest.spyOn(instance, 'uploadChange')
    const spyMessage = jest.spyOn(message, 'info')
    spyUploadChange({
      fileList: [{
        status: 'error',
        name: '文件1'
      }]
    })
    expect(wrapper.state().fileList).toEqual([{
      status: 'error',
      name: '文件1'
    }])
    expect(spyMessage).toHaveBeenCalledWith('文件1上传超时！')
  })
  it('测试人工加固handFasten', () => {
    // wrapper.setState({
    //   status: CONFIG_STATUS.fastenFailed,
    //   loading: false
    // })
    // wrapper.setProps({
    //   state: BASELINE_OPERATE_TYPE.REINFORCE,
    //   visible: true
    // })
    // wrapper.update()
    // wrapper.find('#fasten').simulate('click')
    // expect(operateModalComponent.instance().handFasten).toBeCalled()
    wrapper.instance().handFasten()
    expect(wrapper.state().status).toEqual(CONFIG_STATUS.fastenFailedByManual)
  })
})