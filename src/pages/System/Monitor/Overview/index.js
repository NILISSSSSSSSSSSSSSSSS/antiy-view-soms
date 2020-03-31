import { Component } from 'react'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import { Form, Button, Table, Pagination, Input, Tooltip, Message } from 'antd'
import moment from 'moment'
import api from '@/services/api'
import hasAuth from '@/utils/auth'
import Charts from '@/components/System/Charts'
import HintAlertConfirm from '@/components/System/HintAlert'
import {  emptyFilter, cacheSearchParameter, evalSearchParam, removeCriteria  } from '@/utils/common'
import { systemPermission } from '@a/permission'
const { Item } = Form

class SystemMonitorList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      status: [],
      columns: [
        {
          title: '服务器ip',
          dataIndex: 'ip'
        },
        {
          title: '资产名称',
          dataIndex: 'name',
          render: (text) => {
            return (
              <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
                <span>{emptyFilter(text)}</span>
              </Tooltip>
            )
          }
        },
        {
          title: 'cpu使用率',
          dataIndex: 'cpu',
          render: (text, scope)=>(<span>{scope.cpuMonitorStatus ? text : '---'}</span>)
        },
        {
          title: '内存使用率',
          dataIndex: 'memory',
          render: (text, scope)=>{
            if(scope.memoryMonitorStatus)
              return (<span>{text}</span>)
            else
              return '--'
          }
        },
        {
          title: '磁盘利用率',
          dataIndex: 'disk',
          render: (text, scope)=>{
            if(scope.diskMonitorStatus)
              return (<span>{text}</span>)
            else
              return '--'
          }
        },
        {
          title: '进程数',
          dataIndex: 'process'
        },
        {
          title: '当前状态',
          dataIndex: 'status',
          render: (status, record) => {
            return status === 0 ? '禁用' : '启用'
          }
        },
        {
          title: '操作',
          key: 'operate',
          render: (record) => {
            return (
              hasAuth( systemPermission.sysMonitorOverviewUpdown) ? <a onClick={(e) =>{
                e.stopPropagation()
                this.changeStatus(record)
              } }>{record.status === 0 ? '启用' : '禁用'}</a> : null
            )
          }
        }
      ],
      body: null,
      pageSize: 10,
      currentPage: 1,
      values: {},
      //表格当前高亮行的ID
      stringId: null,
      type: 1,
      date: null,
      initState: 1,
      echartsData: [],
      initUnfold: [],
      hintConfig: {},
      hintShow: false
    }
  }
  componentDidMount () {
    this.props.children(this)
    let { pageSize, currentPage } = this.state
    //解析保留的数据
    let { list } = evalSearchParam(this) || {}
    if(list && list[0]){
      this.setState({
        pageSize: list[0].page.pageSize,
        currentPage: list[0].page.currentPage,
        values: list[0].parameter }, ()=>{
        let { pageSize, currentPage } = list[0].page
        this.getList(currentPage, pageSize)
      })
    }else{
      this.getList(currentPage, pageSize)
    }
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    if (JSON.stringify(this.props.treeData) !== JSON.stringify(nextProps.treeData)) {
      this.setState({
        treeData: nextProps.treeData
      })
    }
  }

  render () {
    let { columns, pageSize, currentPage, body, initUnfold, hintConfig, hintShow } = this.state
    let list  = []
    let total =  0
    if (body){
      list = body.items
      total =  body.totalRecords
    }
    const { getFieldDecorator } = this.props.form
    return (
      <div className="system-monitor-overview">
        <div className="search-bar">
          <Form className="filter-form new-flex-layout" layout="inline" onSubmit={this.handleSubmit}>
            <Item label="综合查询：">
              {getFieldDecorator('name', {
                rules: [{ min: 1, max: 30, message: '字符长度最小为1，最大为30!' }]
              })(
                <Input autoComplete="off" className="filter-form-item" placeholder="请输入ip/资产名称"  />
              )}
            </Item>
            <Item className="search-item item-separation">
              <Button type="primary" htmlType="submit">查询</Button>
              <Button type="primary" ghost onClick={this.handleReset}>重置</Button>
            </Item>
          </Form>
        </div>
        <div className="table-wrap">
          <Table
            rowKey={row => row.stringId}
            columns={columns}
            expandIconAsCell
            // defaultExpandedRowKeys = { []}
            expandedRowKeys = {initUnfold}
            dataSource={list}
            pagination={false}
            // expandIcon={CustomExpandIcon}
            className={`${['l-table-td']}`}
            // rowClassName={this.setRowClassName}
            // 点击行
            expandedRowRender={this.expandedRowRender}
            expandRowByClick = {true}
            onExpand={this.expandedRowRenderFile}
          />
          <Pagination
            className="table-pagination"
            total={total} showTotal={(total) => `共 ${total || 0} 条数据`}
            showQuickJumper={true}
            onChange={this.changePage}
            onShowSizeChange={this.changePage}
            pageSize={pageSize}
            current={currentPage}
          />
        </div>
        <HintAlertConfirm hinitConfig={hintConfig} visible = { hintShow }></HintAlertConfirm>
      </div>
    )
  }
  expandedRowRender = (record, index, indent, expanded)=>{
    if(expanded){
      //更改默认属性
      document.querySelectorAll('.ant-table-expanded-row.ant-table-expanded-row-level-1 td:nth-child(2)').forEach(item=>{
        item.setAttribute('colspan', '9')
      })
      return (
        <Charts echartsData={this.state.echartsData} type={this.state.type} time = {this.state.date}
          getEcharts={this.getEcharts} key={record.stringId} style={{ width: '100%', height: 500 }}/>)
    }
  }
  //更改状态
  expandedRowRenderFile = (expanded, record) => {
    this.setState({ initUnfold: expanded ? [record.stringId] : [] })
    if(expanded){
      this.setState({ date: record.lastMonitorTime ? moment(record.lastMonitorTime) : moment(new Date()) }, ()=>{
        this.getEcharts(record.stringId, 1, this.state.date)
      })
    }
  }
  //操作confirm弹窗
  changeStatus = (obj) => {
    let text = `确认是否${['启用', '禁用'][obj.status]}此监测?`
    //弹窗配置
    let init = {
      text,
      submit: ()=>this.handleAlert(obj),
      onCancel: ()=> this.setState({ hintShow: false })
    }
    this.setState({ hintConfig: init, hintShow: true })
  }
  //confirm确认
  handleAlert= (obj)=>{
    api.sysMonitorserverUpdate({
      id: obj.stringId,
      status: obj.status === 0 ? 1 : 0,
      ip: obj.ip
    }).then(response => {
      if(response && response.head && response.head.code === '200' ){
        let { currentPage, pageSize } = this.state
        Message.success('操作成功')
        this.getList(currentPage, pageSize)
        this.setState({ hintShow: false })
      }
    })
  }
  //重置
  handleReset = () => {
    this.props.form.resetFields()
    removeCriteria('1', this.props.history)
    this.setState({
      values: {},
      pageSize: 10,
      currentPage: 1,
      initState: 1
    }, () => this.getList(1, 10))
  }

  //表单查询
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      values.ip = values.name
      if (!err) {
        this.setState({
          values,
          pageSize: 10,
          currentPage: 1
        }, () => this.getList(1, 10, true))
      }
    })
  }

  //获取echarts数据
  getEcharts = (id, type = 1, date = moment(new Date().getTime()).format('YYYY-MM-DD')) => {
    if (!(id && type && date)) return false
    api.monitorDetail({
      id,
      type,
      date: moment(date).format('YYYY-MM-DD')
    }).then(response => {
      let valueList = [], time = [], data = response.body || {}
      //组装charts数据
      if (data.list) {
        data.list.forEach(item => {
          time.push(moment(item.gmtCreate).format('YYYY-MM-DD HH:mm:ss'))
          valueList.push(item.value)
        })
      }
      data.valueList = valueList
      data.time = time
      data.stringId = id
      //磁盘详情
      if (type === 3 && data.diskDetail) {
        data.diskDetail = data.diskDetail.split(';')
      }
      this.setState({
        echartsData: data,
        type: type - 1,
        date
      })
    })
  }

  //获取列表
  getList = (page, size, is = false) => {
    let { values, initState } = this.state,
      _t = this
    if(is){
      cacheSearchParameter([{
        page: { pageSize: size, currentPage: page },
        parameter: values
      }], this.props.history, 0, '1')
      this.props.saveItemKey()
    }
    api.sysmonitorserverList({ ...values, currentPage: page, pageSize: size }).then(response => {
      const data = response.body
      _t.setState({ body: data })
      //第一次初始化数据，检查是否存在启用状态，默认展开第一条
      if (data && data.items && data.items.length && initState) {
        let stringId = data.items.filter(now=>now.status === 1)
        if(stringId.length){
          _t.setState({
            status: stringId,
            stringId: stringId[0].stringId
          }, ()=>_t.expandedRowRenderFile(true, stringId[0]))
        }
        _t.setState({
          initState: 0
        })
      }
    })
  }
  //翻页
  changePage = (page, size) => {
    this.setState({
      pageSize: size,
      currentPage: page
    }, ()=>this.getList(page, size))
  }
}
const SystemMonitorForm = Form.create()(SystemMonitorList)
export default withRouter(connect()(SystemMonitorForm))
