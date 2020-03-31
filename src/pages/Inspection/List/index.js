import { Component } from 'react'
import { connect } from 'dva'
import { NavLink } from 'dva/router'
import moment from 'moment'
import { Form, Input, Button, Select, Table, Pagination, Badge, Tooltip } from 'antd'
import ModalForm from '@/components/Inspection/ModalForm'
import { transliteration, emptyFilter, cacheSearchParameter, evalSearchParam, removeCriteria } from '@/utils/common'
import CloseForm from './CloseForm'
import api from '@/services/api'
import hasAuth from '@/utils/auth'
import { routinePermission } from '@a/permission'
import DateRange from '@/components/common/DateRange'
import './style.less'

const { Item } = Form
const { Option } = Select

class InspectionList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      body: {
        items: [],
        totalRecords: 0
      },
      modalVisible: false,     // 登记巡检Modal
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      sorts: {
        sortName: undefined,
        sortOrder: undefined
      },
      values: {}
    }
  }
  componentDidMount () {
    //判断是否存有数据
    if (sessionStorage.searchParameter) {
      //解析保留的数据
      let { list } = evalSearchParam(this)
      if (list) {
        let param = JSON.parse(JSON.stringify(list[0])).parameter
        let v = ['beginTime', 'beginTimeEnd', 'endTimeBegin', 'endTime']
        let init = list[0].parameter
        v.forEach(item => {
          delete param[item]
        })
        if (init.beginTime || init.beginTimeEnd)
          param.beginTime = [init.beginTime ? moment(init.beginTime) : '', init.beginTimeEnd ? moment(init.beginTimeEnd) : '']
        if (init.endTimeBegin || init.endTime)
          param.endTime = [init.endTimeBegin ? moment(init.endTimeBegin) : '', init.endTime ? moment(init.endTime) : '']
        this.props.form.setFieldsValue(param)
        this.setState({
          pagingParameter: list[0].page,
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
  //获取巡检列表数据
  getList = () => {
    const { pagingParameter, values } = this.state
    const postParams = {
      ...pagingParameter,
      ...values
    }
    if (!postParams.orderByField) {
      delete postParams.orderByField
      delete postParams.asc
    }
    api.inspectPlanQueryList(postParams).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          body: response.body
        })
      }
    })
  }
  handleTableChange = (pagination, filters, sorter) => {
    const { values } = this.state
    const orderByField = sorter.columnKey ? sorter.columnKey : ''
    const asc = orderByField && sorter.order === 'ascend' ? true : false
    const sorterMode = {
      orderByField,
      asc
    }
    this.setState({
      values: {
        ...values,
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
  //表单查询
  handleSubmit = e => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const beginTimeArr = values.beginTime ? [...values.beginTime] : undefined
        const endTimeArr = values.endTime ? [...values.endTime] : undefined
        // 巡检开始时间
        if (beginTimeArr) {
          values.beginTime = beginTimeArr[0] ? beginTimeArr[0].valueOf() : ''
          values.beginTimeEnd = beginTimeArr[1] ? beginTimeArr[1].valueOf() : ''
        }
        // 巡检结束时间
        if (endTimeArr) {
          values.endTimeBegin = endTimeArr[0] ? endTimeArr[0].valueOf() : ''
          values.endTime = endTimeArr[1] ? endTimeArr[1].valueOf() : ''
        }
        // 当选择全部时，接口中不传递该参数
        if (values.planType === 'all') delete values.planType
        if (values.planLevel === 'all') delete values.planLevel
        if (values.orderCycle === 'all') delete values.orderCycle
        this.setState({
          pagingParameter: {
            pageSize: this.state.pagingParameter.pageSize,
            currentPage: 1
          },
          values
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
    })
  }
  //重置
  onReset = () => {
    this.props.form.resetFields()
    removeCriteria()
    this.resetKeyBegin = 'beigin' + Math.random()
    this.resetKeyEnd = 'end' + Math.random()
    this.setState({
      values: {},
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      sorts: {
        sortName: undefined,
        sortOrder: undefined
      }
    }, () => {
      this.getList()
    })
  }
  //分页
  pageModify = (pageSize, currentPage) => {
    this.setState({
      pagingParameter: {
        pageSize,
        currentPage
      }
    }, () => {
      const { values, sorts, pagingParameter } = this.state
      cacheSearchParameter([{
        page: pagingParameter,
        parameter: { ...values },
        sorts
      }], this.props.history, 0)
      this.getList()
    })
  }
  changePageSize = (currentPage, pageSize) => {
    this.pageModify(pageSize, 1)
  }
  changePage = currentPage => {
    const pageSize = this.state.pagingParameter.pageSize
    this.pageModify(pageSize, currentPage)
  }
  // 打开登记巡检弹窗
  modalOpen = () => {
    this.setState({
      modalVisible: true
    })
  }
  // 关闭登记巡检弹窗
  modalClose = () => {
    this.getList()
    this.setState({
      modalVisible: false
    })
  }
  //“终止计划”，弹出关闭框
  closeBox = id => {
    this.closeChild.closeBox(id)
  }
  render () {
    const { getFieldDecorator } = this.props.form
    const { modalVisible, pagingParameter, body, sorts } = this.state
    const List = body.items
    const total = body.totalRecords
    const columns = [
      {
        title: '巡检名称',
        key: 'name',
        dataIndex: 'name',
        width: '18%',
        render: (text) => {
          return (
            <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
              <span>{emptyFilter(text)}</span>
            </Tooltip>
          )
        }
      },
      {
        title: '巡检级别',
        key: 'planLevel',
        dataIndex: 'planLevel',
        width: '8%',
        render: (planLevel) => {
          switch (planLevel) {
            case 'URGENT':
              return <Badge color="#FF426F" text="紧急" />
            case 'IMPORTANT':
              return <Badge color="#3B6CFF" text="重要" />
            case 'SECONDARY':
              return <Badge color="#05CC7F" text="次要" />
            case 'PROMPT':
              return <Badge color="#F7CCC7" text="提示" />
            default:
              break
          }
        }
      },
      {
        title: '巡检类型',
        key: 'planType',
        dataIndex: 'planType',
        width: '10%',
        render: (planType) => {
          switch (planType) {
            case 'ASSETS_INSPECT':
              return '资产管理'
            case 'BASELINE_INSPECT':
              return '配置管理'
            case 'VUL_PATCH_INSPECT':
              return '漏洞与补丁管理'
            case 'LOG_WARN_INSPECT':
              return '日志与告警管理'
            case 'DAILY_SAFETY_INSPECT':
              return '日常安全管理'
            case 'SAFETY_EQUIPMENT_INSPECT':
              return '安全设备管理'
            case 'SYSTEM_MANGER_INSPECT':
              return '系统管理'
            case 'OTHER_INSPECT':
              return '其他'
            default:
              break
          }
        }
      },
      {
        title: '巡检周期',
        key: 'orderCycle',
        dataIndex: 'orderCycle',
        width: '8%',
        render: (orderCycle) => {
          switch (orderCycle) {
            case 'ONCE':
              return '单次'
            case 'DAILY':
              return '每天'
            case 'WEEKLY':
              return '每周'
            case 'MONTH':
              return '每月'
            default:
              break
          }
        }
      },
      {
        title: '巡检开始时间',
        key: 'startTime',
        dataIndex: 'startTime',
        width: 190,
        render: (text) => { return (<span className="tabTimeCss">{text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>) },
        sorter: true,
        sortOrder: sorts && sorts.sortName === 'startTime' ? sorts.sortOrder : false
      },
      {
        title: '巡检完成时间',
        key: 'endTime',
        dataIndex: 'endTime',
        width: 190,
        render: (text) => { return (<span className="tabTimeCss">{text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>) },
        sorter: true,
        sortOrder: sorts && sorts.sortName === 'endTime' ? sorts.sortOrder : false
      },
      {
        title: '巡检状态',
        key: 'planStatus',
        dataIndex: 'planStatus',
        width: '8%',
        render: (planStatus) => {
          switch (planStatus) {
            case 'WAITING':
              return '待执行'
            case 'RUNNING':
              return '执行中'
            case 'COMPLETE':
              return '已完成'
            case 'CLOSED':
              return '已终止'
            default:
              break
          }
        }
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
        width: 160,
        render: (record) => {
          return (
            <div className="operate-wrap">
              {
                hasAuth(routinePermission.routineInspectView) ? <NavLink to={{
                  pathname: '/routine/inspection/detail',
                  search: `id=${transliteration(record.stringId)}`,
                  state: { rCaches: 1 }
                }}>查看</NavLink> : null
              }
              {
                hasAuth(routinePermission.routineInspectStop) && record.planStatus !== 'COMPLETE' && record.planStatus !== 'CLOSED' ? <a onClick={() => this.closeBox(record.stringId)}>终止计划</a> : null
              }
            </div>
          )
        }
      }
    ]
    return (
      <div>
        <div className="main-table-content">
          <div className="search-bar">
            <Form className="filter-form new-flex-layout" layout="inline" onSubmit={this.handleSubmit} onReset={this.onReset}>
              <Item label="巡检名称">
                {getFieldDecorator('name', {
                  initialValue: '',
                  rules: [{ message: '最多60个字符！', max: 60 }]
                })(
                  <Input autoComplete="off" className="filter-form-item" placeholder="请输入巡检名称" />
                )}
              </Item>
              <Item label="巡检级别" className="item-separation">
                {getFieldDecorator('planLevel', {
                  initialValue: 'all'
                })(
                  <Select className="filter-form-item" placeholder="请选择" getPopupContainer={triggerNode => triggerNode.parentNode}>
                    <Option key="all">全部</Option>
                    <Option key='URGENT'>紧急</Option>
                    <Option key='IMPORTANT'>重要</Option>
                    <Option key='SECONDARY'>次要</Option>
                    <Option key='PROMPT'>提示</Option>
                  </Select>
                )}
              </Item>
              <Item label="巡检类型">
                {getFieldDecorator('planType', {
                  initialValue: 'all'
                })(
                  <Select className="filter-form-item" placeholder="请选择" getPopupContainer={triggerNode => triggerNode.parentNode}>
                    <Option key="all">全部</Option>
                    <Option key='ASSETS_INSPECT'>资产管理</Option>
                    <Option key='BASELINE_INSPECT'>配置管理</Option>
                    <Option key='VUL_PATCH_INSPECT'>漏洞与补丁管理</Option>
                    <Option key='LOG_WARN_INSPECT'>日志与告警管理</Option>
                    <Option key='DAILY_SAFETY_INSPECT'>日常安全管理</Option>
                    <Option key='SAFETY_EQUIPMENT_INSPECT'>安全设备管理</Option>
                    <Option key='SYSTEM_MANGER_INSPECT'>系统管理</Option>
                    {/* <Option key='OTHER_INSPECT'>其他</Option> */}
                  </Select>
                )}
              </Item>
              <Item label="巡检周期">
                {getFieldDecorator('orderCycle', {
                  initialValue: 'all'
                })(
                  <Select className="filter-form-item" placeholder="请选择" getPopupContainer={triggerNode => triggerNode.parentNode}>
                    <Option key="all">全部</Option>
                    <Option key='ONCE'>单次</Option>
                    <Option key='DAILY'>每天</Option>
                    <Option key='WEEKLY'>每周</Option>
                    <Option key='MONTH'>每月</Option>
                  </Select>
                )}
              </Item>
              <Item label="巡检开始时间" className="item-date-container item-separation">
                {getFieldDecorator('beginTime')(
                  <DateRange future placeholder={['开始时间', '结束时间']} format="YYYY-MM-DD" resetKey={this.resetKeyBegin} />
                )}
              </Item>
              <Item label="巡检完成时间" className="item-date-container">
                {getFieldDecorator('endTime')(
                  <DateRange future placeholder={['开始时间', '结束时间']} format="YYYY-MM-DD" resetKey={this.resetKeyEnd} />
                )}
              </Item>
              <Item className="search-item" style={{ 'marginLeft': 16 }}>
                <Button type="primary" htmlType="submit">查询</Button>
                <Button type="primary" ghost htmlType='reset'>重置</Button>
              </Item>
            </Form>
          </div>
          <div className="table-wrap">
            <div className="table-btn">
              <div className="left-btn">
                {
                  hasAuth(routinePermission.routineInspectCheckin) ? <Button type="primary" onClick={this.modalOpen}>登记巡检</Button> : null
                }
              </div>
            </div>
            <Table rowKey="stringId" columns={columns} dataSource={List} pagination={false} onChange={this.handleTableChange} />
            <Pagination
              current={pagingParameter.currentPage}
              pageSize={pagingParameter.pageSize}
              className="table-pagination"
              total={total}
              showTotal={(total) => `共 ${total || 0} 条数据`}
              showSizeChanger={total > 10}
              showQuickJumper={true}
              onChange={this.changePage}
              onShowSizeChange={this.changePageSize} />
          </div>
        </div>
        {/* 终止计划 */}
        <CloseForm close={(ref) => { this.closeChild = ref }} refresh={this.refresh} getList={this.getList} />
        {/* 登记巡检 */}
        <ModalForm visible={modalVisible} close={this.modalClose} onOk={this.modalClose}></ModalForm>
      </div>
    )
  }
}
const InspectionListForm = Form.create()(InspectionList)
export default connect()(InspectionListForm)
