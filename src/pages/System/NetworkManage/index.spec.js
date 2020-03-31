import React from 'react'
import { shallow } from 'enzyme'
import api from '@/services/api'
import { PortManage } from './index'

// jest.mock('../../../../services/api')
const mocks = [
  '@/components/common/ModalConfirm',
  './networkModal',
  '@/permission'
]
mocks.forEach((el) => {
  jest.mock(el)
})

const props = {
  location: {
    search: '?stringId=326'
  }
}
describe('网段详情<PortManage />', () => {
  let wrapper = shallow(<PortManage {...props} />)
  const instance = wrapper.instance()
  const spyToConfigItem = jest.spyOn(instance, 'getList')
  it('<PortManage />正常渲染', () => {
    expect(wrapper.find('.main-table-content')).toHaveLength(1)
  })
  it('getDetail==>请求返回数据', () => {
    api.getNetsegment = jest.fn()
    api.getNetsegment.mockReturnValue(
      Promise.resolve({
        head: { code: '200' }
      })
    )
    spyToConfigItem({
      body: {
        items: [],
        totalRecords: 10
      }
    })
    expect(api.getNetsegment).toHaveBeenCalled()
  })
  it('showEdit编辑弹框', () => {
    const showEdit = jest.spyOn(instance, 'showEdit')
    showEdit(0, {})
    expect(wrapper.state().modalData).toEqual(null)
    showEdit(1, { name: 'test' })
    expect(wrapper.state().modalData).toEqual({
      name: 'test'
    })
  })
  it('showDel删除弹框', () => {
    const showDel = jest.spyOn(instance, 'showDel')
    showDel(11)
    expect(wrapper.state().removeId).toEqual(11)
    expect(wrapper.state().showDel).toEqual(true)
  })
  it('sureDel确认删除', async () => {
    const sureDel = jest.spyOn(instance, 'sureDel')
    api.delNetsegment = jest.fn()
    api.delNetsegment.mockReturnValue(
      Promise.resolve({
        head: { code: '200' }
      })
    )
    await sureDel()
    expect(wrapper.state().showDel).toEqual(true)
    expect(spyToConfigItem).toHaveBeenCalled()
  })
  it('sureAdd确认编辑', () => {
    const sureAdd = jest.spyOn(instance, 'sureAdd')
    sureAdd()
    expect(wrapper.state().showEdit).toEqual(false)
    expect(wrapper.state().modalData).toEqual(null)
    expect(spyToConfigItem).toHaveBeenCalled()
  })
  it('handleCancel取消删除', () => {
    const handleCancel = jest.spyOn(instance, 'handleCancel')
    handleCancel()
    expect(wrapper.state().showEdit).toEqual(false)
    expect(wrapper.state().showDel).toEqual(false)
  })
  it('handleSubmit提交表单，执行查询', () => {
    const spyHandleSubmit = jest.spyOn(instance, 'handleSubmit')
    wrapper.setState({
      pagingParameter: {
        pageSize: 10,
        currentPage: 2
      }
    })
    spyHandleSubmit({
      name: '020100105'
    })
    expect(wrapper.state().pagingParameter.currentPage).toEqual(1)
    expect(wrapper.state().values).toEqual({
      name: '020100105'
    })
    expect(spyToConfigItem).toHaveBeenCalled()
  })
  it('changePage分页', () => {
    const changePage = jest.spyOn(instance, 'changePage')
    changePage(1, 10)
    expect(wrapper.state().pagingParameter).toEqual({
      pageSize: 10,
      currentPage: 1
    })
    expect(spyToConfigItem).toHaveBeenCalled()
  })
})
