import React, { Component } from 'react'
import { Table } from 'antd'
import Tooltip from '@/components/common/CustomTooltip'
import api from '@/services/api'

/**
 * 历史配置记录
 */
const pageSize = 10
export default class HisConfigRecord extends Component {
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
      title: '模板应用时间',
      dataIndex: 'manufacture1r',
      key: 'manufacturer1',
      render: text => <Tooltip title={ text }>{ text }</Tooltip>
    },
    {
      title: '模板变更时间',
      dataIndex: 'manufacturer2',
      key: 'manufacturer2',
      render: text => <Tooltip title={ text }>{ text }</Tooltip>
    },
    {
      title: '模板名称',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      render: text => <Tooltip title={ text }>{ text }</Tooltip>
    },
    {
      title: '模板编号',
      dataIndex: 'softwareName',
      key: 'softwareName',
      render: text => <Tooltip title={ text }>{ text }</Tooltip>
    },
    {
      title: '操作',
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

  render () {
    const { totalRecords: total, list, currentPage: current, pageSize } = this.state

    return (
      <div className="table-wrap">
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
