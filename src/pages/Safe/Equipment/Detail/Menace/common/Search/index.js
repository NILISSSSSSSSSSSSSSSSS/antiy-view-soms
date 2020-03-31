import { Component } from 'react'
import CommonSearch from '@/components/common/Search'

const type = {
  apt: 'apt', // 高级威胁
  virus: 'virus', // 病毒威胁
  tanhai: 'tanhai'  //探海威胁
}
export default class Search extends Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.defaultFields = [
      { label: '检索条件', key: 'retrieve', type: 'input', placeholder: 'IP/端口', data: [], maxLength: 200 },
      { label: '时间范围', key: 'time', type: 'dateRange', placeholder: ['开始日期', '结束日期'], data: [ ] }
    ]
  }
  // 重置查询
  handleReset = () => {
    const { reset, search } = this.props
    if(reset){
      reset()
    }else {
      search({})
    }
  }
  // 提交查询
  handleSubmit = (values = {}) => {
    let params = { ...values }
    if(values.time && values.time.length > 0) {
      const [ beginTime, endTime ] = values.time
      params.beginTime = beginTime ? beginTime.valueOf() : ''
      params.endTime = endTime ? endTime.valueOf() : ''
      delete params.time
    }
    params.multipleQuery = values.retrieve
    const { search } = this.props
    search && search(params)
  }
  /**
   * 给查询条件设置查询选项值
   * @param fields
   * @param list
   * @return {any[]}
   */
  setFilterData = (fields = [], list = []) => {
    return fields.map((e)=>{
      const currentData = list.find(it=>it.key === e.key) || {}
      if(e.key === currentData.key){
        return { ...e, ...currentData, data: currentData.data }
      }
      return e
    })
  }
  render () {
    const { placeholder, from } = this.props
    const { retrieve } = placeholder || {}
    let label = ''
    // 高级威胁
    if (from === type.apt){
      label = '追溯时间'
    }else if (from === type.virus){
      label = '中毒时间'
    }else if (from === type.tanhai){
      label = '最后活跃时间'
    }
    const fields = this.setFilterData(this.defaultFields, [{ key: 'retrieve', placeholder: retrieve }, { key: 'time', label }])
    return (
      <div className="search-bar">
        <CommonSearch wrappedComponentRef={search => { search && (this.searchForm = search.props.form) }} defaultFields={fields} onSubmit={this.handleSubmit} onReset={this.handleReset}/>
      </div>
    )
  }
}
