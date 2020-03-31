import React from 'react'
import { shallow } from 'enzyme'
import KnowledgeList from './index'

describe('测试<KnowledgeList />', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallow(<KnowledgeList />)
  })
  it('测试render <KnowledgeList /> component', () => {
    expect(wrapper.find('.bug-test')).toHaveLength(1)
  })
})