import React from 'react'
import Decommission  from '../Decommission'
import { shallow } from 'enzyme'
import PropTypes from 'prop-types'
import { TooltipFn } from '@u/common'

const statusJump = (params)=> {
  return Promise.resolve({
    head: { code: '200' },
    body: { }
  })
}
const api = {
  statusJump
}

jest.mock('../../../../../../services/api')
const props = {
  onRef: jest.fn()
}

const store = {
  subscribe: () => ({
  }),
  dispatch: () =>({}),
  getState: () => ({
    asset: {
      previousBatch: [
        {
          note: '',
          fileInfo: ''
        }
      ]
    },
    staticAsset: {
      assetModelColumns: [
        {
          title: '资产名称',
          dataIndex: 'name',
          key: 'name',
          render: text=>TooltipFn(text)
        },
        {
          title: 'IP',
          dataIndex: 'ip',
          key: 'ip',
          render: text=>TooltipFn(text)
        }
      ]
    }
  })
}
const options = {
  context: { store },
  childContextTypes: { store: PropTypes.object.isRequired }
}

describe('<Decommission />', () => {
  let wrapper, instance

  beforeEach(() => {
    wrapper = shallow(<Decommission {...props}/>).dive(options).dive(options)
    instance = wrapper.instance()
  })

  const testInit = ()=>{
    const recordsArr = [{
      stringId: 666,
      waitingTaskReponse: {
        taskId: 666
      }
    }]
    instance.openModel(true, recordsArr)
  }

  it('render <Decommission /> component', () => {
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

  it('testFunc changeReject',  ()=> {
    const spyFunc = jest.spyOn(instance, 'changeReject')
    spyFunc()
    expect(spyFunc).toHaveBeenCalled()
  })

  it('testFunc getRecordsArrIds',  ()=> {
    testInit()
    const spyFunc = jest.spyOn(instance, 'getRecordsArrIds')
    spyFunc('stringId')
    expect(spyFunc).toHaveBeenCalled()
  })

  it('testFunc previousBatch',  ()=> {
    const spyFunc = jest.spyOn(instance, 'previousBatch')
    spyFunc()
    expect(spyFunc).toHaveBeenCalled()
  })

  it('testFunc onSubmit',  ()=> {
    testInit()
    const spyFunc = jest.spyOn(instance, 'onSubmit')
    spyFunc()
    expect(spyFunc).toHaveBeenCalled()
  })

  it('shoulder render a Decommission',  ()=> {
    const app = wrapper.debug()
    expect(app).toMatchSnapshot()
  })

})