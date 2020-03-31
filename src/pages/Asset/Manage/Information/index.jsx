import React, { PureComponent, Fragment } from 'react'
// import { connect } from 'dva'
import './style.less'
import { withRouter } from 'dva/router'
import { Form, Table, Checkbox, Icon, message, Popover } from 'antd'
import { analysisUrl, transliteration, TooltipFn, download, evalSearchParam, cacheSearchParameter } from '@/utils/common'
import { Link } from 'react-router-dom'
import moment from 'moment'
import hasAuth from '@/utils/auth'
import { debounce, cloneDeep, throttle } from 'lodash'
import PropTypes from 'prop-types'
import api from '@/services/api'
// Import
import { TableBtns } from '@c/index'
import ModalConfirm from '@/components/common/ModalConfirm'
import AssociatedSoftware from './AssociatedSoftware'
import { AssetsSearch, ASSETS_TYPES } from './AssetsSearch'
import { assetsPermission } from '@a/permission'

import AssetModal from '@/components/Asset/AssetModal'
import ImportAssets from './ImportAssets' //导入资产
import ExportModal from '@/components/common/ExportModal'  //导出
// import Verification from './AssetsProcess/Verification' //结果验证 可能不要了
// import Examination from './AssetsProcess/Examination'  //安全检查 可能不要了

import DealWith from './AssetsProcess/DealWith'  //处理（入网，退回，报废)
import Implementation from './AssetsProcess/Implementation' // 准入实施
import Rectification from './AssetsProcess/Rectification'  // 整改详情
import Retirement from './AssetsProcess/Retirement'  //退回申请 报废申请
import Decommission from './AssetsProcess/Decommission'  //退回执行 报废执行
import { RETIRED, ASSET_STATUS, ASSET_PROCESS, ASSET_SOURCE, ASSETS_IMPORTANT } from '@a/js/enume'

const CheckboxGroup = Checkbox.Group

//所有状态顺序 如枚举。
@withRouter
@Form.create()
class Information extends PureComponent {
  state = {
    PrefixCls: 'Information',
    dataSource: {}, //列表模拟数据
    soVisible: false, //关联软件
    isNoRegist: false, //不予登记
    selectedRowKeys: [], //多选list
    selectedRows: [],  //多选数据
    exportVisible: false,
    isAllSelectShow: false, //大复选禁用
    isSelectShow: true, //小复选禁用
    importVisible: false, //导入
    noRecordsArr: [], //不予登记数据
    seekTerm: {}, //保留导出时需要的搜索条件
    assetProcess: cloneDeep(ASSET_PROCESS).map(item=>{
      item.disabled = true
      return item}),
    isShowPro: [],
    //模板下载
    templateShow: false,
    templateChecked: [],

    //查询开始
    isExpand: false,
    enterControl: analysisUrl(this.props.location.search).work, //是否从工作台进来
    sortName: 'gmt_create',  //排序名字  后端要求默认
    multipleQuery: null,
    categoryModels: null,
    assetStatusList: null,
    assetGroup: null,
    operationSystem: null,
    assetSource: null,
    importanceDegree: null,
    manufacturer: null,
    areaIds: null,
    responsibleUserId: null,
    baselineTemplateId: null,
    gfirstEnterStartTime: null,
    firstEnterEndTime: null,
    serviceLifeStartTime: null,
    serviceLifeEndTime: null,
    currentPage: 1,
    pageSize: 10,
    sortOrder: '',  //排序方式 默认正序
    //查询结束
    columnsFixed: {
      title: () => {
        const columns = this.state.columns.slice(7)
        const content = (
          <div className="table-header-select">
            {columns.map(item => {
              if (item.key !== 'order' && item.key !== 'operate') {
                return (<Checkbox key={item.key} checked={item.isShow} onClick={() => this.tableHeaderChange(item)}>{item.title}</Checkbox>)
              } else {
                return null
              }
            })}
          </div>
        )

        return (
          <Fragment>操作 <span className="custom-column">
            <Popover getPopupContainer={triggerNode => triggerNode.parentNode} placement="bottomRight" trigger="click" content={content}>
              <Icon type="setting" className="icons" />
            </Popover>
          </span>
          </Fragment>)
      },
      isShow: true,
      key: 'operate',
      width: '150px',
      render: (record, item) => {
        const content = this.operateFunc(record)
        return (
          <div className="operate-wrap">
            {hasAuth(assetsPermission.ASSET_INFO_VIEW) &&
              <Link to={{
                pathname: '/asset/manage/detail',
                search: `id=${transliteration(item.stringId)}`,
                state: { rCaches: 1 }
              }}>查看</Link>}
            {content}
          </div>
        )
      }
    },
    columns: [{
      title: '资产类型',
      dataIndex: 'categoryModel',
      key: 'categoryModel',
      width: '90px',
      isShow: true,
      render: status => TooltipFn(ASSETS_TYPES[status - 1])
    }, {
      title: '资产编号',
      dataIndex: 'number',
      key: 'number',
      width: '80px',
      isShow: true,
      render: text => TooltipFn(text)
    }, {
      title: '厂商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: '80px',
      isShow: true,
      render: text => TooltipFn(text)
    }, {
      title: '使用者',
      dataIndex: 'responsibleUserName',
      key: 'responsibleUserName',
      width: '80px',
      isShow: true,
      render: text => TooltipFn(text)
    },  {
      title: '网络连接',
      dataIndex: 'responsibleUserName1',
      key: 'responsibleUserName1',
      width: '80px',
      isShow: true,
      render: text => TooltipFn(text)
    }, {
      title: '资产状态',
      dataIndex: 'assetStatus',
      key: 'assetStatus',
      width: '90px',
      isShow: true,
      render: (status) => TooltipFn((ASSET_STATUS.filter(item=>item.value === status)[0] || {}).name)
    }, {
      title: '首次发现时间',
      dataIndex: 'gmtCreate',
      key: 'gmtCreate',
      width: '160px',
      isShow: false,
      render: (text) => { return (<span className="tabTimeCss">{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>) },
      sorter: true
    },  {
      title: '到期时间',
      dataIndex: 'serviceLife',
      key: 'serviceLife',
      width: '160px',
      isShow: false,
      render: text => TooltipFn(moment(text).format('YYYY-MM-DD'))
    }, {
      title: '资产组',
      dataIndex: 'assetGroup',
      key: 'assetGroup',
      width: '80px',
      isShow: false,
      render: text => TooltipFn(text)
    }, {
      title: '操作系统',
      dataIndex: 'operationSystemName',
      key: 'operationSystemName',
      width: '80px',
      isShow: false,
      render: text => TooltipFn(text)
    }, {
      title: '资产来源',
      dataIndex: 'assetSource',
      key: 'assetSource',
      width: '90px',
      isShow: false,
      render: text => TooltipFn((ASSET_SOURCE.filter(item=>item.value === text)[0] || {}).name)
    }, {
      title: '重要程度',
      dataIndex: 'importanceDegree',
      key: 'importanceDegree',
      width: '90px',
      isShow: false,
      render: text => TooltipFn((ASSETS_IMPORTANT.filter(item=>item.value === text)[0] || {}).name)
    }, {
      title: 'IP',
      dataIndex: 'ips',
      key: 'ips',
      width: '80px',
      isShow: false,
      render: text => TooltipFn(text)
    }, {
      title: 'MAC',
      dataIndex: 'macs',
      key: 'macs',
      width: '80px',
      isShow: false,
      render: text => TooltipFn(text)
    }, {
      title: '基准模板',
      dataIndex: 'baselineTemplateName',
      key: 'baselineTemplateName',
      width: '80px',
      isShow: false,
      render: text => TooltipFn(text)
    }, {
      title: '归属区域',
      dataIndex: 'areaName',
      key: 'areaName',
      width: '80px',
      isShow: false,
      render: text => TooltipFn(text)
    }, {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: '80px',
      isShow: false,
      render: text => TooltipFn(text)
    }, {
      title: '从属业务',
      dataIndex: 'responsibleUserName2',
      key: 'responsibleUserName2',
      width: '80px',
      isShow: false,
      render: text => TooltipFn(text)
    }, {
      title: '准入状态',
      dataIndex: 'responsibleUserName3',
      key: 'responsibleUserName3',
      width: '80px',
      isShow: false,
      render: text => TooltipFn(text)
    }, {
      title: '机器名',
      dataIndex: 'categoryModel55',
      key: 'categoryModel55',
      width: '80px',
      isShow: false,
      render: text => TooltipFn(text)
    }, {
      title: '国资码',
      dataIndex: 'categoryModel555',
      key: 'categoryModel555',
      width: '80px',
      isShow: false,
      render: text => TooltipFn(text)
    }, {
      title: '网络类型',
      dataIndex: 'categoryModel55',
      key: 'categoryModel55',
      width: '80px',
      isShow: false,
      render: text => TooltipFn(text)
    }, {
      title: '是否可借用',
      dataIndex: 'categoryModel555',
      key: 'categoryModel555',
      width: '80px',
      isShow: false,
      render: text => TooltipFn(text)
    }, {
      title: '是否涉密',
      dataIndex: 'categoryModel55',
      key: 'categoryModel55',
      width: '80px',
      isShow: false,
      render: text => TooltipFn(text)
    }, {
      title: '是否孤岛设备',
      dataIndex: 'categoryModel555',
      key: 'categoryModel555',
      width: '80px',
      isShow: false,
      render: text => TooltipFn(text)
    }, {
      title: '序列表',
      dataIndex: 'categoryModel55',
      key: 'categoryModel55',
      width: '80px',
      isShow: false,
      render: text => TooltipFn(text)
    }, {
      title: '机房位置',
      dataIndex: 'categoryModel555',
      key: 'categoryModel555',
      width: '80px',
      isShow: false,
      render: text => TooltipFn(text)
    }, {
      title: '物理位置',
      dataIndex: 'categoryModel55',
      key: 'categoryModel55',
      width: '80px',
      isShow: false,
      render: text => TooltipFn(text)
    }, {
      title: '维护方式',
      dataIndex: 'categoryModel555',
      key: 'categoryModel555',
      width: '80px',
      isShow: false,
      render: text => TooltipFn(text)
    }, {
      title: '购买日期',
      dataIndex: 'categoryModel55',
      key: 'categoryModel55',
      width: '80px',
      isShow: false,
      render: text => TooltipFn(text)
    }, {
      title: '装机时间',
      dataIndex: 'categoryModel555',
      key: 'categoryModel555',
      width: '80px',
      isShow: false,
      render: (text) => { return (<span className="tabTimeCss">{moment(text).format('YYYY-MM-DD')}</span>) }
    }, {
      title: '启用时间',
      dataIndex: 'categoryModel55',
      key: 'categoryModel55',
      width: '80px',
      isShow: false,
      render: (text) => { return (<span className="tabTimeCss">{moment(text).format('YYYY-MM-DD')}</span>) }
    }, {
      title: '描述',
      dataIndex: 'categoryModel555',
      key: 'categoryModel555',
      width: '80px',
      isShow: false,
      render: text => TooltipFn(text)
    }
    ]
  }

  static propTypes = {
    assetBody: PropTypes.object
  }

  //修改table 头部
  tableHeaderChange = (column) => {
    const columns = cloneDeep(this.state.columns)
    columns.forEach(item => {
      if (item.key === column.key) item.isShow = !item.isShow
    })
    this.setState({ columns })
  }

  onSelectBtn = (disabled_num) => {
    let assetProcess = cloneDeep(this.state.assetProcess)
    switch (disabled_num) {
      case (0):
        assetProcess.forEach(item=>item.disabled = true)
        break
      default:
        assetProcess.forEach(item=>{
          if(disabled_num === item.value){
            item.disabled = false
          }else{
            item.disabled = true
          }
        })
        break
    }
    this.setState({ assetProcess })
  }

  //特殊 此版本已入网的非计算设备不能关联软件
  isComputAssoc=( selectedRows)=>{
    let isComputer = false
    selectedRows.forEach(v=> {if((v.assetStatus === 6) && (v.categoryModel !== 1) ) isComputer = true})
    if(isComputer) return void(0)
    this.onSelectBtn(selectedRows[0].assetStatus)
  }

  onSelectChange = (selectedRowKeys, selectedRows) => {
    const bodys = cloneDeep(this.state.dataSource)
    // isSelectShow dataSource
    if (!bodys.items) return void (0)

    //禁用与初次点击行安装方式不一致的行
    if (selectedRows.length === 1) {
      this.isComputAssoc(selectedRows)
      bodys.items.filter(v => v.assetStatus !== selectedRows[0].assetStatus).forEach(t => t.disabled = true)
    } else if (selectedRows.length === 0) {
      //清空时还原
      bodys.items.forEach(v => v.disabled = false)
      this.onSelectBtn(0)
    } else { //全选
      this.isComputAssoc(selectedRows)
    }

    // dataSource.forEach(item => {
    //   if(selectedRowKeys.includes(item.assetId)){
    //     item.disabledSelect = true
    //   }else{
    //     item.disabledSelect = false
    //   }
    // })
    this.setState({ selectedRows, selectedRowKeys, dataSource: bodys })
  };

  //登记
  registration = () => {
    this.props.history.push('/asset/manage/register?source=register&register=new')
  }

  //获取你想要的数据
  getRecordsArrIds = (Arr, stringId) => {
    let stringIds = []
    Arr.forEach(v => stringIds.push(v[stringId]))
    return stringIds
  }

  //显示不予登记弹窗
  noRegistration = (record, isTable = false) => {
    const noRecordsArr = isTable ? this.state.selectedRows : [record]
    this.setState({ isNoRegist: true, noRecordsArr })
  }

  noRegistrationCB = throttle(() => {
    // const { noAssetsIds } = this.state
    const that = this
    let assetList = []
    this.state.noRecordsArr.forEach(item=>{
      const content = {
        taskId: item.waitingTaskReponse ? item.waitingTaskReponse.taskId : null,
        assetId: item.stringId
      }
      assetList.push(content)
    })

    api.assetNoRegister(assetList).then(res => {
      if (res && res.head && res.head.code === '200') {
        message.success('操作成功！')
        that.getAssetList()
        that.setState({ isNoRegist: false, selectedRows: [] })
      }
    })
  }, 5000, { trailing: false } )

  //关联软件
  associatedSoftware = (soVisible = true) => {
    const { selectedRows } = this.state
    let isSame = false
    selectedRows.forEach(item => {
      if (selectedRows[0].baselineTemplateId !== item.baselineTemplateId) isSame = true
    })
    if ((selectedRows.length > 1) && isSame) {
      message.info('所选资产基准模板不一致，请重新选择')
      return void (0)
    }
    this.setState({ soVisible })
  }

  switchCB = (assetStatus, switchObj = []) => {
    return switchObj[assetStatus - 1]
  }

  //taskId
  nowCLickGetInit = Arr => {
    let taskIds = []
    const userId = sessionStorage.getItem('id')
    Arr.forEach(v => {
      if (v.waitingTaskReponse && v.waitingTaskReponse.taskId){
        taskIds.push(v.waitingTaskReponse.taskId)
      }else{
        taskIds.push(null)
      }
    })
    return {
      userId,
      taskIds
    }
  }

  processChange =val=>{
    this.processOnClose(val, true)
  }

  //流程控制
  processOnClose = async (records, isTable = false) => {
    const { selectedRows } = this.state

    const recordsArr = isTable ? selectedRows : [records]
    const { assetStatus, waitingTaskReponse } = recordsArr[0]
    let nowCLickCbState = true

    // 首次发起拟退回没有流程不发起认领
    // if(!(assetStatus === 6 && !waitingTaskReponse)){
    //   nowCLickCbState = await this.nowCLickCb(this.nowCLickGetInit(recordsArr))
    // }

    // if (!nowCLickCbState) return void (0)

    const switchObj = [
      void (0),
      void (0),
      this.Rectification,
      void (0),
      this.DealWith,
      this.Implementation,
      this.Retirement,
      void (0),
      this.Decommission,
      void (0),
      this.DealWith,
      this.Retirement,
      this.Decommission,
      void (0),
      this.DealWith,
      void (0)
    ]
    const child = this.switchCB(assetStatus, switchObj)
    child.openModel(true, recordsArr, assetStatus)
  }

  onRef = (ref, assetStatus) => {
    const switchObj = [
      void (0),
      void (0),
      'Rectification',
      void(0),
      'DealWith',
      'Implementation',
      'Retirement',
      void (0),
      'Decommission',
      void (0),
      'DealWith',
      'Retirement',
      'Decommission',
      void (0),
      'DealWith',
      void (0)
    ]
    let child = this.switchCB(assetStatus, switchObj)
    this[child] = ref
  }

  //分页
  pageChange = (currentPage, pageSize) => {
    this.setState({
      currentPage,
      pageSize
    }, this.getAssetList)
  }

  //排序
  handleTableSort = (pagination, filters, sorter) => {
    let order
    if (sorter.order === 'descend') {
      order = 'DESC'
    } else if (sorter.order === 'ascend') {
      order = 'ASC'
    } else {
      order = ''
    }
    this.setState({
      sortOrder: order
    }, this.getAssetList)
  }

  // 执行查询
  handleSubmit = (valuesData, iscache = false) => {
    valuesData = valuesData || {}
    this.setState({
      multipleQuery: valuesData.multipleQuery,
      categoryModels: valuesData.categoryModels,
      assetStatusList: valuesData.assetStatusList,
      assetGroup: valuesData.assetGroup,
      operationSystem: valuesData.operationSystem,
      assetSource: valuesData.assetSource,
      importanceDegree: valuesData.importanceDegree,
      manufacturer: valuesData.manufacturer,
      areaIds: valuesData.areaIds,
      responsibleUserId: valuesData.responsibleUserId,
      baselineTemplateId: valuesData.baselineTemplateId,
      firstEnterStartTime: valuesData.firstEnterStartTime,
      firstEnterEndTime: valuesData.firstEnterEndTime,
      serviceLifeStartTime: valuesData.serviceLifeStartTime,
      serviceLifeEndTime: valuesData.serviceLifeEndTime,
      sortName: valuesData.sortName,
      sortOrder: valuesData.sortOrder,
      currentPage: valuesData.currentPage,
      pageSize: valuesData.pageSize,
      isExpand: valuesData.isExpand
    }, this.getAssetList(iscache))
  }

  //提交表单
  exportGetData = () => {
    const state = this.state
    const valuesData = {
      multipleQuery: state.multipleQuery,
      categoryModels: state.categoryModels,
      assetStatusList: state.assetStatusList,
      assetGroup: state.assetGroup,
      operationSystem: state.operationSystem,
      assetSource: state.assetSource,
      importanceDegree: state.importanceDegree,
      manufacturer: state.manufacturer,
      areaIds: state.areaIds,
      responsibleUserId: state.responsibleUserId,
      baselineTemplateId: state.baselineTemplateId,
      firstEnterStartTime: state.firstEnterStartTime,
      firstEnterEndTime: state.firstEnterEndTime,
      serviceLifeStartTime: state.serviceLifeStartTime,
      serviceLifeEndTime: state.serviceLifeEndTime,
      currentPage: state.currentPage,
      pageSize: state.pageSize,
      sortName: state.sortName,
      sortOrder: state.sortOrder,
      enterControl: state.enterControl
    }
    return valuesData
  }

  operateJump = async (status, record) => {
    const { push } = this.props.history
    const { assetStatus, categoryModel, stringId } = record
    const isJump = await this.verificationAssetStatus(status, stringId, categoryModel)
    if(!isJump) return void(0)
    const retirement = assetStatus === RETIRED.value
    const urlAdd = `?source=register&id=${encodeURIComponent(stringId)}&categoryModel=${categoryModel}`
    switch (status) {
      case (1): //变更
        push(`/asset/manage/change${urlAdd}`)
        break
      case (2): //登记
        push(`/asset/manage/register${urlAdd}&register=again&retirement=${retirement}`)
        break
      default:
        break
    }

  }

  //没有taskId 就不显示
  isTaskIdShow=record=>{
    return !!(record.waitingTaskReponse && record.waitingTaskReponse.taskId)
  }

  //待整改打回或待实施打回 并且没有taskId 就不显示
  isOriginStatuShow=record=>{
    // true
    return !([3, 8].includes(record.originStatus) && !this.isTaskIdShow(record))
  }

  //操作列表
  operateFunc = (record) => {
    // this.isTaskIdShow(record) 检查taskId
    const contentA = (
      <Fragment>
        {hasAuth(assetsPermission.ASSET_BYDJ) && <a onClick={() => this.noRegistration(record)}>不予登记</a>}
        {hasAuth(assetsPermission.ASSET_DJ) && this.isOriginStatuShow(record) && <a onClick={() => this.operateJump(2, record)}>登记</a>}
      </Fragment>
    )
    const contentB = hasAuth(assetsPermission.ASSET_DJ) && <a onClick={() => this.operateJump(2, record)}>登记</a>

    const contentC = hasAuth(assetsPermission.ASSET_IMPL) && <a onClick={() => this.processOnClose(record)}>整改详情</a>
    const contentCC = hasAuth(assetsPermission.ASSET_IMPL) && <a onClick={() => this.processOnClose(record)}>入网审批未通过处理</a>
    const contentD = hasAuth(assetsPermission.ASSET_VALID) && <a onClick={() => this.processOnClose(record)}>准入实施</a>
    const contentE = (<Fragment>
      {hasAuth(assetsPermission.ASSET_NTY) && <a onClick={() => this.processOnClose(record, false)}>退回申请</a>}
      {hasAuth(assetsPermission.ASSET_UPDATE) && <a onClick={() => this.operateJump(1, record)}>变更</a>}
    </Fragment>
    )
    const contentF = hasAuth(assetsPermission.ASSET_NTY) && <a onClick={() => this.processOnClose(record, false)}>退回执行</a>
    const contentG = hasAuth(assetsPermission.ASSET_CHECK) && <a onClick={() => this.processOnClose(record)}>退回审批未通过处理</a>
    const contentH = hasAuth(assetsPermission.ASSET_CHANGE) && <a onClick={() => this.processOnClose(record)}>报废申请</a>
    const contentI = hasAuth(assetsPermission.ASSET_DJ) && <a onClick={() => this.processOnClose(record)}>报废执行</a>
    const contentJ = hasAuth(assetsPermission.ASSET_DJ) && <a onClick={() => this.processOnClose(record)}>报废审批未通过处理</a>

    const switchObj = [
      contentA,
      contentB,
      contentC,
      void(0),
      contentCC,
      contentD,
      contentE,
      void(0),
      contentF,
      void(0),
      contentG,
      contentH,
      contentI,
      void(0),
      contentJ,
      void(0)
    ]
    return this.switchCB(record.assetStatus, switchObj)
  }

  changeTemplateChecked=v=>this.setState({ templateChecked: v })

  //模板下载
  templateDownload = () => {
    const { templateChecked } = this.state
    if (JSON.stringify(templateChecked) !== '[]') {
      download('/api/v1/asset/export/template', { type: templateChecked })
      this.setState({ templateChecked: [], templateShow: false })
    } else {
      message.warn('请选择设备品类')
    }
  }

  //列表初始化
  itemsInit = (assetBody) => {
    if (!(assetBody && assetBody.items)) assetBody.items = []
    const isAllSelectShow = assetBody.items.every(item => item.assetStatus === assetBody.items[0].assetStatus)
    assetBody.items.forEach(item => {
      item.disabled = false
    })
    this.setState({
      dataSource: assetBody,
      isAllSelectShow
    })
  }

  //**副作用开始 */

  //导出
  exportAssets = () => {
    const state = this.state
    const seekTerm = {
      ...this.exportGetData(),
      sortName: state.sortName,
      sortOrder: state.sortOrder
    }
    api.getAssetList({ ...seekTerm }).then(res => {
      if (res && res.head && res.head.code === '200') {
        //总数为0 ，测试要求前端判断
        if (res.body && res.body.totalRecords && res.body.totalRecords !== 0) {
          this.setState({ exportVisible: true, seekTerm })
        } else {
          message.error('暂无数据可导出!')
        }
      }
    })
  }

  //列表
  getAssetList = debounce( iscache=> {
    // isAllSelectShow  每次请求控制开关
    const state = this.state
    const { history, location } = this.props
    const init = analysisUrl(location.search)
    this.setState({ selectedRowKeys: [], selectedRows: [] })
    const data = this.exportGetData()
    const pagingParameter = {
      currentPage: state.currentPage,
      pageSize: state.pageSize
    }
    const values = {
      ...data
    }
    const payload = {
      ...pagingParameter,
      ...data,
      stringId: init.status !== '2' ? init.id : null
    }
    this.onSelectBtn(0)
    !iscache && cacheSearchParameter([{
      page: pagingParameter,
      parameter: {
        ...values,
        isExpand: state.isExpand,
        conditionShow: state.conditionShow
      }
    }], history, 0, '1')
    api.getAssetList(payload).then(res => {
      if (res && res.head && res.head.code === '200') {
        this.itemsInit(res.body)
      }
    })
  }, 300)

  //license登记 还没定
  // assetAuthNum=()=>{
  //   return api.assetHardwareAuthNum().then(res => {
  //     if(res && res.head && res.head.code === '200' ){
  //       if(res.body.result){
  //         return true
  //       }else{
  //         message.info(res.body.msg)
  //         return false
  //       }
  //     }
  //   }).catch(() => {})
  // }

  //领取任务批量判断
  nowCLickCb = async (init) => {
    const that = this
    // Promise.reject('格式不对')
    return api.claimTaskBatch(init).then(res => {
      if (res && res.head && res.head.code === '200') return true
    }).catch(err=>{
      that.getAssetList()
      return false
    })
  }

  //领取任务登记变更判断
  verificationAssetStatus = async (operation, assetId, categoryModel) => {
    if(operation === 1 && categoryModel !== 1) return true //变更非计算设备不调接口
    const that = this
    return  api.verificationAssetStatus({ operation, assetId }).then(res => {
      if (res && res.head && res.head.code === '200') return true
    }).catch(err=>{
      that.getAssetList()
      return false
    })
  }

  render () {
    const {
      PrefixCls,
      dataSource,
      selectedRowKeys,
      currentPage,
      pageSize,
      selectedRows,
      soVisible,
      isNoRegist,
      exportVisible,
      seekTerm,
      isAllSelectShow,
      isSelectShow,
      importVisible,
      templateShow,
      templateChecked,
      assetProcess,
      isExpand
    } = this.state

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps: record => {
        return {
          disabled: record.disabled
        }
      }
    }

    const associatedSoftwareInfo = {
      soVisible,
      associds: selectedRows,
      associatedSoftware: this.associatedSoftware,
      compEffectCB: this.getAssetList
      //   func: this[MODAL_INTERFACE[tabActiveKey - 1]]
    }

    const noRegisterInfo = {
      visible: isNoRegist,
      onOk: this.noRegistrationCB,
      onCancel: () => this.setState({ isNoRegist: false }),
      children: (<p className="model-text">是否将该资产列为"不予登记"状态?</p>)
    }

    const leftBtns = [
      { label: '登记', onClick: this.registration, check: () => hasAuth(assetsPermission.ASSET_DJ) },
      { label: '导出', onClick: this.exportAssets, check: () => hasAuth(assetsPermission.ASSET_EXPORT) },
      { label: '导入', onClick: () => this.setState({ importVisible: true }), check: () => hasAuth(assetsPermission.ASSET_IMPORT) },
      { label: '模板下载', onClick: () => this.setState({ templateShow: true }), check: () => hasAuth(assetsPermission.ASSET_MBXZ) }
    ]

    // const rightBtns = [
    //   { label: '关联软件', onClick: this.associatedSoftware, disabled: isDisabled_assoc, check: () => hasAuth(assetsPermission.ASSET_GLRJ) },
    //   { label: '不予登记', onClick: () => this.noRegistration(1, true), disabled: isDisabled_noReg, check: () => hasAuth(assetsPermission.ASSET_BYDJ) },
    //   { label: '实施', onClick: () => this.processOnClose(3, true), disabled: isDisabled_Impl, check: () => hasAuth(assetsPermission.ASSET_IMPL) },
    //   { label: '验证', onClick: () => this.processOnClose(4, true), disabled: isDisabled_verif, check: () => hasAuth(assetsPermission.ASSET_VALID) },
    //   { label: '入网', onClick: () => this.processOnClose(5, true), disabled: isDisabled_net, check: () => hasAuth(assetsPermission.ASSET_NETWORKING) }
    // ]

    const rightSelec = { label: '批量操作', onChange: this.processChange, data: assetProcess, check: ()=> hasAuth(assetsPermission.ASSET_DJ) }

    const importAsset = {
      title: '导入',
      visible: importVisible,
      width: 500,
      onOk: () => { document.querySelector('#Information-alert-post').click() },
      onCancel: () => { this.setState({ importVisible: false }) },
      children: <ImportAssets hardCategoryModelNode={ASSETS_TYPES} handleReset={this.handleSubmit} />
    }

    const templateDownload = {
      title: '请选择要下载的模板',
      visible: templateShow,
      width: 650,
      onOk: this.templateDownload,
      onCancel: () => this.setState({ templateChecked: [], templateShow: false }),
      children: <CheckboxGroup style={{ color: '#98ACD9' }} options={ASSETS_TYPES} value={templateChecked} onChange={(v) => { this.changeTemplateChecked(v) }} />
    }

    const proCess = {
      onRef: this.onRef,
      getAssetList: this.getAssetList
    }

    const columns = this.state.columns.filter(item => item.isShow)
    columns.push(this.state.columnsFixed)

    return (
      <div className={PrefixCls}>
        {exportVisible && <ExportModal
          exportModal={{
            exportVisible, //导出弹框显示
            searchValues: seekTerm,  //搜索条件
            total: (dataSource || {}).totalRecords || 0,  //数据总数
            threshold: 5000,  //阈值
            url: '/api/v1/asset/export/file'  //下载地址
          }}
          handleCancelExport={() => this.setState({ exportVisible: false })} />
        }
        <AssetsSearch handleSubmit={this.handleSubmit} isExpand={isExpand} wrappedComponentRef={search => { search && (this.searchForm = search)  }} />

        <div className="table-wrap">
          <TableBtns leftBtns={leftBtns} rightSelec={rightSelec} />
          <Table
            scroll={{ x: true }}
            rowKey='stringId'
            className={`asset-table ${isAllSelectShow ? '' : 'disabled-select-table'}`}
            rowClassName={isSelectShow ? '' : 'selection-hide'}
            onChange={this.handleTableSort}
            columns={columns}
            rowSelection={rowSelection}
            dataSource={dataSource.items || []}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              showQuickJumper: true,
              showSizeChanger: dataSource.totalRecords > 10,
              onShowSizeChange: this.pageChange,
              onChange: this.pageChange,
              pageSizeOptions: ['10', '20', '30', '40'],
              showTotal: () => `共 ${dataSource.totalRecords || 0} 条数据`,
              total: dataSource.totalRecords || 0
            }}
          />
        </div>
        {isNoRegist && <ModalConfirm props={noRegisterInfo} />}
        {soVisible && <AssociatedSoftware {...associatedSoftwareInfo} />}
        <Implementation  {...proCess} />
        {/* <Verification  {...proCess} /> */}
        <DealWith  {...proCess} />
        <Retirement  {...proCess} />
        {/* <Examination  {...proCess} /> */}
        <Rectification  {...proCess} />
        <Decommission  {...proCess} />

        <AssetModal data={importAsset} />
        <AssetModal data={templateDownload} />

      </div>
    )
  }

  async componentDidMount () {
    const { list } = evalSearchParam(this, {}, false) || {}

    // //判断是否存有数据
    if(sessionStorage.searchParameter && list && list[0]){
    //   //解析保留的数据
      const { page, parameter } = list[0]
      this.setState({
        ...page,
        ...parameter
      }, async ()=>{
        await this.getAssetList(true)
        this.searchForm.setFieldsValue( parameter )
      })
    }else{
      this.getAssetList(true) // 根据页面获取列表数据
    }
  }

}
export default Information

