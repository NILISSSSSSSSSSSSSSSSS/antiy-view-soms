import React, { Component } from 'react'
import { Link, withRouter } from 'dva/router'
import { Form, Button, Table, Pagination, message } from 'antd'
import { uniqBy } from 'lodash'
import { cache, TooltipFn } from '@/utils/common'
import api from '@/services/api'
import { patchPermission } from '@a/permission'
import hasAuth from '@u/auth'
import Loadings from '@c/common/Loading'
import { CommonModal } from '@c/index'
import Search  from '@c/common/Search'
import { PATCH_LEVEL } from '@a/js/enume'

const { Item } = Form
const formLayout = {
  labelCol: {
    span: 8
  },
  wrapperCol: {
    span: 12
  }
}

@withRouter
export class InstallPatch extends Component {
  constructor (props) {
    super(props)
    this.state = {
      patchLevel: ['重要', '中等', '严重'],
      values: {},
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      body: null,
      loading: false,
      internetVisible: false,
      noInstallNum: '',
      riskAssetNum: '',
      selectedRowKeys: [],
      selectedRows: [],
      userList: [],
      isShowInternet: false
    }
  }
  componentDidMount () {
    let { list } = cache.evalSearchParam(this, {}, false) || {}
    if (list && list[1]) {
      const { parameter, page } = list[1]
      this.searchForm.setFieldsValue(parameter)
      this.setState({
        pagingParameter: page,
        values: parameter
      }, () => {
        this.getList({
          ...page,
          ...parameter
        })
      })
    } else {
      this.getList(this.state.pagingParameter, false)
    }
  }

  render () {
    const { body, pagingParameter, selectedRowKeys, internetVisible, loading, riskAssetNum, noInstallNum, isShowInternet } = this.state
    const  columns = [{
      title: '补丁名称',
      key: 'patchName',
      dataIndex: 'patchName',
      render: (text)=>{
        return TooltipFn(text)
      }
    }, {
      title: '补丁编号',
      key: 'patchNo',
      dataIndex: 'patchNo',
      render: (text)=>{
        return TooltipFn(text)
      }
    }, {
      title: '补丁等级',
      key: 'patchLevel',
      dataIndex: 'patchLevel'
    },
    {
      title: '未安装资产数',
      key: 'riskAssetNum',
      dataIndex: 'riskAssetNum',
      sortOrder: riskAssetNum,
      sorter: true
    },
    {
      title: '待安装资产数',
      key: 'noInstallNum',
      dataIndex: 'noInstallNum',
      sortOrder: noInstallNum,
      sorter: true
    },
    {
      title: '操作',
      render: (text, record) => {
        return (
          <div className="operate-wrap">
            {
              hasAuth(patchPermission.PatchInstallManageInstall) && <Link to={`/bugpatch/patchmanage/install/patch?id=${record.stringId}&number=${record.antiyPatchNumber}`}>安装</Link>
            }
            {
              hasAuth(patchPermission.PatchInstallManageDetail) && <Link to={`/bugpatch/patchmanage/install/detail?id=${record.antiyPatchNumber}`}>查看</Link>
            }
          </div>
        )
      }
    }]
    let list  = []
    let total =  0
    if (body){
      list = body.items
      total =  body.totalRecords
    }
    //表格复选
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, data) => this.rowChange(selectedRowKeys, data),
      getCheckboxProps: record => ({
        disabled: record.noInstallNum === '0'
      })
    }
    // 配置form
    const formFields = [
      {
        type: 'textArea',
        key: 'repairSuggestions',
        rows: 4,
        name: '配置建议',
        placeholder: '请输入',
        rules: [
          { required: true,  message: '请输入配置建议' },
          { whitespace: true, message: '不能为空字符' },
          { message: '最多500个字符', max: 500 }
        ]
      }
    ]
    const searchFields = [
      { type: 'select', label: '补丁等级', placeholder: '请选择', key: 'patchLevel', data: PATCH_LEVEL },
      { type: 'input', label: '补丁名称', placeholder: '请输入', key: 'patchName', allowClear: true, maxLength: 180 },
      { type: 'input', label: '补丁编号', placeholder: '请输入', key: 'patchNo', allowClear: true, maxLength: 64 }
    ]
    //是否显示入网
    if (isShowInternet) {
      formFields.unshift({
        type: 'radioGroup',
        key: 'whetherBreak',
        name: '补丁安装完成前是否需要阻断入网',
        rules: [
          { required: true,  message: '请选择是否需要阻断入网' }
        ],
        data: [{ label: '是', value: true }, { label: '否', value: false }]
      }, )
    }
    return (
      <article className="main-table-content">
        <div className="search-bar">
          <Search
            defaultFields={searchFields}
            onSubmit={this.onSubmit}
            onReset={this.onReset}
            wrappedComponentRef={search => { search && (this.searchForm = search.props.form) }}
          />
        </div>
        <section className="table-wrap">
          <div className="table-btn">
            {/* 占位 */}
            <div></div>
            <div className="right-btn">
              {
                hasAuth(patchPermission.PatchInstallManageInstall) && <Button type="primary" className="btn-right" onClick={()=> this.handleBatch('install')}>批量安装</Button>
              }
            </div>
          </div>
          <Table
            onChange={this.handleTableSort}
            rowKey="stringId"
            columns={columns}
            dataSource={list}
            rowSelection={rowSelection}
            pagination={false} />
          {
            total > 0 && <Pagination
              className="table-pagination"
              total={total} showTotal={(total) => `共 ${total || 0} 条数据`}
              showSizeChanger={total > 10}
              showQuickJumper
              onChange={this.changePage}
              onShowSizeChange={this.changePage}
              pageSize={pagingParameter.pageSize}
              current={pagingParameter.currentPage} />
          }
        </section>
        <CommonModal
          type="form"
          visible={internetVisible}
          title="安装方案"
          width={750}
          oktext="提交"
          value={this.onInstallSubmit}
          onClose={() => this.setState({ internetVisible: false, loading: false, currentData: null })}
          fields={formFields}
          column={1}
          FormItem={Item}
          formLayout={formLayout}
        />
        <Loadings loading={loading} />
      </article>
    )
  }

  //安装
  onInstallSubmit = (values) => {
    const { selectedRows, userList, pagingParameter } = this.state
    this.setState({
      loading: true
    })
    const relIds = []
    selectedRows.forEach(item => {
      relIds.push(item.stringId)
    })
    values.baselineIds = userList.map(item => item.stringId)
    api.outPatchInstall({
      //补丁维度2
      dimension: '2',
      fromData: {},
      relIds,
      ...values
    }).then(response => {
      if(response && response.head && response.head.code === '200' ){
        message.success('操作成功！')
        this.setState({
          internetVisible: false,
          selectedRowKeys: [],
          selectedRows: [],
          currentData: null
        })
        this.getList({
          ...pagingParameter,
          ...this.state.values
        })
      }
      this.setState({
        loading: false
      })
    }).catch(e => {
      this.setState({
        loading: false
      })
    })
  }

  //查询是否入网
  isInternet = async () => {
    const { selectedRows } = this.state
    let assetIds = []
    selectedRows.forEach(item => {
      if (item.assetIds) {
        assetIds.push(...item.assetIds.split(','))
      }
    })
    assetIds = uniqBy(assetIds)
    await api.isEntryOperation({
      assetIds
    }).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          isShowInternet: response.body
        })
      }
    })
  }

  //行选择
  rowChange = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRowKeys,
      selectedRows: uniqBy([...this.state.selectedRows, ...selectedRows], 'stringId').filter(item => selectedRowKeys.includes(item.stringId))
    })
  }

  //批量操作
  handleBatch = async (type) => {
    const { selectedRowKeys, userList } = this.state
    if (selectedRowKeys.length === 0) {
      message.info('请选择数据！')
      return false
    }
    if (type === 'install') {
      await this.isInternet()
      if (!userList.length) {
        await this.getUsers()
      }
      this.setState({
        internetVisible: true
      })
    }
  }

  //排序
  handleTableSort = (pagination, filters, sorter) => {
    const { columnKey, order } = sorter
    this.setState({
      noInstallNum: columnKey === 'noInstallNum' ? order : '',
      riskAssetNum: columnKey === 'riskAssetNum' ? order : ''
    }, () => {
      const { values, pagingParameter } = this.state
      this.getList({
        ...values,
        ...pagingParameter
      })
    })
  }

  //表单查询
  onSubmit = (values) => {
    const { pagingParameter } = this.state
    this.setState({
      pagingParameter: {
        pageSize: pagingParameter.pageSize,
        currentPage: 1
      },
      values,
      selectedRowKeys: [],
      selectedRows: []
    }, () => {
      this.getList({
        ...this.state.pagingParameter,
        ...values
      })
    })
  }

  //表单重置
  onReset = () => {
    cache.removeCriteria('1', this.props.history)
    const pagingParameter = {
      pageSize: 10,
      currentPage: 1
    }
    this.setState({
      values: {},
      noInstallNum: '',
      riskAssetNum: '',
      pagingParameter,
      selectedRowKeys: [],
      selectedRows: []
    }, () => {
      this.getList(pagingParameter, false)
    })
  }

  //获取列表
  getList = (param, isCach = true) => {
    const { history } = this.props
    let { values, pagingParameter, noInstallNum, riskAssetNum } = this.state
    if (isCach) {
      cache.cacheSearchParameter([{
        page: pagingParameter,
        parameter: values
      }], history, 1, '1')
    }
    if (this.getSort(noInstallNum)) {
      param.sortName = 'noInstallNum'
      param.sortOrder = this.getSort(noInstallNum)
    }
    if (this.getSort(riskAssetNum)) {
      param.sortName = 'riskAssetNum'
      param.sortOrder = this.getSort(riskAssetNum)
    }
    api.getInstallManagePatchtList(param).then(response => {
      if(response && response.head && response.head.code === '200' ){
        this.setState({
          body: response.body
        })
      }
    })
  }

  getSort = (sort) => {
    return sort === 'ascend' ? 'asc' : sort === 'descend' ? 'desc' : null
  }

  //改变当前页显示数量
  changePage = (currentPage, pageSize) => {
    this.setState({
      pagingParameter: {
        pageSize,
        currentPage
      }
    }, () => {
      const { values } = this.state
      const param = {
        currentPage,
        pageSize,
        ...values
      }
      this.getList(param)
    })
  }

  //获取人员
  getUsers = async () => {
    this.setState({
      loading: true
    })
    await api.getBugUsers({
      flowId: 4,
      flowNodeTag: 'config_base'
    }).then(response => {
      if (response && response.head && response.head.code === '200') {
        response.body.forEach(item => {
          item.value = item.stringId
        })
        this.setState({
          userList: response.body
        })
      }
      this.setState({
        loading: false
      })
    }).catch(e => {
      this.setState({
        loading: false
      })
    })
  }
}

export default InstallPatch
