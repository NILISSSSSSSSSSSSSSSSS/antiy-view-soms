import React from 'react'
import Information  from '../index'
import { shallow } from 'enzyme'
import PropTypes from 'prop-types'
import api from '../../../../../services/api'
// import hasAuth from '@/u/auth'

jest.mock('lodash', () => ({
  debounce: jest.fn((fn => fn)),
  cloneDeep: jest.fn((fn => fn))
}))
jest.mock('dva/router')
jest.mock('@/a/permission')
jest.mock('@/u/auth', ()=>({
  hasAuth: jest.fn((fn => true))
}))

// hasAuth = jest.fn((fn => true))

jest.mock('../../../../../services/api')

const props = {
  location: {
    search: null
  },
  history: {
    push: jest.fn()
  }
}
const assetBody = {
  items: [
    {
      disabled: true,
      stringId: 666,
      name: 666,
      number: 666,
      categoryModel: 666,
      ips: 666,
      macs: 666,
      assetStatus: 6,
      gmtCreate: 666,
      serviceLife: 666,
      assetGroup: 666,
      operationSystemName: 666,
      assetSource: 666,
      importanceDegree: 666,
      manufacturer: 666,
      baselineTemplateName: 666,
      areaName: 666,
      responsibleUserName: 666,
      waitingTaskReponse: {
        taskId: 666
      }
    }
  ],
  totalRecords: 20
}
const store = {
  subscribe: () => ({
  }),
  dispatch: () =>({}),
  getState: () => ({
    asset: {
      assetBody
    }
  })
}
const options = {
  context: { store },
  childContextTypes: { store: PropTypes.object.isRequired }
}

describe('<Implementation />', () => {

  let wrapper, instance
  const assetBody2 = JSON.parse(JSON.stringify(assetBody))
  assetBody2.items[0].name = 777
  const nextProps = {
    assetBody: assetBody2
  }
  const selectedRowKeys = []
  const selectedRows0 = []
  const selectedRows1 = [{
    assetStatus: 6
  }]
  const selectedRows2 = [{
    baselineTemplateId: 1,
    assetStatus: 6
  }, {
    baselineTemplateId: 2,
    assetStatus: 6
  }]

  beforeEach(() => {
    const assetBody2 = JSON.parse(JSON.stringify(assetBody))
    assetBody2.items[0].name = 777
    const nextProps = {
      assetBody: assetBody2
    }
    wrapper = shallow(<Information {...props}/>).dive(options).dive(options)
    instance = wrapper.instance()
    instance.UNSAFE_componentWillReceiveProps(nextProps)
    // console.log(instance)
  })

  it('render <Information /> component', () => {
    expect(wrapper.find('.table-wrap')).toHaveLength(1)
  })

  it('testFunc UNSAFE_componentWillReceiveProps', () => {
    instance.UNSAFE_componentWillReceiveProps(nextProps)
  })

  it('testFunc tableHeaderChange', () => {
    const column = {
      key: 'baselineTemplateName'
    }
    instance.tableHeaderChange(column)
  })

  it('testFunc onSelectBtn', () => {
    const Arr = [1, 3, 4, 5, 6, 0, 2]
    Arr.forEach(item=>instance.onSelectBtn(item))
  })

  it('testFunc onSelectChange', () => {
    instance.onSelectChange(selectedRowKeys, selectedRows0)
    instance.onSelectChange(selectedRowKeys, selectedRows1)
    instance.onSelectChange(selectedRowKeys, selectedRows2)

    const nextProps2 = JSON.parse(JSON.stringify(nextProps))
    nextProps2.assetBody.items = null
    instance.UNSAFE_componentWillReceiveProps(nextProps)
    instance.onSelectChange(selectedRowKeys, selectedRows2)
  })

  it('testFunc registration', () => {
    instance.registration()
  })

  it('testFunc noRegistration', () => {
    instance.noRegistration(assetBody.items)
    instance.noRegistration(null, true)
  })

  it('testFunc noRegistrationCB', () => {
    api.assetNoRegister = jest.fn()
    api.assetNoRegister.mockReturnValue(
      Promise.resolve({
        head: { code: '200' },
        body: {  }
      })
    )
    instance.noRegistrationCB()
  })

  it('testFunc associatedSoftware', () => {
    instance.associatedSoftware()
    instance.onSelectChange(selectedRowKeys, selectedRows2)
    instance.associatedSoftware()
  })

  it('testFunc nowCLickGetInit', () => {
    const Arr = [
      {
        waitingTaskReponse: { taskId: 666 }
      }
    ]
    instance.nowCLickGetInit(Arr)
  })

  it('testFunc switchCB', () => {
    instance.switchCB(assetBody.items)
  })

  it('testFunc processOnClose', () => {
    instance.processOnClose(assetBody.items)
    instance.processOnClose(assetBody.items, true)
    const Arr = JSON.parse(JSON.stringify(assetBody.items))
    Arr[0].assetStatus = 7
    instance.processOnClose(Arr)
  })

  it('testFunc onRef', () => {
    instance.onRef(assetBody.items, 3)
  })

  it('testFunc pageChange', () => {
    instance.pageChange(1, 10)
  })

  it('testFunc handleTableSort', () => {
    instance.handleTableSort(null, null, { order: 'descend' })
    instance.handleTableSort(null, null, { order: 'ascend' })
    instance.handleTableSort(null, null, { order: null })
  })

  it('testFunc handleSubmit', () => {
    const valuesData = {
      multipleQuery: 666,
      categoryModels: 666,
      assetStatusList: 666,
      assetGroup: 666,
      operationSystem: 666,
      assetSource: 666,
      importanceDegree: 666,
      manufacturer: 666,
      areaIds: 666,
      responsibleUserId: 666,
      baselineTemplateId: 666,
      firstEnterStartTime: 666,
      firstEnterEndTime: 666,
      serviceLifeStartTime: 666,
      serviceLifeEndTime: 666,
      sortName: 666,
      sortOrder: 666,
      currentPage: 1,
      pageSize: 10
    }
    instance.handleSubmit(null)
    instance.handleSubmit(valuesData)

  })

  it('testFunc exportGetData', () => {
    instance.exportGetData()
  })

  it('testFunc operateJump', () => {
    const Arr = [1, 2, 3]
    Arr.forEach(v=> instance.operateJump(v, assetBody.items))
  })

  it('testFunc isTaskIdShow', () => {
    instance.isTaskIdShow(assetBody.items[0])
  })

  it('testFunc operateFunc', () => {
    instance.operateFunc(assetBody.items)
  })

  it('testFunc templateDownload and changeTemplateChecked', () => {
    instance.templateDownload()
    instance.changeTemplateChecked([666])
    instance.templateDownload()
  })

  it('testFunc itemsInit 0', () => {
    api.getAssetList = jest.fn()
    api.getAssetList.mockReturnValue(
      Promise.resolve({
        head: { code: '200' },
        body: { totalRecords: 0 }
      })
    )
    instance.itemsInit(nextProps)
  })

  it('testFunc itemsInit 1', () => {
    api.getAssetList = jest.fn()
    api.getAssetList.mockReturnValue(
      Promise.resolve({
        head: { code: '200' },
        body: { totalRecords: 1 }
      })
    )
    instance.itemsInit(nextProps)
  })

  it('testFunc exportAssets', () => {
    instance.exportAssets()
  })

  it('testFunc nowCLickCb', () => {
    api.getAssetList = jest.fn()
    api.getAssetList.mockReturnValue(
      Promise.resolve({
        head: { code: '201' },
        body: { }
      })
    )
    api.getAssetList()
  })

  it('shoulder render a Implementation',  ()=> {
    const app = wrapper.debug()
    expect(app).toMatchSnapshot()
  })

})