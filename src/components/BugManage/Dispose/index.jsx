import React, { Component, Fragment } from 'react'
import { connect } from 'dva'
import { object, string } from 'prop-types'
import { Link } from 'dva/router'
import { withRouter } from 'dva/router'
import { uniqBy, debounce } from 'lodash'
import { Form, Table, Pagination, message, Icon, Modal } from 'antd'
import api from '@/services/api'
import { ASSETS_IMPORTANT, UNEXPECTED_DISPOSE_STATUS } from '@a/js/enume'
import { analysisUrl, TooltipFn, transliteration, getAfterDeletePage } from '@/utils/common'
import { CommonModal, TableBtns, Search } from '@c/index'
import Loadings from '@c/common/Loading'
import BugDetail from '@c/BugManage/BugDetail'
import PatchDetail from '@c/PatchManage/PatchDetail'
import './index.less'
import { assetsPermission } from '@a/permission'
import hasAuth from '@/utils/auth'

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
export class Dispose extends Component {
  static propTypes = {
    //漏洞或补丁 bug | patch
    from: string,
    //流程节点
    userParam: object,
    vulModuleType: string,
    //详情接口
    detailUrl: string,
    //列表接口
    listUrl: string,
    //忽略接口
    neglectUrl: string,
    //提交运维接口
    submitUrl: string
  }
  constructor (props) {
    super(props)
    this.state = {
      id: analysisUrl(props.location.search).id,
      number: analysisUrl(props.location.search).number,
      treeData: props.treeData,
      detailData: {},
      selectedRowKeys: [],
      selectedRows: [],
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      body: null,
      values: {},
      //当前操作的数据
      currentData: null,
      devVisible: false,
      loading: false,
      //资产区域ID的集合
      areaId: [],
      isAllSelectShow: false,
      userList: [],
      backVisible: false,
      //退回原因
      result: ''

    }
  }
  componentDidMount () {
    //注意：获取详情用漏洞安天编号，获取列表用漏洞ID
    this.getDetail()
    //获取管理区域树数据
    this.props.dispatch({ type: 'system/getAreasByUserId', payload: { userId: sessionStorage.getItem('id') } })
    this.getList({
      ...this.state.pagingParameter
    })
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    if (JSON.stringify(this.props.treeData) !== JSON.stringify(nextProps.treeData)) {
      this.setState({
        treeData: nextProps.treeData
      })
    }
  }

  render () {
    const { from } = this.props
    let { userList, pagingParameter, body, treeData = [], selectedRowKeys, devVisible, loading, detailData, result, backVisible } = this.state
    const status = from === 'bug' ? 'status' : 'statusName'
    const columns = [
      {
        title: '编号',
        key: 'assetNum',
        width: '16%',
        dataIndex: 'assetNum',
        render: text => TooltipFn (text)
      },
      {
        title: '名称',
        key: 'assetName',
        dataIndex: 'assetName',
        width: '16%',
        render: text => TooltipFn (text)
      },
      {
        title: '类型',
        key: 'assetType',
        dataIndex: 'assetType',
        width: '12%'
      },
      {
        title: 'IP',
        key: 'ip',
        dataIndex: 'ip',
        width: '12%',
        render: text => TooltipFn (text)
      },
      {
        title: '重要程度',
        key: 'importGrade',
        dataIndex: 'importGrade',
        width: '12%'
      },
      {
        title: '归属区域',
        key: 'attribution',
        dataIndex: 'attribution',
        width: '12%'
      },
      {
        title: '状态',
        key: status,
        dataIndex: status,
        width: '12%',
        render: (text, record) => {
          if (text === '已退回') {
            return <span
              className="back-btn"
              onClick={() => this.getResult(record.processInstanceId)}>
              已退回
              <img className="back-result-icon" src={require('@a/images/bubble.png')} alt=""/>
            </span>
          }
          return text
        }
      },

      {
        title: '操作',
        key: 'operate',
        width: '14%',
        render: (record) => {
          const { encodeAssetId, status } = record
          return(
            <div className="operate-wrap">
              {
                status !== '处理中' && <Fragment>
                  <a onClick={() => this.neglect(record)}>忽略</a>
                  <a onClick={() => this.submitToDev(record)}>提交</a>
                </Fragment>
              }
              {
                hasAuth(assetsPermission.ASSET_INFO_VIEW) && <Link
                  target="_blank"
                  to={{
                    pathname: '/asset/manage/detail',
                    search: `id=${transliteration(encodeAssetId)}`,
                    state: { rCaches: 1 }
                  }}>查看</Link>
              }
            </div>
          )
        }
      }
    ]
    //表格复选
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, data) => this.rowChange(selectedRowKeys, data)
    }
    let list  = []
    let total =  0
    if (body){
      list = body.items
      total =  body.totalRecords
    }
    const submitText = from === 'bug' ? '漏洞修复'  : '补丁安装'
    // form字段定义
    const modalFormFields = [
      {
        type: 'select',
        key: 'disposeUserId',
        name: '运维人员',
        rules: [
          { required: true,  message: '请选择运维人员' }
        ],
        showSearch: true,
        placeholder: '请选择',
        defaultValue: '全部',
        data: [{ name: '全部', value: '全部' }, ...userList]
      },
      {
        type: 'textArea',
        key: 'vulRepairMemo',
        rows: 4,
        name: `${submitText}建议`,
        placeholder: '1-500字符',
        rules: [
          { required: true,  message: `请输入${submitText}建议` },
          { whitespace: true, message: '不能为空字符' },
          { message: '最多500个字符', max: 500 }
        ]
      }
    ]
    const defaultFields = [
      { type: 'input', label: '综合查询', placeholder: '请输入资产编号/资产名称/ip', key: 'mutil', allowClear: true, maxLength: 80 },
      { type: 'select', label: '重要程度', placeholder: '请选择', key: 'importGrade', showSearch: true, data: ASSETS_IMPORTANT },
      { type: 'treeSelect', label: '归属区域', placeholder: '全部', key: 'assetArea', showSearch: true, data: treeData[0], config: { name: 'fullName', value: 'stringId' }, multiple: true },
      { type: 'select', label: '状态', placeholder: '全部', key: 'assetState', showSearch: true, data: UNEXPECTED_DISPOSE_STATUS }
    ]
    return (
      <div className="main-detail-content dispose-page">
        <div className="dispose-border-box">
          {
            from === 'bug' ? <BugDetail detailData={detailData} isShowTitle /> : <PatchDetail detail={detailData} />
          }
        </div>
        <p className="detail-title">资产列表</p>
        <div className="search-bar">
          <Search defaultFields={defaultFields} onSubmit={values => this.handleSubmit(values)} onReset={this.handleReset}/>
        </div>
        <div className="table-wrap" style={{ marginTop: 20 }}>
          <TableBtns
            rightBtns={[
              { label: '忽略', onClick: () => this.handleBatch('neglect') },
              { label: '提交', onClick: () => this.handleBatch('submitToDev') }
            ]} />
          <Table
            className="dispose-table"
            rowSelection={rowSelection}
            rowKey='id'
            columns={columns}
            dataSource={list}
            pagination={false} />
          {
            total > 0 && <Pagination
              className="table-pagination"
              total={total} showTotal={(total) => `共 ${total || 0} 条数据`}
              showSizeChanger={total > 10}
              showQuickJumper
              onChange={this.changePage}
              onShowSizeChange={this.changeSize}
              pageSize={pagingParameter.pageSize}
              current={pagingParameter.currentPage} />
          }
        </div>
        <CommonModal
          type="form"
          visible={devVisible}
          title="提交"
          width={650}
          oktext="提交"
          value={this.onSubmit}
          onClose={() => this.setState({ devVisible: false, loading: false, currentData: null, areaId: [] })}
          fields={modalFormFields}
          column={1}
          FormItem={Item}
          formLayout={formLayout}
        />
        <Modal
          className="over-scroll-modal"
          title="退回原因"
          width={650}
          visible={backVisible}
          footer={null}
          maskClosable={false}
          onCancel={() => {this.setState({ backVisible: false })}}>
          <div style={{ padding: 40 }}>{result}</div>
        </Modal>

        <Loadings loading={loading} />
      </div>
    )
  }

  //表单重置
  handleReset = () => {
    const pagingParameter = {
      pageSize: 10,
      currentPage: 1
    }
    this.setState({
      values: {},
      pagingParameter,
      selectedRowKeys: [],
      selectedRows: []
    }, () => {
      this.getList(pagingParameter)
    })
  }

  // 表单查询
  handleSubmit = (values) => {
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

  //提交忽略
  neglect = (record) => {
    const { vulModuleType, neglectUrl, from } = this.props
    const { selectedRows } = this.state
    const data = record ? [record] : selectedRows
    this.claimTaskBatch(data.map(item => item.taskId), () => {
      const ids = [], taskId  = []
      data.forEach(item => {
        ids.push(item.id)
        taskId.push(item.taskId)
      })
      const text = from === 'bug' ? '漏洞' : '补丁'
      confirm({
        icon: <Icon type="close" onClick={() => { Modal.destroyAll() }} />,
        content: `是否确认忽略${text}信息？`,
        okText: '确认',
        onOk: debounce(() => {
          const params = {
            ids,
            taskId
          }
          if (vulModuleType) {
            params.vulModuleType = vulModuleType
          }
          api[neglectUrl](params).then(response => {
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
    })
  }

  //提交运维人员
  onSubmit = debounce((formValues) => {
    this.setState({
      loading: true
    })
    const { vulModuleType, submitUrl, from  } = this.props
    let { disposeUserId, vulRepairMemo } = formValues
    const { id, currentData, selectedRows, userList } = this.state
    const data = currentData ? [currentData] : selectedRows
    this.claimTaskBatch(data.map(item => item.taskId), () => {
      const ids = [], taskId = [], assetIds = []
      data.forEach(item => {
        ids.push(item.id)
        assetIds.push(item.assetId)
        taskId.push(item.taskId)
      })
      if (disposeUserId === '全部') {
        disposeUserId = userList.map(item => item.stringId).join(',')
      }
      let params = {
        ids,
        assetIds,
        taskId,
        //关联漏洞ID
        relId: [id],
        //修复建议
        vulRepairMemo,
        //处置人员ID
        disposeUserId,
        //漏洞标识字段
        type: from === 'bug' ? '1' : '2',
        //建议类型 1 修复/安装 2 退回
        suggestionType: '1'
      }
      if (vulModuleType) {
        params.vulModuleType = vulModuleType
      }
      api[submitUrl](params).then(response => {
        if (response && response.head && response.head.code === '200') {
          this.handleSuccess(data)
        }
        this.setState({
          loading: false
        })
      }).catch(err => {
        this.setState({
          loading: false
        })
      })
    })
  }, 1000, { leading: true, trailing: false })

  handleSuccess = (data) => {
    const { values, pagingParameter, body } = this.state
    let { currentPage, pageSize } = pagingParameter
    message.success('操作成功！')
    currentPage = getAfterDeletePage(body.totalRecords - data.length, currentPage, pageSize)
    this.setState({
      devVisible: false,
      selectedRowKeys: [],
      selectedRows: [],
      areaId: [],
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

  //显示表单弹框，获取运维人员
  submitToDev = async (currentData) => {
    await this.setState({
      loading: true,
      areaId: [currentData.areaId],
      currentData
    })
    await this.getUsers()
    this.setState({
      loading: false,
      devVisible: true
    })
  }

  //行选择
  rowChange = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRows: uniqBy([...this.state.selectedRows, ...selectedRows], 'id').filter(item => selectedRowKeys.includes(item.id)),
      selectedRowKeys
    })
  }

  //批量操作
  handleBatch = async (type) => {
    const { selectedRowKeys, selectedRows } = this.state
    if (selectedRowKeys.length === 0) {
      message.info('请选择数据！')
      return false
    }
    if (type === 'neglect') {
      this.neglect()
    } else {
      await this.setState({
        loading: true,
        areaId: selectedRows.map(item => item.areaId)
      })
      await this.getUsers()
      //提交入网
      this.setState({
        devVisible: true,
        loading: false
      })
    }
  }

  //获取列表
  getList = (param) => {
    const { listUrl, from } = this.props
    const { id } = this.state
    this.setState({
      pagingParameter: {
        pageSize: param.pageSize,
        currentPage: param.currentPage
      }
    })
    if (from === 'bug') {
      param.vulId = id
    } else {
      param.patchId = id
    }
    api[listUrl](param).then(response => {
      if (response && response.head && response.head.code === '200' ) {
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
      this.getList(param)
    })
  }

  changeSize = (currentPage, pageSize) => {
    this.setState({
      selectedRowKeys: [],
      selectedRows: []
    })
    this.changePage(currentPage, pageSize)
  }

  //获取详情
  getDetail = () => {
    const { detailUrl, from } = this.props
    const { number } = this.state
    let params = {}
    if (from === 'bug') {
      params.antiyVulnId = number
    } else {
      params.antiyPatchNumber = number
    }
    api[detailUrl](params).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          detailData: response.body || {}
        })
      }
    })
  }

  //获取人员
  getUsers = async () => {
    const { userParam } = this.props
    const { areaId } = this.state
    userParam.areaId = areaId
    await api.getBugUsers(userParam).then(response => {
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

  //退回原因
  getResult = debounce((processInstanceId) => {
    const taskDefinitionKey = this.props.from === 'bug' ? 'vulFix' : 'patchInstallTask'
    api.findHisFormDataByTaskDefKey({
      taskDefinitionKey,
      processInstanceId
    }).then(response => {
      if(response && response.head && response.head.code === '200' && response.body && response.body.length ){
        const result = response.body.filter(item => item.propertyId === 'reason')
        this.setState({
          backVisible: true,
          result: result.length ? result[0].propertyValue : ''
        })
      }
    })
  }, 1000, { leading: true, trailing: false })

  //流程接口
  claimTaskBatch = (taskIds, callBack) => {
    taskIds = taskIds.filter(item => item !== null)
    if (!taskIds.length) {
      callBack()
      return false
    }
    api.claimTaskBatch({
      taskIds,
      userId: sessionStorage.getItem('id')
    }).then(response => {
      if (response && response.head && response.head.code === '200') {
        callBack()
      }
    })
  }
}

const mapStateToProps = ({ system }) => {
  return { treeData: system.treeData }
}

export default connect(mapStateToProps)(Dispose)
