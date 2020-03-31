import { Component } from 'react'
import { Link, withRouter } from 'dva/router'
import { Form, Button, Table, Pagination, message } from 'antd'
import { uniqBy } from 'lodash'
import { cache, transliteration, analysisUrl, TooltipFn } from '@/utils/common'
import api from '@/services/api'
import { CommonModal } from '@c/index'
import { patchPermission } from '@a/permission'
import hasAuth from '@u/auth'
import Loadings from '@c/common/Loading'
import { ASSETS_IMPORTANT, ASSETS_TYPE } from '@a/js/enume'
import Search  from '@c/common/Search'

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
class InstallAsset extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      body: null,
      riskAssetNum: '',
      noInstallNum: '',
      selectedRowKeys: [],
      selectedRows: [],
      values: {},
      userList: [],
      internetVisible: false,
      loading: false,
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
    let { body, pagingParameter, selectedRowKeys, loading, internetVisible, riskAssetNum, noInstallNum, isShowInternet } = this.state
    const columns = [{
      title: '资产名称',
      key: 'assetName',
      dataIndex: 'assetName',
      render: (text)=>{
        return TooltipFn(text)
      }
    }, {
      title: '资产编号',
      key: 'assetNo',
      dataIndex: 'assetNo',
      render: (text)=>{
        return TooltipFn(text)
      }
    }, {
      title: '资产类型',
      key: 'assetType',
      dataIndex: 'assetType'
    }, {
      title: '重要程度',
      key: 'importGrade',
      dataIndex: 'importGrade'
    },
    {
      title: '当前未安装补丁数',
      key: 'riskAssetNum',
      dataIndex: 'riskAssetNum',
      sortOrder: riskAssetNum,
      sorter: true
    },
    {
      title: '待安装补丁数',
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
              hasAuth(patchPermission.PatchInstallManageInstall) && <Link to={`/bugpatch/patchmanage/install/asset?id=${record.id}&areaId=${record.areaId}`}>安装</Link>
            }
            {
              hasAuth(patchPermission.PatchInstallManageDetail) && <Link to={`/asset/manage/detail?id=${transliteration(record.stringId)}`}>查看</Link>
            }
          </div>
        )
      }
    }]
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
        disabled: record.noInstallNum === '0'
      })
    }
    // 批量安装form
    const formFields = [
      {
        type: 'textArea',
        key: 'repairSuggestions',
        rows: 4,
        name: '配置建议',
        placeholder: '请输入',
        rules: [
          { required: true,  message: '请输入配置建议议' },
          { whitespace: true, message: '不能为空字符' },
          { message: '最多500个字符', max: 500 }
        ]
      }
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
            rowKey="id"
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
      relIds.push(item.id)
    })
    values.baselineIds = userList.map(item => item.stringId)
    api.outPatchInstall({
      //资产维度1
      dimension: '1',
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
      selectedRows: uniqBy([...this.state.selectedRows, ...selectedRows], 'id').filter(item => selectedRowKeys.includes(item.id))
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
    cache.removeCriteria('0', this.props.history)
    const pagingParameter = {
      pageSize: 10,
      currentPage: 1
    }
    this.setState({
      values: {},
      riskAssetNum: '',
      noInstallNum: '',
      pagingParameter,
      selectedRowKeys: [],
      selectedRows: []
    }, () => {
      this.getList(pagingParameter, false)
    })
  }

 //排序
 handleTableSort = (pagination, filters, sorter) => {
   const { columnKey, order } = sorter
   this.setState({
     riskAssetNum: columnKey === 'riskAssetNum' ? order : '',
     noInstallNum: columnKey === 'noInstallNum' ? order : ''
   }, () => {
     const { values, pagingParameter } = this.state
     this.getList({
       ...values,
       ...pagingParameter
     })
   })
 }

  //获取列表
  getList = (param, isCach = true) => {
    const { history } = this.props
    let { values, pagingParameter, riskAssetNum, noInstallNum } = this.state
    if (isCach) {
      cache.cacheSearchParameter([{
        page: pagingParameter,
        parameter: values
      }], history, 0, '0')
    }
    let stringid = analysisUrl(this.props.location.search).stringid
    if (stringid) {
      values.stringId = stringid
    }
    if (this.getSort(noInstallNum)) {
      param.sortName = 'noInstallNum'
      param.sortOrder = this.getSort(noInstallNum)
    }
    if (this.getSort(riskAssetNum)) {
      param.sortName = 'riskAssetNum'
      param.sortOrder = this.getSort(riskAssetNum)
    }
    api.getInstallManageAssetList(param).then(response => {
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

export default InstallAsset
