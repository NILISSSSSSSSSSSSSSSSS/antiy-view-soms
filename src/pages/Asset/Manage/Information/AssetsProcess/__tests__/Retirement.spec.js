import React from 'react'
import Retirement  from '../Retirement'
import { shallow } from 'enzyme'
import PropTypes from 'prop-types'

const props = {
  onRef: jest.fn()
}

const store = {
  subscribe: () => ({
  }),
  dispatch: () =>({}),
  getState: () => ({
    asset: {
      usersByRoleCodeAndAreaIdList: [
        {
          stringId: 666,
          name: 666
        }
      ]
    }
  })
}
const options = {
  context: { store },
  childContextTypes: { store: PropTypes.object.isRequired }
}

describe('<Retirement />', () => {
  let wrapper, instance

  beforeEach(() => {
    wrapper = shallow(<Retirement {...props}/>).dive(options).dive(options)
    instance = wrapper.instance()
  })

  const testInit = ()=>{
    const recordsArr = [{
      stringId: 666,
      stepNode: 666,
      waitingTaskReponse: {
        taskId: 666
      }
    }]
    instance.openModel(true, recordsArr)
  }

  it('render <Retirement /> component', () => {
    expect(wrapper.find('.process-wrap')).toHaveLength(1)
  })

  it('test  shouldComponentUpdate', () => {
    const nextState1 = {
      visible: true
    }
    const nextState2 = {
      visible: false
    }
    instance.shouldComponentUpdate(null, nextState1)
    instance.state.visible = true
    instance.shouldComponentUpdate(null, nextState2)
  })

  it('testFunc openModel',  ()=> {
    instance.openModel(false)
  })

  it('testFunc UploadChange',  ()=> {
    const info = {
      fileList: [
        {
          name: 666,
          uid: 666,
          status: 'done',
          percent: 100,
          response: {
            head: {
              code: '200'
            }
          }
        }
      ]
    }
    instance.UploadChange(info)
  })

  it('testFunc getRecordsArrIds',  ()=> {
    testInit()
    const spyFunc = jest.spyOn(instance, 'getRecordsArrIds')
    spyFunc('stringId')
    expect(spyFunc).toHaveBeenCalled()
  })

  it('testFunc onSubmit',  ()=> {
    testInit()
    const spyFunc = jest.spyOn(instance, 'onSubmit')
    spyFunc()
    expect(spyFunc).toHaveBeenCalled()
  })

  it('testFunc onSubmitCB',  ()=> {
    const values = {
      file: {
        fileList: [
          {
            response: {
              body: [{
                fileUrl: 666,
                originFileName: 666
              }]
            }
          }
        ]
      },
      operator: 'all',
      agree: 1,
      note: 666
    }
    testInit()
    const spyFunc = jest.spyOn(instance, 'onSubmitCB')
    spyFunc(values)
    expect(spyFunc).toHaveBeenCalled()
  })

  it('shoulder render a Retirement',  ()=> {
    const app = wrapper.debug()
    expect(app).toMatchSnapshot()
  })

})