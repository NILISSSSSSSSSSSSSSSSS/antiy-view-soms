import React from 'react'
import { shallow } from 'enzyme'
import Login from './index'
import api from '@/services/api'
import PropTypes from 'prop-types'

// jest.mock('../../utils/common.js')
// jest.mock('../../services/api.js')

const props = {
  form: {
    getFieldDecorator: jest.fn(opts => c => c),
    validateFields: jest.fn(opts => c => c)
  },
  history: {
    push: ()=>{}
  }
}
const store = {
  subscribe: () => ({}),
  dispatch: jest.fn(opts => c => c),
  getState: () => ({
    system: { id: '', menus: [] }
  })
}
const options = {
  context: { store },
  childContextTypes: { store: PropTypes.object.isRequired }
}
const head = { code: '200' }
describe('<Login />', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallow(<Login { ...props }/>).dive(options).dive(options)
    // wrapper = shallow(<Login {...props}/>, options)
    // loginComponent = mount(<Login {...props}/>)
  })
  // it('render <Login /> component', () => {
  //   expect(wrapper.find('.login-content')).to.have.lengthOf(1)
  //   expect(wrapper.find(Carousel)).to.have.lengthOf(1)
  // })
  // it('初始化时status', () => {
  //   expect(loginComponent.state().msg).equal('')
  // })~
  it('handleSubmit', () => {
    const body = {
      a: '5',
      user_info: {
        menus: [ { tag: '1' } ],
        stringId: '5',
        name: '1',
        licenseVersion: '5',
        mustModifyPassword: false
      }
    }

    // expect(loginComponent.state().msg).equal('')
    const spyFunction_handleSubmit = jest.spyOn(wrapper.instance(), 'handleSubmit')
    api.login = jest.fn()
    api.login.mockReturnValue(Promise.resolve({
      head,
      body
    }))

    props.form.validateFields = (func) => {
      func(false, { username: 'lijian', password: '123456@Qa', imageCode: '112233' })
    }
    spyFunction_handleSubmit({ preventDefault: jest.fn() })
    props.form.validateFields = (func)=>{
      func(false, { username: '', password: '123456@Qa', imageCode: '112233' })
    }
    spyFunction_handleSubmit({ preventDefault: jest.fn() })

    props.form.validateFields = (func)=>{
      func(false, { username: 'lijian2', password: '', imageCode: '112233' })
    }
    spyFunction_handleSubmit({ preventDefault: jest.fn() })

    props.form.validateFields = (func)=>{
      func(false, { username: 'lijian2', password: '123456@Qa', imageCode: '' })
    }
    spyFunction_handleSubmit({ preventDefault: jest.fn() })
    api.login.mockReturnValue(Promise.resolve({ head: '500' }))
    spyFunction_handleSubmit({ preventDefault: jest.fn() })
  })
  it('getImageCodeUrl ==>获取验证码图片', function () {
    const spyFunction_getImageCodeUrl = jest.spyOn(wrapper.instance(), 'getImageCodeUrl')
    spyFunction_getImageCodeUrl()
    const imageCodeUrl = wrapper.state().imageCodeUrl
    expect(imageCodeUrl).toEqual(`api/v1/oauth/sys/code?time=${ Date.parse(new Date())}`)
  })

  // it('快照', ()=>{
  //   const app = wrapper.debug()
  //   expect(app).toMatchSnapshot()
  // })
})
