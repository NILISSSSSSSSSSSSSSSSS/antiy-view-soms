import React, { Component, Fragment } from 'react'
import { Link } from 'dva/router'
import { withRouter } from 'react-router-dom'
import { Table, Pagination, message, Modal, Icon, Form, Button } from 'antd'
import { object, bool, string, number } from 'prop-types'
import { debounce, uniqBy } from 'lodash'
import api from '@/services/api'
import hasAuth from '@u/auth'
import { bugPermission } from '@a/permission'
import { cache, transliteration, TooltipFn, getAfterDeletePage } from '@/utils/common'
import { CommonModal } from '@c/index'
import Loadings from '@c/common/Loading'
import BugSearch from '@c/BugManage/BugSearch'

const { confirm } = Modal
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
class BugList extends Component {
  static propTypes = {
    //来至哪个管理模块下的页面
    from: string,
    //漏洞维度、漏洞信息管理：1，突发漏洞：2
    dimension: number,
    //标签页
    active: string,
    //消息页面跳转过来需要的参数
    urlParam: string,
    //跳转处置页面的地址
    disposeUrl: string,
    //接口地址
    listApi: string,
    //是否生成解决方案表单项
    isSolved: bool,
    //是否生成处置按钮
    isDispose: bool,
    //是否生成处置资产数table列
    isNoHandleAssets: bool,
    //列表不一致的地方
    diffItems: object,
    //查询项
    searchItems: object,
    //查看权限
    checkTag: string,
    //处置权限
    disposeTag: string,
    //表格复选框批量操作
    isSelection: bool,
    //提交按钮
    isSubmit: bool,
    //修复按钮
    isRepair: bool,
    //选人的流程参数
    userParam: object
  }
  //注意：因为后端是不同的人做基本相同的接口，所以（漏洞知识管理，突发漏洞管理）与（漏洞信息管理、漏洞处置管理）中的列表字段和查询参数不一致
  static defaultProps = {
    active: '0',
    diffItems: {
      id: 'stringId',
      name: 'vulName',
      number: 'vulNo',
      level: 'threatLevel',
      levelStr: 'threatLevel'
    }
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
      selectedRowKeys: [],
      selectedRows: [],
      //排序方式
      noHandleNum: '',
      riskAssetNum: '',
      waitRepairNum: '',
      devVisible: false,
      internetVisible: false,
      loading: false,
      //人员
      userList: [],
      isShowInternet: false
    }
  }
  componentDidMount () {
    const { active } = this.props
    let { list } = cache.evalSearchParam(this, {}, false) || {}
    if (list && list[Number(active)]) {
      const { parameter, page } = list[Number(active)]
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
    const {
      from,
      disposeUrl,
      isSolved,
      isDispose,
      isNoHandleAssets,
      diffItems,
      searchItems,
      checkTag,
      disposeTag,
      isSelection,
      isSubmit,
      isRepair
    } = this.props
    let {
      pagingParameter,
      body,
      noHandleNum,
      riskAssetNum,
      waitRepairNum,
      selectedRowKeys,
      devVisible,
      internetVisible,
      loading,
      isShowInternet
    } = this.state
    //表格复选
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, data) => this.rowChange(selectedRowKeys, data),
      getCheckboxProps: record => ({
        disabled: record.waitRepairNum === '0'
      })
    }
    let columns = [
      {
        title: '漏洞编号',
        key: diffItems.number,
        width: '16%',
        dataIndex: diffItems.number,
        render: text => TooltipFn (text),
        isShow: true
      },
      {
        title: '漏洞名称',
        key: diffItems.name,
        dataIndex: diffItems.name,
        width: '16%',
        render: text => TooltipFn (text),
        isShow: true
      },
      {
        title: '危害等级',
        key: diffItems.levelStr,
        dataIndex: diffItems.levelStr,
        width: '12%',
        isShow: true
      },
      {
        title: '是否有解决方案',
        key: 'solved',
        dataIndex: 'solved',
        width: '12%',
        render: (text) => {
          return text ? '是' : '否'
        },
        isShow: isSolved
      },
      {
        title: '待处置资产数量',
        key: 'noHandleNum',
        width: '14%',
        dataIndex: 'noHandleNum',
        sortOrder: noHandleNum,
        sorter: true,
        isShow: isNoHandleAssets
      },
      {
        title: '风险资产数',
        key: 'riskAssetNum',
        width: '14%',
        dataIndex: 'riskAssetNum',
        sortOrder: riskAssetNum,
        sorter: true,
        isShow: from === 'dispose'
      },
      {
        title: '待修复资产数',
        key: 'waitRepairNum',
        width: '14%',
        dataIndex: 'waitRepairNum',
        sortOrder: waitRepairNum,
        sorter: true,
        isShow: from === 'dispose'
      },
      {
        title: '操作',
        key: 'operate',
        width: '14%',
        render: (record) => {
          const id = record[diffItems.id]
          const antiyVulnId = record.antiyVulnId
          return(
            <div className="operate-wrap">
              {
                hasAuth(disposeTag) && isDispose && <Link to={`${disposeUrl}?number=${antiyVulnId}&id=${transliteration(id)}&caches=1`}>处置</Link>
              }
              {
                hasAuth(checkTag) && <Link to={{
                  pathname: `/bugpatch/bugmanage/${from}/detail`,
                  search: `number=${transliteration(antiyVulnId)}&id=${transliteration(id)}&caches=1`,
                  state: { rCaches: 1 }
                }}>查看</Link>
              }
            </div>
          )
        },
        isShow: true
      }
    ]
    columns = columns.filter(item => item.isShow)
    let list  = []
    let total =  0
    if (body){
      list = body.items
      total =  body.totalRecords
    }
    // 提交form
    const submitFormFields = [
      {
        type: 'textArea',
        key: 'vulRepairMemo',
        rows: 4,
        name: '漏洞修复建议',
        placeholder: '请输入',
        rules: [
          { required: true,  message: '请输入漏洞修复建议' },
          { whitespace: true, message: '不能为空字符' },
          { message: '最多500个字符', max: 500 }
        ]
      }
    ]
    // 修复form
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
      }, )
    }
    return (
      <div className="main-table-content">
        <BugSearch
          onSubmit={this.onSubmit}
          onReset={this.onReset}
          isSolved={isSolved}
          searchItems={searchItems || diffItems}
          wrappedComponentRef={search => { search && (this.searchForm = search.searchForm) }}
        />
        {/* 列表+分页 */}
        <div className="table-wrap">
          {
            isSelection &&
            <div className="table-btn">
              {/* 占位 */}
              <div></div>
              <div className="right-btn">
                {
                  isSubmit && hasAuth(bugPermission.vulHandle) && <Fragment>
                    <Button type="primary" className="btn-right" onClick={()=> this.handleBatch('neglect')}>忽略</Button>
                    <Button type="primary" className="btn-right" onClick={()=> this.handleBatch('dev')}>提交</Button>
                  </Fragment>
                }
                {
                  isRepair && hasAuth(bugPermission.vulHandleDeal) && <Button type="primary" className="btn-right" onClick={()=> this.handleBatch('internet')}>批量修复</Button>
                }
              </div>
            </div>
          }
          <Table
            onChange={this.handleTableSort}
            rowKey={diffItems.id}
            columns={columns}
            dataSource={list}
            rowSelection={isSelection ? rowSelection : null}
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
        {
          isSelection &&
          <Fragment>
            <CommonModal
              type="form"
              visible={devVisible}
              title="提交"
              width={650}
              oktext="提交"
              value={this.onDevSubmit}
              onClose={() => this.setState({ devVisible: false, loading: false, currentData: null })}
              fields={submitFormFields}
              column={1}
              FormItem={Item}
              formLayout={formLayout}
            />
            <CommonModal
              type="form"
              visible={internetVisible}
              title="修复方案"
              width={750}
              oktext="提交"
              value={this.onRepairSubmit}
              onClose={() => this.setState({ internetVisible: false, loading: false, currentData: null })}
              fields={repairFormFields}
              column={1}
              FormItem={Item}
              formLayout={formLayout}
            />
            <Loadings loading={loading} />
          </Fragment>
        }
      </div>
    )
  }

  //提交运维
  onDevSubmit = (values) => {
    const { diffItems } = this.props
    const { selectedRows, userList } = this.state
    this.setState({
      loading: true
    })
    const vulOutDisposeRequestList = []
    selectedRows.forEach(item => {
      vulOutDisposeRequestList.push({
        vulAssetNum: item.noHandleNum,
        vulId: item[diffItems.id]
      })
    })
    values.disposeUserId = userList.map(item => item.stringId).join(',')
    api.outSubmit({
      //类型 1 漏洞 2 补丁
      type: '1',
      //漏洞登记类型 1 突发漏洞管理 2 信息漏洞管理
      vulModuleType: '2',
      //建议类型 1 修复/安装 2 退回
      suggestionType: '1',
      vulOutDisposeRequestList,
      ...values
    }).then(response => {
      if(response && response.head && response.head.code === '200' ){
        this.handleSuccess(selectedRows)
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

  //配置入网
  onRepairSubmit = (values) => {
    this.setState({
      loading: true
    })
    const { selectedRows, userList, pagingParameter } = this.state
    const ids = []
    selectedRows.forEach(item => {
      ids.push(item.stringId)
    })
    values.baselineIds = userList.map(item => item.stringId)
    api.outBugRepairBug({
      ids,
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

  //忽略
  neglect = (record) => {
    const { diffItems } = this.props
    const { selectedRows } = this.state
    const data = record ? [record] : selectedRows
    const vulOutDisposeRequestList = []
    data.forEach(item => {
      vulOutDisposeRequestList.push({
        vulId: item[diffItems.id],
        vulAssetNum: item.noHandleNum
      })
    })
    const params = {
      vulModuleType: 2,
      vulOutDisposeRequestList
    }
    confirm({
      icon: <Icon type="close" onClick={() => { Modal.destroyAll() }} />,
      content: '是否确认忽略漏洞信息？',
      okText: '确认',
      onOk: debounce(() => {
        api.outUpdateStatus(params).then(response => {
          if (response && response.head && response.head.code === '200') {
            this.handleSuccess(data)
          }
        })
      }, 1000, { leading: true, trailing: false }),
      onCancel: () => {
        this.setState({
          currentData: null
        })
      }
    })
  }

  handleSuccess = (data) => {
    const { values, pagingParameter, body } = this.state
    let { currentPage, pageSize } = pagingParameter
    message.success('操作成功！')
    currentPage = getAfterDeletePage(body.totalRecords - data.length, currentPage, pageSize)
    this.setState({
      devVisible: false,
      selectedRowKeys: [],
      selectedRows: [],
      currentData: null,
      pagingParameter: {
        currentPage,
        pageSize
      }
    }, () => {
      this.getList({
        pageSize,
        currentPage,
        ...values
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

  //批量操作
  handleBatch = async (type) => {
    const { selectedRowKeys, userList } = this.state
    if (selectedRowKeys.length === 0) {
      message.info('请选择数据！')
      return false
    }
    if (type === 'neglect') {
      this.neglect()
    } else {
      if (!userList.length) {
        await this.isInternet()
        await this.getUsers()
      }
      this.setState({
        [`${type}Visible`]: true
      })
    }
  }

  //行选择
  rowChange = (selectedRowKeys, selectedRows) => {
    const { diffItems } = this.props
    this.setState({
      selectedRowKeys,
      selectedRows: uniqBy([...this.state.selectedRows, ...selectedRows], diffItems.id).filter(item => selectedRowKeys.includes(item[diffItems.id]))
    })
  }

  //排序
  handleTableSort = (pagination, filters, sorter) => {
    const { columnKey, order } = sorter
    this.setState({
      noHandleNum: columnKey === 'noHandleNum' ? order : '',
      riskAssetNum: columnKey === 'riskAssetNum' ? order : '',
      waitRepairNum: columnKey === 'waitRepairNum' ? order : ''
    }, () => {
      const { values, pagingParameter } = this.state
      this.getList({
        ...values,
        ...pagingParameter
      })
    })
  }

  //表单重置
  onReset = () => {
    const { active, history } = this.props
    cache.removeCriteria(active, history)
    const pagingParameter = {
      pageSize: 10,
      currentPage: 1
    }
    this.setState({
      values: {},
      noHandleNum: '',
      riskAssetNum: '',
      waitRepairNum: '',
      selectedRowKeys: [],
      selectedRows: [],
      pagingParameter
    }, () => {
      this.getList(pagingParameter, false)
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
      const { pagingParameter } = this.state
      this.getList({
        ...pagingParameter,
        ...values
      })
    })
  }

  //获取列表
  getList = (param, isCach = true) => {
    const { history, active, dimension, listApi, urlParam } = this.props
    let { values, pagingParameter, noHandleNum, riskAssetNum, waitRepairNum } = this.state
    if (isCach) {
      const cacheParam = active ? [history, Number(active), active] : [history]
      cache.cacheSearchParameter([{
        page: pagingParameter,
        parameter: values
      }], ...cacheParam)
    }
    if (this.getSort(noHandleNum)) {
      param.sortName = 'noHandleNum'
      param.sortOrder = this.getSort(noHandleNum)
    }
    if (this.getSort(riskAssetNum)) {
      param.sortName = 'riskAssetNum'
      param.sortOrder = this.getSort(riskAssetNum)
    }
    if (this.getSort(waitRepairNum)) {
      param.sortName = 'waitRepairNum'
      param.sortOrder = this.getSort(waitRepairNum)
    }
    param.dimension = dimension
    if (urlParam) {
      param.stringId = urlParam
    }
    api[listApi](param).then(response => {
      if (response && response.head && response.head.code === '200' ) {
        this.setState({
          body: response.body
        })
      }
    })
  }

  //获取人员
  getUsers = async () => {
    const { userParam } = this.props
    this.setState({
      loading: true
    })
    await api.getBugUsers(userParam).then(response => {
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
      this.getList(param, true)
    })
  }
}

export default BugList
