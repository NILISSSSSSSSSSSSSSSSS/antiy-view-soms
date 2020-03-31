import React, { Component } from 'react'
import { Form } from 'antd'
import { func, bool, object } from 'prop-types'
import { THREAT_GRADE, HAS_PLAN } from '@a/js/enume'
import { Search } from '@c/index'

@Form.create()
class BugSearch extends Component {
  static propTypes = {
    onSubmit: func,
    onReset: func,
    //是否有解决方案表单项，默认false
    isSolved: bool,
    //组件的不同项
    searchItems: object
  }
  constructor (props) {
    super(props)
    this.state = {
      fetching: false,
      bugNumbers: []
    }
  }

  componentDidMount () {

  }

  render () {
    const { isSolved = false, searchItems, onSubmit, onReset } = this.props
    let defaultFields = [
      { type: 'select', label: '危害等级', placeholder: '请选择', key: searchItems.level, showSearch: true, data: THREAT_GRADE },
      { type: 'input', label: '漏洞编号', placeholder: '请输入', key: searchItems.number, allowClear: true, maxLength: 60 },
      { type: 'input', label: '漏洞名称', placeholder: '请输入', key: searchItems.name, allowClear: true, maxLength: 512 }
    ]
    if (isSolved) {
      defaultFields.push({ type: 'select', label: '是否有解决方案', placeholder: '请选择', key: 'solved', showSearch: true, data: HAS_PLAN })
    }
    return (
      <div className="search-bar">
        <Search
          defaultFields={defaultFields}
          onSubmit={values => onSubmit(values)}
          onReset={onReset}
          wrappedComponentRef={(search) => { search && (this.searchForm = search.props.form) }}
        />
      </div>
    )
  }

  //表单重置
  handleReset = () => {
    const { onReset, form } = this.props
    form.resetFields()
    onReset()
  }

}

export default BugSearch
