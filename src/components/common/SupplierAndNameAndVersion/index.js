/**
 * Jian Li
 * 2019/10/14 13:36
 * desc:
 **/
import React, { Component } from 'react'
import { Select } from 'antd'
import api from '@/services/api'
import './index.less'

const Option = Select.Option
const isNull = { name: '全部', value: null }
const SCENE = {
  performance: 1,
  feature: 2,
  version: 3
}
export default class SupplierAndNameAndVersion extends Component {
  constructor (props) {
    super(props)
    const { isSearch } = this.props
    this.state = {
      supplierList: isSearch ? [isNull] : [],
      nameList: isSearch ? [isNull] : [],
      versionList: isSearch ? [isNull] : []
    }
  }
  componentDidMount () {
    this.getSupplierList()
  }

  /**
   * 获取厂商列表数据
   */
  getSupplierList = () => {
    const { scene } = this.props
    return api.getSafetySupplier({ use: SCENE[scene] }).then(res=>{
      const { isSearch } = this.props
      const supplierList = isSearch ? [ isNull ].concat((res.body || []).map(e=>({ name: e.val, value: e.val }))) : (res.body || [])
      this.setState({ supplierList })
      return res
    })
  }
  /**
   * 获取名称列表数据
   */
  getNameList = (params) => {
    const { scene } = this.props
    return api.getSafetyName({ ...params, use: SCENE[scene] }).then(res=>{
      const { isSearch } = this.props
      const nameList = isSearch ? [ isNull ].concat((res.body || []).map(e=>({ name: e.val, value: e.val }))) : (res.body || [])
      this.setState({ nameList })
      return res
    })
  }
  /**
   * 获取版本列表数据
   */
  getVersionList = (params) => {
    const { scene } = this.props
    return api.getSafetyVersion({ ...params, use: SCENE[scene] }).then(res=>{
      const { isSearch } = this.props
      const versionList = isSearch ? [ isNull ].concat((res.body || []).map(e=>({ name: e.val, value: e.businessId }))) : (res.body || [])
      this.setState({ versionList })
      return res
    })
  }
  onSelect = (type, key) => {
    const {  onChange, form, id, value } = this.props
    const { supplier, name } = value || {}
    if(type === 'supplier'){
      key && this.getNameList({ supplier: key })
      const _value = { supplier: key, name: null, businessId: null }
      onChange && onChange(_value)
      form && form.setFieldsValue({ [id]: _value })
    }else if(type === 'name'){
      key && this.getVersionList({ supplier, name: key })
      const _value = { supplier, name: key, businessId: null }
      onChange && onChange(_value)
      form && form.setFieldsValue({ [id]: _value })
    }else if(type === 'version'){
      const _value = { supplier, name, businessId: key }
      onChange && onChange(_value)
      form && form.setFieldsValue({ [id]: _value })
    }
  }
  render () {
    const { placeholder, value } = this.props
    const { supplierList, nameList, versionList } = this.state
    const { supplier = null, name = null, businessId = null } = value || {}
    const _supplierList = supplierList || []
    const _nameList = nameList || []
    const _versionList = versionList || []
    const _placeholder = placeholder || []
    return (
      <div className="SupplierAndNameAndVersion-container">
        <span className="SupplierAndNameAndVersion-item">
          <span className="SupplierAndNameAndVersion-item-label">
            厂商:
          </span>
          <Select value={supplier} className="SupplierAndNameAndVersion-item-value" onSelect={(key)=>this.onSelect('supplier', key)} placeholder={_placeholder[0]}>
            { _supplierList.map((e) => {
              return <Option key={ e.value } value={ e.value }>{ e.name }</Option>
            }) }
          </Select>
        </span>
        <span className="SupplierAndNameAndVersion-item">
          <span className="SupplierAndNameAndVersion-item-label">
            名称:
          </span>

          <Select value={name} className="SupplierAndNameAndVersion-item-value" onSelect={(key)=>this.onSelect('name', key)} placeholder={_placeholder[1]}>
            { _nameList.map((e) => {
              return <Option key={ e.value } value={ e.value }>{ e.name }</Option>
            }) }
          </Select>
        </span>
        <span className="SupplierAndNameAndVersion-item">
          <span className="SupplierAndNameAndVersion-item-label">
             版本:
          </span>

          <Select value={businessId} className="SupplierAndNameAndVersion-item-value" onSelect={(key)=>this.onSelect('version', key)} placeholder={_placeholder[2]}>
            { _versionList.map((e) => {
              return <Option key={ e.value } value={ e.value }>{ e.name }</Option>
            }) }
          </Select>
        </span>
      </div>
    )
  }
}
