import React from 'react'
import ProBasic from '../ProBasic'
import { shallow } from 'enzyme'

const fileInfo = [{
  'url': '666',
  'fileName': '666'
}]
const props = {
  basicObj: {
    remarkName: 666,
    note: 666,
    fileInfo: JSON.stringify(fileInfo)
  }
}

describe('<ProBasic />', () => {
  const wrapper = shallow(<ProBasic {...props}/>)

  it('render <AssetsSearch /> component', () => {
    expect(wrapper.find('.basic-info')).toHaveLength(1)
  })
  it('test <a></a> click',  ()=> {
    wrapper.find('a').simulate('click')
  })

  it('shoulder render a ProBasic',  ()=> {
    const app = wrapper.debug()
    expect(app).toMatchSnapshot()
  })

})