import React from 'react'
import { shallow } from 'enzyme'
import api from '../../../../services/api'
import { message } from 'antd'
import DetailModel, { DetailModelForm } from './index'
import sinon from 'sinon'
import PropTypes from 'prop-types'

// jest.mock('../../../../services/api')
const mocks = [
  '@/components/common/ModalConfirm',
  './ConfigTable/index',
  './SoftTable/index'
]
mocks.forEach((el) => {
  jest.mock(el)
})
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

const props = {
  location: {
    search: '?stringId=9'
  },
  history: {
    goBack: jest.fn()
  },
  dispatch: jest.fn(),
  form: {
    validateFields: jest.fn(opts => c => c),
    getFieldDecorator: jest.fn(opts => c => c)
  }
}
describe('模板编辑<DetailModelForm />', () => {
  let wrapper = shallow(<DetailModel {...props} />, options).dive().dive()
  let instance = wrapper.instance()
  it('<DetailModel />正常渲染', () => {
    expect(wrapper.find('.model-edit-form-content')).toHaveLength(1)
  })
  it('UNSAFE_componentWillReceiveProps', () => {
    let wrapper2 = shallow(<DetailModelForm {...props} />)
    sinon.spy(DetailModelForm.prototype, 'UNSAFE_componentWillReceiveProps')
    wrapper2.setProps({
      osList: []
    })
    expect(DetailModelForm.prototype.UNSAFE_componentWillReceiveProps.calledOnce).toBeTruthy()
  })
  it('getModelById==>请求返回数据', () => {
    const spyToConfigModelItem = jest.spyOn(instance, 'getModelById')
    api.getConfigTemplateById = jest.fn()
    api.getConfigTemplateById.mockReturnValue(
      Promise.resolve({
        head: { code: '200' },
        body: {
        }
      })
    )
    spyToConfigModelItem({
      templateOb: {
        name: 'linux_jcx_test1'
      },
      os: '614121061453135889',
      isApply: true,
      blankType: 2
    })
    expect(api.getConfigTemplateById).toHaveBeenCalled()
  })
  it('onCancel取消弹框', () => {
    expect(wrapper.state().checkShow).toEqual(false)
  })
  it('onChangeOS选择适用系统', () => {
    expect(wrapper.state().addConfigList).toEqual([])
    expect(wrapper.state().addSoftwareList).toEqual([])
    // expect(wrapper.SoftTable.state().blankLists).toEqual([])
  })
  it('selectOs选择适用系统', () => {
    const spyselectOs = jest.spyOn(instance, 'selectOs')
    spyselectOs('1')
    instance.props.dispatch({ type: 'baseSetting/getConfigOsList', payload: { productName: '1' } })
  })
  it('获取执行人', async () => {
    const getUsersByRoleCodeAndAreaId = jest.spyOn(instance, 'getUsersByRoleCodeAndAreaId')
    api.getUsersByRoleCodeAndAreaId = jest.fn()
    api.getUsersByRoleCodeAndAreaId.mockReturnValue(
      Promise.resolve({
        head: { code: '200' },
        body: {
        }
      })
    )
    await getUsersByRoleCodeAndAreaId()
    expect(wrapper.state().NextOperatorList).toEqual([])
  })
  it('onChangeBlank选择黑白名单', () => {
    const onChangeBlank = jest.spyOn(instance, 'onChangeBlank')
    onChangeBlank(1)
    expect(wrapper.state().blankType).toEqual(1)
  })
  it('testFunc showResult', () => {
    const showResult = jest.spyOn(instance, 'showResult')
    showResult(1)
    expect(wrapper.state().showbtn).toEqual(true)
    showResult(0)
    expect(wrapper.state().showbtn).toEqual(false)
  })
  it('onChangeConfig基准项列表修改', () => {
    const onChangeConfig = jest.spyOn(instance, 'onChangeConfig')
    onChangeConfig([], [], true)
    expect(wrapper.state().baseValues).toEqual({
      isCheck: true,
      origList: [],
      dataList: []
    })
  })
  it('onChangeSoft软件列表修改', () => {
    const onChangeSoft = jest.spyOn(instance, 'onChangeSoft')
    onChangeSoft([], [], true)
    expect(wrapper.state().softValues).toEqual({
      isCheck: true,
      origList: [],
      dataList: []
    })
  })
  it('filterList列表筛选', () => {
    const filterList = jest.spyOn(instance, 'filterList')
    filterList()
  })
  it('testFunc onSubmit', () => {
    // const spyMessage = jest.spyOn(message, 'info')
    props.form.validateFields = (func) => {
      func(false, { name: 'afaf' })
    }
    // api.updateNetsegment = jest.fn()
    // api.updateNetsegment.mockReturnValue(
    //   Promise.resolve({
    //     head: { code: '200' }
    //   })
    // )
    // expect(spyMessage).toHaveBeenCalledWith('起始值应小于结束值')
    instance.onSubmit({ name: 'afafaf' })
    // expect(wrapper.state().values).toEqual({
    //   name: 'afafaf'
    // })
  })
})
