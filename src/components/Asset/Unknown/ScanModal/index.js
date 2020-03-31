import React, { Component } from 'react'
import { CommonModal } from '@c'
import api from '@/services/api'
import { debounce } from 'lodash'

const formLayout = {
  labelCol: {
    span: 8
  },
  wrapperCol: {
    span: 14
  }
}
const pageSize = -1 // 代表查所有数据
export default class ScanModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      // 网段
      networkSegment: [],
      // 端口
      portGroup: []
    }
  }

  componentDidMount () {
    this.getNetworkSegmentList()
    this.getPortGroupList()
  }
  // 搜索网段
  onSearchNetworkSegment = (value) => {
    this.onSearchNetworkSegment({ item: value })
  }
  // 搜索端口
  onSearchPortGroup = (value) => {
    console.log(value)
    this.getPortGroupList({ information: value })
  }
  // 获取网段列表
  getNetworkSegmentList = (filter) => {
    // 上一次的请求未返回时，不进行请求
    if(this.networkSegmentLoading){
      return
    }
    this.networkSegmentLoading = true
    api.getNetsegment({ ...filter, pageSize }).then(res=>{
      const { items = [] } = res.body || {}
      this.setState({ networkSegment: items })
      this.networkSegmentLoading = false
    }).catch(()=>{
      this.networkSegmentLoading = false
    })
  }
  // 获取端口列表
  getPortGroupList = (filter) => {
    // 上一次的请求未返回时，不进行请求
    if(this.portGroupLoading){
      return
    }
    this.portGroupLoading = true
    api.getParamPortList({ ...filter, pageSize }).then((res)=>{
      const { items = [] } = res.body || {}
      this.setState({ portGroup: items })
      this.portGroupLoading = false
    }).catch(()=>{
      this.portGroupLoading = false
    })
  }
  onSubmit = debounce((values) => {
    const { onSubmit } = this.props
    onSubmit && onSubmit(values)
  })

  render () {
    const { visible, onClose } = this.props
    const { networkSegment, portGroup } = this.state
    const fields = [
      {
        type: 'select',
        key: 'netSegmentId',
        name: '扫描网段',
        showSearch: true,
        mode: 'multiple',
        config: { name: 'portGroupName', value: 'primaryKey' },
        rules: [
          { required: true, message: '请选择扫描网段' }
        ],
        placeholder: '请选择扫描网段',
        data: networkSegment
      },
      {
        type: 'select',
        key: 'portGroupId',
        name: '扫描端口组',
        showSearch: true,
        rules: [
          { required: true, message: '请选择扫描端口组' }
        ],
        config: { name: 'portGroupName', value: 'primaryKey' },
        placeholder: '请选择扫描端口组',
        data: portGroup
      },

      {
        type: 'select',
        key: 'alarm',
        name: '探测后是否产生告警',
        defaultValue: 2,
        placeholder: '请选择',
        data: [
          { label: '是', value: 1 },
          { label: '否', value: 2 }
        ]
      }
    ]
    return (
      <CommonModal
        title='资产探测'
        type="form"
        visible={ visible }
        formLayout={ formLayout }
        fields={ fields }
        oktext='确定'
        value={ this.onSubmit }
        onClose={ onClose }
      />
    )
  }
}
