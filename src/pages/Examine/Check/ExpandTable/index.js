
import React, { Component } from 'react'
import { connect } from 'dva'
import { Table, Pagination } from 'antd'
import { analysisUrl } from '@/utils/common'
import { withRouter } from 'dva/router'
import api from '@/services/api'

export class ModelDetails extends Component {
  constructor (props) {
    super(props)
    const query = analysisUrl(this.props.location.search)
    this.state = {
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      ExpandObject: {
        'bug': [
          {
            title: '漏洞名称',
            key: 'ruleId',
            dataIndex: 'ruleId'
          },
          {
            title: '漏洞编号',
            key: 'ruleId',
            dataIndex: 'ruleId'
          },
          {
            title: '危害等级',
            key: 'ruleId',
            dataIndex: 'ruleId'
          }
        ],
        'patch': [
          {
            title: '补丁编号',
            key: 'ruleId',
            dataIndex: 'ruleId'
          },
          {
            title: '补丁名称',
            key: 'ruleId',
            dataIndex: 'ruleId'
          },
          {
            title: '补丁等级',
            key: 'ruleId',
            dataIndex: 'ruleId'
          },
          {
            title: '补丁热支持',
            key: 'ruleId',
            dataIndex: 'ruleId'
          }
        ]
      },
      stringId: query.stringId,
      body: null //详情
    }
  }
  componentDidMount () {
    //获取模板信息
    // this.initIdata()
  }
  render () {
    let { pagingParameter, body, ExpandObject } = this.state
    const { props } = this.props
    let list = [{ ruleId: 'fsdgdg' }], total = 0
    if (body) {
      list = body.items
      total = Number(body.totalRecords)
    }
    return (
      <div>
        <Table
          rowKey="templateNo"
          columns={ExpandObject[props]}
          dataSource={list}
          pagination={false}
        />
        {total > 0 && <Pagination
          className="table-pagination"
          total={total} showTotal={(total) => `共 ${total || 0} 条数据`}
          showSizeChanger={total > 10 ? true : false}
          showQuickJumper={true}
          onChange={this.changeShowSize}
          onShowSizeChange={this.changeShowSize}
          pageSize={pagingParameter.pageSize}
          current={pagingParameter.currentPage} />}
      </div>
    )
  }
  //初始化数据
  initIdata = () => {
    api.getConfigTemplateById({ primaryKey: this.state.stringId }).then(res => {
      this.setState({
        DetailModel: res.body
      })
    })
  }
}
export default withRouter(connect()(ModelDetails))
