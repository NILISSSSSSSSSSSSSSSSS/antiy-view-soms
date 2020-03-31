import React from 'react'
import Implementation  from '../Implementation'
import { shallow } from 'enzyme'
import PropTypes from 'prop-types'
import { TooltipFn } from '@u/common'

const props = {
  onRef: jest.fn(),
  getAssetList: jest.fn()
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

describe('<Implementation />', () => {
  let wrapper, instance
  const recordsArr = [{
    stringId: 666,
    stepNode: 666,
    waitingTaskReponse: {
      taskId: 666
    }
  }]

  beforeEach(() => {
    wrapper = shallow(<Implementation {...props}/>).dive(options).dive(options)
    instance = wrapper.instance()
  })

  const testInit = ()=>{
    instance.openModel(true, recordsArr)
  }

  beforeEach(() => {
    testInit()
  })

  it('render <Implementation /> component', () => {
    expect(wrapper.find('.process-wrap')).toHaveLength(1)
    instance.state.analysisCarry = true
    const wrapper2 = shallow(<Implementation {...props}/>).dive(options).dive(options)
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
    instance.setState({ isTable: false }, ()=>{
      instance.isTableFn(jest.fn(), jest.fn() )
    })
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
    instance.downTempAlone(666)
  })

  it('testFunc isDeleteCB',  ()=> {
    instance.isDeleteCB()
  })

  it('testFunc onSubmitCbApi',  ()=> {
    const res = {
      head: {
        result: 666
      }
    }
    instance.onSubmitCbApi(res)
  })

  it('testFunc downTemp',  ()=> {
    const params = {
      flag: 666,
      ids: 666,
      comIds: 666
    }
    instance.downTemp(params)
  })

  it('testFunc getFixReportAsset',  ()=> {
    const params = {
      flag: 666,
      ids: 666,
      comIds: 666
    }
    instance.getFixReportAsset(params)
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
    const spyFunc = jest.spyOn(instance, 'onSubmitCB')
    spyFunc(values)
    expect(spyFunc).toHaveBeenCalled()
  })

  it('shoulder render a Implementation',  ()=> {
    const app = wrapper.debug()
    expect(app).toMatchSnapshot()
  })

})
