import React, { Component } from 'react'
import { Link } from 'dva/router'
import { Form, Button, Table, Pagination, Modal, Icon, message } from 'antd'
import { debounce, uniqBy } from 'lodash'
import { cache, analysisUrl, TooltipFn, getAfterDeletePage } from '@/utils/common'
import { CommonModal } from '@c/index'
import Loadings from '@c/common/Loading'
import api from '@/services/api'
import Search  from '@c/common/Search'
import { PATCH_LEVEL } from '@a/js/enume'
import { patchPermission } from '@a/permission'
import hasAuth from '@u/auth'

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

export class InformationList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      body: null,
      values: {},
      noInstallNum: '',
      page: {
        pageSize: 10,
        currentPage: 1
      },
      selectedRowKeys: [],
      selectedRows: [],
      //运维人员
      userList: [],
      devVisible: false,
      loading: false
    }
  }
  componentDidMount () {
    let { list } = cache.evalSearchParam(this, {}, false) || {}
    if (list) {
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
    const { body, devVisible, selectedRowKeys, pagingParameter, loading, noInstallNum } = this.state
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
        key: 'patchInstallMemo',
        rows: 4,
        name: '补丁处理建议',
        placeholder: '请输入',
        rules: [
          { required: true,  message: '请输入补丁处理建议' },
          { whitespace: true, message: '不能为空字符' },
          { message: '最多500个字符', max: 500 }
        ]
      }
    ]
    //表格复选
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, data) => this.rowChange(selectedRowKeys, data)
    }
    const searchFields = [
      { type: 'select', label: '补丁等级', placeholder: '请选择', key: 'patchLevel', data: PATCH_LEVEL },
      { type: 'input', label: '补丁名称', placeholder: '请输入', key: 'patchName', allowClear: true, maxLength: 180 },
      { type: 'input', label: '补丁编号', placeholder: '请输入', key: 'patchNo', allowClear: true, maxLength: 64 }
    ]
    const columns = [{
      title: '补丁编号',
      key: 'patchNo',
      dataIndex: 'patchNo',
      render: (text)=>{
        return TooltipFn(text)
      }
    }, {
      title: '补丁名称',
      key: 'patchName',
      dataIndex: 'patchName',
      render: (text)=>{
        return TooltipFn(text)
      }
    }, {
      title: '补丁等级',
      key: 'patchLevel',
      dataIndex: 'patchLevel'
    }, {
      title: '待处置资产数',
      key: 'noInstallNum',
      dataIndex: 'noInstallNum',
      sortOrder: noInstallNum,
      sorter: true
    }, {
      title: '操作',
      render: (record) => {
        return (
          <div className="operate-wrap">
            {
              hasAuth(patchPermission.PatchInfoManageDispose) && <Link to={`/bugpatch/patchmanage/information/dispose?id=${record.stringId}&number=${record.antiyPatchNumber}`}>处置</Link>
            }
            {
              hasAuth(patchPermission.PatchInfoManageDetail) && <Link to={`/bugpatch/patchmanage/information/detail?id=${record.antiyPatchNumber}`}>查看</Link>
            }
          </div>
        )
      }
    }]
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
            <div className="right-btn" >
              <Button type="primary" className="btn-right" onClick={()=> this.handleBatch('neglect')}>忽略</Button>
              <Button type="primary" className="btn-right" onClick={()=> this.handleBatch('submitToDev')}>提交</Button>
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
          visible={devVisible}
          title="提交"
          width={650}
          oktext="提交"
          value={this.onRepairSubmit}
          onClose={() => this.setState({ devVisible: false, loading: false, currentData: null })}
          fields={submitFormFields}
          column={1}
          FormItem={Item}
          formLayout={formLayout}
        />
        <Loadings loading={loading} />
      </article>
    )
  }

  //修复
  onRepairSubmit = (values) => {
    const { selectedRows, userList } = this.state
    this.setState({
      loading: true
    })
    const patchs = [], assetNums = []
    selectedRows.forEach(item => {
      patchs.push(item.stringId)
      assetNums.push(item.noInstallNum)
    })
    values.operationId = userList.map(item => item.stringId).join(',')
    api.patchBatchSubmit({
      assetNums,
      patchs,
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

  //忽略
  neglect = (record) => {
    const { selectedRows } = this.state
    const data = record ? [record] : selectedRows
    const patchs = [], assetNums = []
    data.forEach(item => {
      patchs.push(item.stringId)
      assetNums.push(item.noInstallNum)
    })
    confirm({
      icon: <Icon type="close" onClick={() => { Modal.destroyAll() }} />,
      content: '是否确认忽略补丁信息？',
      okText: '确认',
      onOk: debounce(() => {
        api.patchBatchIgnore({
          patchs,
          assetNums
        }).then(response => {
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
    if (type === 'neglect') {
      this.neglect()
    }
    if (type === 'submitToDev') {
      if (!userList.length) {
        await this.getUsers()
      }
      //获取配置人员
      this.setState({
        devVisible: true
      })
    }
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

  //排序
  handleTableSort = (pagination, filters, noInstallNum) => {
    const { columnKey, order } = noInstallNum
    this.setState({
      noInstallNum: columnKey === 'noInstallNum' ? order : ''
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
    cache.removeCriteria()
    const pagingParameter = {
      pageSize: 10,
      currentPage: 1
    }
    this.setState({
      values: {},
      noInstallNum: '',
      selectedRowKeys: [],
      selectedRows: [],
      pagingParameter
    }, () => {
      this.getList(pagingParameter, false)
    })
  }

  //获取列表
  getList = (param, isCach = true) => {
    const { history } = this.props
    let { values, pagingParameter, noInstallNum } = this.state
    if (isCach) {
      cache.cacheSearchParameter([{
        page: pagingParameter,
        parameter: values
      }], history)
    }
    let stringid = analysisUrl(this.props.location.search).stringid
    if (stringid) {
      values.stringId = stringid
    }
    if (this.getSort(noInstallNum)) {
      param.sortName = 'noInstallNum'
      param.sortOrder = this.getSort(noInstallNum)
    }
    api.patchInfoList(param).then(response => {
      if(response && response.head && response.head.code === '200' ){
        this.setState({
          body: response.body
        })
      }
    })
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

  getSort = (sort) => {
    return sort === 'ascend' ? 'asc' : sort === 'descend' ? 'desc' : null
  }

  //获取人员
  getUsers = async () => {
    this.setState({
      loading: true
    })
    await api.getBugUsers({
      flowId: 1,
      flowNodeTag: 'patch_install'
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

export default InformationList
