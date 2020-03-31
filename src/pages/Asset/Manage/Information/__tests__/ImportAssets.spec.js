import React from 'react'
import { shallow } from 'enzyme'
import  ImportAssets from '../ImportAssets'
import PropTypes from 'prop-types'
// import api from '../../../../../services/api'
// jest.mock('../../../../../services/api')

// const api = {}
// const resultPro = ()=>Promise.resolve({
//   head: { code: '200' },
//   body: { }
// })
// api.assetImportComputer = jest.fn()
// api.assetImportNet = jest.fn()
// api.assetImportSafety = jest.fn()
// api.assetImportStorage = jest.fn()
// api.assetImportOthers = jest.fn()

// api.assetImportComputer.mockReturnValue(resultPro())
// api.assetImportNet.mockReturnValue(resultPro())
// api.assetImportSafety.mockReturnValue(resultPro())
// api.assetImportStorage.mockReturnValue(resultPro())
// api.assetImportOthers.mockReturnValue(resultPro())

const props = {
  hardCategoryModelNode: ['计算设备', '网络设备', '安全设备', '存储设备', '其它设备']
}

const store = {
  subscribe: () => ({
  }),
  dispatch: () =>({}),
  getState: () => ({
    asset: { importAssetLoading: false }
  })
}
const options = {
  context: { store },
  childContextTypes: { store: PropTypes.object.isRequired }
}

describe('<ImportAssets />', () => {

  const wrapper = shallow(<ImportAssets {...props}/>).dive(options).dive(options)
  const instance = wrapper.instance()

  //   console.log(instance)
  it('render <ImportAssets /> component', () => {
    expect(wrapper.find('.Information')).toHaveLength(1)
  })

  it('testFunc submitPost', () => {
    const spyFunc = jest.spyOn(instance, 'submitPost')

    const cc = {
      preventDefault: jest.fn()
    }
    spyFunc(cc)
    expect(spyFunc).toHaveBeenCalled()
  })

  it('testFunc validator', () => {
    const spyFunc = jest.spyOn(instance, 'validator')
    spyFunc(null, '12.jpg', jest.fn())
    expect(spyFunc).toHaveBeenCalled()
  })

  it('testFunc inputCB', () => {
    const spyFunc = jest.spyOn(instance, 'inputCB')
    spyFunc()
    expect(spyFunc).toHaveBeenCalled()
  })

  it('testFunc submitPostCB', () => {
    const spyFunc = jest.spyOn(instance, 'submitPostCB')
    const values = { category: 2 }
    spyFunc(values)
    expect(spyFunc).toHaveBeenCalled()
  })

  it('testFunc submitPostCbFn', () => {
    const spyFunc = jest.spyOn(instance, 'submitPostCbFn')
    const res = { body: '2' }
    spyFunc(res)
    const res2 = { body: '导入失败' }
    spyFunc(res2)
    expect(spyFunc).toHaveBeenCalled()
  })

  it('testFunc submitPostCbFin', () => {
    const spyFunc = jest.spyOn(instance, 'submitPostCbFin')
    spyFunc()
    expect(spyFunc).toHaveBeenCalled()
  })

  it('shoulder render a ImportAssets',  ()=> {
    const app = wrapper.debug()
    expect(app).toMatchSnapshot()
  })
})