
import React, { Component, Fragment } from 'react'
import { connect } from 'dva'
import { Table, Pagination } from 'antd'
import './style.less'
import moment from 'moment'
import { transliteration, analysisUrl, TooltipFn, emptyFilter } from '@/utils/common'
import { Link, withRouter } from 'dva/router'
import api from '@/services/api'
import ExpandTable from './ExpandTable/index'
import AssetInfo from './Info/index'

export class ModelDetails extends Component {
  constructor (props) {
    super(props)
    const query = analysisUrl(this.props.location.search)
    this.state = {
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      spObject: {
        // '1': {
        //   expanded: 'bug',
        //   title: '修复建议' //漏洞审批
        // },
        // '2': {
        //   expanded: 'patch',
        //   title: '安装建议' //补丁审批
        // },
        // '3': {
        //   title: '加固方案' //配置加固审批
        // },
        'assetRetire': { //资产退役审批
          detailList: [
            { name: '退役方案', key: 'name' },
            { name: '附件', key: 'source', check: 1 }]
        },
        'assetScrap': { //资产报废审批
          detailList: [
            { name: '报废方案', key: 'name' },
            { name: '附件', key: 'source', check: 1 }]
        }
        // 'assetEntry': { //资产入网审批
        //   detailList: [
        //     { name: '退役申请人', key: 'name' }]
        // },
        // '7': {
        //   expanded: 'bug',
        //   title: '修复建议' //突发漏洞审批
        // }
      },
      columns: [
        {
          title: '名称',
          key: 'ruleId',
          dataIndex: 'ruleId'
        },
        {
          title: '编号',
          key: 'ruleId',
          dataIndex: 'ruleId'
        },
        {
          title: '类型',
          key: 'ruleId',
          dataIndex: 'ruleId'
        },
        {
          title: 'IP',
          key: 'ruleId',
          dataIndex: 'ruleId'
        },
        {
          title: '重要程度',
          key: 'ruleId',
          dataIndex: 'ruleId'
        },
        {
          title: '归属区域',
          key: 'ruleId',
          dataIndex: 'ruleId'
        },
        {
          title: '操作',
          key: 'operate',
          width: '16%',
          render: (record) => {
            return (
              <div className="operate-wrap">
                <Fragment>
                  {
                    <Link to={`/asset/manage/detail?id=${transliteration(record.stringId)}`}>查看</Link>
                  }
                </Fragment>
              </div>
            )
          }
        }
      ],
      stringId: query.stringId,
      type: query.type,
      expandedRowKeys: [], // 被展开的行
      body: null //详情
    }
  }
  componentDidMount () {
    //获取模板信息
    // this.initIdata()
  }
  render () {
    let { pagingParameter, body, columns, expandedRowKeys, spObject, type } = this.state
    console.log(type)
    const expanded = spObject[type] && spObject[type].expanded
    let list = [{ ruleId: 'fsdgdg', id: 1 }, { ruleId: 'fsdgdgww', id: 2 }], total = 0
    if (body) {
      list = body.items
      total = Number(body.totalRecords)
    }
    const details = {
      fileRequests: [{ fileName: 'fdgsgsg' }, { fileName: 'fdgfsfsfsgsg' }]
    }
    return (
      <div className="main-detail-content">
        <p className="detail-title">资产信息</p>
        {expanded ? <Table
          rowKey="id"
          columns={columns}
          dataSource={list}
          onExpand={this.onExpandTable}
          expandedRowKeys={expandedRowKeys}//列表只展示一行
          pagination={false}
          expandedRowRender={this.expandedRowRender}
        /> : <Table
          rowKey="id"
          columns={columns}
          dataSource={list}
          pagination={false}
        />
        }
        {spObject[type] && spObject[type].detailList && <AssetInfo detailList={spObject[type].detailList} body={details} />}
        {total > 0 && <Pagination
          className="table-pagination"
          total={total} showTotal={(total) => `共 ${total || 0} 条数据`}
          showSizeChanger={total > 10 ? true : false}
          showQuickJumper={true}
          onChange={this.changeShowSize}
          onShowSizeChange={this.changeShowSize}
          pageSize={pagingParameter.pageSize}
          current={pagingParameter.currentPage} />}
        {/*  基准项信息 */}
        {spObject[type] && spObject[type].title && <p className="detail-title">{spObject[type].title}</p>}
        <p className="detail-title">审批结论</p>
        <div className="detail-content detail-content-layout">
          <div className='no-text'>无</div>
        </div>
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
  /**
   * 展开表格事件
   * @param status
   * @param record
   */
  onExpandTable = (status, record) => {
    if (status) {
      this.setState({ expandedRowKeys: [record.id] })
    } else {
      this.setState({ expandedRowKeys: [] })
    }
  }
  expandedRowRender = (record, index, indent, expanded) => {
    let { spObject, type } = this.state
    if (expanded) {
      return (
        <ExpandTable props={spObject[type].expanded} />)
    }
  }
}
export default withRouter(connect()(ModelDetails))
