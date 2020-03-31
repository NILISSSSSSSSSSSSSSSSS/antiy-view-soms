import React from 'react'
import { shallow } from 'enzyme'
import api from '@/services/api'
import Scan  from './index'

jest.mock('react-router-dom')
jest.mock('@/services/api')

const props = {
  onClose: jest.fn(),
  onBackstage: jest.fn(),
  onStopFind: jest.fn(),
  goTo: jest.fn(),
  scanUrl: 'scanUrl'
}

describe('测试<Scan />', () => {
  let wrapper =  shallow(<Scan {...props} />)
  const instance = wrapper.instance()
  it('测试render <Scan /> component', () => {
    expect(wrapper.find('.over-scroll-modal')).toHaveLength(1)
  })
  it('测试scaning', () => {
    const scaning = jest.spyOn(instance, 'scaning')
    const spyFunction = jest.spyOn(api, 'scanUrl')
    wrapper.setState({
      onProgress: 10
    })
    scaning()
    expect(scaning).toHaveBeenCalled()
    expect(spyFunction).toHaveBeenCalled()
    expect(wrapper.state().errorMessage).toEqual('')
  })
  it('测试setInterval', () => {
    const setInterval = jest.spyOn(instance, 'setInterval')
    setInterval()
    expect(setInterval).toHaveBeenCalled()
  })
  it('测试jumpPage,time10', () => {
    const jumpPage = jest.spyOn(instance, 'jumpPage')
    wrapper.setState({
      time: 10
    })
    jumpPage()
    expect(jumpPage).toHaveBeenCalled()
    expect(wrapper.state().time).toEqual(9)
  })
  it('测试jumpPage,time1', () => {
    const jumpPage = jest.spyOn(instance, 'jumpPage')
    wrapper.setState({
      time: 1
    })
    jumpPage()
    expect(jumpPage).toHaveBeenCalled()
  })
  it('测试backstage', () => {
    const backstage = jest.spyOn(instance, 'backstage')
    backstage()
    expect(backstage).toHaveBeenCalled()
  })
  it('测试stopFind', () => {
    const stopFind = jest.spyOn(instance, 'stopFind')
    stopFind()
    expect(stopFind).toHaveBeenCalled()
    expect(wrapper.state().isCloseShow).toEqual(true)
  })
  it('测试close', () => {
    const close = jest.spyOn(instance, 'close')
    close()
    expect(close).toHaveBeenCalled()
  })
  it('测试clearInterval', () => {
    const clearInterval = jest.spyOn(instance, 'clearInterval')
    clearInterval()
    expect(clearInterval).toHaveBeenCalled()
  })

})