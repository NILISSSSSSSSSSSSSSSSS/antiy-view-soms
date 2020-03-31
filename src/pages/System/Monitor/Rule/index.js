import { Component } from 'react'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import { Form, Button, Table, Pagination, Input, Select, Tooltip, Message } from 'antd'
import api from '@/services/api'
import './style.less'
import hasAuth from '@/utils/auth'
import { emptyFilter, cacheSearchParameter, evalSearchParam, removeCriteria } from '@/utils/common'
import ChangeMonitorModal from '@/components/System/ChangeMonitorModal'
import HintAlertConfirm from '@/components/System/HintAlert'
import { systemPermission } from '@a/permission'

const { Item } = Form
const { Option } = Select

class SystemRoleList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      columns: [
        {
          title: '监测项',
          dataIndex: 'itemString',
          render: (text) => {
            return (
              <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
                <span>{emptyFilter(text)}</span>
              </Tooltip>
            )
          }
        },
        {
          title: '规则名',
          dataIndex: 'ruleName',
          render: (text) => {
            return (
              <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
                <span>{emptyFilter(text)}</span>
              </Tooltip>
            )
          }
        },
        {
          title: '监测项单位',
          dataIndex: 'unitString'
        },
        {
          title: '临界值',
          dataIndex: 'threshold'
        },
        {
          title: '监测频率',
          dataIndex: 'frequency'
        },
        {
          title: '监测间隔单位',
          dataIndex: 'frequencyUnit'
        },
        {
          title: '规则状态',
          dataIndex: 'statusString'
        },
        {
          title: '操作',
          key: 'operate',
          render: (record) => {
            return (
              <div className="operate-wrap">
                {
                  hasAuth(systemPermission.sysMonitorRuleUpdownUpdate) ? <a onClick={() => this.handleChange(record)}>变更</a> : null
                }
                {
                  hasAuth(systemPermission.sysMonitorRuleUpdown) ? <a onClick={() => this.handleStop(record)}>{record.status ? '禁用' : '启用'}</a> : null
                }
              </div>
            )
          }
        }
      ],
      body: null,
      pageSize: 10,
      currentPage: 1,
      values: {},
      //监测项
      itemList: [],
      //重置密码组件通信
      changeModal: {
        visible: false,
        id: ''
      },
      parent: props.parent,
      hintConfig: {},
      hintShow: false
    }
  }
  componentDidMount () {
    this.props.children(this)
    this.getItem()
    let { pageSize, currentPage } = this.state
    let { list } = evalSearchParam(this) || {}
    //判断是否存有数据
    if (list && list[1]) {
      this.setState({
        pageSize: list[1].page.pageSize,
        currentPage: list[1].page.currentPage,
        values: list[1].parameter
      }, () => {
        let { pageSize, currentPage } = list[1].page
        this.getList(currentPage, pageSize)
      })
    } else {
      this.getList(currentPage, pageSize)
    }
  }

  render () {
    let { columns, pageSize, currentPage, body, itemList, hintConfig, hintShow } = this.state
    let list = []
    let total = 0
    if (body) {
      list = body.items
      total = body.totalRecords
    }
    const { getFieldDecorator } = this.props.form
    return (
      <div className="system-monitor-list">
        <div className="search-bar">
          <Form className="filter-form new-flex-layout" layout="inline" onSubmit={this.handleSubmit}>
            <Item label="监测项">
              {getFieldDecorator('item', {
                initialValue: 'all'
              })(
                <Select placeholder='全部' getPopupContainer={triggerNode => triggerNode.parentNode}>
                  <Option value='all'>全部</Option>
                  {
                    itemList.map(item => {
                      return <Option key={item.id}>{item.itemName}</Option>
                    })
                  }
                </Select>
              )}
            </Item>
            <Item label="规则名" className="item-separation">
              {getFieldDecorator('ruleName', {
                rules: [{ min: 1, max: 30, message: '字符长度最小为1，最大为30!' }]
              })(
                <Input autoComplete="off" className="filter-form-item" placeholder='请输入规则名' />
              )}
            </Item>
            <Item label="规则状态">
              {getFieldDecorator('status', {
                initialValue: 'all'
              })(
                <Select placeholder='全部' getPopupContainer={triggerNode => triggerNode.parentNode}>
                  <Option value='all'>全部</Option>
                  <Option key={0}>禁用</Option>
                  <Option key={1}>启用</Option>
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
          <Table rowKey="stringId" columns={columns} dataSource={list} pagination={false} />
          <Pagination
            className="table-pagination"
            total={total} showTotal={(total) => `共 ${total || 0} 条数据`}
            showQuickJumper={true}
            showSizeChanger={true}
            onChange={this.changePage}
            onShowSizeChange={this.changePage}
            pageSize={pageSize}
            current={currentPage} />
        </div>
        <HintAlertConfirm hinitConfig={hintConfig} visible={hintShow}></HintAlertConfirm>
        <ChangeMonitorModal changeModal={this.state.changeModal} handleCancel={this.handleCancel} refurbish={this.refurbish} />
      </div>
    )
  }
  //重置
  handleReset = () => {
    this.props.form.resetFields()
    removeCriteria('0', this.props.history)
    this.setState({
      values: {},
      pageSize: 10,
      currentPage: 1
    }, () => this.getList(1, 10))
  }

  //表单查询
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (values.item === 'all')
          values.item = undefined
        if (values.status === 'all')
          values.status = undefined
        this.setState({
          values,
          pageSize: 10,
          currentPage: 1
        }, () => {
          this.getList(1, 10, true)
        })
      }
    })
  }

  //停用启用
  handleStop = (obj) => {
    let text = `确认是否${['启用', '禁用'][obj.status]}此监测规则?`
    //弹窗配置
    let init = {
      text,
      submit: () => this.handleAlert(obj),
      onCancel: () => this.setState({ hintShow: false })
    }
    this.setState({ hintConfig: init, hintShow: true })
  }
  //confirm确认
  handleAlert = (obj) => {
    api.sysMonitorItemUpdate({
      id: obj.stringId,
      status: !obj.status ? 1 : 0
    }).then(response => {
      if (response && response.head && response.head.code === '200') {
        let { currentPage, pageSize } = this.state
        Message.success('操作成功')
        this.changePage(currentPage, pageSize)
        this.setState({ hintShow: false })
      }
    })
  }
  //变更
  handleChange = (item) => {
    this.setState({
      changeModal: {
        visible: true,
        id: item.stringId,
        value: item.threshold
      }
    })
  }

  //更改临界值刷新列表
  refurbish = () => {
    let { pageSize, currentPage } = this.state
    this.changePage(currentPage, pageSize)
  }
  //获取列表
  getList = (currentPage, pageSize, is = false) => {
    let { values } = this.state
    if(is){
      cacheSearchParameter([{
        page: { pageSize, currentPage },
        parameter: values
      }],
      this.props.history, 1, '0')
      this.props.saveItemKey()
    }
    api.sysMonitorItemList({ ...values, currentPage, pageSize }).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          body: response.body
        })
      }
    })
  }
  //翻页
  changePage = (currentPage, pageSize) => {
    this.setState({
      currentPage,
      pageSize
    }, () => {
      this.getList(currentPage, pageSize, true)
    })
  }

  //获取检测项
  getItem = () => {
    api.sysMonitorItemQueryAll({}).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          itemList: response.body || []
        })
      }
    })
  }

  handleCancel = () => {
    this.setState({
      changeModal: {
        visible: false
      }
    })
  }
}

const SystemRoleListForm = Form.create()(SystemRoleList)
export default withRouter(connect()(SystemRoleListForm))
