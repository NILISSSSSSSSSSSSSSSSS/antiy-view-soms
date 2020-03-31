import React from 'react'
import { AssetsSearch } from '../index'
import { shallow } from 'enzyme'
import PropTypes from 'prop-types'

// jest.mock('@/utils/common')
// jest.mock('@/services/api')
jest.mock('dva/router')
jest.mock('moment', ()=>jest.fn())
// jest.mock('@/components/common/DateRange')

const props = {

  location: {
    search: null

  },
  handleSubmit: jest.fn()
}

const comProp = {
  id: 1,
  value: '666'
}
const store = {
  subscribe: () => ({
  }),
  dispatch: () =>({}),
  getState: () => ({
    asset: {
      getAssetsOS: [comProp],
      manufacturerList: [
        {
          value: '666'
        }
      ],
      groupInfoBody: [comProp],
      userInAssetList: [comProp],
      userAreaTree: {
        childrenNode: [
          { fullName: '区域2',
            stringId: 'Uk7e0x3xPVlH6l8t9bL8Vw==' }
        ],
        fullName: '区域',
        stringId: 'Uk7e0x3xPVlH6l8t9bL6Vw=='
      },
      baselineTemplate: [comProp]
    }
  })
}
const options = {
  context: { store },
  childContextTypes: { store: PropTypes.object.isRequired }
}

describe('<AssetsSearch />', () => {

  const wrapper = shallow(<AssetsSearch {...props}/>).dive(options).dive(options)
  const instance = wrapper.instance()

  // console.log(instance)

  it('render <AssetsSearch /> component Branches', () => {
    const props2 = {
      location: {
        search: {
          conditionShow: true,
          assetStatusList: null
        }
      }
    }
    const wrapper2 = shallow(<AssetsSearch {...props2}/>).dive(options).dive(options)
    expect(wrapper2.find('.search-bar')).toHaveLength(1)
  })

  it('render <AssetsSearch /> component', () => {
    expect(wrapper.find('.search-bar')).toHaveLength(1)
  })

  it('testFunc showCondition',  ()=> {
    instance.showCondition()
    expect(instance.state.isExpand).toBeTruthy()
  })

  it('testFunc submitControl',  ()=> {
    const val = {
      _d: 'Tue Oct 08 2019 00:00:00 GMT+0800 (中国标准时间)',
      _f: 'YYYY-MM-DD HH:mm:ss',
      _i: '2019-10-08 00:00:00',
      _isAMomentObject: true,
      _isUTC: false,
      _isValid: true,
      _locale: null,
      _pf: null
    }
    // instance.showCondition()
    const spyFunc = jest.spyOn(instance, 'showCondition')
    spyFunc(val, ' 00:00:00')
    expect(spyFunc).toHaveBeenCalled()

  })

  it('testFunc handleReset',  ()=> {
    const spyFunc = jest.spyOn(instance, 'handleReset')
    spyFunc()
    expect(spyFunc).toHaveBeenCalled()
  })

  it('shoulder render a AssetsSearch',  ()=> {
    const app = wrapper.debug()
    expect(app).toMatchSnapshot()
  })

})

