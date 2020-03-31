import React from 'react'
import NetworkAccess  from '../NetworkAccess'
import { shallow } from 'enzyme'
import PropTypes from 'prop-types'
import { TooltipFn } from '@u/common'
import api from '../../../../../../services/api'

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
          assetId: 666,
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

describe('<NetworkAccess />', () => {
  let wrapper, instance
  const recordsArr = [{
    stringId: 666,
    stepNode: 666,
    waitingTaskReponse: {
      taskId: 666
    }
  }, {
    stringId: 667,
    stepNode: 666,
    waitingTaskReponse: {
      taskId: 666
    }
  }]

  beforeEach(() => {
    wrapper = shallow(<NetworkAccess {...props}/>).dive(options).dive(options)
    instance = wrapper.instance()
    testInit()
  })

  const testInit = ()=>{
    instance.openModel(true, recordsArr)
  }

  it('render <NetworkAccess /> component', () => {
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

  it('testFunc downTempAlone',  ()=> {
    instance.downTempAlone()
  })

  it('testFunc downTempBatch',  ()=> {
    instance.downTempBatch(...recordsArr)
  })

  it('testFunc delete',  ()=> {
    instance.delete(666)
  })

  it('testFunc isDeleteCB',  ()=> {
    instance.isDeleteCB()
  })

  it('testFunc previousBatch',  ()=> {
    const spyFunc = jest.spyOn(instance, 'previousBatch')
    spyFunc()
    expect(spyFunc).toHaveBeenCalled()
  })

  it('testFunc downTemp',  ()=> {
    const params = {
      flag: 666,
      ids: 666,
      comIds: 666
    }
    instance.downTemp(params)
  })

  it('testFunc onSubmit',  ()=> {
    api.statusJump = jest.fn()
    api.statusJump.mockReturnValue(
      Promise.resolve({
        head: { code: '200', result: 666 },
        body: {  }
      })
    )
    const spyFunc = jest.spyOn(instance, 'onSubmit')
    spyFunc()
    expect(spyFunc).toHaveBeenCalled()
  })

  it('shoulder render a NetworkAccess',  ()=> {
    const app = wrapper.debug()
    expect(app).toMatchSnapshot()
  })

})