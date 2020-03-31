import React, { Component } from 'react'
import { Table } from 'antd'
import Tooltip from '@/components/common/CustomTooltip'
import api from '@/services/api'
import Search  from '@c/common/Search'

/**
 * 黑白名单
 */
const pageSize = 10
export default class BlackAndWhiteList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      list: [],
      currentPage: 1,
      totalRecords: 0,
      pageSize
    }
  }

  componentDidMount () {
    this.getSoftListById()
  }

  //获取软件列表信息
  getSoftListById = (isCache = true) => {
    const { templateId } = this.props
    const { currentPage, pageSize } = this.state
    let param = { currentPage, pageSize, templateId }
    api.listSoftwareForTemplateByPage(param).then(res => {
      const { currentPage, totalRecords, items } = res.body || {}
      this.setState({
        list: items || [],
        currentPage,
        totalRecords
      })
    })
  }
  softColumns = [
    {
      title: '厂商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      render: text => <Tooltip title={ text }>{ text }</Tooltip>
    },
    {
      title: '名称',
      dataIndex: 'softwareName',
      key: 'softwareName',
      render: text => <Tooltip title={ text }>{ text }</Tooltip>
    },
    {
      title: '版本',
      dataIndex: 'edition',
      key: 'edition',
      render: text => <Tooltip title={ text }>{ text }</Tooltip>
    } ]
  //分页
  pageChange=(currentPage)=>{
    this.setState({
      currentPage
    }, this.getSoftListById)
  }

  onSubmit=()=>{

  }

  onReset=()=>{

  }

  render () {
    const { totalRecords: total, list, currentPage: current, pageSize } = this.state

    const defaultFields = [
      { type: 'input', label: '厂商', placeholder: '请输入', key: 'assetName', allowClear: true, maxLength: 64 },
      { type: 'input', label: '名称', placeholder: '请输入', key: 'assetNo', allowClear: true, maxLength: 64 }
    ]
    return (
      <div className="table-wrap">
        <div className="search-bar">
          <Search defaultFields={defaultFields} onSubmit={this.onSubmit} onReset={this.onReset} />
        </div>
        <Table
          pagination={ {
            total,
            current,
            pageSize,
            onChange: this.pageChange,
            showTotal: () => `共 ${total ? total : 0} 条数据`
          } }
          columns={ this.softColumns }
          dataSource={ list }/>
      </div>
    )
  }
}
