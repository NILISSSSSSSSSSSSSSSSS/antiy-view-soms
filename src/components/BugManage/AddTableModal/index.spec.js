import React from 'react'
import { message } from 'antd'
import { shallow } from 'enzyme'
import AddTableModal from './index'

describe('测试<AddTableModal />', () => {
  const props = {
    body: {
      item: []
    },
    onClose: () => {},
    onChange: () => {},
    onConfirm: () => {}
  }
  let wrapper = shallow(<AddTableModal {...props} />)
  it('测试render <AddTableModal /> component', () => {
    expect(wrapper.find('.main-table-content')).toHaveLength(1)
  })
  it('测试close', () => {
    const instance = wrapper.instance()
    const close = jest.spyOn(instance, 'close')
    close()
    expect(wrapper.state().selectedRowKeys).toEqual([])
  })
  it('测试confirm，无勾选数据', () => {
    const instance = wrapper.instance()
    const confirm = jest.spyOn(instance, 'confirm')
    const spyMessage = jest.spyOn(message, 'info')
    wrapper.setState({
      selectedRowKeys: []
    })
    confirm()
    expect(spyMessage).toHaveBeenCalledWith('请选择数据！')
  })
  it('测试confirm,有勾选数据', () => {
    const instance = wrapper.instance()
    const confirm = jest.spyOn(instance, 'confirm')
    wrapper.setState({
      selectedRowKeys: [{}]
    })
    confirm()
    expect(confirm).toHaveBeenCalled()
  })
  it('测试pageChange', () => {
    const instance = wrapper.instance()
    const pageChange = jest.spyOn(instance, 'pageChange')
    pageChange()
    expect(pageChange).toHaveBeenCalled()
  })
})