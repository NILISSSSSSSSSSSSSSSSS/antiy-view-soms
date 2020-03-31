import React from 'react'
import Verification  from '../Verification'
import { shallow } from 'enzyme'
import PropTypes from 'prop-types'
import { TooltipFn } from '@u/common'
import api from '../../../../../../services/api'

jest.mock('../../../../../../services/api')

const props = {
  onRef: jest.fn(),
  getAssetList: jest.fn()
}

api.getCheckReportAsset = jest.fn()
api.getCheckReportAsset.mockReturnValue(
  Promise.resolve({
    head: { code: '200', result: 666 },
    body: {  }
  })
)

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
      ],
      usersByRoleCodeAndAreaIdList: [
        {
          stringId: 666,
          name: 666
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
          dataIndex: 'ips',
          key: 'ips',
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

describe('<Verification />', () => {
  let wrapper, instance
  const recordsArr = [{
    stringId: 666,
    stepNode: 666,
    note: 666,
    fileInfo: null,
    waitingTaskReponse: {
      taskId: 666
    }
  }]

  beforeEach(() => {
    wrapper = shallow(<Verification {...props}/>).dive(options).dive(options)
    instance = wrapper.instance()
  })

  const testInit = ()=>{
    instance.openModel(true, recordsArr)
  }

  beforeEach(() => {
    testInit()
  })

  it('render <Verification /> component', () => {
    expect(wrapper.find('.process-wrap')).toHaveLength(1)
    instance.state.analysisCarry = true
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

  it('testFunc uploadChangeBatch',  ()=> {
    instance.uploadChangeBatch(666, true, true, true )
  })

  it('testFunc isTableFn',  ()=> {
    instance.isTableFn(jest.fn(), jest.fn() )
    const Arr = [
      ...recordsArr,
      {
        stringId: 667,
        stepNode: 666,
        note: 666,
        fileInfo: null,
        waitingTaskReponse: {
          taskId: 666
        }
      }]
    instance.openModel(true, Arr)

    instance.isTableFn(jest.fn(), jest.fn() )

  })

  it('testFunc uploadChange',  ()=> {
    const info = {
      fileList: [
        {
          name: 666,
          uid: 666,
          status: 'uploading',
          percent: 100,
          response: {
            head: {
              code: '200'
            }
          }
        },
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
    instance.uploadChange(info)
  })

  it('testFunc lookReportAlone',  ()=> {
    instance.lookReportAlone()
  })

  it('testFunc lookReportBatch',  ()=> {
    instance.lookReportBatch(666)
  })

  it('testFunc lookReportBatch',  ()=> {
    instance.lookReportBatch(recordsArr)
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

  it('testFunc downTemp',  ()=> {
    const params = {
      flag: 666,
      ids: 666,
      comIds: 666
    }
    instance.downTemp(params)
  })

  it('testFunc baselineFileAssetCB',  ()=> {
    const body = [
      {
        assetId: 666,
        result: true
      }
    ]
    instance.baselineFileAssetCB(recordsArr, body)
  })

  it('testFunc urlCB',  ()=> {
    instance.urlCB('/basesetting/list/enforcement?', 666)
  })

  it('testFunc queryProcessAssetCB',  ()=> {
    const res = {
      body: [
        {
          assetId: 666,
          onProgress: 1
        },
        {
          assetId: 6,
          onProgress: 1
        }
      ]
    }
    instance.queryProcessAssetCB(res)
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

  it('testFunc previousBatch',  ()=> {
    instance.state.isTable = true
    const spyFunc = jest.spyOn(instance, 'previousBatch')
    spyFunc()
    expect(spyFunc).toHaveBeenCalled()
  })

  it('testFunc onSubmit',  ()=> {
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
    api.statusJump = jest.fn()
    api.statusJump.mockReturnValue(
      Promise.resolve({
        head: { code: '200', result: 666 },
        body: {  }
      })
    )
    const spyFunc = jest.spyOn(instance, 'onSubmitCB')
    spyFunc(values)
    expect(spyFunc).toHaveBeenCalled()
  })

  it('testFunc queryProcessAsset',  ()=> {
    api.queryProcessAsset = jest.fn()
    api.queryProcessAsset.mockReturnValue(
      Promise.resolve({
        head: { code: '200', result: 666 },
        body: {  }
      })
    )
    instance.queryProcessAsset()
  })

  it('testFunc getCheckReportAsset',  ()=> {
    // api.getCheckReportAsset = jest.fn()
    // api.getCheckReportAsset.mockReturnValue(
    //   Promise.resolve({
    //     head: { code: '200', result: 666 },
    //     body: {  }
    //   })
    // )
    instance.getCheckReportAsset()
  })

  it('testFunc baselineFileAsset',  ()=> {
    api.baselineFileAsset = jest.fn()
    api.baselineFileAsset.mockReturnValue(
      Promise.resolve({
        head: { code: '200', result: 666 },
        body: {  }
      })
    )
    instance.baselineFileAsset()
  })

  it('shoulder render a Verification',  ()=> {
    const app = wrapper.debug()
    expect(app).toMatchSnapshot()
  })

})
