import React, { Component, Fragment } from 'react'
import { TooltipFn, analysisUrl, cacheSearchParameter, evalSearchParam } from '@u/common'
import hasAuth from '@/utils/auth'
import { Table, Pagination, Button } from 'antd'
import api from '@/services/api'
// import { Search } from '@c/index'  //引入方式
import { systemPermission } from '@a/permission'

export class ServiceConfig extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      body: null,
      columns: [
        {
          title: '服务名称',
          key: 'name',
          dataIndex: 'name',
          width: '20%',
          render: text => TooltipFn(text)
        },
        {
          title: '状态',
          key: 'state',
          dataIndex: 'state',
          width: '20%'
        },
        {
          title: '路径',
          key: 'path',
          dataIndex: 'path',
          width: '44%',
          render: text => TooltipFn(text)
        },
        {
          title: '操作',
          key: 'operate',
          width: '16%',
          render: (record) => {
            return (
              <div className="operate-wrap">
                <span>通信配置</span>
              </div>
            )
          }
        }
      ]
    }
  }
  componentDidMount () {
    // this.getList()
  }
  render () {
    let { pagingParameter, body, columns } = this.state
    let list = [], total = 0
    if (body) {
      list = body.items
      total = Number(body.totalRecords)
    }
    return (
      <div className="main-table-content">
        {/* <div className="search-bar">
          <Search defaultFields={defaultFields} onSubmit={this.handleSubmit} />
        </div> */}
        {/* 列表+分页 */}
        <div className="table-wrap">
          <div className="table-btn">
            <div className="left-btn">
              {
                hasAuth(systemPermission.sysSetNetsegmentNew) && <Button type="primary" onClick={this.showEdit}>新增服务</Button>
              }
            </div>
          </div>
          <Table rowKey="stringId" columns={columns} dataSource={list} pagination={false}
          />
          {total > 0 && <Pagination
            className="table-pagination"
            total={total}
            showTotal={(total) => `共 ${total || 0} 条数据`}
            showSizeChanger={total > 10 ? true : false}
            showQuickJumper
            onChange={this.changePage}
            onShowSizeChange={this.changePage}
            pageSize={pagingParameter.pageSize}
            current={pagingParameter.currentPage} />
          }
        </div>
      </div>
    )
  }

  //获取列表
  getList = () => {
    let { pagingParameter } = this.state
    api.getNetsegment(pagingParameter).then(res => {
      if (pagingParameter.currentPage !== 1 && !res.body.items.length) {
        this.setState({
          pagingParameter: {
            currentPage: pagingParameter.currentPage - 1,
            pageSize: pagingParameter.pageSize
          }
        }, this.getList)
      } else {
        this.setState({
          body: res.body
        })
      }
    })
  }
  //分页
  changePage = (currentPage, pageSize) => {
    this.setState({
      pagingParameter: {
        pageSize,
        currentPage
      }
    }, this.getList)
  }
}
export default ServiceConfig