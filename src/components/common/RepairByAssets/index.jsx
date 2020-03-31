import React, { Component } from 'react'
import { Link } from 'dva/router'
import { withRouter } from 'react-router-dom'
import { Table, Pagination, message, Form, Button } from 'antd'
import { bool, string } from 'prop-types'
import { uniqBy } from 'lodash'
import api from '@/services/api'
import hasAuth from '@u/auth'
import { bugPermission, assetsPermission } from '@a/permission'
import { ASSETS_IMPORTANT, ASSETS_TYPE } from '@a/js/enume'
import { cache, transliteration, TooltipFn, analysisUrl } from '@u/common'
import Loadings from '@c/common/Loading'
import Search  from '@c/common/Search'
import { CommonModal } from '@c/index'

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
class RepairByAssets extends Component {
  static propTypes = {
    //列表的接口地址
    listUrl: string,
    //是否显示查看按钮
    isCheckShow: bool,
    //是否显示处置按钮
    isDisposeShow: bool
  }
  constructor (props) {
    super(props)
    this.state = {
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      body: null,
      values: {},
      //未修复资产排序方式
      sortedInfo: null,
      id: analysisUrl(this.props.location.search).id,
      curVulNum: '',
      waitRepairNum: '',
      repairVisible: false,
      loading: false,
      //配置人员
      userList: [],
      selectedRowKeys: [],
      selectedRows: [],
      isShowInternet: false
    }
  }
  componentDidMount () {
    let { list } = cache.evalSearchParam(this, {}, false) || {}
    if (list && list[0]) {
      const { parameter, page } = list[0]
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
    const { isCheckShow, isDisposeShow } = this.props
    let { pagingParameter, body, curVulNum, waitRepairNum, selectedRowKeys, repairVisible, loading, isShowInternet } = this.state
    const columns = [
      {
        title: '资产名称',
        key: 'assetName',
        dataIndex: 'assetName',
        width: '16%',
        render: text => TooltipFn (text)
      },
      {
        title: '资产编号',
        key: 'assetNo',
        width: '16%',
        dataIndex: 'assetNo',
        render: text => TooltipFn (text)
      },
      {
        title: '资产类型',
        key: 'assetType',
        dataIndex: 'assetType',
        width: '12%'
      },
      {
        title: '重要程度',
        key: 'importGrade',
        dataIndex: 'importGrade',
        width: '12%'
      },
      {
        title: '当前漏洞数',
        key: 'curVulNum',
        width: '14%',
        dataIndex: 'curVulNum',
        sortOrder: curVulNum,
        sorter: true
      },
      {
        title: '待修复漏洞数',
        key: 'waitRepairNum',
        width: '14%',
        dataIndex: 'waitRepairNum',
        sortOrder: waitRepairNum,
        sorter: true
      },
      {
        title: '操作',
        key: 'operate',
        width: '14%',
        render: (record) => {
          return(
            <div className="operate-wrap">
              {
                isDisposeShow && hasAuth(bugPermission.vulHandleDeal) && record.waitRepairNum !== '0' &&
                <Link to={`/bugpatch/bugmanage/dispose/disposebyassets?id=${transliteration(record.id)}&areaId=${transliteration(record.areaId)}&caches=1`}>处置</Link>
              }
              {
                isCheckShow && hasAuth(assetsPermission.ASSET_INFO_VIEW) && <Link to={{
                  pathname: '/asset/manage/detail',
                  search: `id=${transliteration(record.stringId)}`,
                  state: { rCaches: 1 }
                }}>查看</Link>
              }
            </div>
          )
        }
      }
    ]
    const searchFields = [
      { type: 'select', label: '资产类型', placeholder: '请选择', key: 'assetType', data: ASSETS_TYPE },
      { type: 'select', label: '重要程度', placeholder: '请选择', key: 'importGrade', data: ASSETS_IMPORTANT },
      { type: 'input', label: '资产名称', placeholder: '请输入', key: 'assetName', allowClear: true, maxLength: 64 },
      { type: 'input', label: '资产编号', placeholder: '请输入', key: 'assetNo', allowClear: true, maxLength: 64 }
    ]
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
        disabled: record.waitRepairNum === '0'
      })
    }
    // 配置入网
    const repairFormFields = [
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
    //是否显示入网
    if (isShowInternet) {
      repairFormFields.unshift({
        type: 'radioGroup',
        key: 'need',
        name: '漏洞修复完成前是否需要阻断入网',
        rules: [
          { required: true,  message: '请选择是否需要阻断入网' }
        ],
        data: [{ label: '是', value: true }, { label: '否', value: false }]
      })
    }
    return (
      <div>
        <div className="search-bar">
          <Search
            defaultFields={searchFields}
            onSubmit={this.onSubmit}
            onReset={this.onReset}
            wrappedComponentRef={(search) => { search && (this.searchForm = search.props.form) }}
          />
        </div>
        {/* 列表+分页 */}
        <div className="table-wrap">
          <div className="table-btn">
            {/* 占位 */}
            <div></div>
            <div className="right-btn">
              {
                hasAuth(bugPermission.vulHandleDeal) && <Button type="primary" className="btn-right" onClick={()=> this.handleBatch('repair')}>批量修复</Button>
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
        </div>
        <CommonModal
          type="form"
          visible={repairVisible}
          title="修复方案"
          width={750}
          oktext="提交"
          value={this.onRepairSubmit}
          onClose={() => this.setState({ repairVisible: false, loading: false, currentData: null })}
          fields={repairFormFields}
          column={1}
          FormItem={Item}
          formLayout={formLayout}
        />
        <Loadings loading={loading} />
      </div>
    )
  }

  //修复
  onRepairSubmit = (values) => {
    this.setState({
      loading: true
    })
    const { selectedRows, userList, pagingParameter } = this.state
    const ids = []
    selectedRows.forEach(item => {
      ids.push(item.id)
    })
    values.baselineIds =  userList.map(item => item.stringId)
    api.outBugRepairAsset({
      ids,
      ...values
    }).then(response => {
      if(response && response.head && response.head.code === '200' ){
        message.success('操作成功！')
        this.setState({
          repairVisible: false,
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
    let assetIds = selectedRows.map(item => item.id)
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
    if (type === 'repair') {
      await this.isInternet()
      if (!userList.length) {
        await this.getUsers()
      }
      this.setState({
        repairVisible: true
      })
    }
  }

  //获取人员
  getUsers = () => {
    api.getBugUsers({
      flowId: 2,
      flowNodeTag: 'vul_repair'
    }).then(response => {
      if (response && response.head && response.head.code === '200') {
        response.body.forEach(item => {
          item.value = item.stringId
        })
        this.setState({
          userList: response.body
        })
      }
    })
  }

  //排序
  handleTableSort = (pagination, filters, sorter) => {
    const { columnKey, order } = sorter
    this.setState({
      curVulNum: columnKey === 'curVulNum' ? order : '',
      waitRepairNum: columnKey === 'waitRepairNum' ? order : ''
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
    const { history } = this.props
    cache.removeCriteria('0', history)
    const pagingParameter = {
      pageSize: 10,
      currentPage: 1
    }
    this.setState({
      values: {},
      curVulNum: '',
      waitRepairNum: '',
      pagingParameter,
      selectedRowKeys: [],
      selectedRows: []
    }, () => {
      this.getList(pagingParameter, false)
    })
  }

  //获取列表
  getList = (param, isCach = true) => {
    const { history, listUrl } = this.props
    let { values, pagingParameter, curVulNum, waitRepairNum, id } = this.state
    if (isCach) {
      cache.cacheSearchParameter([{
        page: pagingParameter,
        parameter: values
      }], history, 0, '0')
    }
    if (this.getSort(curVulNum)) {
      param.sortName = 'curVulNum'
      param.sortOrder = this.getSort(curVulNum)
    }
    if (this.getSort(waitRepairNum)) {
      param.sortName = 'waitRepairNum'
      param.sortOrder = this.getSort(waitRepairNum)
    }
    //消息管理跳转至此页面需要传的参数
    if (id) {
      param.stringId = id
    }
    api[listUrl](param).then(response => {
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

export default RepairByAssets
