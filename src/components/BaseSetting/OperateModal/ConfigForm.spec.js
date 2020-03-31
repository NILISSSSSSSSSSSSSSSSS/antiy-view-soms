import React from 'react'
import { shallow } from 'enzyme'
import { Spin, message } from 'antd'
import api from '@/services/api'
import { ConfigForm } from './ConfigForm'

const props = {
  form: {
    getFieldDecorator: jest.fn(opts => c => c),
    validateFields: jest.fn(opts => c => c)
  },
  configSubmit: jest.fn()
}
describe('<ConfigForm />', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallow(<ConfigForm { ...props }/>)
  })
  it('render <ConfigForm /> component', () => {
    expect(wrapper.find('.check-result-wrap')).toHaveLength(1)
    expect(wrapper.find(Spin)).toHaveLength(1)
  })
  it('初始化时status', () => {
    expect(wrapper.state().usersByRoleCodeAndAreaIdList).toEqual([])
    expect(wrapper.state().loading).toEqual(true)
  })
  it('测试getList, 获取配置核查执行人列表', async () => {
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
    expect(wrapper.state().loading).toEqual(false)
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
  it('handleSubmit,应该调起props传入的configSubmit方法', () => {
    wrapper.setState({
      usersByRoleCodeAndAreaIdList: [{
        stringId: '1',
        name: '执行人1'
      }, {
        stringId: '2',
        name: '执行人2'
      }]
    })
    const instance = wrapper.instance()
    const spyHandleSubmit = jest.spyOn(instance, 'handleSubmit')
    const spyPropsFunction = jest.spyOn(instance.props, 'configSubmit')
    props.form.validateFields = (func) => {
      func(false, { checkType: '1', checkUser: 'all' })
    }
    spyHandleSubmit({ preventDefault: jest.fn() })
    expect(spyPropsFunction).toHaveBeenCalledWith({
      checkType: '1',
      checkUser: ['1', '2'],
      configUrl: []
    })
  })
})