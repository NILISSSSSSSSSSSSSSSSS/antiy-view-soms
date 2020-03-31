import { shallow } from 'enzyme'
import React from 'react'
// import api from '@/services/api'
import { InstallTemplate } from './index'
import { message } from 'antd'
import ModalConfirm from '@/components/common/ModalConfirm'
// jest.mock('../../../../services/api')
const props = {
  form: {
    validateFields: jest.fn(),
    resetFields: jest.fn(opts => c => c)
  },
  getFieldDecorator: jest.fn()
}

describe('render <InstallTemplate />', () => {
  const wrapper = shallow(<InstallTemplate {...props}/>)
  const instance = wrapper.instance()
  const spygetList = jest.spyOn(instance, 'getList')
  it('render', () => {
    expect(wrapper.find('.main-table-content')).toHaveLength(1)
    expect(wrapper.find(ModalConfirm)).toHaveLength(2)
  })
  it('getList', () => {
    spygetList()
  })
  it('PageChange', () => {
    const spypageChange = jest.spyOn(instance, 'pageChange')
    spypageChange(2, 20)
    expect(wrapper.state().pagingParameter).toEqual({
      currentPage: 2,
      pageSize: 20
    })
    expect(spygetList).toHaveBeenCalled()
  })
  it( 'isAlertDel弹窗', () => {
    const spyAlertDel = jest.spyOn(instance, 'isAlertDel' )
    let ststusArr = [1, 2, 3, 4]
    let newSelectedRowKeys = []
    spyAlertDel(ststusArr, newSelectedRowKeys)
    expect(spygetList).toHaveBeenCalled()
  })
  it( 'isAlertDel弹窗, 复选框取消一部分', () => {
    const spyAlertDel = jest.spyOn(instance, 'isAlertDel' )
    const spyMessage = jest.spyOn(message, 'warn')
    wrapper.setState({
      rowsSelectedList: []
    })
    spyAlertDel()
    expect(spyMessage).toHaveBeenCalledWith('请勾选数据')
    expect(spygetList).toHaveBeenCalled()
  })
  it('clearData删除', () => {
    const spyclearData = jest.spyOn(instance, 'clearData' )
    spyclearData()
    expect(spygetList).toHaveBeenCalled()
  })
  it('onIsUpDown', ()=> {
    const spyonIsUpDown = jest.spyOn(instance, 'onIsUpDown' )
    spyonIsUpDown()
    expect(spygetList).toHaveBeenCalled()
  })
  it( 'onSubmit查询', () => {
    const spyonSubmit = jest.spyOn(instance, 'onSubmit' )
    spyonSubmit({})
    expect(spygetList).toHaveBeenCalled()
  })
  it( '重置', () => {
    const spyHandleReset = jest.spyOn(instance, 'handleReset')
    spyHandleReset()
    expect(wrapper.state().pagingParameter).toEqual({
      pageSize: 10,
      currentPage: 1
    })
    expect(wrapper.state().search).toEqual({})
    expect(spygetList).toHaveBeenCalled()
  })

})