import { shallow } from 'enzyme'
import React from 'react'
import { PatchTable } from './index'

const props = {
  location: {
    search: 'JhLbOb5lPQs9fbep/UIXzw=='
  },
  form: {
    validateFields: jest.fn()
  },
  children: jest.fn()
}

describe('渲染 <PatchTable />', () => {
  const wrapper = shallow(<PatchTable {...props}/>)
  const instance = wrapper.instance()
  const spygetPatchData = jest.spyOn(instance, 'getPatchData')
  it('render', () => {
    expect(wrapper.find('.table-wrap')).toHaveLength(1)
  })
  it('showAdd', () => {
    const spyshowAdd = jest.spyOn(instance, 'showAdd')
    spyshowAdd()
  })
  it('编辑时获取数据测试', () => {
    wrapper.setState({
      isEdit: this.props.isEdit
    })
    spygetPatchData()
  })

  it('前端保存列表数据', () => {
    const spysavePatch = jest.spyOn(instance, 'savePatch')
    spysavePatch()
    expect(spygetPatchData).toHaveBeenCalled()
  })
  it( '关闭弹窗', () => {
    const spyclosePatch = jest.spyOn(instance, 'closePatch')
    spyclosePatch()
    expect(spygetPatchData).toHaveBeenCalled()
  })
})