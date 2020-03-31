import React, { Component, Fragment } from 'react'
import { Table, Pagination, Button, Select, message, Form, Icon, Modal } from 'antd'
import { Link } from 'dva/router'
import { connect } from 'dva'
import { uniqBy, debounce } from 'lodash'
import { withRouter } from 'dva/router'
import moment from 'moment'
import api from '@/services/api'
import { string, object, array } from 'prop-types'
import ManualRepairModal from '@c/BugManage/ManualRepairModal'
import ManualInstallModal from '@c/PatchManage/ArtificialModal'
import hasAuth from '@/utils/auth'
import { analysisUrl, transliteration, TooltipFn, getAfterDeletePage } from '@u/common'
import Loadings from '@c/common/Loading'
import { CommonModal, Search } from '@c/index'
import '@/pages/BugManage/index.less'

const { confirm } = Modal
const { Item } = Form
const { Option } = Select
const formLayout = {
  labelCol: {
    span: 8
  },
  wrapperCol: {
    span: 12
  }
}

@withRouter
class DisposeTable extends Component {
  static propTypes = {
    //页面来源：bug | patch
    pageType: string,
    //页面类型：assets | bug | patch
    from: string,
    //入网接口
    internetUrl: string,
    //忽略接口
    neglectUrl: string,
    neglectId: string,
    //查询项
    defaultFields: array,
    linkId: string,
    diffItems: object,
    listUrl: string,
    paramsId: string,
    repairByAutoUrl: string,
    repairByMananulUrl: string,
    configUrl: string,
    backUrl: string,
    adviseUrl: string,
    linkUrl: string,
    userParam: object,
    checkTag: string
  }
  constructor (props) {
    super(props)
    this.state = {
      id: analysisUrl(this.props.location.search).id,
      //当前操作的列表数据
      currentData: null,
      //资产区域ID的集合
      areaId: [],
      loading: false,
      body: null,
      values: {},
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      //修复建议
      adviseData: [],
      //人工修复弹框
      manualRepairVisible: false,
      selectedRowKeys: [],
      //当前勾选列表
      selectedRows: [],
      isAllSelectShow: false,
      //禁用批量忽略
      isDisabledNeglect: false,
      //禁用批量退回
      isDisabledBack: false,
      internetVisible: false,
      backVisible: false,
      userList: [],
      isShowInternet: false,
      treeData: props.treeData
    }
    const isBug = props.pageType === 'bug'
    //配置弹框的状态
    this.configStatus = isBug ? ['3', '8'] : ['3', '7']
    //显示修复按钮对应的状态
    this.repairStatus = isBug ? ['3', '6', '7', '8'] : ['3', '6', '7']
    //显示忽略按钮对应的状态
    this.neglectStatus = isBug ? ['6', '8'] : ['6', '7']
    //显示退回按钮对应的状态
    this.backStatus = ['3']
    //禁止复选框的的行：修复中
    this.disabled = ['4']
    this.pageText = isBug ? '漏洞' : '补丁'
    this.repairText = isBug ? '修复' : '安装'
  }

  componentDidMount () {
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
    const { linkUrl, diffItems, from, linkId, checkTag, pageType, defaultFields } = this.props
    const { name, number, type = {}, area = {}, level } = diffItems
    const {
      userList,
      isAllSelectShow,
      pagingParameter,
      body,
      selectedRowKeys,
      internetVisible,
      backVisible,
      isDisabledNeglect,
      isDisabledBack,
      loading,
      isShowInternet,
      treeData
    } = this.state
    const isBug = pageType === 'bug'
    //表格复选
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, data) => this.rowChange(selectedRowKeys, data),
      //行禁用
      getCheckboxProps: record => ({
        disabled: record.disabledRow
      })
    }
    let list  = [], total = 0
    if (body){
      list = body.items
      total =  body.totalRecords
    }
    let columns = [
      {
        title: name.text,
        dataIndex: name.key,
        key: name.key,
        isShow: true,
        render: text => TooltipFn (text)

      },
      {
        title: number.text,
        dataIndex: number.key,
        key: number.key,
        isShow: true,
        render: text => TooltipFn (text)
      },
      {
        title: type.text,
        dataIndex: type.key,
        key: type.key,
        width: 180,
        isShow: from !== 'assets',
        render: text => TooltipFn (text)
      },
      {
        title: area.text,
        dataIndex: area.key,
        key: area.key,
        width: 180,
        isShow: from !== 'assets',
        render: text => TooltipFn (text)
      },
      {
        title: level.text,
        dataIndex: level.key,
        key: level.key,
        isShow: true,
        render: text => TooltipFn (text)
      },
      {
        title: 'IP',
        key: 'ip',
        dataIndex: 'ip',
        isShow: from === 'patch' && pageType === 'patch',
        render: (text) => {
          return TooltipFn(text)
        }
      },
      {
        title: '前置补丁',
        key: 'prePatch',
        dataIndex: 'prePatch',
        isShow: from === 'assets' && pageType === 'patch',
        render: (text) => {
          return TooltipFn(text)
        }
      },
      {
        title: `${this.repairText}方式`,
        dataIndex: 'mode',
        isShow: true,
        render: (text, record) => {
          //修复方式初始化
          let initMode
          if (text === '1') {
            initMode = '人工'
          } else {
            initMode = '自动'
          }
          if (this.disabled.includes(record.status)) {
            return initMode
          } else {
            return (
              <Select
                getPopupContainer={triggerNode => triggerNode.parentNode}
                value={text}
                style={{ width: 80 }}
                placeholder="请选择"
                disabled={record.disabledMode}
                onChange={value => this.changeRepair(value, record)}>
                <Option key='1'>人工</Option>
                <Option key='2'>自动</Option>
              </Select>
            )
          }
        }
      },
      {
        title: `${this.repairText}状态`,
        dataIndex: 'statusStr',
        key: 'statusStr',
        isShow: true,
        render: text => TooltipFn (text)
      },
      {
        title: '修复方案',
        dataIndex: 'solutionId',
        key: 'solutionId',
        isShow: pageType === 'bug',
        render: (text, record) => {
          return this.getPlan(text, record)
        }
      },
      {
        title: `${this.repairText}建议`,
        dataIndex: 'suggestion',
        key: 'suggestion',
        isShow: true,
        render: (text, record) => {
          if (record.suggestion) {
            return TooltipFn(record.suggestion.suggestion)
          } else {
            return '--'
          }
        }
      },
      {
        title: `${this.repairText}时间`,
        dataIndex: 'time',
        key: 'time',
        width: 200,
        isShow: true,
        render: (text, record) => {
          return text ? <span className="tabTimeCss">{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span> : '--'
        }
      },
      {
        title: '操作',
        key: 'operate',
        isShow: true,
        render: (record) => {
          const { status } = record
          let url = `${linkUrl}${transliteration(record[linkId])}`
          if (isBug && from === 'assets') {
            url += `&id=${record.vulId}`
          }
          return(
            <div className="operate-wrap">
              {
                this.neglectStatus.includes(status) && <a onClick={() => this.neglect(record)}>忽略</a>
              }
              {
                this.backStatus.includes(status) && <a onClick={()=> this.setState({ currentData: record, backVisible: true })}>退回</a>
              }
              {
                this.repairStatus.includes(status) &&  <a onClick={() => this.prevRepair(record)}>{this.repairText}</a>
              }
              {
                hasAuth(checkTag) && <Link to={url} target="_blank">查看</Link>
              }
            </div>
          )
        }
      }]
    columns = columns.filter(item => item.isShow)
    //配置入网表单
    const internetKey = isBug ? 'ifNeed' : 'whetherBreak'
    const internetValues = isBug ? [0, 1] : [false, true]
    let formFields = [
      {
        type: 'select',
        key: 'baselineIds',
        name: '配置人员',
        rules: [
          { required: true,  message: '请选择配置人员' }
        ],
        showSearch: true,
        placeholder: '请选择',
        defaultValue: '全部',
        data: [{ name: '全部', value: '全部' }, ...userList]
      },
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
        key: internetKey,
        name: `${this.pageText}${this.repairText}完成前是否需要阻断入网`,
        rules: [
          { required: true,  message: '请选择是否需要阻断入网' }
        ],
        data: [{ label: '是', value: internetValues[1] }, { label: '否', value: internetValues[0] }]
      })
    }
    //退回表单
    const backFields = [
      {
        type: 'textArea',
        key: 'reason',
        rows: 4,
        name: '退回理由',
        placeholder: '请输入',
        rules: [
          { required: true,  message: '请输入退回理由' },
          { whitespace: true, message: '不能为空字符' },
          { max: 500, message: '最多500个字符'  }
        ]
      }
    ]

    let searchForm = [
      ...defaultFields
    ]
    if (from !== 'assets' ) {
      searchForm = [
        ...searchForm,
        {
          type: 'treeSelect',
          label: '资产区域',
          placeholder: '全部',
          key: 'assetArea',
          showSearch: true,
          data: treeData[0],
          config: { name: 'fullName', value: 'stringId' },
          multiple: true
        }
      ]
    }
    return (
      <div>
        <div className="search-bar">
          <Search defaultFields={searchForm} onSubmit={values => this.handleSubmit(values)} onReset={this.handleReset}/>
        </div>
        <div className="table-wrap" style={{ marginTop: '20px' }}>
          <div className='table-btn'>
            {/* 占位 */}
            <div></div>
            <div className="right-btn">
              <Button disabled={isDisabledNeglect} type='primary' onClick={() => this.handleBatch('neglect')}>忽略</Button>
              <Button disabled={isDisabledBack} type='primary' onClick={() => this.handleBatch('backVisible')}>退回</Button>
              <Button type='primary' onClick={() => this.handleBatch('repair')}>{this.repairText}</Button>
            </div>
          </div>
          <Table
            className={isAllSelectShow ? '' : 'disabled-select-table'}
            rowKey="stringId"
            columns={columns}
            dataSource={list}
            rowSelection={rowSelection}
            pagination={false} />
          {
            total > 0 && <Pagination
              className="table-pagination"
              total={total}
              showTotal={(total) => `共 ${total || 0} 条数据`}
              showQuickJumper
              showSizeChanger={total > 10}
              onChange={this.changePage}
              onShowSizeChange={this.changeSize}
              pageSize={pagingParameter.pageSize}
              current={pagingParameter.currentPage} />
          }
        </div>
        {/* 退回*/}
        <CommonModal
          type="form"
          visible={backVisible}
          title="退回"
          width={650}
          oktext="提交"
          value={this.onBackSubmit}
          onClose={() => this.setState({ backVisible: false, currentData: null })}
          fields={backFields}
          column={1}
          FormItem={Item}
          formLayout={formLayout}
        />
        {/* 提交入网 */}
        <CommonModal
          type="form"
          visible={internetVisible}
          title={isBug ? '修复方案' : '补丁配置'}
          width={750}
          oktext="提交"
          value={this.onInterNetSubmit}
          onClose={() => this.setState({ internetVisible: false, loading: false, currentData: null })}
          fields={formFields}
          column={1}
          FormItem={Item}
          formLayout={formLayout}
        />
        {
          this.renderRepairModal()
        }
        <Loadings loading={loading} />
      </div>
    )
  }

  //配置入网
  onInterNetSubmit = debounce((formValues) => {
    this.setState({
      loading: true
    })
    const { internetUrl } = this.props
    const { values, currentData, selectedRows, userList, pagingParameter } = this.state
    const data = currentData ? [currentData] : selectedRows
    this.claimTaskBatch(data.map(item => item.taskId), () => {
      const configs = data.map(item => {
        const { stringId, solutionId, taskId, solutionName } = item
        return {
          id: stringId,
          solutionId,
          solutionName,
          taskId
        }
      })
      const baselineIds = formValues.baselineIds
      formValues.baselineIds = baselineIds === '全部' ? userList.map(item => item.stringId) : [baselineIds]
      let params = {
        configs,
        mode: data[0].mode - 0,
        ...formValues
      }
      api[internetUrl](params).then(response => {
        if (response && response.head && response.head.code === '200') {
          message.success('操作成功！')
          this.setState({
            internetVisible: false,
            selectedRowKeys: [],
            selectedRows: [],
            areaId: [],
            currentData: null
          })
          this.getList({
            ...pagingParameter,
            ...values
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
    })
  }, 1000, { leading: true, trailing: false })

  //提交自动修复
  autoRepair = debounce((data) => {
    this.checkPlan(data) && this.autoRepairPost(data)
  }, 1000, { leading: true, trailing: false })

  autoRepairPost = (data) => {
    const { repairByAutoUrl, pageType } = this.props
    const { values, pagingParameter } = this.state
    confirm({
      icon: <Icon type="close" onClick={() => { Modal.destroyAll() }} />,
      content: <Fragment>
        <p className="model-text">{`是否执行资产${this.pageText}${this.repairText}任务？`}</p>
        <p className="model-text" style={{ marginTop: 0 }}>{`确认后将开始执行${this.repairText}操作！`}</p>
      </Fragment>,
      okText: '确认',
      onOk: () => {
        this.claimTaskBatch(data.map(item => item.taskId), () => {
          let params = {}
          //漏洞自动修复
          if (pageType === 'bug') {
            const configs = data.map(item => {
              const { stringId, solutionId, taskId, solutionName } = item
              return {
                id: stringId,
                solutionId,
                solutionName,
                taskId
              }
            })
            params = {
              configs
            }
          //补丁自动安装
          } else {
            params = {
              relIds: data.map(item => item.stringId)
            }
          }
          api[repairByAutoUrl](params).then(response => {
            if (response && response.head && response.head.code === '200') {
              this.setState({
                selectedRowKeys: [],
                selectedRows: [],
                currentData: null
              })
              this.getList({
                ...pagingParameter,
                ...values
              })
              message.success('操作成功！')
            }
          })
        })
      }
    })
  }

  //提交人工修复
  submitManualRepair = debounce((formValues) => {
    const { repairByMananulUrl, pageType } = this.props
    const { values, pagingParameter, currentData, selectedRows } = this.state
    const data = currentData ? [currentData] : selectedRows
    this.claimTaskBatch(data.map(item => item.taskId), () => {
      const configs = data.map(item => {
        const { stringId, solutionId, taskId, solutionName } = item
        return {
          id: stringId,
          solutionId,
          solutionName,
          taskId
        }
      })
      let params = {
        configs,
        ...formValues
      }
      api[repairByMananulUrl](params).then(response => {
        if (response && response.head && response.head.code === '200') {
          this.setState({
            selectedRowKeys: [],
            selectedRows: [],
            manualRepairVisible: false,
            currentData: null
          })
          //人工选择已修复会删除当前数据
          const successStats = pageType === 'bug' ? '1' : 1
          if (formValues.status === successStats) {
            this.handleSuccess(data)
          } else {
            message.success('操作成功！')
            this.getList({
              ...pagingParameter,
              ...values
            })
          }
        }
      })
    })
  }, 1000, { leading: true, trailing: false })

  //提交退回
  onBackSubmit = debounce((formValues) => {
    const { backUrl, pageType } = this.props
    let { selectedRows, currentData } = this.state
    const data = currentData ? [currentData] : selectedRows
    this.claimTaskBatch(data.map(item => item.taskId), () => {
      const rollbackList = data.map(item => {
        return {
          stringId: item.stringId,
          taskId: item.taskId
        }
      })
      const backKey = pageType === 'bug' ? 'vulHandleResult' : 'patchHandleResult'
      api[backUrl]({
        rollbackList,
        fromData: { [backKey]: 'goBack', reason: formValues.reason }
      }).then(response => {
        if (response && response.head && response.head.code === '200') {
          this.handleSuccess(data)
        }
      })
    })
  }, 1000, { leading: true, trailing: false })

  //提交忽略
  neglect = (record) => {
    const { pageType, from, neglectUrl, neglectId } = this.props
    const { selectedRows, id } = this.state
    const data = record ? [record] : selectedRows
    this.claimTaskBatch(data.map(item => item.taskId), () => {
      const ids = [], taskId  = []
      data.forEach(item => {
        ids.push(item[neglectId])
        taskId.push(item.taskId)
      })
      confirm({
        icon: <Icon type="close" onClick={() => { Modal.destroyAll() }} />,
        content: `是否确认忽略${this.pageText}信息？`,
        okText: '确认',
        onOk: debounce(() => {
          let params = {}
          //补丁安装
          if (pageType === 'patch') {
            params = {
              ids,
              taskId
            }
            //资产维度
            if (from === 'assets') {
              params.assetId = id
            } else {
              params.patchId = id
            }
          //漏洞修复
          } else {
            params = {
              relId: ids,
              taskId
            }
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

  handleSuccess = (data) => {
    const { values, pagingParameter, body } = this.state
    let { currentPage, pageSize } = pagingParameter
    message.success('操作成功！')
    currentPage = getAfterDeletePage(body.totalRecords - data.length, currentPage, pageSize)
    this.setState({
      backVisible: false,
      manualRepairVisible: false,
      internetVisible: false,
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

  //检查人工单单条修复
  checkManualPlan = (data) => {
    const bool = this.checkPlan([data])
    bool && this.setState({ manualRepairVisible: true, currentData: data })
  }

  //判断是否包含缓解方案
  checkPlan = (data) => {
    let bool = true
    data.forEach(item => {
      if (item.solutionType === '1') {
        message.info(`${item.solutionName}为缓解方案，请重新选择！`)
        bool = false
      }
    })
    return bool
  }

  //修复方式修改
  changeRepair = (value, record) => {
    let { body, selectedRows } = this.state
    body = JSON.parse(JSON.stringify(body))
    let currentRow = body.items.filter(item => item.stringId === record.stringId)[0]
    //通过勾选行列表判断复选框是否禁用
    if (!this.disabled.includes(currentRow.status)) {
      currentRow.disabledRow = selectedRows.length !== 0 ? !currentRow.disabledRow : false
    }
    currentRow.mode = value
    this.setState({
      body
    }, this.isAllSelectShow)
  }

  //修复方案修改
  changePlan = (value, record) => {
    let { body, selectedRows } = this.state
    //获取修复方案的type
    const { solutionType, solutionName } = record.solutionList.filter(item => item.stringId === value)[0]
    body = JSON.parse(JSON.stringify(body))
    let currentRow = body.items.filter(item => item.stringId === record.stringId)[0]
    //批量操作选中行的修复方案数据，防止批量修复操作的时候方案值不会改变
    if (selectedRows.length) {
      selectedRows = JSON.parse(JSON.stringify(selectedRows))
      let selectedRow = selectedRows.filter(item => item.stringId === record.stringId)[0]
      if (selectedRow) {
        selectedRow.solutionId = value
        selectedRow.solutionType = solutionType
      }
    }
    //是否修改了方案
    currentRow.isChangePlan = currentRow.oldPlanId !== value
    currentRow.solutionId = value
    currentRow.solutionType = solutionType
    currentRow.solutionName = solutionName
    this.setState({
      body,
      selectedRows
    })
  }

  //获取方案
  getPlan = (text, record) => {
    const { status } = record
    const solutionList = record.solutionList || []
    //配置中、待修复、修复中、已缓解且全是缓解方案展示solution或空
    if (status === '2' || status === '3' || status === '4') {
      return record.solution ? TooltipFn(record.solution.solutionName) : '--'
    }
    //待配置、已缓解、修复失败展示list下拉框或空(只有待配置，修复失败，已缓解状态的修复方案可以进行修改)
    if (status === '1' || status === '6' || status === '7') {
      if (!solutionList.length) {
        return  '--'
      } else {
        return <Select
          getPopupContainer={triggerNode => triggerNode.parentNode}
          value={text}
          style={{ width: 80 }}
          placeholder="请选择"
          disabled={record.disabledPlan}
          onChange={value => this.changePlan(value, record)}>
          {
            solutionList.map(item => <Option key={item.stringId}>{item.solutionName}</Option>)
          }
        </Select>
      }
    }
    return '--'
  }

  //是否显示全选
  isAllSelectShow = () => {
    const { body } = this.state
    const items = body.items
    //非禁选行
    const canOptionRows = items.filter(item => !this.disabled.includes(item.status))
    if (canOptionRows.length) {
      let isAllSelectShow = false
      const firstRowMode = canOptionRows[0].mode
      const firstStatus = canOptionRows[0].status
      //状态一致和修复方式一致才能显示全选
      isAllSelectShow = canOptionRows.every(item => item.mode === firstRowMode && item.status === firstStatus)
      this.setState({
        isAllSelectShow
      })
    }
  }

  //行选择
  rowChange = (selectedRowKeys, data) => {
    const { body, selectedRows } = this.state
    const list = body.items
    //所有选择的行(包括分页选中)
    const allSelectedRows = uniqBy([...selectedRows, ...data], 'stringId').filter(item => selectedRowKeys.includes(item.stringId))
    this.rowChangeToInit(selectedRowKeys, list)
    if (data.length || selectedRowKeys.length) {
      this.rowChangeToDisabled(data, selectedRows, list, allSelectedRows)
    } else {
      this.rowChangeToReset(list)
    }
    this.setState({
      selectedRows: allSelectedRows,
      selectedRowKeys
    })
  }

  //初始化启用每一行，防止取消后无法启用复选框，禁用所有复选中行的修复方式
  rowChangeToInit = (selectedRowKeys, list) => {
    list.map(item => {
      item.disabledMode = false
      item.disabledRow = false
      item.disabledPlan = false
      return item
    }).filter(item =>
      selectedRowKeys.includes(item.stringId)
    ).forEach(item => {
      item.disabledMode = true
    })
  }

  //禁用操作
  rowChangeToDisabled = (data, selectedRows, list, allSelectedRows) => {
    data = data.length ? data : selectedRows
    const status = data[0].status
    //禁用状态和修复方式不一致
    list.filter(item =>
      item.mode !== data[0].mode || item.status !== status
    ).forEach(item => {
      item.disabledRow = true
    })
    //禁用状态不一致的下拉修复框
    list.filter(item =>
      item.status !== status
    ).forEach(item => {
      item.disabledMode = true
    })
    //是否禁用批量退回按钮
    const isDisabledBack = allSelectedRows.some(item => !this.backStatus.includes(item.status))
    this.setState({
      isDisabledBack
    })
    //是否禁用批量忽略按钮
    const isDisabledNeglect = allSelectedRows.some(item => !this.neglectStatus.includes(item.status))
    this.setState({
      isDisabledNeglect
    })
  }

  //清空时重置
  rowChangeToReset = (list) => {
    this.setState({
      isDisabledNeglect: false,
      isDisabledBack: false
    })
    //还原初始化禁用的行
    list.filter(item =>
      this.disabled.includes(item.status)
    ).forEach(item => {
      item.disabledRow = true
    })
  }

  //渲染修复弹框
  renderRepairModal = () => {
    const { pageType } = this.props
    const { manualRepairVisible } = this.state
    if (manualRepairVisible) {
      return pageType === 'bug' ?
        <ManualRepairModal
          visible={manualRepairVisible}
          onsubmit={this.submitManualRepair}
          onCancel={() => this.setState({ manualRepairVisible: false, currentData: null })}
        /> :
        <ManualInstallModal
          visible={manualRepairVisible}
          onsubmit={this.submitManualRepair}
          onCancel={() => this.setState({ manualRepairVisible: false, currentData: null })}
        />
    }
  }

  //批量操作
  handleBatch = async (type) => {
    const { selectedRows } = this.state
    if (selectedRows.length === 0) {
      message.info('请选择数据！')
      return false
    }
    //忽略
    if (type === 'neglect') {
      this.neglect()
    }
    //退回
    if (type === 'backVisible') {
      this.setState({
        backVisible: true
      })
    }
    //安装 | 修复
    if (type === 'repair') {
      this.handleRepair(selectedRows)
    }
  }

  handleRepair = async (selectedRows) => {
    const { mode, status } = selectedRows[0]
    const { pageType } = this.props
    //漏洞非待修复状态需判断是否更改过修复方案
    if (pageType === 'bug' && status !== '3' && selectedRows.length > 1 && this.checkChangePlan(selectedRows)) {
      message.info('批量修复时禁止修改修复方案！')
      return false
    }
    //配置弹框
    if (this.configStatus.includes(status)) {
      await this.setState({
        loading: true,
        areaId: selectedRows.map(item => item.areaId)
      })
      await this.isInternet()
      //获取配置人员
      await this.getUsers()
      this.setState({
        internetVisible: true,
        loading: false
      })
    } else {
      if (mode === '1') {
        const bool = this.checkPlan(selectedRows)
        bool && this.setState({ manualRepairVisible: true })
      } else {
        this.autoRepair(selectedRows)
      }
    }
  }

  /**
  * 修复安装前置判断
  * 漏洞：1.待修复 2.配置失败 3.修复失败时更改了修复方案 => 弹配置框;
  *       修复失败未修改方案 => 弹人工、自动框
  * 补丁：1.待安装 2.配置失败 => 弹配置框;
  *       安装失败 => 弹人工、自动框
  **/
  prevRepair = async (record) => {
    const { pageType } = this.props
    //待修复待安装状态下弹配置弹框
    if (this.configStatus.includes(record.status) || (pageType === 'bug' && this.isBugConfig([record]))) {
      await this.setState({
        loading: true,
        areaId: [record.areaId],
        currentData: record
      })
      await this.isInternet()
      //获取配置人员
      await this.getUsers()
      this.setState({
        internetVisible: true
      })
    } else {
      const { mode } = record
      mode === '1' ? this.checkManualPlan(record) : this.autoRepair([record])
    }
  }

  //漏洞是否弹配置
  isBugConfig = (selectedRows) => {
    const isChangePlan = selectedRows.some(item => item.isChangePlan)
    if (['6', '7'].includes(selectedRows[0].status) && isChangePlan) {
      return true
    }
    return false
  }

  //查询是否入网
  isInternet = async () => {
    const { from } = this.props
    const { selectedRows, id, currentData } = this.state
    let assetIds = []
    if (from === 'assets') {
      assetIds = [id]
    } else {
      assetIds = currentData ? [currentData.assetId] : selectedRows.map(item => item.assetId)
    }
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

  //漏洞下批量修复时,检查是否修改了修复方案
  checkChangePlan = (selectedRows) => {
    const { body } = this.state
    let bool = false
    selectedRows.forEach(item => {
      const row = body.items.filter(subItem => subItem.stringId === item.stringId)[0]
      if (row.isChangePlan) {
        bool = true
      }
    })
    return bool
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

  //表单查询
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

  //获取列表
  getList = (param) => {
    const { listUrl, paramsId, from, pageType  } = this.props
    const { id, selectedRows, selectedRowKeys } = this.state
    param[paramsId] = id
    //资产维度标识字段
    if (from === 'assets') {
      param.suggestionEnum = 0
    }
    api[listUrl](param).then(response => {
      if (response && response.body && response.head && response.head.code === '200' ) {
        let body = response.body
        //初始化数据
        body.items.forEach((item, i) => {
          item.mode += ''
          item.status += ''
          //漏洞相关
          if (pageType === 'bug') {
            item.solutionList = item.solutionList || []
            //默认设置解决方案ID
            this.setSolutionId(item)
            //设置原始方案
            item.oldPlanId = item.solutionId
            //修复方案
            item.disabledPlan = false
          }
          //禁止勾选状态
          item.disabledRow = this.disabled.includes(item.status)
          //修复方式
          item.disabledMode = false
          //已勾选添加属性状态
          item.isSelected = selectedRowKeys.includes(item.stringId)
          //替换已勾选的数据
          const selectedRow = selectedRows.filter(subItem => subItem.stringId === item.stringId)
          if (selectedRow.length) {
            body.items[i] = selectedRow[0]
          }
        })
        //如果存在翻页操作
        if (selectedRows.length) {
          body = this.getBody(body)
        }
        this.setState({
          body: JSON.parse(JSON.stringify(body)),
          isAllSelectShow: false
        }, this.isAllSelectShow)
      }
    })
  }

  //设置解决方案
  setSolutionId = (item) => {
    const status = item.status
    const solutionList = item.solutionList
    //待修复、修复中
    if (status === '3' || status === '4') {
      item.solutionId = item.solution ? item.solution.stringId : null
      item.solutionType = item.solution ? item.solution.solutionType : null
      item.solutionName = item.solution ? item.solution.solutionName : null
    }
    //修复失败、已缓解
    if (status === '6' || status === '7') {
      item.solutionId = solutionList.length ? solutionList[0].stringId : null
      item.solutionType = solutionList.length ? solutionList[0].solutionType : null
      item.solutionName = solutionList.length ? solutionList[0].solutionName : null
    }
  }

  //获取分页前操作状态的数据
  getBody = (body) => {
    const { selectedRows } = this.state
    const { status, mode } = selectedRows[0]
    //禁用状态和修复方式不一致
    body.items.filter(item =>
      item.mode !== mode || item.status !== status
    ).forEach(item => {
      item.disabledRow = true
    })
    body.items.filter(item =>
      item.status !== status || (item.mode === mode && item.isSelected)
    ).forEach(item => {
      item.disabledMode = true
    })
    //禁用已勾选，可修复，且修复状态一致数据的修复状态
    return body
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

  //获取人员
  getUsers = async () => {
    const { userParam, from } = this.props
    const { areaId } = this.state
    //区域ID
    if (from === 'assets') {
      userParam.areaId =  [analysisUrl(this.props.location.search).areaId]
    } else {
      userParam.areaId = areaId
    }
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

  //流程接口
  claimTaskBatch = (taskIds, callBack) => {
    api.claimTaskBatch({
      taskIds,
      userId: sessionStorage.getItem('id')
    }).then(response => {
      if (response && response.head && response.head.code === '200') {
        callBack()
      } else {
        this.setState({
          loading: false
        })
      }
    }).catch(e => {
      this.setState({
        loading: false
      })
    })
  }
}

const mapStateToProps = ({ system }) => {
  return { treeData: system.treeData }
}
export default connect(mapStateToProps)(DisposeTable)

