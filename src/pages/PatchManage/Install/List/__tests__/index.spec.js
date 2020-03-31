import React from 'react'
import { shallow, mount } from 'enzyme'
import { InstallList } from '../index'

jest.mock('../../../../../services/api')

const props = {
  location: {
    search: '?status=1'
  }
}

describe('补丁知识库列表页 <Knowledge>', () => {
  let wrapper
  wrapper = shallow(<InstallList {...props}  />)
  it('补丁安装管理 component', () => {
    expect(wrapper.find('.patch-install-container')).toHaveLength(1)
  })
})