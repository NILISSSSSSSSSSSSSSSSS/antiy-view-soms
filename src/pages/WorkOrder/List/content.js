import { Component, Fragment } from 'react'
import { connect } from 'dva'
import { NavLink } from 'dva/router'
import moment from 'moment'
import { Form, Input, Button, Select, Table, message, Pagination, Tooltip, Icon, Row, Badge } from 'antd'
import api from '@/services/api'
import { transliteration, emptyFilter, cacheSearchParameter, evalSearchParam } from '@/utils/common'
import hasAuth from '@/utils/auth'
import { routinePermission } from '@a/permission'
import DateRange from '@/components/common/DateRange'
import ModalConfirm from '@/components/common/ModalConfirm'
import RejectForm from './rejectForm'
import CloseForm from './closeForm'
import CompleteForm from './completeForm'
import './style.less'

const { Item } = Form
const { Option } = Select
const statusMap = [
  {
    key: '0',
    name: '全部',
    pages: ['todo', 'create', 'finish', 'all']
  },
  {
    key: '1',
    name: '待执行',
    pages: ['todo', 'create', 'all']
  },
  {
    key: '2',
    name: '执行中',
    pages: ['todo', 'create', 'all']
  },
  {
    key: '3',
    name: '已完成',
    pages: ['finish', 'create', 'all']
  },
  {
    key: '4',
    name: '未完成',
    pages: ['finish', 'create', 'all']
  },
  {
    key: '5',
    name: '拒绝接收',
    pages: ['finish', 'create', 'all']
  },
  {
    key: '6',
    name: '已关闭',
    pages: ['create', 'all']
  }
]
// 工单超期对应的orderStatus
const overdueMap = {
  accept: 1,   // 接单超期
  complete: 2  // 完成超期
}

class WorkOrderList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      menuType: '',
      conditionShow: false,
      body: props.body,
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      sorts: {
        sortName: undefined,
        sortOrder: undefined
      },
      values: {
        orderType: '0',
        orderStatus: '0',
        workLevel: '0'
      },
      dateFormat: 'YYYY-MM-DD HH:mm:ss',
      defaultActiveKey: '1',
      userList: [],             // 执行人列表
      acceptOrderVisible: false // 接单
    }
  }
  componentDidMount () {
    // 获取筛选项中的执行人列表
    this.props.children(this)
    api.getUsersByAreaOfCurrentUser().then((data) => {
      this.setState({
        userList: data.body
      })
    })
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    // 更新列表数据
    if (JSON.stringify(this.props.body) !== JSON.stringify(nextProps.body)) {
      this.setState({
        body: nextProps.body
      })
    }
    if (this.props.keys !== nextProps.tabActiveKey) {
      this.props.form.resetFields()
      this.setState({
        conditionShow: false,
        values: {
          orderType: '0',
          orderStatus: '0',
          workLevel: '0'
        }
      })
    }
  }
  initData = (type) => {
    //判断是否存有数据
    //解析保留的数据
    let { list } = evalSearchParam(this) || {}
    if (list) {
      let param = JSON.parse(JSON.stringify(list[0])).parameter
      let v = ['estimateBeginStartTime', 'estimateBeginEndTime', 'estimateFinishStartTime', 'estimateFinishEndTime']
      let init = list[0].parameter
      v.forEach(item => {
        delete param[item]
      })
      if (init.estimateBeginStartTime || init.estimateBeginEndTime)
        param.startTime = [init.estimateBeginStartTime ? moment(init.estimateBeginStartTime) : '', init.estimateBeginEndTime ? moment(init.estimateBeginEndTime) : '']
      if (init.estimateFinishStartTime || init.estimateFinishEndTime)
        param.endTime = [init.estimateFinishStartTime ? moment(init.estimateFinishStartTime) : '', init.estimateFinishEndTime ? moment(init.estimateFinishEndTime) : '']
      this.props.form.setFieldsValue(param)
      this.setState({
        pagingParameter: list[0].page,
        values: list[0].parameter,
        conditionShow: list[0].conditionShow,
        sorts: list[0].sorts,
        menuType: type
      }, () => {
        this.getList()
      })
    } else {
      this.setState({
        pagingParameter: {
          currentPage: 1,
          pageSize: 10
        },
        menuType: type
      }, () => {
        this.getList()
      })
    }
  }
  getList = () => {
    const { values, pagingParameter, menuType } = this.state
    const postParams = {
      ...values,
      ...pagingParameter,
      id: this.props.id
    }
    this.initPageList(postParams, menuType)
  }
  handleTableChange = (pagination, filters, sorter) => {
    const { menuType } = this.state
    const source = sorter.columnKey ? sorter.columnKey : ''
    let sort = ''
    if (source) sort = sorter.order === 'ascend' ? 'ASC' : 'DESC'
    const values = { ...this.state.values }
    if (source && sort) {
      values.source = source
      values.sort = sort
    }
    this.setState({
      values,
      sorts: {
        sortName: sorter.columnKey,
        sortOrder: sorter.order
      }
    }, () => {
      const { values, pagingParameter, sorts, conditionShow } = this.state
      const postParams = {
        ...values,
        ...pagingParameter
      }
      cacheSearchParameter([{
        page: pagingParameter,
        parameter: { ...values },
        sorts,
        conditionShow
      }], this.props.history)
      this.initPageList(postParams, menuType)
    })
  }
  //弹出拒绝框
  rejectWorkOrder = ({ id }) => {
    this.rejectChild.rejectWorkOrder(id)
  }
  //弹出关闭框
  closeWorkOrder = ({ id }) => {
    this.closeChild.closeWorkOrder(id)
  }
  //弹出完成框
  completeWorkOrder = ({ id }) => {
    this.completeChild.completeWorkOrder(id)
  }
  //刷新列表
  refresh = () => {
    this.pageModify(10, 1)
  }
  // 提交表单，执行查询
  handleSubmit = (e) => {
    e.preventDefault()
    const { menuType } = this.state
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (values.executeUserId === '0') values.executeUserId = ''
        const startTimeArr = values.startTime ? [...values.startTime] : undefined
        const endTimeArr = values.endTime ? [...values.endTime] : undefined
        // 预计开始时间
        if (startTimeArr) {
          values.estimateBeginStartTime = startTimeArr[0] ? startTimeArr[0].valueOf() : ''
          values.estimateBeginEndTime = startTimeArr[1] ? startTimeArr[1].valueOf() : ''
          delete values.startTime
        }
        // 预计结束时间
        if (endTimeArr) {
          values.estimateFinishStartTime = endTimeArr[0] ? endTimeArr[0].valueOf() : ''
          values.estimateFinishEndTime = endTimeArr[1] ? endTimeArr[1].valueOf() : ''
          delete values.endTime
        }
        this.setState({
          values,
          pagingParameter: {
            pageSize: this.state.pagingParameter.pageSize,
            currentPage: 1
          }
        }, () => {
          const { values, pagingParameter, sorts, conditionShow } = this.state
          const postParams = {
            ...values,
            ...pagingParameter
          }
          cacheSearchParameter([{
            page: pagingParameter,
            parameter: { ...values },
            sorts,
            conditionShow
          }], this.props.history)
          this.initPageList(postParams, menuType)
        })
      }
    })
  }
  receiveWorkOrderShow = item => {
    const values = {
      'receiveStatus': true,
      'orderId': item.id
    }
    this.setState({
      receiveOrder: values,
      acceptOrderVisible: true
    })
  }
  // 接收工单
  receiveWorkOrder = () => {
    const { receiveOrder } = this.state
    const self = this
    api.workOrderReceiveStatus(receiveOrder).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({ acceptOrderVisible: false })
        message.success('接单成功！')
        self.pageModify(self.state.pagingParameter.pageSize, self.state.pagingParameter.currentPage)
      } else {
        this.setState({ acceptOrderVisible: false })
        message.error('接单失败！' + response.body)
      }
    })
  }

  //重置form表单查询条件
  resetFormFileds = (type = '') => {
    this.props.form.resetFields()
    this.resetKeyStart = 'start' + Math.random()
    this.resetKeyEnd = 'end' + Math.random()
    this.setState({
      menuType: type,
      values: {
        orderType: '0',
        orderStatus: '0',
        workLevel: '0'
      },
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      sorts: {
        sortName: undefined,
        sortOrder: undefined
      }
    }, this.getList)
  }
  // 改变当前页显示数量
  changeShowSize = (currentPage, pageSize) => {
    this.pageModify(pageSize, 1)
  }
  // 当前页码改变
  changePage = (currentPage) => {
    const pageSize = this.state.pagingParameter.pageSize
    this.pageModify(pageSize, currentPage)
  }
  // 页面修改
  pageModify = (pageSize, currentPage) => {
    const { menuType } = this.state
    this.setState({
      pagingParameter: {
        pageSize,
        currentPage
      }
    }, () => {
      const { sorts, pagingParameter, values, conditionShow } = this.state
      let postParams = {
        ...pagingParameter,
        ...values
      }
      cacheSearchParameter([{
        page: pagingParameter,
        parameter: { ...values },
        sorts,
        conditionShow
      }], this.props.history, 0)
      this.initPageList(postParams, menuType)
    })
  }
  // 获取list
  initPageList = (values, page) => {
    switch (page) {
      case 'todo':
        this.props.dispatch({ type: 'workOrder/getTodoList', payload: values })
        break
      case 'finish':
        this.props.dispatch({ type: 'workOrder/getFinishList', payload: values })
        break
      case 'create':
        this.props.dispatch({ type: 'workOrder/getCreateList', payload: values })
        break
      case 'all':
        this.props.dispatch({ type: 'workOrder/getAllList', payload: values })
        break
      default:
        break
    }
  }

  //根据权限显示操作按钮
  getWorkOrderBtn = (record) => {
    const { receivePerssion, closedPerssion, completedPerssion } = record
    const { menuType } = this.state
    return (
      <Fragment>
        {
          receivePerssion === 'true' && menuType !== 'create' ? (
            <Fragment>
              {
                hasAuth(routinePermission.workorderMyundoReceive) ? <a onClick={() => this.receiveWorkOrderShow(record)}>接单</a> : null
              }
              {
                hasAuth(routinePermission.workorderMyundoDisagree) ? <a onClick={() => this.rejectWorkOrder(record)}>拒绝接单</a> : null
              }
            </Fragment>
          ) : null
        }
        {
          hasAuth(routinePermission.workorderMycreateClose) && closedPerssion === 'true' && menuType !== 'finish' && menuType !== 'todo' ? (
            <a onClick={() => this.closeWorkOrder(record)}>关闭</a>
          ) : null
        }
        {
          hasAuth(routinePermission.workorderMyundoComplete) && completedPerssion === 'true' && menuType !== 'create' ? (
            <a onClick={() => this.completeWorkOrder(record)}>完成</a>
          ) : null
        }
      </Fragment>
    )
  }

  /**
   * 获取超期标识，根据列表项中的orderStatus与currentSituation
   * 仅在“我的待办”中，并且列表项的currentSituation不为‘normal’
   * 判断orderStatus, 接单超期蓝色，完成超期绿色
   * @param record 列表项
   * return 标识的className
   */
  getOverdueTips = record => {
    const { menuType } = this.state
    const { orderStatus, currentSituation } = record
    if ((menuType === 'todo' || menuType === 'create') && currentSituation !== 'normal') {
      if (orderStatus === overdueMap.accept) {
        return 'work-order-table-color blue'
      } else if (orderStatus === overdueMap.complete) {
        return 'work-order-table-color green'
      }
    } else {
      return 'work-order-table-color'
    }
  }

  render () {
    const { getFieldDecorator } = this.props.form
    const { menuType } = this.props
    const { userList, conditionShow, acceptOrderVisible, pagingParameter, body, sorts, dateFormat } = this.state
    let list = []
    let total = 0
    let columns = [
      {
        title: '工单名称',
        key: 'name',
        dataIndex: 'name',
        width: '16%',
        pages: ['todo', 'finish', 'create', 'all'],
        render: (text, record) => {
          return (
            <span>
              {/* 超期标识 */}
              <span className="tips">
                <span className={this.getOverdueTips(record)} />
              </span>
              <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
                <span>{emptyFilter(text)}</span>
              </Tooltip>
            </span>
          )
        }
      },
      {
        title: '工单编号',
        key: 'workNumber',
        dataIndex: 'workNumber',
        width: '10%',
        pages: ['todo', 'finish', 'create', 'all'],
        render: (text, record) => {
          return (
            <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
              <span>{text}</span>
            </Tooltip>
          )
        }
      },
      {
        title: '工单级别',
        key: 'workLevel',
        dataIndex: 'workLevel',
        width: '8%',
        pages: ['todo', 'finish', 'create', 'all'],
        render: (text) => {
          switch (text) {
            case '紧急':
              return <Badge color="#FF426F" text="紧急" />
            case '重要':
              return <Badge color="#3B6CFF" text="重要" />
            case '次要':
              return <Badge color="#05CC7F" text="次要" />
            case '提示':
              return <Badge color="#F7CCC7" text="提示" />
            default:
              break
          }
        }
      },
      {
        title: '发起人',
        key: 'createUserName',
        dataIndex: 'createUserName',
        pages: ['todo', 'finish'],
        width: '10%',
        render: (text) => {
          return (
            <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
              <span>{emptyFilter(text)}</span>
            </Tooltip>
          )
        }
      },
      {
        title: '执行人',
        key: 'executeUserName',
        dataIndex: 'executeUserName',
        pages: ['create', 'all'],
        width: '10%',
        render: (text) => {
          return (
            <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
              <span>{emptyFilter(text)}</span>
            </Tooltip>
          )
        }
      },
      {
        title: '工单类型',
        key: 'orderType',
        dataIndex: 'orderType',
        width: '8%',
        pages: ['todo', 'finish', 'create', 'all']
      },
      {
        title: '工单状态',
        key: 'orderStatusName',
        dataIndex: 'orderStatusName',
        width: '8%',
        pages: ['todo', 'finish', 'create', 'all'],
        render: (text) => {
          return (
            <span>{emptyFilter(text)}</span>
          )
        }
      },
      {
        title: '预计开始时间',
        key: 'startTime',
        dataIndex: 'startTime',
        width: 160,
        pages: ['todo', 'finish', 'create', 'all'],
        sorter: true,
        sortOrder: sorts && sorts.sortName === 'startTime' ? sorts.sortOrder : false,
        className: 'time',
        render: (text) => { return (<span className="tabTimeCss">{text ? moment(text).format(dateFormat) : '--'}</span>) }
      },
      {
        title: '预计结束时间',
        key: 'endTime',
        dataIndex: 'endTime',
        width: 160,
        pages: ['todo', 'finish', 'create', 'all'],
        sorter: true,
        sortOrder: sorts && sorts.sortName === 'endTime' ? sorts.sortOrder : false,
        className: 'time',
        render: (text) => { return (<span className="tabTimeCss">{text ? moment(text).format(dateFormat) : '--'}</span>) }
      },
      {
        title: () => {
          return (
            <div className="operate-title">
              操作
            </div>
          )
        },
        key: 'operate',
        width: 200,
        className: `operate-${menuType}`,
        pages: ['todo', 'finish', 'create', 'all'],
        render: (text, record) => {
          return (
            <div className="operate-wrap" >
              {
                menuType === 'todo' && hasAuth(routinePermission.workorderMyundoView) ? <NavLink to={{
                  pathname: '/routine/workorder/todo/detail',
                  search: `workOrderId=${transliteration(record.id)}`,
                  state: { rCaches: 1 }
                }}>查看</NavLink> : null
              }
              {
                menuType === 'finish' && hasAuth(routinePermission.workorderMydoneView) ? <NavLink to={{
                  pathname: '/routine/workorder/todo/detail',
                  search: `workOrderId=${transliteration(record.id)}`,
                  state: { rCaches: 1 }
                }}>查看</NavLink> : null
              }
              {
                menuType === 'create' && hasAuth(routinePermission.workorderMycreateView) ? <NavLink to={{
                  pathname: '/routine/workorder/todo/detail',
                  search: `workOrderId=${transliteration(record.id)}`,
                  state: { rCaches: 1 }
                }}>查看</NavLink> : null
              }
              {
                this.getWorkOrderBtn(record)
              }
            </div>
          )
        }
      }
    ]
    if (body) {
      list = body.items
      total = body.totalRecords
    }
    // 根据页面类型，过滤工单状态待选项
    const status = statusMap.filter(item => {
      return item.pages.includes(menuType)
    })
    // 根据页面类型，过滤表头
    columns = columns.filter(item => {
      return item.pages.includes(menuType)
    })
    const title = <Fragment>
      <p className="work-order-table-title">
        <span className="blue-title">超期未接单</span>
        <span className="green-title">超期未完成</span>
      </p>
    </Fragment>
    const acceptOrderProps = {
      visible: acceptOrderVisible,
      onOk: this.receiveWorkOrder,
      onCancel: () => { this.setState({ acceptOrderVisible: false }) },
      children: <p className="model-text">确认接收工单吗？</p>
    }

    return (
      <div className="main-table-content workorder-list">
        <div className="search-bar">
          <Form className="filter-form new-flex-layout" layout="inline" onSubmit={this.handleSubmit}>
            <Item label="综合查询">
              {getFieldDecorator('keyWord', {
                initialValue: '',
                rules: [{ message: '最多60个字符！', max: 60 }]
              })(
                <Input autoComplete="off" className="filter-form-item"
                  placeholder={menuType === 'all' ? '请输入工单名称/执行人/工单编号' : '请输入工单名称/工单编号'} />
              )}
            </Item>
            <Item className="search-item item-separation">
              <Button type="primary" htmlType="submit">查询</Button>
              <Button type="primary" ghost onClick={() => this.resetFormFileds(menuType)}>重置</Button>
              <span className="show-ondition" onClick={() => this.setState({ conditionShow: !conditionShow })}>
                <Icon type={conditionShow ? 'up' : 'down'} />
                {conditionShow ? '收起' : '展开'}
              </span>
            </Item>
            {/* 下拉框筛选 */}
            <Row style={{ display: conditionShow ? 'block' : 'none' }} className="hide-form">
              <Row className="new-flex-layout no-padding">
                <Item label="工单类型">
                  {getFieldDecorator('orderType', {
                    initialValue: '0'
                  })(
                    <Select className="filter-form-item" placeholder="请选择工单类型" getPopupContainer={triggerNode => triggerNode.parentNode}>
                      <Option key="0">全部</Option>
                      <Option key="1">巡检</Option>
                      <Option key="2">预警</Option>
                      <Option key="3">重保</Option>
                      <Option key="4">应急</Option>
                      <Option key="5">清查</Option>
                      <Option key="10">其他</Option>
                      <Option key="11">告警</Option>
                    </Select>
                  )}
                </Item>
                <Item label="工单级别" className="item-separation">
                  {getFieldDecorator('workLevel', {
                    initialValue: '0'
                  })(
                    <Select className="filter-form-item" placeholder="请选择工单级别" getPopupContainer={triggerNode => triggerNode.parentNode}>
                      <Option key="0">全部</Option>
                      <Option key="1">紧急</Option>
                      <Option key="2">重要</Option>
                      <Option key="3">次要</Option>
                      <Option key="4">提示</Option>
                    </Select>
                  )}
                </Item>
                <Item label="工单状态">
                  {getFieldDecorator('orderStatus', {
                    initialValue: '0'
                  })(
                    <Select className="filter-form-item" placeholder="请选择工单状态" getPopupContainer={triggerNode => triggerNode.parentNode}>
                      {
                        status.map(item => (
                          <Option key={item.key}>{item.name}</Option>
                        ))
                      }
                    </Select>
                  )}
                </Item>
                {
                  menuType === 'create' &&
                  <Item label="执行人">
                    {getFieldDecorator('executeUserId', {
                      initialValue: '0'
                    })(
                      <Select optionFilterProp="name" showSearch className="filter-form-item" placeholder='请选择执行人' getPopupContainer={triggerNode => triggerNode.parentNode}>
                        <Option key="0">全部</Option>
                        {
                          userList.map(item => (
                            <Option key={item.stringId} name={item.name}>{item.name}</Option>
                          ))
                        }
                      </Select>
                    )}
                  </Item>
                }
                <Item label="预计开始时间" className={`item-date-container ${menuType === 'create' ? 'item-separation' : ''}`}>
                  {getFieldDecorator('startTime')(
                    <DateRange future placeholder={['开始日期', '结束日期']} format="YYYY-MM-DD" resetKey={this.resetKeyStart} />
                  )}
                </Item>
                <Item label="预计结束时间" className={`item-date-container ${menuType !== 'create' ? 'item-separation' : ''}`}>
                  {getFieldDecorator('endTime')(
                    <DateRange future placeholder={['开始日期', '结束日期']} format="YYYY-MM-DD" resetKey={this.resetKeyEnd} />
                  )}
                </Item>
              </Row>
            </Row>
          </Form>
        </div>
        <div className="table-wrap workorder-table">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={list}
            pagination={false}
            title={() => (menuType === 'todo' || menuType === 'create') ? title : ''}
            onChange={this.handleTableChange}
          />
          {total > 0 && <Pagination
            current={pagingParameter.currentPage}
            pageSize={pagingParameter.pageSize}
            className="table-pagination"
            total={total}
            showTotal={(total) => `共 ${total} 条数据`}
            showSizeChanger={total > 10 ? true : false}
            showQuickJumper={true}
            onChange={this.changePage}
            onShowSizeChange={this.changeShowSize} />}
        </div>
        {/* 拒绝接单 */}
        <RejectForm reject={(ref) => { this.rejectChild = ref }} refresh={this.refresh} />
        {/* 关闭 */}
        <CloseForm close={(ref) => { this.closeChild = ref }} refresh={this.refresh} />
        {/* 完成 */}
        <CompleteForm complete={(ref) => { this.completeChild = ref }} refresh={this.refresh} />
        {/* 接单 */}
        <ModalConfirm props={acceptOrderProps} />
      </div>
    )
  }
}

const mapStateToProps = ({ workOrder }) => {
  return {
    body: workOrder.body
  }
}

const WorkOrderListForm = Form.create()(WorkOrderList)
export default connect(mapStateToProps)(WorkOrderListForm)