import { Component } from 'react'
import api from '@/services/api'
import CommonSearch from '@/components/common/Search'

const type = {
  apt: 'apt', // 高级威胁
  virus: 'virus', // 病毒威胁
  tanhai: 'tanhai'  //探海威胁
}

export default class Search extends Component {
  constructor (props) {
    super(props)
    this.state = {
      equList: [] // 所属的安全设备列表
    }
    this.filterFields = [
    ]
    this.defaultFields = [
      { label: '所属安全设备', allowClear: false, placeholder: '全部', key: 'safetyId', type: 'select', config: { name: 'name', value: 'id' } },
      { label: '检索条件', key: 'retrieve', type: 'input', placeholder: '全部', data: [], maxLength: 200 },
      { label: '时间范围', key: 'time', type: 'dateRange', placeholder: ['开始日期', '结束日期'], data: [ ] }
    ]
  }
  componentDidMount () {
    const { from } = this.props
    // 高级威胁
    if (from === type.apt){
      this.getAPTEqu()
    }else if (from === type.virus){
      this.getVirusEqu()
    }else if (from === type.tanhai){
      this.getTanhaiEqu()
    }
  }

  // 获取高级威胁所属的安全设备
  getAPTEqu = () => {
    api.getsafetythreataptEquip().then((res)=>{
      if(res){
        this.setState({ equList: res.body })
      }
    })
  }
  // 获取探海威胁所属的安全设备
  getTanhaiEqu = () => {
    api.getsafetythreattanhaiEquip().then((res)=>{
      if(res){
        this.setState({ equList: res.body })
      }
    })
  }

  // 获取病毒所属的安全设备
  getVirusEqu = () => {
    api.getsafetythreatvirusEquip().then((res)=>{
      if(res){
        this.setState({ equList: res.body })
      }
    })
  }
  // 重置查询
  handleReset = () => {
    const { reset } = this.props
    reset && reset()
  }

  handleSubmit = (values = {}) => {
    let params = { ...values }
    if(values.time && values.time.length > 0) {
      const [ beginTime, endTime ] = values.time
      params.beginTime = beginTime ? beginTime.valueOf() : ''
      params.endTime = endTime ? endTime.valueOf() : ''
      delete params.time
    }
    params.safetyId = values.safetyId
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
    const { safetyId, retrieve } = placeholder || {}
    const { equList } = this.state
    let label = ''
    // 高级威胁
    if (from === type.apt){
      label = '追溯时间'
    }else if (from === type.virus){
      label = '中毒时间'
    }else if (from === type.tanhai){
      label = '最后活跃时间'
    }
    const fields = this.setFilterData(this.defaultFields, [{ key: 'safetyId', data: equList, placeholder: safetyId }, { key: 'time', label }, { key: 'retrieve', placeholder: retrieve }])
    return (
      <div className="search-bar">
        <CommonSearch wrappedComponentRef={search => { search && (this.searchForm = search.props.form) }} defaultFields={fields} onSubmit={this.handleSubmit} onReset={this.handleReset}/>
      </div>
    )
  }
}
