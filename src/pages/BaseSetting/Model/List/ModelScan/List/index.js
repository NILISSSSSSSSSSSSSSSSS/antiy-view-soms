import { Component } from 'react'
import { TooltipFn, evalSearchParam, cacheSearchParameter, transliteration } from '@u/common'
import { Form, Table, message, Pagination, Button } from 'antd'
import { connect } from 'dva'
import { Link, withRouter } from 'dva/router'
import {
  Search,
  CommonModal
} from '@c/index'  //引入方式
import hasAuth from '@/utils/auth'
import { configPermission } from '@a/permission'
import api from '@/services/api'
import moment from 'moment'

const { Item } = Form
const dateFormat = 'YYYY-MM-DD HH:mm:ss'
class ModelScan extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      Visible: false,
      scanVisible: false,
      columns: [
        {
          title: '扫描任务名称',
          key: 'scanName',
          dataIndex: 'scanName',
          render: text => TooltipFn(text)
        },
        {
          title: '扫描开始时间',
          key: 'gmtCreate',
          dataIndex: 'gmtCreate',
          render: (text) => {
            return (<span className="tabTimeCss">{text ? moment(text).format(dateFormat) : '--'}</span>)
          }
        }, {
          title: '扫描结束时间',
          key: 'gmtEnd',
          dataIndex: 'gmtEnd',
          render: (text) => {
            return (<span className="tabTimeCss">{text ? moment(text).format(dateFormat) : '--'}</span>)
          }
        }, {
          title: '扫描状态',
          key: 'scanStatus',
          dataIndex: 'scanStatus',
          render: (text, record) => {
            return ( text === 0 ? '执行中' : '已完成')
          }
        },
        {
          title: '操作',
          key: 'operate',
          width: '16%',
          render: (record) => {
            return (
              <div className="operate-wrap">
                {
                  hasAuth(configPermission.viewScanBasetemplate) &&
                  <Link to={`/basesetting/model/scandetail?stringId=${transliteration(record.scanId)}`}>查看结果</Link>
                }
              </div>
            )
          }
        }],
      body: null,
      scanArr: [
        { name: '', key: 'scanType', type: 'select', multiple: null, search: true, data: [{ name: '基准项', value: 0 }, { name: '黑名单', value: 1 }, { name: '白名单', value: 2 }], required: 'scanVerifi', message: '请选择基准项/黑名单/白名单' },
        { name: '', key: 'scanVerifi', type: 'select', multiple: null, required: 'scanType', message: '请选择状态', search: false, data: [{ name: '等于', value: 0 }, { name: '不等于', value: 1 }] },
        { name: '', key: 'scanContent', type: 'input', required: 'scanType', message: '请选择基准项/黑名单/白名单' },
        { name: '', key: 'configId' },
        { name: '', key: 'defineValue' }],
      total: 0,
      values: {},
      submitValues: {}
    }
  }
  componentDidMount () {
    let { list } = evalSearchParam(this, {}, false) || {}
    if (list && list.length) {
      if (list[0].parameter.time && list[0].parameter.time.length) {
        list[0].parameter.time.forEach((ele, idx) => {
          ele && (list[0].parameter.time[idx] = moment(moment(ele).format('YYYY-MM-DD')))
        })
      }
      if (list[0].parameter.time2 && list[0].parameter.time2.length) {
        list[0].parameter.time2.forEach((ele, idx) => {
          ele && (list[0].parameter.time2[idx] = moment(moment(ele).format('YYYY-MM-DD')))
        })
      }
      this.searchForm.setFieldsValue({ ...list[0].parameter })
      this.setState({ pagingParameter: list[0].page, values: list[0].parameter }, () => this.getList())
    } else {
      this.getList(false, false)
    }
  }
  getList = (isCache = true) => {
    let { values, pagingParameter } = this.state
    isCache && cacheSearchParameter([{ page: pagingParameter, parameter: { ...values } }], this.props.history)
    if (values.time && values.time.length > 0) {
      values.startGmtCreate = values.time[0] ? values.time[0].valueOf() + '' : ''
      values.endGmtCreate = values.time[1] ? values.time[1].valueOf() + '' : ''
      delete values.time
    }
    if (values.time2 && values.time2.length > 0) {
      values.startGmtEnd = values.time2[0] ? values.time2[0].valueOf() + '' : ''
      values.endGmtEnd = values.time2[1] ? values.time2[1].valueOf() + '' : ''
      delete values.time2
    }
    let param = { ...pagingParameter, ...values }
    api.queryTemplateScan(param).then(res=>{
      this.setState({
        body: res.body
      })
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
      values
    }, () => {
      this.getList()
    })
  }
  //表单重置
  handleReset = () => {
    const pagingParameter = {
      pageSize: 10,
      currentPage: 1
    }
    this.setState({
      values: {},
      pagingParameter
    }, () => {
      sessionStorage.removeItem('searchParameter')
      this.getList()
    })
  }
  //分页
  changePage = (currentPage, pageSize) => {
    this.setState({
      pagingParameter: {
        pageSize,
        currentPage
      }
    }, () => {
      this.getList()
    })
  }
  isValid = (record) => {
    this.setState({ Visible: true })
  }
  scanRegister = (values) => {
    this.combination(values)
  }
  //组合动态生成的字段
  combination = (values) => {
    console.log(values)
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
        case 'baselineConfigInfoExt':
          if (init[1] !== undefined && values[key] !== undefined && values[key] !== null)
            param.scanConditionList = isArr(key1, init[1], Number(init[2]), values[key]).filter(item=> item !== null)
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
  checkValues = () => {
    let { submitValues } = this.state
    if (!submitValues.scanConditionList) {
      message.warn('扫描任务内容不能为空!')
    } else {
      submitValues.scanConditionList = submitValues.scanConditionList.map(item => {
        if (item.scanType !== 0) {
          return {
            scanType: item.scanType,
            scanVerifi: item.scanType,
            softId: item.configId,
            scanContent: item.scanContent
          }
        } else {
          return {
            scanType: item.scanType,
            scanVerifi: item.scanType,
            configId: item.configId,
            defineValue: item.defineValue,
            scanContent: item.scanContent
          }
        }
      })
      api.newTemplateScan(submitValues).then(res => {
        message.success('操作成功!')
        this.setState({
          Visible: false
        }, this.getList)
      })
    }
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
  }
  render () {
    let { pagingParameter, body, columns, Visible, scanArr } = this.state
    let list = [], total = 0
    if (body) {
      list = body.items
      total = Number(body.totalRecords)
    }
    const formLayout = {
      labelCol: {
        span: 4
      },
      wrapperCol: {
        span: 19
      }
    }
    const defaultFields = [
      { type: 'input', label: '扫描任务名称', placeholder: '请输入扫描任务名称', key: 'scanName', allowClear: true, maxLength: 30 },
      { type: 'select', label: '扫描状态', placeholder: '请选择扫描状态', key: 'scanStatus', data: [{ name: '执行中', value: 0 }, { name: '已完成', value: 1 }] },
      { type: 'dateRange', label: '扫描开始时间', placeholder: ['', ''], key: 'time', allowClear: true },
      { type: 'dateRange', label: '扫描结束时间', placeholder: ['', ''], key: 'time2', allowClear: true }
    ]
    this.formFields = [
      {
        type: 'input', key: 'scanName', name: '扫描任务名称', rules: [{ required: true, message: '请输入扫描任务名称' }]
      },
      {
        type: 'AddScan', key: 'name2', name: '扫描任务内容', data: scanArr
      }
    ]
    return (
      <div className="main-table-content">
        <div className="search-bar">
          <Search defaultFields={defaultFields} wrappedComponentRef={search => { search && (this.searchForm = search.props.form) }} onSubmit={this.handleSubmit} onReset={this.handleReset} />
        </div>
        {/* 列表+分页 */}
        <div className="table-wrap">
          {
            hasAuth(configPermission.newScanBasetemplate) ? <div className="table-btn">
              <div className="left-btn">
                <Button type="primary" onClick={() => this.setState({ Visible: true })}>新建扫描</Button>
              </div>
            </div> : null}
          <Table rowKey="stringId" onChange={this.handleTableChange} columns={columns} dataSource={list} pagination={false}
          />
          {total > 0 && <Pagination
            className="table-pagination"
            total={total}
            showTotal={(total) => `共 ${total || 0} 条数据`}
            showSizeChanger={total > 10 ? true : false}
            showQuickJumper
            onChange={this.changePage}
            onShowSizeChange={this.changePage}
            pageSize={pagingParameter.pageSize}
            current={pagingParameter.currentPage} />
          }
        </div>
        <CommonModal
          type="form"
          visible={Visible}
          title="模板扫描"
          width={1200}
          oktext="扫描"
          value={this.scanRegister}
          fields={this.formFields}
          column={1}
          FormItem={Item}
          formLayout={formLayout}
          onClose={() => { this.setState({ Visible: false }) }}
        >
        </CommonModal>
        {/* 扫描 */}
      </div>
    )
  }
}
export default withRouter(connect()(ModelScan))