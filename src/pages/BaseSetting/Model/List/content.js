import React, { Component, Fragment } from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import moment from 'moment'
import { Form, Button, Table, Pagination, message } from 'antd'
import { transliteration, TooltipFn, cacheSearchParameter, evalSearchParam, removeCriteria } from '@/utils/common'
import api from '@/services/api'
import hasAuth from '@/utils/auth'
import ModalConfirm from '@/components/common/ModalConfirm'
import { Search } from '@c/index'  //引入方式
import { configPermission } from '@a/permission'
import AddScan from '@c/common/AddScan'
import CommonModal from '@/components/common/Modal'
import CommonForm from '@c/common/Form'
import { map, debounce, find } from 'lodash'
import './content.less'
// @withRouter
const { Item } = Form
const formItemLayout2 = {
  labelCol: {
    span: 8
  },
  wrapperCol: {
    span: 15
  }
}
export class BaseSettingModelList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      status: [
        {
          key: 0,
          name: '禁用'
        },
        {
          key: 1,
          name: '启用'
        }
      ],
      columns: [
        {
          title: '编号',
          key: 'number',
          dataIndex: 'number',
          width: '12%',
          render: text => TooltipFn(text)
        },
        {
          title: '名称',
          key: 'name',
          dataIndex: 'name',
          width: '12%',
          render: text => TooltipFn(text)
        },
        {
          title: '变更时间',
          key: 'gmtModified',
          dataIndex: 'gmtModified',
          isShow: false,
          width: '16%',
          render: (text) => { return (<span className="tabTimeCss">{text ? moment(text).format(this.state.dateFormat) : '--'}</span>) }
        },
        {
          title: '适用系统',
          key: 'systemName',
          width: '12%',
          dataIndex: 'systemName',
          render: text => TooltipFn(text)
        },
        {
          title: '配置资产数量',
          key: 'assetNum',
          width: '10%',
          dataIndex: 'assetNum'
        },
        {
          title: '状态',
          key: 'isEnableName',
          width: '10%',
          dataIndex: 'isEnableName'
        },
        {
          title: '操作',
          width: '16%',
          render: (text, record) => {
            return (
              <div className="operate-wrap">
                {
                  this.getWorkOrderBtn(record)
                }
              </div>
            )
          }
        }
      ],
      body: {},
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      osList: this.props.osList || [],
      values: {},
      dateFormat: 'YYYY-MM-DD HH:mm:ss',
      itemOs: [],
      showAlert: false,
      alertCont: {},
      scanArr: [
        { name: '', key: 'scanType', type: 'select', multiple: null, search: true, data: [{ name: '基准项', value: 0 }, { name: '黑名单', value: 1 }, { name: '白名单', value: 2 }], required: 'scanVerifi', message: '请选择基准项/黑名单/白名单' },
        { name: '', key: 'scanStatus', type: 'select', multiple: null, required: '', message: '请选择状态', search: false, data: [] },
        { name: '', key: 'scanContent', type: 'input', required: 'scanContent', message: '请选择需要变更为...' },
        { name: '', key: 'configId' },
        { name: '', key: 'id' },
        { name: '', key: 'defineValue' }],
      selectedRowKeys: [], //多选
      showChange: false,
      NextOperatorList: [],
      checkTemplate: [],
      baseProps: {
        stringId: '',
        os: ''
      },
      configAlertShow: false,
      submitValues: {}
    }
  }
  componentDidMount () {
    //根据页面获取列表数据
    let { isScan } = this.props
    if (!isScan) {
      this.setForm()
    } else {
      this.queryTemplateScanByPage()
    }
    this.props.dispatch({ type: 'baseSetting/getConfigOsList', payload: { name: '操作系统' } })
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    // 更新列表数据
    if (nextProps.osList && JSON.stringify(this.props.osList) !== JSON.stringify(nextProps.osList)) {
      this.setState({
        osList: nextProps.osList
      })
    }
  }
  render () {
    let { columns, pagingParameter,
      body, showAlert, status, osList, selectedRowKeys, showChange,
      scanArr,
      baseProps,
      configAlertShow,
      NextOperatorList } = this.state
    let { isNew, isScan, scanData } = this.props
    let list = []
    let total = 0
    if (body) {
      list = body.items
      total = body.totalRecords
    }
    const AlertInfo = {
      visible: showAlert,
      onOk: this.alertOk,
      onCancel: this.handleCancel,
      children: (<p className="model-text">是否禁用该模板？</p>)
    }
    const defaultFields = [
      { type: 'input', label: '名称', placeholder: '请输入', key: 'name', allowClear: true, maxLength: 80 },
      { type: 'input', label: '编号', placeholder: '请输入', key: 'number', allowClear: true, maxLength: 30 },
      { type: 'select', multiple: false, label: '状态', placeholder: '全部', key: 'isEnable', data: status, config: { name: 'name', value: 'key' } },
      { type: 'dateRange', label: '变更时间', placeholder: ['开始时间', '结束时间'], key: 'time', allowClear: true },
      { type: 'treeSelect', multiple: true, placeholder: '全部', label: '适用系统', key: 'os', data: osList, config: { name: 'name', value: 'node' }, treeDefaultExpandAll: false }
    ]
    //勾选事件
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys
        })
      }
    }
    const fields = [
      {
        name: '下一步',
        key: 'nextKey',
        type: 'select',
        defaultValue: '基准核查',
        disabled: true
      },
      {
        name: '下一步执行人',
        key: 'operator',
        showSearch: true,
        type: 'select',
        optionFilterProp: 'children',
        data: NextOperatorList,
        config: { value: 'stringId' },
        rules: [{ required: true, message: '请选择下一步执行人' }]
      },
      {
        name: '备注',
        key: 'remark',
        type: 'input',
        rules: [{ whitespace: true, message: '备注不能为空！' }, { message: '最多300个字符！', max: 300 }]
      }
    ]
    return (
      <div className="main-table-content">
        <div className="search-bar">
          <Search defaultFields={defaultFields}
            onSubmit={this.handleSubmit}
            onReset={this.resetFormFileds}
            wrappedComponentRef={search => { search && (this.searchForm = search.props.form) }}
            showExpand={false}
          />
        </div>
        <div className="table-wrap">
          {
            hasAuth(configPermission.newBasetemplate) && isNew === 1 ? <div className="table-btn">
              <div className="left-btn">
                <Link to="/basesetting/model/edit" style={{ color: '#fff' }}><Button style={{ width: 'auto', zIndex: '1000' }} type="primary">新建模板</Button></Link>
              </div>
            </div> : null}
          {
            hasAuth(configPermission.viewScanBasetemplate) && isScan ? <div className="table-btn">
              <div className="left-btn">
                <Button type="primary" onClick={() => this.AlertChange(0)}>批量变更</Button>
              </div>
            </div> : null}
          {isScan ? <Table
            rowKey="id"
            columns={columns}
            rowSelection={rowSelection}
            dataSource={list}
            pagination={false}
          /> : <Table
            rowKey="templateNo"
            columns={columns}
            dataSource={list}
            pagination={false}
          />}
          {total > 0 && <Pagination
            className="table-pagination"
            total={total} showTotal={(total) => `共 ${total || 0} 条数据`}
            showSizeChanger={total > 10 ? true : false}
            showQuickJumper={true}
            onChange={this.changeShowSize}
            onShowSizeChange={this.changeShowSize}
            pageSize={pagingParameter.pageSize}
            current={pagingParameter.currentPage} />}
          <ModalConfirm props={AlertInfo} />
          <CommonModal
            type="normal"
            visible={showChange}
            title="模板变更"
            width={1200}
            className="model-scan-change"
            onClose={() => { this.setState({ showChange: false }) }}
          >
            <div className='scan-content' style={{ paddingBottom: configAlertShow ? '0' : '20px ' }}>
              <div className='scan-content-text required-label'>变更内容：</div>
              <AddScan title=''
                config={scanArr} //基本配置项
                value={scanData}
                field={'baselineConfigInfoExt2'}
                isScan={true}
                isChange={true}
                os={baseProps.os}
                statusChange={this.statusChange}
                form={this.props.form} />
            </div>
            {configAlertShow && <div className='scan-content-footer'>
              <CommonForm
                column={3}
                fields={fields}
                form={this.props.form}
                FormItem={Item}
                formLayout={formItemLayout2}
              />
            </div>}
            <div className="Button-center btn-wrap">
              <div>
                <Button type="primary" onClick={this.modalHandleSubmit}>
                  确定
                </Button>
                <Button type="primary" ghost onClick={() => { this.setState({ showChange: false }) }}>
                  取消
                </Button>
              </div>
            </div>
          </CommonModal>
        </div>
      </div>
    )
  }
  //回显查询条件
  setForm = () => {
    let { list } = evalSearchParam(this) || {}
    let { tabActiveKey } = this.props
    let Keys = [1, 0][Number(tabActiveKey)]
    if (list !== undefined && list[Keys]) {
      this.setState({ pagingParameter: list[Keys].page, values: list[Keys].parameter }, () => this.initPageList())
      let ob = list[Keys].parameter
      if (ob.time && ob.time.length) {
        ob.time.forEach((ele, idx) => {
          ele && (ob.time[idx] = moment(moment(ele).format('YYYY-MM-DD')))
        })
      }
      this.searchForm.setFieldsValue({ ...ob })
    } else {
      this.initPageList(false)
    }
  }
  //根据你权限显示操作按钮
  getWorkOrderBtn = (record) => {
    let { isNew, isScan = false } = this.props
    return (
      <Fragment>
        {
          hasAuth(configPermission.editBasetemplate) && isNew === 1 ? <Link to={`/basesetting/model/update?stringId=${transliteration(record.id)}`}>编辑</Link> : null
        }
        {
          hasAuth(configPermission.viewScanBasetemplate) && isScan ? <a onClick={() => this.AlertChange(record)}>变更</a> : null
        }
        {(hasAuth(configPermission.updownBasetemplate) || hasAuth(configPermission.updownHistoryBasetemplate)) && !isScan && (record.isEnableName !== '禁用' ? <a onClick={() => this.showAlert(record)}>禁用</a> : <a onClick={() => this.changeStatus(record)}>启用</a>)}
        {
          (hasAuth(configPermission.viewBasetemplate) || hasAuth(configPermission.viewHistoryBasetemplate)) && <Link to={{
            pathname: '/basesetting/model/checkdetail',
            search: `stringId=${transliteration(record.id)}&isScan=${isScan}`
          }}>查看</Link>
        }
      </Fragment>
    )
  }
  // 提交表单，执行查询
  handleSubmit = (values) => {
    let { scanId } = this.props
    this.setState({
      values,
      pagingParameter: {
        pageSize: this.state.pagingParameter.pageSize,
        currentPage: 1
      }
    }, () => {
      if (scanId) this.queryTemplateScanByPage()
      else this.initPageList()
    })
  }
  //启用模板
  changeStatus = (item) => {
    this.setState({
      alertCont: {
        stringId: item.id
      }
    }, this.alertOk)
  }
  //启用禁用弹框接口
  alertOk = () => {
    let { alertCont } = this.state
    api.disableTemplate(alertCont).then(response => {
      message.success('操作成功！')
      this.initPageList()
      this.setState({
        showAlert: false
      })
    })
  }
  // 禁用模板
  showAlert = (item) => {
    this.setState({
      showAlert: true,
      alertCont: {
        stringId: item.id
      }
    })
  }
  //弹框关闭
  handleCancel = () => {
    this.setState({ showAlert: false })
  }
  //重置form表单查询条件
  resetFormFileds = () => {
    let { scanId } = this.props
    this.props.form.resetFields()
    let { tabActiveKey } = this.props
    removeCriteria(tabActiveKey, this.props.history)
    this.setState({
      values: {},
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      }
    }, () => {
      if (scanId) this.queryTemplateScanByPage()
      else this.initPageList(false)
    }
    )
  }
  //分页
  changeShowSize = (currentPage, pageSize) => {
    this.setState({
      pagingParameter: {
        pageSize,
        currentPage
      }
    }, () => {
      let { scanId } = this.props
      if (scanId) this.queryTemplateScanByPage()
      else this.initPageList()
    })
  }
  checkTime = (values) => {
    if (values.time && values.time.length > 0) {
      values.beginTime = values.time[0] ? values.time[0].valueOf() + '' : ''
      values.endTime = values.time[1] ? values.time[1].valueOf() + '' : ''
      delete values.time
    }
  }
  // 获取list
  initPageList = (isCache = true) => {
    let { values, pagingParameter } = this.state
    let { isNew, tabActiveKey } = this.props
    let ob = Number(tabActiveKey) === 1 ? [0, '1'] : [1, '0']
    //isCache为true的时候缓存
    isCache && cacheSearchParameter([{ page: pagingParameter, parameter: { ...values } }], this.props.history, ...ob)
    this.checkTime(values)
    let param = { ...values, ...pagingParameter }
    param.isNew = isNew
    api.getConfigTemplateList(param).then(res => {
      this.setState({
        body: res.body
      })
    })
  }
  //变更
  AlertChange = (record) => {
    let { selectedRowKeys } = this.state
    if (record) this.setState({
      selectedRowKeys: []
    })
    if (!selectedRowKeys.length && !record)
      message.warn('请先选择要变更的项！')
    else {
      this.setState({
        baseProps: {
          stringId: record.id,
          os: record.os
        },
        checkTemplate: !selectedRowKeys.length ? [record.id] : [selectedRowKeys],
        showChange: true
      }, this.getAreaId)
    }
  }
  //获取区域id
  getAreaId = () => {
    console.log(this.state.checkTemplate)
    api.listAssetForTemplateByPage({ templateIds: this.state.checkTemplate }).then(res => {
      this.setState({
        areaId: map(res.body.items, 'areaId')
      }, () => {
        this.getUsersByRoleCodeAndAreaId()
      })
    })
  }
  //获取执行人
  getUsersByRoleCodeAndAreaId = () => {
    api.getUsersByRoleCodeAndAreaId({ flowNodeTag: 'config_check', flowId: 4, areaId: this.state.areaId }).then(res => {
      let NextOperatorList = res.body || []
      NextOperatorList.unshift({ name: '全部', stringId: '-1' })
      this.setState({
        NextOperatorList: NextOperatorList
      })
    })
  }
  modalHandleSubmit = debounce(() => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (values.operator)
          this.combination(values)
        else this.setState({
          showChange: false
        })
      }
    })
  })
  //组合动态生成的字段
  combination = (values) => {
    let param = { ...values }
    let arr = Object.keys(values)
    let key1 = []
    //判断数组中是否有值，没有就新建
    let isArr = (variate, key, index, v) => {
      if (!variate[index]) variate[index] = {}
      variate[index][key] = v
      return variate
    }
    arr.forEach(key => {
      let init = key.split('_')
      switch (init[0]) {
        case 'baselineConfigInfoExt2':
          if (init[1] !== undefined && values[key] !== undefined && values[key] !== null)
            param.scanConditionList = !key.includes('serviceValue') && isArr(key1, init[1], Number(init[2]), values[key]).filter(item => item !== null)
          break
        default:
          break
      }
      if (key.indexOf('_') > -1)
        delete param[key]
    })
    this.setState({
      submitValues: param
    }, this.checkValues)
  }
  checkValues = async () => {
    let { submitValues, NextOperatorList, checkTemplate } = this.state
    let { scanData } = this.props
    let addSoftwareList = [], deleteSoftwareList = [], addConfigList = [], deleteConfigList = [], modifyConfigList = []
    NextOperatorList.splice(0, 1)
    /*
        软件列表deleteSoftwareList addSoftwareList
        基准项列表modifyConfigList deleteConfigList addConfigList
        scanStatus 0新增  1删除  2 变更
    */
    submitValues.scanConditionList.map(item => {
      let softObj = find(scanData, { softId: item.configId })
      let configObj = find(scanData, { configId: item.configId })
      if (item.scanType !== 0 && item.scanStatus === 2 && !softObj || (item.scanType !== 0 && item.scanStatus === 0)) { //变更软件并删除之前的
        let content = item.scanContent.split('/')
        addSoftwareList.push({
          stringId: item.configId,
          manufacturer: content[0],
          softwareName: content[1],
          edition: content[2]
        })
        let soft =  find(scanData, { id: item.id })
        if (soft && item.scanStatus === 2) {
          deleteSoftwareList.push({ softwareId: soft.softId })
        }
      } else if (item.scanType !== 0 && item.scanStatus) {
        deleteSoftwareList.push({ softwareId: item.configId })
      } else if (item.scanStatus === 2 && !configObj) { //变更基准项并删除之前的
        addConfigList.push({
          infoId: item.configId,
          defineValue: item.defineValue,
          valueStatus: item.defineValue ? 1 : 0
        })
        let config =  find(scanData, { id: item.id })
        deleteConfigList.push({
          infoId: config ? config.configId : item.configId
        })
      } else if (configObj && configObj.defineValue !== item.defineValue) { //修改已存在的基准项
        modifyConfigList.push({
          infoId: item.configId,
          defineValue: item.defineValue,
          valueStatus: item.defineValue ? 1 : 0
        })
      } else if (item.scanStatus) { //删除基准项
        deleteConfigList.push({
          infoId: item.configId
        })
      } else if(item.scanStatus === 0){ //新增基准项
        let content = item.scanContent.split('/')
        addConfigList.push({
          infoId: item.configId,
          defineValue: content[2],
          valueStatus: content[2] ? 1 : 0
        })
      }
    })
    if (submitValues.operator === '-1') {
      submitValues.operator = map(NextOperatorList, 'stringId').join(',')
    }
    submitValues.ids = checkTemplate
    let currentUser = sessionStorage.getItem('id')
    submitValues.formData = submitValues.operator && `{"baselineConfigUserId":\"${currentUser}\", "baselineCheckUser":\"${submitValues.operator}\", "baselineConfigResult":\"baselineCheck\"}`//基准核查人选择
    let editParam = {//编辑模板数据
      deleteSoftwareList,
      modifyConfigList,
      deleteConfigList,
      addConfigList,
      addSoftwareList,
      operator: submitValues.operator,
      formData: submitValues.formData,
      ids: checkTemplate,
      remark: submitValues.remark
    }
    await api.updateTemplateScan(editParam).then(res => {
      console.log(this.props)
      this.props.history.push('/basesetting/list/enforcement?isScan=true')
    })
  }
  queryTemplateScanByPage = () => {
    let { scanId } = this.props
    let { values, pagingParameter } = this.state
    this.checkTime(values)
    let param = { ...values, ...pagingParameter }
    param.scanId = scanId
    api.queryTemplateScanByPage(param).then(res => {
      this.setState({
        body: res.body
      })
    })
  }
  statusChange = (isShow) => {
    this.setState({
      configAlertShow: isShow
    })
  }
}
const mapStateToProps = ({ baseSetting }) => {
  return {
    osList: baseSetting.osList
  }
}
const BaseSettingListForm = Form.create()(BaseSettingModelList)
export default connect(mapStateToProps)(BaseSettingListForm)
