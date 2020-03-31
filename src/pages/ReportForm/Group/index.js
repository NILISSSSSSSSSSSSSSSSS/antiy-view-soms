import { Component } from 'react'
import { connect } from 'dva'
import { Form, Table, Button, Select, Icon, DatePicker, Pagination, Dropdown, Menu } from 'antd'
import api from '@/services/api'
import moment from 'moment'
import Search from './Search'
import { ASSETS_IMPORTANT } from '@a/js/enume'
import SaveModal from '@c/ReportForm/Group/SaveModal'
import { TooltipFn } from '@/utils/common'
import ExportModal from '@/components/common/ExportModal'
import ModalConfirm from '@/components/common/ModalConfirm'
import './style.less'

moment.locale('zh-cn')
const { Item } = Form
const { Option } = Select
class ReportFormGroup extends Component {
  constructor (props) {
    super(props)
    this.state = {
      columns: [{
        title: '资产编号',
        dataIndex: 'number',
        key: 'number',
        render: (text)=>TooltipFn(text)
      }, {
        title: '所属区域',
        dataIndex: 'areaName',
        key: 'areaName',
        render: (text)=>TooltipFn(text)

      }, {
        title: '首次入网时间',
        dataIndex: 'firstEnterNett',
        key: 'firstEnterNett',
        sorter: true,
        width: 180,
        render: text=>text ? TooltipFn(moment(text).format('YYYY-MM-DD HH:mm:ss')) : null

      }, {
        title: '重要程度',
        dataIndex: 'importanceDegree',
        key: 'importanceDegree',
        render: ( text ) => {
          switch(text){
            case 1 : return '核心'
            case 2 : return '重要'
            case 3 : return '一般'
            default : break
          }
        }
      },  {
        title: 'IP',
        dataIndex: 'ips',
        key: 'ips',
        render: (text)=>TooltipFn(text)
      }, {
        title: '使用者',
        dataIndex: 'responsibleUserName',
        key: 'responsibleUserName',
        render: (text)=>TooltipFn(text)
      }, {
        title: '基准模板',
        dataIndex: 'baseTemplate',
        key: 'baseTemplate',
        render: (text)=>TooltipFn(text)
      }, {
        title: '厂商',
        dataIndex: 'manufacturer',
        key: 'manufacturer',
        render: (text)=>TooltipFn(text)
      }, {
        title: '未修复漏洞',
        dataIndex: 'noVulCount',
        key: 'noVulCount',
        sorter: true,
        render: (text)=>TooltipFn(text)
      }, {
        title: '已修复漏洞',
        dataIndex: 'vulCount',
        key: 'vulCount',
        sorter: true,
        render: (text)=>TooltipFn(text)
      },  {
        title: '未安装补丁',
        dataIndex: 'noPatchCount',
        key: 'noPatchCount',
        sorter: true,
        render: (text)=>TooltipFn(text)
      }, {
        title: '已安装补丁',
        dataIndex: 'patchCount',
        key: 'patchCount',
        sorter: true,
        render: (text)=>TooltipFn(text)
      }
      ],
      flagValue: undefined, //历史模板编辑时保存值
      listBody: {},
      sortedInfo: {},
      templateData: [],
      supplierArr: [],
      currentPage: 1,
      pageSize: 10,
      checkedValue: '',
      isOpen: false,
      initSearch: true,
      childrenSearch: {},
      search: {}, //保留搜索条件
      exportVisible: false, //导出框显示
      searchValues: {}, //导出查询条件
      exportTotal: 0, //导出数据总数
      sortName: undefined,
      clearModal: false,
      thanValue: [{ value: 0, name: '全部' }, { value: 1, name: '小于等于' }, { value: 2, name: '大于等于' }],
      historyData: [],
      showData: [],
      editModal: false
    }
  }
  componentDidMount () {
    this.getList()
    this.getHistoryData()
    this.baselineTemplate()
    this.getSupplierData()
    this.getTree()
  }

  //获取列表数据
  getList = ( param ) => {
    let { sortName, sortOrder, currentPage, pageSize, search } = this.state
    api.getCompositionReportList({ ...param, sortName, sortOrder, currentPage, pageSize, ...search }).then(response => {
      this.setState({
        listBody: response.body
      })
    })
  }
  // 区域树
  getTree = () => {
    api.getUserAreaTree().then( res =>
      this.setState({ getUserAreaTree: res.body })
    )
  }
  // 基准模板下拉
  baselineTemplate = () => {
    api.baselineTemplate().then( res => {
      this.setState({
        templateData: [ {
          value: res.body[0].id,
          name: res.body[0].value
        }]
      })
    })
  }
  // 厂商下拉
  getSupplierData = () => {
    api.getManufacturerInfo({ supplier: null }).then( res => {
      this.setState({ supplierArr: res.body })
    }
    )
  }
  // 排序
  handChange = (pagination, filters, sorter) => {
    let sortName =  sorter.columnKey
    let sortOrder = (sorter.order === 'ascend') ? 'ASC' :  (sorter.order === 'descend') ?  'DESC' : undefined
    this.setState({ sortName, sortOrder, selectedRowKeys: [], selectList: [] }, this.getList)
  }
  // 翻页
  pageChange = (currentPage, pageSize) =>{
    this.setState({ currentPage, pageSize }, this.getList)
  }
  //文件导出
  Download = (v) => {
    let { search, currentPage, pageSize, listBody, childrenSearch } = this.state
    search.currentPage = currentPage
    search.pageSize = pageSize
    search.exportType = v.key//导出类型
    this.setState({
      exportTotal: listBody.totalRecords,
      exportVisible: true,
      // 后端有exportType，所以search一定要写后面覆盖前面，不能写前面
      searchValues: { ...childrenSearch, ...search }
    })
  }
  // 展示删除弹框
  showComfim = (e, item) =>{
    e.stopPropagation()
    this.setState({ clearModal: true, historyId: item.stringId })
  }
  // 确认删除
  clearData = () => {
    const { historyId } = this.state
    api.delHistoryTemplate({ id: historyId }).then( res => {
      this.setState({ clearModal: false }, this.getHistoryData)
    })
  }
  // 历史模板下拉数据
  getHistoryData = () => {
    api.historyTemplateData().then( res => {
      // 有默认筛选时就有初始查询
      let initVal = res.body.filter(item => { return item.identification === 1 }).map( item => { return item.stringId})[0]
      this.setState({
        historyData: res.body,
        initVal//用于判断初始话是否默认回显
      }, initVal && (() => this.getShowData(initVal)))
    })
  }
  // 输入框回显数据
  getShowData = (param) => {
    let { initVal } = this.state
    api.assetCompoditionReportShowData({ id: param }).then( res => {
      this.setState({ showData: res.body.query, isOpen: true, detailData: res.body, childrenSearch: res.body.query })
      param === initVal && this.getList(res.body.query)
    })
  }
  // 历史模板下拉框改变
  historyOnChange = (v) => {
    this.Search.onReset()
    this.getShowData(v)
  }
  // 显示编辑（新增）弹窗
  showEditModal = (parm, values) => {
    this.props.form.validateFields(['historySearch'], (err, value)=> {
      let { detailData } = this.state
      this.SaveModal.showModal(parm, values, value, detailData)
    })
  }
  // 重置(search子组件)
  searchOnReset = ()=> {
    this.Search.onReset()
  }

  // 查询
  onSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields( (err, values) => {
      values.firstEnterStartTime = values.firstEnterStartTime && moment(values.firstEnterStartTime).startOf('day').valueOf()
      values.firstEnterEndTime = values.firstEnterEndTime && moment(values.firstEnterEndTime).endOf('day').valueOf()
      // 父组件的值
      this.setState({ search: values  },
        // 子组件的值
        () => this.Search.onSearch())
    })
  }
  // 查询提交
  onSearch = (values) => {
    let { search } = this.state
    delete search.historySearch
    let param = { ...search,  ...values }
    this.getList(param)
    this.setState({ childrenSearch: values })
  }
  // 重置
  onReset = () => {
    this.props.form.resetFields()
    this.Search.onReset()
    this.setState({ showData: {}, search: {}, initSearch: false }, this.getList)
  }
  render () {
    let {
      listBody,
      exportVisible,
      searchValues,
      exportTotal,
      initSearch,
      isOpen,
      templateData,
      getUserAreaTree,
      supplierArr,
      columns,
      currentPage,
      pageSize,
      historyData,
      clearModal,
      thanValue,
      showData
    } = this.state
    let { getFieldDecorator } = this.props.form
    let list = []
    let totalRecords = 0
    if (listBody) {
      list = listBody.items
      totalRecords = listBody.totalRecords
    }
    // 模板查询条件
    const AddParms = [
      {
        type: 'select',
        label: '基准模板',
        key: 'baselineTemplateIds',
        multiple: 'multiple',
        data: templateData,
        initialValue: showData && showData !== null ? showData.baselineTemplateIds : undefined
      },
      {
        type: 'select',
        label: '厂商',  key: 'manufacturers',
        multiple: 'multiple',  data: supplierArr,
        initialValue: showData && showData !== null ? showData.manufacturers : undefined
      },
      {
        type: 'select-tree',
        label: '所属区域',
        key: 'area',
        multiple: 'multiple',
        data: getUserAreaTree,
        initialValue: showData && showData !== null ? showData.areaIds : undefined
      },
      {
        type: 'select-input',
        paramClassName: 'short-select-input',
        key: 'noVulCounts', label: '未修复漏洞',
        data: thanValue, count: 'noVulCount',
        placeholder: { input: '请输入', select: '请选择' },
        initialValue: showData && showData !== null ? [showData.noVulCountType, showData.noVulCount] : undefined
      },
      {
        type: 'select-input',
        paramClassName: 'short-select-input',
        key: 'vulCounts',
        label: '已修复漏洞',
        data: thanValue,
        count: 'vulCount',
        placeholder: { input: '请输入', select: '请选择' },
        initialValue: showData && showData !== null ? [showData.vulCountType, showData.vulCount] : undefined
      },
      {
        type: 'select',
        paramClassName: '',
        label: '重要程度',
        key: 'importanceDegrees',
        multiple: 'multiple',
        data: ASSETS_IMPORTANT,
        initialValue: showData && showData !== null ? showData.importanceDegrees : undefined
      },
      {
        type: 'select-input',
        paramClassName: 'short-select-input',
        key: 'noPatchCounts', label: '未安装补丁',
        data: thanValue, count: 'noPatchCount',
        placeholder: { input: '请输入', select: '请选择' },
        initialValue: showData && showData !== null ? [showData.noPatchCountType, showData.noPatchCount] : undefined
      },
      {
        type: 'select-input',
        paramClassName: 'short-select-input',
        key: 'patchCounts', label: '已安装补丁',
        data: thanValue, count: 'patchCount',
        placeholder: { input: '请输入', select: '请选择' },
        initialValue: showData && showData !== null ? [showData.patchCountType, showData.patchCount] : undefined
      }
    ]
    const alertClear = {
      visible: clearModal,
      children: (<p className='model-text'>是否删除此查询条件?</p>),
      onOk: this.clearData,
      onCancel: () => this.setState({ clearModal: false })
    }
    let searchClassName = isOpen ? 'search-down' : 'search-up'
    const menu = (
      <Menu onClick={this.Download}>
        <Menu.Item key={1}>EXCLE</Menu.Item>
        <Menu.Item key={2}>CSV</Menu.Item>
      </Menu>
    )
    let initVal = historyData.filter(item => { return item.identification === 1 }).map( item => {  return item.stringId})[0]
    return (
      <div className="main-table-content" >
        <Form className="filter-form new-flex-layout" layout="inline" onSubmit={this.onSubmit} onReset ={ this.onReset }>
          <Item label='首次入网时间' className='item-date-container item-date-two'>
            {getFieldDecorator('firstEnterStartTime', {
            })(
              <DatePicker placeholder="开始日期" allowClear getCalendarContainer={triggerNode => triggerNode.parentNode} />
            )}
            <span className="split">-</span>
          </Item>
          <Item className='item-date-container item-date-two'>
            {getFieldDecorator('firstEnterEndTime', {
            })(
              <DatePicker placeholder="结束日期" allowClear  getCalendarContainer={triggerNode => triggerNode.parentNode} />
            )}
          </Item>
          <Item label="历史模板">
            {
              getFieldDecorator('historySearch', { initialValue: initSearch ? initVal : undefined })(
                <Select placeholder="请选择" name='historySearch' getPopupContainer={triggerNode => triggerNode.parentNode} onChange={this.historyOnChange} >
                  {
                    historyData.map((item)=>{
                      return ( <Option value={item.stringId} key={item.stringId}>
                        <span className='option-clear' onClick={(e) => this.showComfim(e, item)}><Icon type="close" /></span>
                        <span className='option-content'>{item.name}</span></Option>)
                    })
                  }
                </Select>
              )
            }
          </Item>
          <Item className="search-item item-separation">
            <Button type="primary" htmlType="submit">查询</Button>
            <Button type="primary" ghost htmlType='reset' onClick={this.handleReset}>重置</Button>
            <span className="show-ondition" onClick={() => this.setState({ isOpen: !isOpen })}>
              <Icon type={isOpen ? 'up' : 'down'} />
              {isOpen ? '收起' : '展开'}
            </span>
          </Item>
        </Form>
        <div className={searchClassName}>
          <Search
            parms={AddParms}
            showEditModal ={this.showEditModal}
            children={(now) => this.Search = now}
            onSearch = {this.onSearch}
          />
        </div>
        <section className="table-wrap table-style">
          <div className="table-btn">
            <div className="left-btn">
              <div className='down-up-btn'>
                <Dropdown overlay={menu}>
                  <Button type="primary">导出</Button>
                </Dropdown>
              </div>

            </div>
          </div>
          <Table rowKey="id" columns={columns} dataSource={list} onChange={this.handChange} pagination={false}/>
          {
            totalRecords > 0 &&
          <Pagination
            current={currentPage}
            className="table-pagination"
            defaultPageSize={10}
            pageSize={pageSize}
            onChange={this.pageChange}
            showSizeChanger={totalRecords > 10 && true}
            onShowSizeChange={ this.pageChange}
            total={totalRecords ? totalRecords : 0}
            showTotal={(total) => `共 ${total} 条数据`}
            showQuickJumper={true} />
          }
        </section>
        {/* 导出 */}
        {
          exportVisible && <ExportModal
            exportModal={{
              exportVisible, //弹框显示
              searchValues, //搜索条件
              total: exportTotal, //数据总数
              threshold: 5000, //阈值
              url: '/api/v1/asset/assetcompositionreport/export/file'//下载地址
            }}
            handleCancelExport={() => this.setState({ exportVisible: false })} />
        }
        <SaveModal  childrens={(now)=>this.SaveModal = now } getHistoryData={this.getHistoryData} searchOnReset={this.searchOnReset}/>
        {/* 确认清除弹窗 */}
        <ModalConfirm props={alertClear}/>
      </div>
    )
  }
}

const ReportFormWarnFrom = Form.create()(ReportFormGroup)
export default connect()(ReportFormWarnFrom)
