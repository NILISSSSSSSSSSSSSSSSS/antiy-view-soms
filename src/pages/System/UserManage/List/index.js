import { Component } from 'react'
import { connect } from 'dva'
import { NavLink } from 'dva/router'
import { Form, Button, Table, Pagination, Input, DatePicker, Message, Select, TreeSelect, Tooltip } from 'antd'
import api from '@/services/api'
import moment from 'moment'
import './style.less'
import hasAuth from '@/utils/auth'
import {
  transliteration, emptyFilter, cacheSearchParameter,
  evalSearchParam, removeCriteria
} from '@/utils/common'
import InfoReport from '@/components/Asset/AssetDetail/InfoReport'
import ResetPwdModal from '@/components/System/ResetPwdModal'
import HintAlertfrom from '@/components/System/HintAlert'
import { systemPermission } from '@a/permission'
const { Item } = Form
const { TreeNode, SHOW_PARENT } = TreeSelect
const Option = Select.Option

class SystemUserList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      sortOrders: undefined,
      body: null,
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      treeData: this.props.treeData,
      values: {},
      //重置密码组件通信
      resetPwdModal: {
        visible: false,
        id: ''
      },
      startD: new Date(),
      startTime: undefined,
      endTime: undefined,
      sorts: {
        sortName: undefined,
        sortOrder: undefined
      },
      roleIdsArr: [],
      hintConfig: {},
      hintShow: false
    }
  }
  componentDidMount () {
    //获取管理区域树数据
    this.props.dispatch({ type: 'system/getAreasByUserId', payload: { userId: sessionStorage.getItem('id') } })
    //获取 所有角色信息
    api.getAllRoles().then((iData) => {
      if (iData.body && iData.head.code === '200') {
        this.setState({ roleIdsArr: iData.body })
      }
    })
    //判断是否存有数据
    let { list } = evalSearchParam(this) || {}
    if (list) {
      let sortKey = () => {
        if (list[0].parameter.sortOrder)
          return list[0].parameter.sortOrder + 'end'
        else
          return void (0)
      }
      this.setState({
        pagingParameter: list[0].page,
        values: list[0].parameter,
        sortOrders: sortKey()
      }, () => this.getList(false))
    } else {
      this.getList(false)
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
    let { pagingParameter, body, treeData, roleIdsArr, sortOrders, hintConfig, hintShow } = this.state
    let list = []
    let total = 0
    if (body) {
      list = body.items
      total = body.totalRecords
    }
    const { getFieldDecorator } = this.props.form
    const columns = [
      {
        title: '用户名',
        dataIndex: 'username',
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
        title: '姓名',
        dataIndex: 'name',
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
        title: '角色',
        dataIndex: 'roles',
        width: '12%',
        render: (text) => {
          return (
            <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
              <span>{emptyFilter(text)}</span>
            </Tooltip>
          )
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: '10%',
        render: (status, record) => {
          if (typeof (status) !== 'number' && isNaN(status)) return ''
          return ['禁用', '启用', '锁定', '新建'][status]
        }
      },
      {
        title: '管理区域',
        dataIndex: 'manageArea',
        width: '12%'
      },
      {
        title: '创建时间',
        dataIndex: 'gmtCreate',
        width: '16%',
        sorter: true,
        sortOrder: sortOrders,
        sortDirections: ['descend', 'ascend'],
        render: timestamp => timestamp <= 0 ? '' : (<span className="tabTimeCss">{moment(timestamp).format('YYYY-MM-DD HH:mm:ss')}</span>)
      },
      {
        title: '操作',
        key: 'operate',
        width: '20%',
        render: (record) => {
          return (
            <div className="operate-wrap">
              {
                hasAuth(systemPermission.sysUserView) ? <NavLink to={{
                  pathname: '/system/usermanage/informationcheck',
                  search: `id=${transliteration(record.stringId)}`,
                  state: { rCaches: 1 }
                }}>查看</NavLink> : null
              }
              {
                hasAuth(systemPermission.sysUserUpdate) ? <NavLink to={`/system/usermanage/informationChange?id=${transliteration(record.stringId)}`}>变更</NavLink> : null
              }
              {
                record.status === 0 && hasAuth(systemPermission.sysUserUpdownunlock) ? <a onClick={() => this.handleOption(record, 1)}>启用</a>
                  : record.status === 1 && hasAuth(systemPermission.sysUserUpdownunlock) ? <a onClick={() => this.handleOption(record, 0)}>禁用</a>
                    : record.status === 2 && hasAuth(systemPermission.sysUserUpdownunlock) ? <a onClick={() => this.handleOption(record, 2)}>解锁</a> : null
              }
              {
                hasAuth(systemPermission.sysUserResetpwd) ? <a onClick={() => this.handlePwdReset(record)}>重置密码</a> : null
              }
            </div>
          )
        }
      }
    ]
    return (
      <div className="main-table-content system-user-list">
        <div>
          {/* <InfoReport></InfoReport> */}
        </div>
        <div className="search-bar">
          <Form className="filter-form new-flex-layout" layout="inline" onSubmit={this.handleSubmit}>
            <Item label="姓名：">
              {getFieldDecorator('name', {
                rules: [{ min: 1, max: 30, message: '字符输入长度为 1-30 ' }]
              })(
                <Input autoComplete="off" className="filter-form-item" placeholder="请输入姓名" />
              )}
            </Item>
            <Item label="用户名" className="item-separation">
              {getFieldDecorator('username', {
                rules: [{ min: 1, max: 30, message: '字符输入长度为 1-30' }]
              })(
                <Input autoComplete="off" className="filter-form-item" placeholder="请输入用户名" />
              )}
            </Item>
            <Item label="角色">
              {getFieldDecorator('roleIds')(
                <Select showSearch placeholder="全部" mode="multiple" allowClear getPopupContainer={triggerNode => triggerNode.parentNode} optionFilterProp='children' >
                  {roleIdsArr && roleIdsArr.map((item) => (
                    <Option value={item.stringId} key={item.stringId}>{item.name}</Option>)
                  )}
                </Select>
              )}
            </Item>
            <Item label="管理区域" className="hidden-margin">
              {getFieldDecorator('areaIds')(
                <TreeSelect
                  showSearch
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  placeholder="全部"
                  allowClear
                  treeDefaultExpandAll
                  treeCheckable={true}
                  multiple
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  showCheckedStrategy={SHOW_PARENT}
                  treeNodeFilterProp='title'
                >
                  {
                    this.renderTreeNodes(treeData)
                  }
                </TreeSelect>
              )}
            </Item>
            <Item label="创建时间" className="item-date-container item-separation-two item-date-two">
              {
                getFieldDecorator('gmtCreateStart')(
                  <DatePicker
                    getCalendarContainer={triggerNode => triggerNode.parentNode}
                    disabledDate={(date) => date && date >= moment(new Date())}
                    placeholder="开始时间" />
                )
              }
              <span>-</span>
            </Item>
            <Item className="item-date-container item-separation-two item-date-two">
              {
                getFieldDecorator('gmtCreateEnd')(
                  <DatePicker
                    getCalendarContainer={triggerNode => triggerNode.parentNode}
                    disabledDate={(date) => date && date >= moment(new Date())}
                    placeholder="结束时间" />
                )
              }
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
                hasAuth(systemPermission.sysUserCheckin) ? <Button type="primary" onClick={() => this.props.history.push('/system/usermanage/informationregister?from=regsiter')}>登记</Button> : null
              }
            </div>
          </div>
          <Table rowKey="stringId" columns={columns} dataSource={list} pagination={false} onChange={this.handleTableChange} />
          <Pagination
            className="table-pagination"
            total={total} showTotal={(total) => `共 ${total || 0} 条数据`}
            showQuickJumper={true}
            showSizeChanger={true}
            onShowSizeChange={this.changePage}
            onChange={this.changePage}
            pageSize={pagingParameter.pageSize}
            current={pagingParameter.currentPage} />
          {
            this.state.resetPwdModal.visible ?
              <ResetPwdModal resetPwdModal={this.state.resetPwdModal} handleCancelPwd={this.handleCancelPwd} />
              : null
          }
        </div>
        <HintAlertfrom hinitConfig={hintConfig} visible={hintShow}></HintAlertfrom>
      </div>
    )
  }
  //渲染table操作元素
  renderHandle = () => {

  }

  //生成管理区域树
  renderTreeNodes = data => data.map(item => {
    if (!item) {
      return []
    }
    if (item.childrenNode) {
      return (
        <TreeNode value={item.stringId} title={item.fullName} key={item.stringId}>
          {this.renderTreeNodes(item.childrenNode)}
        </TreeNode>
      )
    }
    return <TreeNode value={item.stringId} title={item.fullName} key={item.stringId} />
  })
  //排序分页
  handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      sorts: {
        sortName: sorter.columnKey,
        sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc'
      },
      sortOrders: sorter.order
    }, () => this.getList())
  }
  //表单重置
  handleReset = () => {
    this.props.form.resetFields()
    removeCriteria()
    this.setState({
      values: {},
      endTime: undefined,
      startTime: undefined,
      sortOrders: undefined,
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      }
    }, () => this.getList(false)
    )
  }
  //表单查询
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let { gmtCreateStart, gmtCreateEnd } = values
        if (gmtCreateStart)
          values.gmtCreateStart = moment(gmtCreateStart).startOf('day').valueOf()
        if (gmtCreateEnd)
          values.gmtCreateEnd = moment(gmtCreateEnd).endOf('day').valueOf()
        if (gmtCreateStart && gmtCreateEnd && values.gmtCreateEnd <= values.gmtCreateStart) {
          Message.info('结束时间不能小于开始时间！')
          return
        }
        values.areaIds = values.areaIds ? values.areaIds : undefined
        this.setState({
          pagingParameter: {
            pageSize: this.state.pagingParameter.pageSize,
            currentPage: 1
          },
          values
        }, () => this.getList())
      }
    })
  }

  //操作confirm弹窗
  handleOption = ({ stringId }, status) => {
    let text = `确认${['停用', '启用', '解锁'][status]}此用户吗?`
    //弹窗的配置项
    let init = {
      text,
      submit: () => this.handleAlert(stringId, status),
      onCancel: ()=> this.setState({ hintShow: false })
    }
    this.setState({ hintConfig: init, hintShow: true })
  }
  //confirm确认操作
  handleAlert = (stringId, status) => {
    let param = !status  ? { userId: stringId } : { primaryKey: stringId }
    api[!status ? 'forbiddenUser' : 'enableUser'](param).then(res => {
      if (res && res.head && res.head.code === '200') {
        Message.success('操作成功！')
        this.getList(false)
        this.setState({ hintShow: false })
      }
    })
  }

  //重置密码
  handlePwdReset = (item) => {
    this.setState({
      resetPwdModal: {
        visible: true,
        id: item.stringId
      }
    })
  }

  handleCancelPwd = () => {
    this.setState({
      resetPwdModal: {
        visible: false
      }
    })
  }

  //获取列表
  getList = (state = true) => {
    let { values, sorts, pagingParameter } = this.state
    if (state)
      cacheSearchParameter([{
        page: pagingParameter,
        parameter: { ...values, ...sorts }
      }], this.props.history)
    api.getUsers({ ...pagingParameter, ...values, ...sorts }).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          body: response.body
        })
      }
    }).catch(err => { })
  }

  //当前页码改变
  changePage = (currentPage, pageSize) => {
    this.setState({
      pagingParameter: {
        pageSize: pageSize,
        currentPage: currentPage
      }
    }, () => this.getList())
  }
}

const mapStateToProps = ({ system }) => {
  return { treeData: system.treeData }
}

const SystemUserListForm = Form.create()(SystemUserList)
export default connect(mapStateToProps)(SystemUserListForm)
