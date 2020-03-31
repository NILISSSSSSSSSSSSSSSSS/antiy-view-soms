import { Component } from 'react'
import { connect } from 'dva'
import { NavLink } from 'dva/router'
import { Form, Select, Button, Table, Pagination, Input, Tooltip } from 'antd'
import moment from 'moment'
import ModalForm from '@/components/Timing/ModalForm'
import hasAuth from '@/utils/auth'
import { transliteration, emptyFilter, cacheSearchParameter, evalSearchParam, removeCriteria } from '@/utils/common'
import DateRange from '@/components/common/DateRange'
import ModalConfirm from '@/components/common/ModalConfirm'
import { systemPermission } from '@a/permission'
import './style.less'

const { Item } = Form
const { Option } = Select

class TimingList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      values: {
        currentPage: 1,
        pageSize: 10
      },
      sorts: {
        sortName: undefined,
        sortOrder: undefined
      },
      startVisible: false, // 启动
      pauseVisible: false  // 挂起
    }
  }
  componentDidMount () {
    //判断是否存有数据
    if (sessionStorage.searchParameter) {
      let { list } = evalSearchParam(this)
      if (list) {
        let param = JSON.parse(JSON.stringify(list[0])).parameter
        let v = ['beginTime', 'beginTimeEnd', 'endTimeBegin', 'endTime']
        let init = list[0].parameter
        v.forEach(item => {
          delete param[item]
        })
        if (init.beginTime || init.beginTimeEnd) {
          param.beginTime = [init.beginTime ? moment(init.beginTime) : '', init.beginTimeEnd ? moment(init.beginTimeEnd) : '']
        }
        if (init.endTimeBegin || init.endTime) {
          param.endTime = [init.endTimeBegin ? moment(init.endTimeBegin) : '', init.endTime ? moment(init.endTime) : '']
        }
        this.props.form.setFieldsValue(param)
        this.setState({
          values: list[0].parameter,
          sorts: list[0].sorts
        }, () => {
          this.getList()
        })
      } else {
        this.getList()
      }
    } else {
      this.getList()
    }
  }

  //根据页面获取列表数据
  getList = () => {
    const { values } = this.state
    const postParams = {
      ...values
    }
    if (!postParams.orderByField) {
      delete postParams.orderByField
      delete postParams.asc
    }
    this.props.dispatch({ type: 'taskPlan/query', payload: postParams })
  }

  handleReset = () => {
    this.props.form.resetFields()
    this.resetKeyBegin = 'beigin' + Math.random()
    this.resetKeyEnd = 'end' + Math.random()
    removeCriteria()
    this.setState({
      values: {
        currentPage: 1,
        pageSize: 10
      },
      sorts: {
        sortName: undefined,
        sortOrder: undefined
      }
    }, () => {
      this.getList()
    })
  }

  // 提交表单，执行查询
  handleSubmit = (current, pageSize, e) => {
    e && e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (values.executeCommand === 'all')
          values.executeCommand = undefined
        if (values.planStatus === 'all')
          values.planStatus = undefined
        if (values.taskCycle === 'all')
          values.taskCycle = undefined
        // 开始时间
        const beginTimeArr = values.beginTime ? [...values.beginTime] : undefined
        if (beginTimeArr) {
          values.beginTime = beginTimeArr[0] ? beginTimeArr[0].valueOf() : ''
          values.beginTimeEnd = beginTimeArr[1] ? beginTimeArr[1].valueOf() : ''
        }
        // 完成时间
        const endTimeArr = values.endTime ? [...values.endTime] : undefined
        if (endTimeArr) {
          values.endTimeBegin = endTimeArr[0] ? endTimeArr[0].valueOf() : ''
          values.endTime = endTimeArr[1] ? endTimeArr[1].valueOf() : ''
        }
        values.currentPage = current || this.props.taskPlan.pagination.current
        values.pageSize = pageSize || this.props.taskPlan.pagination.pageSize
        this.setState({
          values: {
            ...this.state.values,
            ...values
          }
        }, () => {
          const { sorts } = this.state
          cacheSearchParameter([{
            page: {},
            parameter: { ...values },
            sorts
          }], this.props.history)
          this.getList()
        })
      }
    })
  }
  startConfirmShow = planId => {
    this.setState({
      startVisible: true,
      planId
    })
  }
  pauseConfirmShow = planId => {
    this.setState({
      pauseVisible: true,
      planId
    })
  }
  // 启动确认
  startConfirm = () => {
    const { planId } = this.state
    this.props.dispatch({ type: 'taskPlan/startupTaskPlan', payload: { primaryKey: planId } })
    this.setState({ startVisible: false })
  }
  // 挂起确认
  pauseConfirm = () => {
    const { planId } = this.state
    this.props.dispatch({ type: 'taskPlan/pauseTaskPlan', payload: { primaryKey: planId } })
    this.setState({ pauseVisible: false })
  }

  // 打开新增任务弹窗
  modalOpen = (record) => {
    this.props.dispatch({ type: 'taskPlan/modifyModalVisible', payload: { modalVisible: true, record: record } })
  }

  // 关闭新增任务弹窗
  modalClose = (form) => {
    form.resetFields()
    this.props.dispatch({ type: 'taskPlan/modifyModalVisible', payload: { modalVisible: false } })
  }
  handleTableChange = (pagination, filters, sorter) => {
    const orderByField = sorter.columnKey ? sorter.columnKey : ''
    const asc = orderByField && sorter.order === 'ascend' ? true : false
    const sorterMode = {
      orderByField,
      asc
    }
    this.setState({
      values: {
        ...this.state.values,
        ...sorterMode
      },
      sorts: {
        sortName: sorter.columnKey,
        sortOrder: sorter.order
      }
    }, () => {
      const { pagingParameter, sorts, values } = this.state
      cacheSearchParameter([{
        page: pagingParameter,
        parameter: { ...values },
        sorts
      }], this.props.history)
      this.getList()
    })
  }

  render () {
    const { getFieldDecorator } = this.props.form
    const { list, pagination, typeMapping, stateMapping, modalVisible, taskCycleMapping } = this.props.taskPlan
    const { startVisible, pauseVisible, sorts } = this.state
    const columns = [
      {
        title: '定时任务名称',
        key: 'name',
        dataIndex: 'name',
        width: '20%',
        render: (text) => {
          return (
            <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
              <span>{emptyFilter(text)}</span>
            </Tooltip>
          )
        }
      },
      {
        title: '任务周期',
        key: 'taskCycle',
        dataIndex: 'taskCycle',
        width: '8%',
        render: val => {
          return emptyFilter(taskCycleMapping[val])
        }
      },
      {
        title: '定时任务开始时间',
        key: 'startTime',
        dataIndex: 'startTime',
        width: '16%',
        render: timestamp => (<span className="tabTimeCss">{timestamp <= 0 ? '--' : moment(timestamp).format('YYYY-MM-DD HH:mm:ss')}</span>),
        sorter: true,
        sortOrder: sorts && sorts.sortName === 'startTime' ? sorts.sortOrder : false
      },
      {
        title: '定时任务完成时间',
        key: 'endTime',
        dataIndex: 'endTime',
        width: '16%',
        sorter: true,
        sortOrder: sorts && sorts.sortName === 'endTime' ? sorts.sortOrder : false,
        render: timestamp => (<span className="tabTimeCss">{timestamp <= 0 ? '--' : moment(timestamp).format('YYYY-MM-DD HH:mm:ss')}</span>)
      },
      {
        title: '定时任务类型',
        key: 'executeCommand',
        dataIndex: 'executeCommand',
        width: '10%',
        render: val => {
          return (
            <Tooltip title={typeMapping[val]} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
              <span>{emptyFilter(typeMapping[val])}</span>
            </Tooltip>
          )
        }
      },
      {
        title: '任务状态',
        key: 'planStatus',
        dataIndex: 'planStatus',
        width: '10%',
        render: val => {
          return emptyFilter(stateMapping[val])
        }
      },
      {
        title: '操作',
        key: 'operate',
        width: 200,
        render: (record) => {
          return (
            <div className="operate-wrap">
              {record.planStatus === 'PAUSED' && hasAuth(systemPermission.sysTimerUpdown) && <a onClick={() => this.startConfirmShow(record.stringId)}>启动</a>}
              {record.planStatus === 'RUNNING' && hasAuth(systemPermission.sysTimerUpdown) && <a onClick={() => this.pauseConfirmShow(record.stringId)}>挂起</a>}
              {record.planStatus === 'PAUSED' && hasAuth(systemPermission.sysTimerEdit) && <a onClick={() => this.modalOpen(record)}>编辑任务</a>}
              {
                hasAuth(systemPermission.sysTimerViewreport) ? <NavLink to={{
                  pathname: '/system/timing/detail',
                  search: `planId=${transliteration(record.stringId)}&executeCommand=${record.executeCommand}`,
                  state: { rCaches: 1 }
                }}>查看报告</NavLink> : null
              }
            </div>
          )
        }
      }
    ]
    const startProps = {
      visible: startVisible,
      onOk: this.startConfirm,
      onCancel: () => { this.setState({ startVisible: false }) },
      children: <p className="model-text">确认启动任务吗？</p>
    }

    const pauseProps = {
      visible: pauseVisible,
      onOk: this.pauseConfirm,
      onCancel: () => { this.setState({ pauseVisible: false }) },
      children: <p className="model-text">确认挂起任务吗？</p>
    }

    return (
      <div className="main-table-content timed-task-list">
        <div className="search-bar">
          <Form className="filter-form  new-flex-layout" layout="inline" onSubmit={(e) => this.handleSubmit(1, null, e)}>
            <Item label="定时任务名称">
              {getFieldDecorator('name', {
                initialValue: ''
              })(
                <Input autoComplete="off" className="filter-form-item" placeholder="请输入定时任务名称" maxLength={60}/>
              )}
            </Item>
            <Item label="任务开始时间" className="item-date-container item-separation">
              {getFieldDecorator('beginTime')(
                <DateRange future placeholder={['开始时间', '结束时间']} format="YYYY-MM-DD" resetKey={this.resetKeyBegin} />
              )}
            </Item>
            <Item label="任务完成时间" className="item-date-container">
              {getFieldDecorator('endTime')(
                <DateRange future placeholder={['开始时间', '结束时间']} format="YYYY-MM-DD" resetKey={this.resetKeyEnd} />
              )}
            </Item>
            <Item label="定时任务类型">
              {getFieldDecorator('executeCommand', {
                initialValue: 'all'
              })(
                <Select className="filter-form-item" placeholder="请选择定时任务类型" getPopupContainer={triggerNode => triggerNode.parentNode}>
                  <Option key='all'>全部</Option>
                  {Object.keys(typeMapping).map(key => <Option key={key}>{typeMapping[key]}</Option>)}
                </Select>
              )}
            </Item>
            <Item label="定时任务状态" className="item-separation">
              {getFieldDecorator('planStatus', {
                initialValue: 'all'
              })(
                <Select className="filter-form-item" placeholder="请选择任务状态" getPopupContainer={triggerNode => triggerNode.parentNode}>
                  <Option key='all'>全部</Option>
                  {Object.keys(stateMapping).map(key => <Option key={key}>{stateMapping[key]}</Option>)}
                </Select>
              )}
            </Item>
            <Item label="定时任务周期">
              {getFieldDecorator('taskCycle', {
                initialValue: 'all'
              })(
                <Select className="filter-form-item" placeholder="请选择任务状态" getPopupContainer={triggerNode => triggerNode.parentNode}>
                  <Option key='all'>全部</Option>
                  {Object.keys(taskCycleMapping).map(key => <Option key={key}>{taskCycleMapping[key]}</Option>)}
                </Select>
              )}
            </Item>
            <Item className="search-item">
              <Button type="primary" htmlType="submit">查询</Button>
              <Button type="primary" ghost onClick={this.handleReset}>重置</Button>
            </Item>
          </Form>
        </div>
        <div className="table-wrap">
          <div className="table-btn">
            <div className="left-btn">
              {
                hasAuth(systemPermission.sysTimerCheckin) ? <Button style={{ width: 'auto' }} type="primary" onClick={() => this.modalOpen(undefined)}>新建任务</Button> : null
              }
            </div>
          </div>
          <Table rowKey="stringId" columns={columns} dataSource={list} pagination={false} onChange={this.handleTableChange} />
          {
            pagination.total > 0 &&
             <Pagination className="table-pagination" showTotal={(total) => `共 ${total || 0} 条数据`} {...pagination}
               onChange={(page, pageSize) => this.handleSubmit(page, pageSize)}
               showSizeChanger ={pagination.total > 10}
               onShowSizeChange={(current, size) => this.handleSubmit(1, size)} />
          }

        </div>
        <ModalForm visible={modalVisible} close={this.modalClose} getList={() => { this.props.dispatch({ type: 'taskPlan/query', payload: {} }) }}></ModalForm>
        {/* 启动 */}
        <ModalConfirm props={startProps} />
        {/* 挂起 */}
        <ModalConfirm props={pauseProps} />
      </div>
    )
  }
}

const TimingListForm = Form.create()(TimingList)
export default connect(({ taskPlan }) => ({ taskPlan }))(TimingListForm)