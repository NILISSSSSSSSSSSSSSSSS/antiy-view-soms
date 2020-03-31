import React from 'react'
import { shallow } from 'enzyme'
import { message } from 'antd'
import api from '@/services/api'
import { BASELINE_OPERATE_TYPE, CONFIG_STATUS } from '@a/js/enume'
import { SubmitForm } from './SubmitForm'

const props = {
  form: {
    getFieldDecorator: jest.fn(opts => c => c),
    validateFields: jest.fn(opts => c => c)
  },
  configSubmit: jest.fn()
}
describe('<SubmitForm />', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallow(<SubmitForm { ...props }/>)
  })
  it('render <SubmitForm /> component', () => {
    expect(wrapper.find('.check-result-wrap')).toHaveLength(1)
  })
  it('初始化时status', () => {
    expect(wrapper.state().usersByRoleCodeAndAreaIdList).toEqual([])
  })
  it('测试getList, 获取配置加固执行人列表', async () => {
    const instance = wrapper.instance()
    const spyGetList = jest.spyOn(instance, 'getList')
    api.getUsersByRoleCodeAndAreaId = jest.fn()
    api.getUsersByRoleCodeAndAreaId.mockReturnValue(
      Promise.resolve({
        head: { code: '200' },
        body: ['123']
      })
    )
    await spyGetList()
    expect(api.getUsersByRoleCodeAndAreaId).toHaveBeenCalled()
    expect(wrapper.state().usersByRoleCodeAndAreaIdList).toEqual(['123'])
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
  it('handleSubmit， 当state为核查时，应该调起saveCheck方法', () => {
    wrapper.setProps({
      state: BASELINE_OPERATE_TYPE.CHECK
    })
    const instance = wrapper.instance()
    const spyHandleSubmit = jest.spyOn(instance, 'handleSubmit')
    const spySaveCheck = jest.spyOn(instance, 'saveCheck')
    props.form.validateFields = (func) => {
      func(false, { isPass: '1', checkUser: 'all' })
    }
    spyHandleSubmit({ preventDefault: jest.fn() })
    expect(spySaveCheck).toHaveBeenCalled()
  })
  it('handleSubmit， 当state为加固时，应该调起saveReinforce方法', () => {
    wrapper.setProps({
      state: BASELINE_OPERATE_TYPE.REINFORCE
    })
    const instance = wrapper.instance()
    const spyHandleSubmit = jest.spyOn(instance, 'handleSubmit')
    const spySaveReinforce = jest.spyOn(instance, 'saveReinforce')
    props.form.validateFields = (func) => {
      func(false, { isPass: '1', checkUser: 'all' })
    }
    spyHandleSubmit({ preventDefault: jest.fn() })
    expect(spySaveReinforce).toHaveBeenCalled()
  })
  it('saveCheck，保存核查, 当状态为核查待确认时，且核查结果提交未通过，需调取自动加固接口automaticReinforce', async () => {
    wrapper.setState({
      usersByRoleCodeAndAreaIdList: [{
        stringId: '1',
        name: '执行人1'
      }, {
        stringId: '2',
        name: '执行人2'
      }]
    })
    wrapper.setProps({
      status: CONFIG_STATUS.checkWaitConfirm
    })
    const instance = wrapper.instance()
    const spySaveCheck = jest.spyOn(instance, 'saveCheck')
    api.saveCheck = jest.fn()
    api.saveCheck.mockReturnValue(
      Promise.resolve({
        head: { code: '200' }
      })
    )
    api.automaticReinforce = jest.fn()
    api.automaticReinforce.mockReturnValue(
      Promise.resolve({
        head: { code: '200' }
      })
    )
    await spySaveCheck({
      remark: '备注123',
      isPass: 0,
      fixUser: 'all',
      uploadFiles: null
    })
    expect(api.saveCheck).toHaveBeenCalled()
    expect(api.automaticReinforce).toHaveBeenCalled()
  })
  it('saveReinforce，保存加固, 成功后message提示', async () => {
    wrapper.setProps({
      status: CONFIG_STATUS.checkWaitConfirm
    })
    const instance = wrapper.instance()
    const spySaveReinforce = jest.spyOn(instance, 'saveReinforce')
    const spyMessage = jest.spyOn(message, 'success')
    const spyGetNewList = jest.spyOn(instance, 'getNewList')
    api.saveReinforce = jest.fn()
    api.saveReinforce.mockReturnValue(
      Promise.resolve({
        head: { code: '200' }
      })
    )
    await spySaveReinforce({
      remark: '备注123',
      isPass: 0,
      uploadFiles: null
    })
    expect(api.saveReinforce).toHaveBeenCalled()
    expect(spyMessage).toHaveBeenCalledWith('操作成功！')
    expect(spyGetNewList).toHaveBeenCalled()
  })
})