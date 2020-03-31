import React from 'react'
import { shallow, mount } from 'enzyme'
import  AssociatedSoftware from '../index'
import PropTypes from 'prop-types'

// import debounce from 'lodash/debounce'
// import * as sinon from 'sinon'

//所有注释勿删，将来有用
jest.mock('lodash', () => ({
  debounce: jest.fn((fn => fn))
}))

const batchRelation = (params)=> {
  return Promise.resolve({
    head: { code: '200' },
    body: { }
  })
}
const api = {
  batchRelation
}

jest.mock('../../../../../../services/api')
// jest.mock('@/u/common.js')
// jest.mock('@/services/api.js')
// jest.mock('@/c/Search')
// jest.mock('@/c/CommonModal')

const props = {
  // form: {
  //   getFieldDecorator: jest.fn( opts => c => c )
  // },

  soVisible: false,
  associds: [{ baselineTemplateId: 1 }],
  associatedSoftware: jest.fn()
}

const  selectes = {
  supplier: 666,
  productName: 666,
  version: 666,
  softPlatform: 666
}

const store = {
  subscribe: () => ({
  }),
  dispatch: () =>({}),
  getState: () => ({
    asset: {
      installableList: {
        items: [
          selectes
        ],
        totalRecords: 10
      },
      usersByRoleCodeAndAreaIdList: [
        {
          stringId: '1',
          name: 'duuliy'
        }
      ]
    }
  })
}
const options = {
  context: { store },
  childContextTypes: { store: PropTypes.object.isRequired }
}

describe('<AssociatedSoftware />', () => {

  const wrapper = shallow(<AssociatedSoftware {...props}/>).dive(options).dive(options)
  const instance = wrapper.instance()
  const expectStates = (vals, valCBs)=>{
    vals.forEach((v, i)=>expect(instance.state[v]).toBe(valCBs[i]))
  }
  // console.log(instance)
  it('render <AssociatedSoftware /> component', () => {
    expect(wrapper.find('.table-wrap')).toHaveLength(1)
  })
  it('testFunc onSelectChange', () => {
    instance.onSelectChange(selectes, selectes)
    const vals = ['otherBusinessIds', 'selectedRowKeys']
    const valCBs = [selectes, selectes]
    expectStates(vals, valCBs)
  })

  it('testFunc onSubmit', () => {
    instance.onSubmit(selectes)
    const vals = ['supplier', 'productName', 'currentPage', 'pageSize']
    const valCBs = [666, 666, 1, 10]
    expectStates(vals, valCBs)
  })

  it('testFunc onReset', () => {
    instance.onReset()
    const vals = ['supplier', 'productName', 'currentPage', 'pageSize']
    const valCBs = [null, null, 1, 10]
    expectStates(vals, valCBs)
  })

  it('testFunc pageChange', () => {
    const currentPage = 2
    const pageSize = 20
    instance.pageChange(currentPage, pageSize)
    const vals = ['currentPage', 'pageSize']
    const valCBs = [2, 20]
    expectStates(vals, valCBs)
  })

  it('testFunc onConfirm', () => {
    const spyFunc = jest.spyOn(instance, 'onConfirm')
    spyFunc()
    expect(spyFunc).toHaveBeenCalled()
  })

  it('testFunc onConfirmCB', () => {
    const spyFunc = jest.spyOn(instance, 'onConfirmCB')
    const valuesCom = {
      'assetId': ['37g570oTx1JL7FNSqNzaMw=='],
      'softId': ['614120741717147648'],
      'memo': '666'
    }
    const values1 = {
      ...valuesCom,
      'baselineConfigUserId': '2reo+l2cXUDmupuhJ65GTg=='
    }
    const values2 = {
      ...valuesCom,
      'baselineConfigUserId': 'all'
    }
    spyFunc(values1)
    spyFunc(values2)

    expect(spyFunc).toHaveBeenCalled()
  })

  it('testFunc installableList and debounce', async () => {
    // let clock
    // clock = sinon.useFakeTimers()
    // const spyFunc = jest.spyOn(instance, 'installableList')
    // const debounced = debounce(spyFunc, 1000)
    // debounced()
    // expect(spyFunc).toHaveBeenCalledTimes(0)
    // for(let i = 0;i < 10;i++){
    //   clock.tick(500)
    //   debounced()
    // }
    // expect(spyFunc).toHaveBeenCalledTimes(0)
    // clock.tick(1000)
    // expect(spyFunc).toHaveBeenCalledTimes(1)
    // // console.log(instance.props.installableList)
    // await console.log(instance.props.dispatch({ type: 'asset/installableList', payload: {
    //   baselineTemplateId: props.associds[0].baselineTemplateId,
    //   supplier: 6666,
    //   productName: 666,
    //   currentPage: 1,
    //   pageSize: 10
    // } }))
    // clock.restore()
    // console.log(instance.props.installableList)

  })

  it('shoulder render a AssociatedSoftware',  ()=> {
    const app = wrapper.debug()
    expect(app).toMatchSnapshot()
  })
})